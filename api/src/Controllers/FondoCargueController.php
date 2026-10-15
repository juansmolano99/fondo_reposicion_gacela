<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\UploadedFileInterface;

final class FondoCargueController
{
    public function __construct(private DbProvider $db)
    {
    }

    public function cargue(Request $request, Response $response): Response
    {
        $files = $request->getUploadedFiles();
        $archivo = $files['archivo'] ?? null;

        if (!$archivo instanceof UploadedFileInterface || $archivo->getError() !== UPLOAD_ERR_OK || $archivo->getSize() <= 0) {
            return Http::text($response, 'Debe enviar un archivo CSV.', 400);
        }

        $tmp = $archivo->getStream()->getMetadata('uri');
        $contents = (string) $archivo->getStream();
        if ($contents === '' && is_string($tmp) && is_file($tmp)) {
            $contents = (string) file_get_contents($tmp);
        }
        $contents = str_replace(["\r\n", "\r"], "\n", $contents);
        $lines = explode("\n", $contents);
        $primera = array_shift($lines);
        
        if ($primera === null || trim($primera) === '') {
            return Http::text($response, 'El archivo está vacío.', 400);
        }

        $partes = preg_split('/[,;\t]/', $primera) ?: [];
        $partes = array_map('trim', $partes);
        $partes = array_map('strtolower', $partes);
        
        $expectedColumns = ['placa', 'anio', 'mes', 'valor'];
        $columnIndexes = [];
        
        foreach ($expectedColumns as $col) {
            $index = array_search($col, $partes, true);
            if ($index === false) {
                return Http::text($response, "El CSV debe contener la columna: $col", 400);
            }
            $columnIndexes[$col] = $index;
        }

        $movimientos = [];
        $placasUnicas = [];
        
        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }
            $p = preg_split('/[,;\t]/', $line) ?: [];
            $p = array_map('trim', $p);
            
            if (count($p) < 4) {
                continue;
            }
            
            $placa = strtoupper(trim($p[$columnIndexes['placa']] ?? ''));
            if ($placa === '') {
                continue;
            }
            
            $anio = (int) ($p[$columnIndexes['anio']] ?? 0);
            $mes = (int) ($p[$columnIndexes['mes']] ?? 0);
            $valor = (float) str_replace(',', '', $p[$columnIndexes['valor']] ?? '0');
            
            if ($anio < 2000 || $anio > 2100 || $mes < 1 || $mes > 12) {
                continue;
            }
            
            if ($valor <= 0) {
                continue;
            }
            
            $movimientos[] = [
                'placa' => $placa,
                'anio' => $anio,
                'mes' => $mes,
                'valor' => $valor,
            ];
            
            $placasUnicas[$placa] = true;
        }

        if (count($movimientos) === 0) {
            return Http::text($response, 'No hay filas válidas en el CSV.', 400);
        }

        $placasArray = array_keys($placasUnicas);
        $vehiculosExistentes = $this->db->obtenerVehiculosPorPlacas($placasArray);
        
        $placasFaltantes = array_diff($placasArray, array_keys($vehiculosExistentes));
        
        if (count($placasFaltantes) > 0) {
            return Http::json($response, [
                'status' => 'requires_vehicles',
                'message' => 'Se detectaron placas no registradas en la base de datos.',
                'placas_faltantes' => array_values($placasFaltantes),
                'datos_csv' => $movimientos,
            ], 400);
        }

        try {
            $usuario = (string) $request->getAttribute('usuario', '');
            $vehiculoIds = [];
            foreach ($vehiculosExistentes as $placa => $vehiculo) {
                $vehiculoIds[$placa] = $vehiculo['id'];
            }
            
            $count = $this->db->crearMovimientosPorLote($movimientos, $vehiculoIds, $usuario);
            
            return Http::json($response, [
                'status' => 'success',
                'mensaje' => sprintf("Cargue correcto: %d movimientos procesados.", $count),
            ]);
        } catch (\Exception $ex) {
            return Http::json($response, [
                'status' => 'error',
                'message' => $ex->getMessage(),
            ], 500);
        }
    }

    public function cargueCompleto(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $nuevosVehiculos = $body['nuevos_vehiculos'] ?? [];
        $datosCsv = $body['datos_csv'] ?? [];
        
        if (empty($nuevosVehiculos) || empty($datosCsv)) {
            return Http::text($response, 'Se requieren nuevos vehículos y datos del CSV.', 400);
        }

        $usuario = (string) $request->getAttribute('usuario', '');
        
        try {
            $this->db->pdo()->beginTransaction();
            
            $nuevosVehiculosIds = $this->db->crearVehiculosPorLote($nuevosVehiculos);
            
            $placasArray = array_unique(array_merge(
                array_column($datosCsv, 'placa'),
                array_keys($nuevosVehiculosIds)
            ));
            $todosVehiculos = $this->db->obtenerVehiculosPorPlacas($placasArray);
            
            $vehiculoIds = [];
            foreach ($todosVehiculos as $placa => $vehiculo) {
                $vehiculoIds[$placa] = $vehiculo['id'];
            }
            
            $count = $this->db->crearMovimientosPorLote($datosCsv, $vehiculoIds, $usuario);

            $this->db->pdo()->commit();

            return Http::json($response, [
                'status' => 'success',
                'mensaje' => sprintf("Proceso completado: %d vehículos creados, %d movimientos procesados.", count($nuevosVehiculos), $count),
            ]);
        } catch (\Throwable $e) {
            if ($this->db->pdo()->inTransaction()) {
                $this->db->pdo()->rollBack();
            }
            return Http::text($response, 'Error interno del servidor', 500);
        }
    }
}
