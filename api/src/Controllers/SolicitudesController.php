<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\FileStorage;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\UploadedFileInterface;

final class SolicitudesController
{
    private const NATURALEZAS = ['propietario', 'apoderado', 'administrador'];
    private const ESTADOS = ['Radicado', 'En Revision', 'Pdte Documentación', 'Aprobado', 'Rechazado'];

    public function __construct(private DbProvider $db)
    {
    }

    public function getAll(Request $request, Response $response): Response
    {
        unset($request);
        return Http::json($response, $this->db->obtenerSolicitudes());
    }

    public function getByPlaca(Request $request, Response $response, array $args): Response
    {
        unset($request);
        return Http::json($response, $this->db->obtenerSolicitudesPorPlaca((string) $args['placa']));
    }

    public function create(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $placa = Http::str($body, 'placa');
        $valorEstimado = Http::num($body, 'valorEstimado');
        $nombreCompleto = Http::str($body, 'nombreCompleto');
        $naturaleza = Http::str($body, 'naturaleza');
        $descripcion = Http::str($body, 'descripcion');

        if ($placa === '') {
            return Http::text($response, 'Placa es requerida', 400);
        }
        if ($valorEstimado <= 0) {
            return Http::text($response, 'Valor estimado debe ser mayor a 0', 400);
        }
        if ($nombreCompleto === '') {
            return Http::text($response, 'Nombre de quien solicita es requerido', 400);
        }
        if ($naturaleza === '' || !$this->inListCi($naturaleza, self::NATURALEZAS)) {
            return Http::text($response, 'Naturaleza inválida', 400);
        }
        if ($descripcion === '') {
            return Http::text($response, 'Descripción es requerida', 400);
        }

        $vehiculo = $this->db->obtenerVehiculoPorPlaca($placa);
        if ($vehiculo === null) {
            return Http::text($response, 'La placa no existe', 400);
        }

        $files = $request->getUploadedFiles();
        $archivo = $files['archivo'] ?? null;
        $rutaAdjunto = null;
        if ($archivo instanceof UploadedFileInterface) {
            $rutaAdjunto = FileStorage::saveAdjuntoSolicitud($archivo);
        }

        $usuario = (string) $request->getAttribute('usuario', '');
        $creada = $this->db->crearSolicitud(
            $placa,
            $valorEstimado,
            $nombreCompleto,
            trim($naturaleza),
            $descripcion,
            $rutaAdjunto,
            $usuario !== '' ? $usuario : null
        );

        return Http::json($response, $creada);
    }

    public function nuevoEstado(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $body = Http::body($request);
        $estado = Http::str($body, 'estado');

        if ($id <= 0) {
            return Http::text($response, 'Id inválido', 400);
        }
        if ($estado === '') {
            return Http::text($response, 'Estado es requerido', 400);
        }
        if (!$this->inListCi($estado, self::ESTADOS)) {
            return Http::text($response, 'Estado inválido', 400);
        }

        $actualizado = $this->db->actualizarEstadoSolicitud($id, trim($estado));
        if (!$actualizado) {
            return Http::empty($response, 404);
        }
        return Http::empty($response, 200);
    }

    /**
     * @param list<string> $list
     */
    private function inListCi(string $value, array $list): bool
    {
        foreach ($list as $item) {
            if (strcasecmp($value, $item) === 0) {
                return true;
            }
        }
        return false;
    }
}
