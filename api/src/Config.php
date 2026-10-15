<?php

declare(strict_types=1);

namespace App;

final class Config
{
    public static function load(): void
    {
        $dir = dirname(__DIR__);
        if (is_file($dir . DIRECTORY_SEPARATOR . '.env')) {
            $dotenv = \Dotenv\Dotenv::createImmutable($dir);
            $dotenv->safeLoad();
        }
    }

    public static function get(string $key, ?string $default = null): string
    {
        $value = $_ENV[$key] ?? getenv($key);
        if ($value === false || $value === null || $value === '') {
            return $default ?? '';
        }
        return (string) $value;
    }

    public static function jwtKey(): string
    {
        $key = self::get('JWT_KEY');
        if ($key === '') {
            throw new \RuntimeException('JWT_KEY no está configurado en .env');
        }
        return $key;
    }

    public static function jwtIssuer(): string
    {
        return self::get('JWT_ISSUER', 'FondoReposicion');
    }

    public static function jwtAudience(): string
    {
        return self::get('JWT_AUDIENCE', 'FondoReposicionUsuarios');
    }

    public static function dsn(): string
    {
        $host = self::get('DB_HOST', '127.0.0.1');
        $port = self::get('DB_PORT', '3306');
        $name = self::get('DB_NAME', '');
        return sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);
    }

    public static function dbUser(): string
    {
        return self::get('DB_USER', '');
    }

    public static function dbPass(): string
    {
        return self::get('DB_PASS', '');
    }

    public static function uploadsDir(): string
    {
        return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
    }
}
