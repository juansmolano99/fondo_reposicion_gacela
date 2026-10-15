<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\FileStorage;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\UploadedFileInterface;

final class RetirosController
{
    public function __construct(private DbProvider $db)
    {
    }

    public function obtenerSaldo(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $saldo = $this->db->obtenerSaldoDisponible((string) $args['placa']);
        return Http::json($response, $saldo);
    }

    public function obtenerRetiros(Request $request, Response $response, array $args): Response
    {
        unset($request);
        return Http::json($response, $this->db->obtenerRetirosPorPlaca((string) $args['placa']));
    }

    public function crearRetiro(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        return $this->crearRetiroInterno(
            $request,
            $response,
            Http::str($body, 'placa'),
            Http::num($body, 'monto'),
            Http::str($body, 'observacion') !== '' ? Http::str($body, 'observacion') : null,
            Http::str($body, 'rutaAdjunto') !== '' ? Http::str($body, 'rutaAdjunto') : null
        );
    }

    public function crearRetiroConAdjunto(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $files = $request->getUploadedFiles();
        $archivo = $files['archivo'] ?? null;
        $rutaAdjunto = null;
        if ($archivo instanceof UploadedFileInterface) {
            $rutaAdjunto = FileStorage::saveAdjunto($archivo);
        }

        return $this->crearRetiroInterno(
            $request,
            $response,
            Http::str($body, 'placa'),
            Http::num($body, 'monto'),
            Http::str($body, 'observacion') !== '' ? Http::str($body, 'observacion') : null,
            $rutaAdjunto
        );
    }

    private function crearRetiroInterno(
        Request $request,
        Response $response,
        string $placa,
        float $monto,
        ?string $observacion,
        ?string $rutaAdjunto
    ): Response {
        if (trim($placa) === '') {
            return Http::text($response, 'Placa es requerida', 400);
        }
        if ($monto <= 0) {
            return Http::text($response, 'El monto debe ser mayor a 0', 400);
        }

        $saldo = $this->db->obtenerSaldoDisponible($placa);
        if ($monto > $saldo) {
            $msg = sprintf('Saldo insuficiente. Disponible: %s', number_format($saldo, 2, '.', ','));
            return Http::text($response, $msg, 400);
        }

        $usuario = (string) $request->getAttribute('usuario', '');

        try {
            $this->db->pdo()->beginTransaction();
            $this->db->crearRetiro($placa, $monto, $observacion, $usuario, $rutaAdjunto);
            $this->db->pdo()->commit();

            return Http::json($response, [
                'mensaje' => 'Retiro registrado correctamente',
                'saldoRestante' => $saldo - $monto,
            ]);
        } catch (\Throwable $e) {
            if ($this->db->pdo()->inTransaction()) {
                $this->db->pdo()->rollBack();
            }
            return Http::text($response, 'Error al registrar el retiro', 500);
        }
    }
}
