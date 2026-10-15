<?php

declare(strict_types=1);

namespace App;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class JwtHelper
{
    public const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
    public const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

    public static function generateToken(string $usuario, string $rol, array $permisos): string
    {
        $now = time();
        $payload = [
            'iss' => Config::jwtIssuer(),
            'aud' => Config::jwtAudience(),
            'nbf' => $now,
            'iat' => $now,
            'exp' => $now + (2 * 3600),
            self::CLAIM_NAME => $usuario,
            'unique_name' => $usuario,
            'name' => $usuario,
            self::CLAIM_ROLE => $rol,
            'role' => $rol,
            'permiso' => $permisos,
        ];

        return JWT::encode($payload, Config::jwtKey(), 'HS256');
    }

    public static function decode(string $token): object
    {
        JWT::$leeway = 60;
        $decoded = JWT::decode($token, new Key(Config::jwtKey(), 'HS256'));
        if (($decoded->iss ?? '') !== Config::jwtIssuer()) {
            throw new \UnexpectedValueException('Issuer inválido');
        }
        $aud = $decoded->aud ?? '';
        if (is_array($aud)) {
            $aud = $aud[0] ?? '';
        }
        if ((string) $aud !== Config::jwtAudience()) {
            throw new \UnexpectedValueException('Audience inválida');
        }
        return $decoded;
    }

    public static function usuarioFromPayload(object $payload): string
    {
        return (string) (
            $payload->{self::CLAIM_NAME}
            ?? $payload->unique_name
            ?? $payload->name
            ?? ''
        );
    }

    public static function permisosFromPayload(object $payload): array
    {
        $raw = $payload->permiso ?? [];
        if ($raw === null || $raw === '') {
            return [];
        }
        if (is_array($raw)) {
            return array_values(array_map('strval', $raw));
        }
        return [(string) $raw];
    }
}
