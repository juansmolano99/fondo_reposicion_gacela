<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class VehiculosController
{
    public function __construct(private DbProvider $db)
    {
    }

    public function obtenerPorPlaca(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $vehiculo = $this->db->obtenerVehiculoPorPlaca((string) $args['placa']);
        if ($vehiculo === null) {
            return Http::empty($response, 404);
        }
        return Http::json($response, $vehiculo);
    }

    public function obtenerFondos(Request $request, Response $response, array $args): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $anioParam = $queryParams['anio'] ?? 'todos';
            
            $placa = (string) $args['placa'];
            
            $anio = ($anioParam !== null && $anioParam !== '' && $anioParam !== 'todos') 
                ? (int) $anioParam 
                : null;

            $fondos = $this->db->obtenerFondosMensuales($placa, $anio);
            return Http::json($response, $fondos);
        } catch (\Throwable $e) {
            return Http::text($response, 'Error interno del servidor', 500);
        }
    }

    public function obtenerResumen(Request $request, Response $response, array $args): Response
    {
        unset($request);
        $resumen = $this->db->obtenerResumen((string) $args['placa']);
        if ($resumen === null) {
            return Http::empty($response, 404);
        }
        return Http::json($response, $resumen);
    }

    public function obtenerEmpresas(Request $request, Response $response): Response
    {
        unset($request);
        $empresas = $this->db->obtenerEmpresas();
        return Http::json($response, $empresas);
    }
}
