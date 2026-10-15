<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class RolesController
{
    public function __construct(private DbProvider $db)
    {
    }

    public function obtenerRoles(Request $request, Response $response): Response
    {
        unset($request);
        return Http::json($response, $this->db->obtenerRoles());
    }

    public function crearRol(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $this->db->crearRol(Http::str($body, 'codigo'), Http::str($body, 'descripcion'));
        return Http::empty($response, 200);
    }

    public function obtenerPermisos(Request $request, Response $response): Response
    {
        unset($request);
        return Http::json($response, $this->db->obtenerPermisos());
    }

    public function asignarPermiso(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $this->db->asignarPermisoRol((int) ($body['rolId'] ?? 0), (int) ($body['permisoId'] ?? 0));
        return Http::empty($response, 200);
    }

    public function quitarPermiso(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $this->db->quitarPermisoRol((int) ($body['rolId'] ?? 0), (int) ($body['permisoId'] ?? 0));
        return Http::empty($response, 200);
    }
}
