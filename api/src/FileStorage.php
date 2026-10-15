<?php

declare(strict_types=1);

namespace App;

use Psr\Http\Message\UploadedFileInterface;

final class FileStorage
{
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain',
    ];

    private static function validateFileType(UploadedFileInterface $file): void
    {
        $stream = $file->getStream();
        $stream->rewind();
        $bytes = $stream->read(8);
        $stream->rewind();

        $extension = strtolower(pathinfo($file->getClientFilename() ?? '', PATHINFO_EXTENSION));

        // Validar por magic bytes
        $isValid = match (true) {
            str_starts_with($bytes, '%PDF') => $extension === 'pdf',
            str_starts_with($bytes, "\xFF\xD8\xFF") => in_array($extension, ['jpg', 'jpeg'], true),
            str_starts_with($bytes, "\x89PNG\r\n\x1A\n") => $extension === 'png',
            str_starts_with($bytes, 'text/plain') || ctype_print(substr($bytes, 0, 4)) => $extension === 'txt',
            default => false,
        };

        if (!$isValid) {
            throw new \RuntimeException('El tipo de archivo no es válido o no coincide con su extensión.');
        }
    }

    public static function saveAdjunto(?UploadedFileInterface $file, string $subdir = ''): ?string
    {
        if ($file === null || $file->getError() !== UPLOAD_ERR_OK || $file->getSize() <= 0) {
            return null;
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \RuntimeException('El archivo excede el tamaño máximo permitido de 10MB.');
        }

        self::validateFileType($file);

        $original = $file->getClientFilename() ?? 'archivo';
        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($original)) ?: 'archivo';
        $nombreSeguro = gmdate('YmdHis') . '_' . $safeName;

        $base = Config::uploadsDir() . DIRECTORY_SEPARATOR . 'adjuntos';
        if ($subdir !== '') {
            $base .= DIRECTORY_SEPARATOR . $subdir;
        }
        if (!is_dir($base) && !mkdir($base, 0775, true) && !is_dir($base)) {
            throw new \RuntimeException('No se pudo crear el directorio de adjuntos.');
        }

        $file->moveTo($base . DIRECTORY_SEPARATOR . $nombreSeguro);

        $web = '/adjuntos/' . ($subdir !== '' ? $subdir . '/' : '') . $nombreSeguro;
        return $web;
    }

    public static function saveAdjuntoSolicitud(?UploadedFileInterface $file): ?string
    {
        if ($file === null || $file->getError() !== UPLOAD_ERR_OK || $file->getSize() <= 0) {
            return null;
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \RuntimeException('El archivo excede el tamaño máximo permitido de 10MB.');
        }

        self::validateFileType($file);

        $original = $file->getClientFilename() ?? 'archivo';
        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($original)) ?: 'archivo';
        $nombreSeguro = gmdate('YmdHis') . '_' . bin2hex(random_bytes(16)) . '_' . $safeName;

        $base = Config::uploadsDir() . DIRECTORY_SEPARATOR . 'adjuntos' . DIRECTORY_SEPARATOR . 'solicitudes';
        if (!is_dir($base) && !mkdir($base, 0775, true) && !is_dir($base)) {
            throw new \RuntimeException('No se pudo crear el directorio de adjuntos.');
        }

        $file->moveTo($base . DIRECTORY_SEPARATOR . $nombreSeguro);
        return '/adjuntos/solicitudes/' . $nombreSeguro;
    }

    public static function saveAdjuntoDocumentacion(?UploadedFileInterface $file): ?string
    {
        if ($file === null || $file->getError() !== UPLOAD_ERR_OK || $file->getSize() <= 0) {
            return null;
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \RuntimeException('El archivo excede el tamaño máximo permitido de 10MB.');
        }

        self::validateFileType($file);

        $original = $file->getClientFilename() ?? 'archivo';
        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($original)) ?: 'archivo';
        $nombreSeguro = gmdate('YmdHis') . '_' . bin2hex(random_bytes(16)) . '_' . $safeName;

        $base = Config::uploadsDir() . DIRECTORY_SEPARATOR . 'adjuntos' . DIRECTORY_SEPARATOR . 'documentacion';
        if (!is_dir($base) && !mkdir($base, 0775, true) && !is_dir($base)) {
            throw new \RuntimeException('No se pudo crear el directorio de documentación.');
        }

        $file->moveTo($base . DIRECTORY_SEPARATOR . $nombreSeguro);
        return '/adjuntos/documentacion/' . $nombreSeguro;
    }

    public static function resolveAdjuntoPath(string $rutaParam): ?string
    {
        // 1. Decodificar adecuadamente los espacios '+' y '%20'
        $clean = rawurldecode(urldecode($rutaParam));
        $clean = ltrim($clean, '/\\');

        // Prevenir Traversal Attacks (../)
        if ($clean === '' || str_contains($clean, '..')) {
            return null;
        }

        // Eliminar prefijo 'adjuntos/' para evitar duplicar carpetas
        $clean = preg_replace('#^adjuntos[/\\\\]#i', '', $clean) ?? $clean;

        // Normalizar separadores a Windows (\)
        $relativePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $clean);

        // 2. Ruta exacta según la estructura del proyecto: api/uploads/adjuntos/
        $baseDir = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'adjuntos';
        $fullPath = $baseDir . DIRECTORY_SEPARATOR . $relativePath;

        error_log("Buscando archivo en: " . $fullPath);

        if (is_file($fullPath)) {
            return realpath($fullPath) ?: $fullPath;
        }

        return null;
    }

    public static function contentType(string $filename): string
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return match ($ext) {
            'pdf' => 'application/pdf',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'txt' => 'text/plain',
            default => 'application/octet-stream',
        };
    }
}
