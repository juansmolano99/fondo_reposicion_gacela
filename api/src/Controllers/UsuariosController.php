<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\Http;
use App\PasswordHasher;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class UsuariosController
{
    public function __construct(private DbProvider $db)
    {
    }

    public function obtenerRolesParaDropdown(Request $request, Response $response): Response
    {
        unset($request);
        $roles = $this->db->obtenerRoles();
        $out = [];
        foreach ($roles as $r) {
            $out[] = ['value' => $r['nombre'], 'label' => $r['nombre']];
        }
        return Http::json($response, $out);
    }

    public function obtenerUsuarios(Request $request, Response $response): Response
    {
        unset($request);
        try {
            return Http::json($response, $this->db->obtenerUsuarios());
        } catch (\Throwable $ex) {
            return Http::text($response, 'Error interno del servidor: ' . $ex->getMessage(), 500);
        }
    }

    public function crear(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        [$hash, $salt] = PasswordHasher::crearHash((string) ($body['password'] ?? ''));
        $this->db->crearUsuario(
            Http::str($body, 'nombreUsuario'),
            Http::str($body, 'nombreCompleto'),
            $hash,
            $salt,
            Http::str($body, 'rol'),
            true
        );
        return Http::empty($response, 200);
    }

    public function editar(Request $request, Response $response, array $args): Response
    {
        $body = Http::body($request);
        $this->db->editarUsuario(
            (int) $args['id'],
            Http::str($body, 'nombreUsuario'),
            Http::str($body, 'nombreCompleto'),
            Http::str($body, 'rol'),
            Http::boolVal($body['activo'] ?? true, true)
        );
        return Http::empty($response, 200);
    }

    public function restablecerPassword(Request $request, Response $response, array $args): Response
    {
        $id = (int) ($args['id'] ?? 0);
        if ($id <= 0) {
            return Http::text($response, 'ID de usuario inválido', 400);
        }

        $body = (array) $request->getParsedBody();
        $nuevaPassword = isset($body['password']) ? trim((string) $body['password']) : '';

        if ($nuevaPassword === '') {
            return Http::text($response, 'La nueva contraseña es requerida', 400);
        }

        // Generar salt y hash para la nueva contraseña
        [$hash, $salt] = PasswordHasher::crearHash($nuevaPassword);

        $this->db->cambiarPassword($id, $hash, $salt);

        return Http::json($response, [
            'mensaje' => 'Contraseña restablecida correctamente',
            'usuarioId' => $id
        ]);
    }

    public function cambiarEstado(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $this->db->toggleEstadoUsuario((int) $args['id']);
        return Http::empty($response, 200);
    }

    public function inhabilitar(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $this->db->inhabilitarUsuario((int) $args['id']);
        return Http::empty($response, 200);
    }

    public function eliminar(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $this->db->eliminarUsuario((int) $args['id']);
        return Http::empty($response, 200);
    }
}
