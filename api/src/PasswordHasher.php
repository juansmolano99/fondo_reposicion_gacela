<?php

declare(strict_types=1);

namespace App;

final class PasswordHasher
{
    /**
     * Nuevos usuarios: BCrypt nativo de PHP.
     * Devuelve [hash, salt] para conservar el esquema de columnas de `usuarios`.
     */
    public static function crearHash(string $password): array
    {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        if ($hash === false) {
            throw new \RuntimeException('No se pudo generar el hash de la contraseña.');
        }
        return [$hash, 'bcrypt'];
    }

    /**
     * Verifica BCrypt (usuarios creados en PHP) y HMAC-SHA512 (usuarios heredados de .NET).
     */
    public static function verificar(string $password, string $storedHash, string $storedSalt): bool
    {
        if ($storedHash !== '' && str_starts_with($storedHash, '$2')) {
            return password_verify($password, $storedHash);
        }

        if ($storedSalt === '' || $storedHash === '') {
            return false;
        }

        $saltBytes = base64_decode($storedSalt, true);
        if ($saltBytes === false || $saltBytes === '') {
            return false;
        }

        $computed = base64_encode(hash_hmac('sha512', $password, $saltBytes, true));
        return hash_equals($storedHash, $computed);
    }
}
