<?php

declare(strict_types=1);

namespace App;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class Http
{
    public static function json(Response $response, mixed $data, int $status = 200): Response
    {
        $payload = json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION
        );
        $response->getBody()->write($payload === false ? 'null' : $payload);
        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }

    public static function empty(Response $response, int $status = 200): Response
    {
        return $response->withStatus($status);
    }

    public static function text(Response $response, string $message, int $status): Response
    {
        $response->getBody()->write(json_encode($message, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }

    public static function body(Request $request): array
    {
        $parsed = $request->getParsedBody();
        return is_array($parsed) ? $parsed : [];
    }

    public static function str(array $data, string $key, string $default = ''): string
    {
        if (!array_key_exists($key, $data) || $data[$key] === null) {
            return $default;
        }
        return trim((string) $data[$key]);
    }

    public static function num(array $data, string $key, float $default = 0.0): float
    {
        if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') {
            return $default;
        }
        if (is_numeric($data[$key])) {
            return (float) $data[$key];
        }
        $normalized = str_replace(',', '.', (string) $data[$key]);
        return is_numeric($normalized) ? (float) $normalized : $default;
    }

    public static function boolVal(mixed $value, bool $default = false): bool
    {
        if ($value === null) {
            return $default;
        }
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return (int) $value === 1;
        }
        $s = strtolower((string) $value);
        if (in_array($s, ['true', '1', 'yes', 'on'], true)) {
            return true;
        }
        if (in_array($s, ['false', '0', 'no', 'off'], true)) {
            return false;
        }
        return $default;
    }

    public static function decimal(?string $value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }
        return (float) $value;
    }
}
