<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\FileStorage;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\UploadedFileInterface;

final class DocumentacionController
{
    public function __construct(private DbProvider $db)
    {
    }

    public function listarPorSolicitud(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $solicitudId = (int) $args['id'];
        $documentos = $this->db->obtenerDocumentosPorSolicitud($solicitudId);
        return Http::json($response, $documentos);
    }

    public function crear(Request $request, Response $response): Response
    {
        $parsedBody = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();

        $solicitudId = (int) ($parsedBody['solicitud_id'] ?? 0);
        $tipoDocumento = trim($parsedBody['tipo_documento'] ?? '');
        $estadoAsociado = trim($parsedBody['estado_asociado'] ?? '');
        $observaciones = trim($parsedBody['observaciones'] ?? '');

        if (!$solicitudId || empty($tipoDocumento) || empty($estadoAsociado)) {
            return Http::json($response, ['error' => 'Faltan datos obligatorios'], 400);
        }

        /** @var \Psr\Http\Message\UploadedFileInterface|null $file */
        $file = $uploadedFiles['archivo'] ?? null;
        $rutaArchivo = FileStorage::saveAdjuntoDocumentacion($file);

        if (!$rutaArchivo) {
            return Http::json($response, ['error' => 'No se pudo adjuntar el archivo PDF o formato inválido'], 400);
        }

        $exito = $this->db->registrarDocumento([
            'solicitud_id' => $solicitudId,
            'tipo_documento' => $tipoDocumento,
            'nombre_archivo' => $file->getClientFilename() ?? 'documento.pdf',
            'ruta_archivo' => $rutaArchivo,
            'observaciones' => $observaciones !== '' ? $observaciones : null,
            'estado_asociado' => $estadoAsociado
        ]);

        if (!$exito) {
            return Http::json($response, ['error' => 'Error al guardar en base de datos'], 500);
        }

        return Http::json($response, ['mensaje' => 'Documento de soporte guardado exitosamente'], 201);
    }
}