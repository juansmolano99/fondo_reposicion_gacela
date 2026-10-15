<?php

declare(strict_types=1);

namespace App\Controllers;

use App\FileStorage;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class AdjuntosController
{
    public function ver(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $rutaRaw = isset($params['ruta']) ? (string) $params['ruta'] : '';

        if ($rutaRaw === '') {
            return Http::text($response, 'Ruta no especificada', 400);
        }

        $fullPath = FileStorage::resolveAdjuntoPath($rutaRaw);

        if ($fullPath === null || !is_file($fullPath)) {
            return Http::text($response, 'Archivo no encontrado', 404);
        }

        $stream = @fopen($fullPath, 'rb');
        if ($stream === false) {
            return Http::empty($response, 500);
        }

        $body = new \Slim\Psr7\Stream($stream);
        $downloadName = basename($fullPath);
        $contentType = FileStorage::contentType($fullPath);

        return $response
            ->withBody($body)
            ->withHeader('Content-Type', $contentType)
            ->withHeader('Content-Disposition', 'inline; filename="' . rawurlencode($downloadName) . '"')
            ->withHeader('Content-Length', (string) filesize($fullPath))
            ->withStatus(200);
    }
}