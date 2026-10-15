<?php

declare(strict_types=1);

if (PHP_SAPI === 'cli-server') {
    $urlPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if ($urlPath !== false && $urlPath !== '/') {
        $cleanPath = rawurldecode($urlPath);

        // Buscar el archivo solicitado dentro de /api/uploads/
        $fileCandidate = __DIR__ . '/uploads' . preg_replace('#^/adjuntos#i', '/adjuntos', $cleanPath);
        if (is_file($fileCandidate)) {
            return false; // Permite al servidor dev de PHP entregar el archivo estático directamente
        }
    }
}

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

use App\AuthService;
use App\Config;
use App\Controllers\AdjuntosController;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\FondoCargueController;
use App\Controllers\RetirosController;
use App\Controllers\RolesController;
use App\Controllers\SolicitudesController;
use App\Controllers\DocumentacionController;
use App\Controllers\UsuariosController;
use App\Controllers\VehiculosController;
use App\DbProvider;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require __DIR__ . '/vendor/autoload.php';

Config::load();

$app = AppFactory::create();

// 1. Decodificador de cuerpo (JSON/Form)
$app->addBodyParsingMiddleware();

// 2. RoutingMiddleware primero en la definición
$app->addRoutingMiddleware();

// 3. CorsMiddleware registrado DESPUÉS de RoutingMiddleware para que se ejecute PRIMERO en la pila
$app->add(new CorsMiddleware());

// 4. Manejador de Errores
$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->getDefaultErrorHandler()->forceContentType('application/json');
// Permitir peticiones OPTIONS para CORS
$app->options('/api/dashboard', function (Request $request, Response $response) {
    return $response;
});

$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$basePath = str_replace('\\', '/', dirname($scriptName));
if ($basePath !== '/' && $basePath !== '.' && $basePath !== '') {
    $app->setBasePath(rtrim($basePath, '/'));
}

$db = new DbProvider();
$authService = new AuthService($db);

$authCtrl = new AuthController($authService);
$dashboardCtrl = new DashboardController($db);
$vehiculosCtrl = new VehiculosController($db);
$retirosCtrl = new RetirosController($db);
$usuariosCtrl = new UsuariosController($db);
$rolesCtrl = new RolesController($db);
$fondoCtrl = new FondoCargueController($db);
$solicitudesCtrl = new SolicitudesController($db);
$documentacionCtrl = new DocumentacionController($db);
$adjuntosCtrl = new AdjuntosController();

$auth = AuthMiddleware::require();
$pUsuarioConsultar = AuthMiddleware::require('USUARIO_CONSULTAR');
$pUsuarioCrear = AuthMiddleware::require('USUARIO_CREAR');
$pUsuarioEditar = AuthMiddleware::require('USUARIO_EDITAR');
$pVehiculoConsultar = AuthMiddleware::require('VEHICULO_CONSULTAR');
$pVehiculoResumen = AuthMiddleware::require('VEHICULO_RESUMEN');
$pVehiculoDetalle = AuthMiddleware::require('VEHICULO_DETALLE');
$pRetiroCrear = AuthMiddleware::require('RETIRO_CREAR');
$pFondoCargue = AuthMiddleware::require('FONDO_CARGUE');

// Definición de Rutas API
$app->post('/api/auth/login', [$authCtrl, 'login']);

$app->get('/api/dashboard/resumen', [$dashboardCtrl, 'resumen'])->add($auth);

$app->get('/api/vehiculos/empresas', [$vehiculosCtrl, 'obtenerEmpresas'])->add($auth);
// Cambiar la ruta basada en segmento por una ruta limpia que soporte opcionalidad o query params:
$app->get('/api/vehiculos/{placa}/fondos', [$vehiculosCtrl, 'obtenerFondos'])->add($pVehiculoDetalle);
$app->get('/api/vehiculos/{placa}/fondos/{anio}', [$vehiculosCtrl, 'obtenerFondos'])->add($pVehiculoDetalle);
$app->get('/api/vehiculos/{placa}/resumen', [$vehiculosCtrl, 'obtenerResumen'])->add($pVehiculoResumen);
$app->get('/api/vehiculos/{placa}', [$vehiculosCtrl, 'obtenerPorPlaca'])->add($pVehiculoConsultar);

$app->get('/api/retiros/saldo/{placa}', [$retirosCtrl, 'obtenerSaldo'])->add($auth);
$app->post('/api/retiros/with-file', [$retirosCtrl, 'crearRetiroConAdjunto'])->add($pRetiroCrear);
$app->get('/api/retiros/{placa}', [$retirosCtrl, 'obtenerRetiros'])->add($auth);
$app->post('/api/retiros', [$retirosCtrl, 'crearRetiro'])->add($pRetiroCrear);

$app->get('/api/usuarios/roles', [$usuariosCtrl, 'obtenerRolesParaDropdown'])->add($pUsuarioCrear);
$app->get('/api/usuarios', [$usuariosCtrl, 'obtenerUsuarios'])->add($auth);
$app->post('/api/usuarios', [$usuariosCtrl, 'crear'])->add($pUsuarioCrear);
$app->put('/api/usuarios/{id}/estado', [$usuariosCtrl, 'cambiarEstado'])->add($pUsuarioEditar);
$app->patch('/api/usuarios/{id}/inhabilitar', [$usuariosCtrl, 'inhabilitar'])->add($pUsuarioEditar);
$app->put('/api/usuarios/{id}', [$usuariosCtrl, 'editar'])->add($pUsuarioEditar);
$app->put('/api/usuarios/{id}/password', [$usuariosCtrl, 'restablecerPassword'])->add($pUsuarioEditar);
$app->delete('/api/usuarios/{id}', [$usuariosCtrl, 'eliminar'])->add($pUsuarioEditar);

$app->get('/api/roles/permisos', [$rolesCtrl, 'obtenerPermisos'])->add($pUsuarioConsultar);
$app->get('/api/roles', [$rolesCtrl, 'obtenerRoles'])->add($pUsuarioConsultar);
$app->post('/api/roles', [$rolesCtrl, 'crearRol'])->add($pUsuarioCrear);
$app->post('/api/roles/asignar', [$rolesCtrl, 'asignarPermiso'])->add($pUsuarioEditar);
$app->post('/api/roles/quitar', [$rolesCtrl, 'quitarPermiso'])->add($pUsuarioEditar);

$app->post('/api/fondo/cargue', [$fondoCtrl, 'cargue'])->add($pFondoCargue);
$app->post('/api/fondo/cargue-completo', [$fondoCtrl, 'cargueCompleto'])->add($pFondoCargue);

$app->get('/api/solicitudes/vehiculo/{placa}', [$solicitudesCtrl, 'getByPlaca'])->add($pVehiculoConsultar);
$app->get('/api/solicitudes', [$solicitudesCtrl, 'getAll'])->add($pVehiculoConsultar);
$app->post('/api/solicitudes', [$solicitudesCtrl, 'create'])->add($pVehiculoConsultar);
$app->put('/api/solicitudes/{id}/estado', [$solicitudesCtrl, 'nuevoEstado'])->add($pVehiculoConsultar);

$app->get('/api/solicitudes/{id}/documentacion', [$documentacionCtrl, 'listarPorSolicitud'])->add($auth);
$app->post('/api/documentacion', [$documentacionCtrl, 'crear'])->add($auth);

$app->get('/api/adjuntos/ver', [$adjuntosCtrl, 'ver'])->add($auth);

// 5. Ruta comodín OPTIONS SIEMPRE al final de las definiciones de rutas
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// Registrar la ruta GET
$app->get('/api/dashboard', function ($request, $response) use ($db) {
    $queryParams = $request->getQueryParams();
    $anioParam = $queryParams['anio'] ?? 'todos';
    $placa = $queryParams['placa'] ?? null;
    
    $anio = ($anioParam !== null && $anioParam !== '' && $anioParam !== 'todos') 
        ? (int)$anioParam 
        : null;

    $metricas = $db->obtenerDashboardMetricas($anio, $placa);

    $response->getBody()->write(json_encode($metricas));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();