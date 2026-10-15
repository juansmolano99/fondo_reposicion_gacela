<?php

declare(strict_types=1);

namespace App;

final class AuthService
{
    public function __construct(private DbProvider $db)
    {
    }

    /**
     * @return array{token:?string,nombreCompleto:?string,usuario:?string,rol:?string}
     */
    public function login(string $usuario, string $password): array
    {
        $user = $this->db->obtenerUsuarioPorNombre($usuario);
        if ($user === null || !$user['activo']) {
            return ['token' => null, 'nombreCompleto' => null, 'usuario' => null, 'rol' => null];
        }

        if (!PasswordHasher::verificar($password, $user['passwordHash'], $user['passwordSalt'])) {
            return ['token' => null, 'nombreCompleto' => null, 'usuario' => null, 'rol' => null];
        }

        $permisos = $this->db->obtenerPermisosPorUsuario($user['nombreUsuario']);
        $token = JwtHelper::generateToken($user['nombreUsuario'], $user['rol'], $permisos);

        return [
            'token' => $token,
            'nombreCompleto' => $user['nombreCompleto'],
            'usuario' => $user['nombreUsuario'],
            'rol' => $user['rol'],
        ];
    }
}
