<?php

declare(strict_types=1);

namespace App\Controllers;

use App\AuthService;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class AuthController
{
    public function __construct(private AuthService $auth)
    {
    }

    public function login(Request $request, Response $response): Response
    {
        $body = Http::body($request);
        $usuario = Http::str($body, 'usuario');
        $password = isset($body['password']) ? (string) $body['password'] : '';

        $result = $this->auth->login($usuario, $password);
        if ($result['token'] === null) {
            return Http::empty($response, 401);
        }

        return Http::json($response, $result);
    }
}
