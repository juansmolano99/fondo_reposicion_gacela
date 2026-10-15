<?php

declare(strict_types=1);

namespace App\Controllers;

use App\DbProvider;
use App\Http;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class DashboardController
{
    public function __construct(private DbProvider $db)
    {
    }

public function resumen(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $anioParam = $params['anio'] ?? null;
        $placa = $params['placa'] ?? null;

        error_log("ANIO_PARAM: " . print_r($anioParam, true) . " | PLACA: " . print_r($placa, true));

        // Si no viene el año o es 'todos', puedes asignar el año actual por defecto 
        // (o mantener null solo si el usuario explícitamente quiere histórico)
        $anio = ($anioParam !== null && $anioParam !== '' && $anioParam !== 'todos') 
            ? (int)$anioParam 
            : (int)date('Y'); // O déjalo en null si 'todos' debe ser histórico global

        // 1. Obtener totales limpios aplicando los filtros de año y placa
        $totalReposicionBruto = $this->db->obtenerTotalReposicion($anio, $placa);
        $totalRetiros = $this->db->obtenerTotalRetiros($anio, $placa);

        // 2. Restar los retiros al total de reposición
        $totalReposicionNeto = $totalReposicionBruto - $totalRetiros;

        // 3. Calcular el porcentaje utilizado de manera segura
        $presupuestoUtilizado = ($totalReposicionBruto > 0) 
            ? round(($totalRetiros / $totalReposicionBruto) * 100, 2) 
            : 0.0;

        return Http::json($response, [
            'totalReposicion'      => $totalReposicionNeto,
            'totalRetiros'         => $totalRetiros,
            'usuariosActivos'      => $this->db->obtenerUsuariosActivos(),
            'presupuestoUtilizado' => $presupuestoUtilizado,
            'flujoMensual'         => $this->db->obtenerFlujoMensual($anio, $placa),
        ]);
    }
    public function obtenerDashboardMetricas(Request $request, Response $response): Response
{
    $params = $request->getQueryParams();
    $anio = isset($params['anio']) && $params['anio'] !== '' ? (int) $params['anio'] : (int) date('Y');

    // Pasar el año a la consulta de la base de datos
    $data = $this->db->obtenerDashboardMetricas($anio);

    return Http::json($response, $data);
}
}
