<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Http;
use App\JwtHelper;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

final class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(private ?string $permiso = null)
    {
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        $header = $request->getHeaderLine('Authorization');
        if (!preg_match('/^Bearer\\s+(.+)$/i', $header, $m)) {
            return Http::empty(new SlimResponse(), 401);
        }

        try {
            $payload = JwtHelper::decode(trim($m[1]));
        } catch (ExpiredException | SignatureInvalidException | \UnexpectedValueException | \Exception) {
            return Http::empty(new SlimResponse(), 401);
        }

        $usuario = JwtHelper::usuarioFromPayload($payload);
        $permisos = JwtHelper::permisosFromPayload($payload);

        if ($this->permiso !== null && $this->permiso !== '' && !in_array($this->permiso, $permisos, true)) {
            return Http::empty(new SlimResponse(), 403);
        }

        $request = $request
            ->withAttribute('usuario', $usuario)
            ->withAttribute('permisos', $permisos)
            ->withAttribute('jwt', $payload);

        return $handler->handle($request);
    }

    public static function require(?string $permiso = null): self
    {
        return new self($permiso);
    }
}
