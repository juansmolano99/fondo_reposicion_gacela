<?php

declare(strict_types=1);

namespace App;

final class DbProvider
{
    private \PDO $pdo;

    public function __construct()
    {
        $this->pdo = new \PDO(
            Config::dsn(),
            Config::dbUser(),
            Config::dbPass(),
            [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }

    public function pdo(): \PDO
    {
        return $this->pdo;
    }

    public function obtenerVehiculoPorPlaca(string $placa): ?array
    {
        $sql = 'SELECT v.placa, v.interno_actual AS interno_actual, v.modelo, v.carroceria,
                       v.propietario_actual AS propietario_actual, v.empresa_vinculacion_actual AS empresa_vinculacion_actual,
                       v.vida_util_anios, v.observaciones
                FROM vehiculos v
                WHERE v.placa = :placa';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':placa' => $placa]);
        $row = $stmt->fetch();

        if ($row === false) {
            return null;
        }

        // Consultar agregados por año directamente desde la tabla de movimientos (aportes)
        $sqlTotales = 'SELECT YEAR(m.fecha_movimiento) AS anio, IFNULL(SUM(m.valor), 0) AS total
                       FROM fondo_repo_movimientos m
                       INNER JOIN vehiculos v ON v.id = m.vehiculo_id
                       WHERE v.placa = :placa
                       GROUP BY YEAR(m.fecha_movimiento)';
        $stmtTotales = $this->pdo->prepare($sqlTotales);
        $stmtTotales->execute([':placa' => $placa]);
        
        $totalesAnuales = [];
        $totalGeneral = 0.0;
        
        while ($t = $stmtTotales->fetch()) {
            $anio = (int) $t['anio'];
            $val = Http::decimal((string) $t['total']);
            $totalesAnuales['total_' . $anio] = $val;
            $totalGeneral += $val;
        }

        return [
            'placa' => (string) $row['placa'],
            'numeroInternoActual' => (int) $row['interno_actual'],
            'modelo' => (int) $row['modelo'],
            'carroceria' => (string) ($row['carroceria'] ?? ''),
            'propietarioActual' => (string) ($row['propietario_actual'] ?? ''),
            'empresaVinculacionActual' => (string) ($row['empresa_vinculacion_actual'] ?? ''),
            'vidaUtilAnios' => (int) ($row['vida_util_anios'] ?? 0),
            'total2023' => $totalesAnuales['total_2023'] ?? 0.0,
            'total2024' => $totalesAnuales['total_2024'] ?? 0.0,
            'total2025' => $totalesAnuales['total_2025'] ?? 0.0,
            'total2026' => $totalesAnuales['total_2026'] ?? 0.0,
            'totalGeneral' => $totalGeneral,
            'promedioMensual' => $totalGeneral / 12,
            'observaciones' => (string) ($row['observaciones'] ?? ''),
            'totalesAnuales' => empty($totalesAnuales) ? new \stdClass() : $totalesAnuales,
        ];
    }

    public function obtenerFondosMensuales(string $placa, ?int $anio = null): ?array
    {
        // Construimos la consulta base
        $sql = 'SELECT MONTH(m.fecha_movimiento) AS mes, IFNULL(SUM(m.valor), 0) AS total
                FROM fondo_repo_movimientos m
                INNER JOIN vehiculos v ON v.id = m.vehiculo_id
                WHERE v.placa = :placa';

        $params = [':placa' => $placa];

        // Si se proporciona un año específico, lo agregamos a la condición SQL
        if ($anio !== null) {
            $sql .= ' AND YEAR(m.fecha_movimiento) = :anio';
            $params[':anio'] = $anio;
        }

        $sql .= ' GROUP BY MONTH(m.fecha_movimiento)';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        $valores = [];
        while ($row = $stmt->fetch()) {
            $mesNum = (int) ($row['mes'] ?? 0);
            $mesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            $mesKey = ($mesNum >= 1 && $mesNum <= 12) ? $mesKeys[$mesNum - 1] : (string) $mesNum;
            $valores[$mesKey] = Http::decimal((string) $row['total']);
        }

        return [
            'placa' => $placa,
            'anio' => $anio ?? 'todos',
            'valores' => empty($valores) ? new \stdClass() : $valores,
        ];
    }

    public function obtenerFondosMensualesVehiculo(string $placa, ?int $anio = null): array
    {
        // Construir condición opcional de año
        $whereAnio = ($anio !== null && $anio > 0) ? " AND anio = :anio" : "";
        $params = [':placa' => trim($placa)];
        
        if ($anio !== null && $anio > 0) {
            $params[':anio'] = $anio;
        }

        $sql = "
            SELECT mes, COALESCE(SUM(valor), 0) AS total 
            FROM fondo_repo_movimientos 
            WHERE TRIM(placa) = TRIM(:placa) 
            AND (UPPER(tipo_movimiento) = 'APORTE' OR UPPER(tipo_movimiento) = 'INGRESO' OR tipo_movimiento IS NULL)
            {$whereAnio}
            GROUP BY mes 
            ORDER BY mes ASC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $resultados = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Formatear como un diccionario de meses o array plano según lo que espere tu frontend
        $valores = [];
        foreach ($resultados as $row) {
            $valores[$row['mes']] = (float) $row['total'];
        }

        return ['valores' => $valores];
    }

    public function obtenerResumen(string $placa): ?array
{
    $stmtVeh = $this->pdo->prepare("SELECT * FROM vehiculos WHERE placa = :placa LIMIT 1");
    $stmtVeh->execute([':placa' => $placa]);
    $veh = $stmtVeh->fetch(\PDO::FETCH_ASSOC);

    // Si no encuentra el vehículo, DEBE retornar null explícitamente
    if (!$veh) {
        return null; 
    }

    $sumAportes = $sumAportes ?? 0;
    $totalRetiros = $totalRetiros ?? 0;
    // ... tus cálculos de aportes y retiros ...
    $totalGeneral = $sumAportes - $totalRetiros;

    // Asegúrate de que el método SIEMPRE termine con un return válido
    return [
        'placa'           => (string) $veh['placa'],
        'vidaUtilAnios'   => (int) ($veh['vida_util_anios'] ?? 0),
        'totalGeneral'    => $totalGeneral,
        'promedioMensual' => $totalGeneral / 12,
    ];
}

    public function obtenerDashboardMetricas(?int $anio = null, ?string $placa = null): array
    {
        // Construir condiciones comunes para Aportes / Ingresos
        $whereAportes = ["(UPPER(tipo_movimiento) = 'APORTE' OR UPPER(tipo_movimiento) = 'INGRESO' OR tipo_movimiento IS NULL)"];
        $params = [];

        if ($anio && $anio > 0) {
            $whereAportes[] = "anio = :anio";
            $params[':anio'] = $anio;
        }

        if ($placa && trim($placa) !== '') {
            $whereAportes[] = "placa = :placa";
            $params[':placa'] = trim($placa);
        }

        $sqlWhereAportes = "WHERE " . implode(" AND ", $whereAportes);

        // 1. Total Reposición (Aportes)
        $stmtTotal = $this->pdo->prepare("
            SELECT COALESCE(SUM(valor), 0) AS total 
            FROM fondo_repo_movimientos 
            {$sqlWhereAportes}
        ");
        $stmtTotal->execute($params);
        $totalReposicion = (float) $stmtTotal->fetchColumn();

        // Construir condiciones para Retiros
        $whereRetiros = ["(activo = 1 OR activo IS NULL)"];
        $paramsRetiros = [];

        if ($anio && $anio > 0) {
            $whereRetiros[] = "YEAR(fecha) = :anio";
            $paramsRetiros[':anio'] = $anio;
        }

        if ($placa && trim($placa) !== '') {
            $whereRetiros[] = "UPPER(TRIM(placa)) = :placa";
            $paramsRetiros[':placa'] = trim($placa);
        }

        $sqlWhereRetiros = "WHERE " . implode(" AND ", $whereRetiros);

        // 2. Total Retiros
        $stmtRetiros = $this->pdo->prepare("
            SELECT COALESCE(SUM(monto), 0) AS total 
            FROM fondo_repo_retiros_produc 
            {$sqlWhereRetiros}
        ");
        $stmtRetiros->execute($paramsRetiros);
        $totalRetiros = (float) $stmtRetiros->fetchColumn();

        // 3. Flujo mensual
        $stmtFlujo = $this->pdo->prepare("
            SELECT mes, COALESCE(SUM(valor), 0) AS total 
            FROM fondo_repo_movimientos 
            {$sqlWhereAportes}
            GROUP BY mes 
            ORDER BY mes ASC
        ");
        $stmtFlujo->execute($params);
        $movimientosMes = $stmtFlujo->fetchAll(\PDO::FETCH_KEY_PAIR);

        $nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        $flujoMensual = [];

        for ($m = 1; $m <= 12; $m++) {
            $flujoMensual[] = [
                'mes'   => $nombresMeses[$m - 1],
                'valor' => (float) ($movimientosMes[$m] ?? 0),
            ];
        }

        return [
            'totalReposicion' => $totalReposicion - $totalRetiros, // Ajuste para reflejar el saldo neto
            'totalRetiros'    => $totalRetiros,
            'flujoMensual'    => $flujoMensual,
            'anio'            => $anio,
            'placa'           => $placa,
        ];
    }

    public function obtenerVehiculoResumen(string $placa): ?array
    {
        $stmtVeh = $this->pdo->prepare("SELECT * FROM vehiculos WHERE placa = :placa LIMIT 1");
        $stmtVeh->execute([':placa' => $placa]);
        $veh = $stmtVeh->fetch(\PDO::FETCH_ASSOC);

        if (!$veh) {
            return null;
        }

        // Total de aportes desde fondo_repo_movimientos
        $stmtAportes = $this->pdo->prepare("
            SELECT COALESCE(SUM(valor), 0) 
            FROM fondo_repo_movimientos 
            WHERE vehiculo_id = :id AND tipo_movimiento = 'APORTE'
        ");
        $stmtAportes->execute([':id' => $veh['id']]);
        $sumAportes = (float) $stmtAportes->fetchColumn();

        // Total de retiros desde fondo_repo_retiros_produc
        $sqlRetiros = 'SELECT IFNULL(SUM(r.monto), 0) AS total_retiros
                       FROM fondo_repo_retiros_produc r
                       WHERE r.placa = :placa AND (r.activo = 1 OR r.activo IS NULL)';
        $stmtRetiros = $this->pdo->prepare($sqlRetiros);
        $stmtRetiros->execute([':placa' => $placa]);
        $totalRetiros = (float) $stmtRetiros->fetchColumn();

        // Saldo general = Total Aportes - Total Retiros
        $totalGeneral = $sumAportes - $totalRetiros;

        return [
            'placa'           => (string) $veh['placa'],
            'vidaUtilAnios'   => (int) ($veh['vida_util_anios'] ?? 0),
            'totalGeneral'    => $totalGeneral,
            'promedioMensual' => $totalGeneral / 24,
        ];
    }

    public function obtenerTotalReposicion(): float
    {
        $sql = 'SELECT IFNULL(SUM(valor), 0) FROM fondo_repo_movimientos';
        $val = $this->pdo->query($sql)->fetchColumn();
        return Http::decimal($val === false ? '0' : (string) $val);
    }

    public function obtenerTotalRetiros($anio = null, ?string $placa = null): float
    {
        $where = [];
        $params = [];

        // Filtro por año opcional
        if ($anio !== null && $anio !== 'todos' && $anio !== '' && $anio > 0) {
            $where[] = "YEAR(fecha) = :anio";
            $params[':anio'] = (int)$anio;
        }

        // Filtro por placa opcional
        if ($placa !== null && trim($placa) !== '') {
            $where[] = "UPPER(TRIM(placa)) = :placa";
            $params[':placa'] = trim(strtoupper($placa));
        }

        $sqlWhere = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

        $stmt = $this->pdo->prepare("
            SELECT COALESCE(SUM(monto), 0) AS total 
            FROM fondo_repo_retiros_produc 
            {$sqlWhere}
        ");
        
        $stmt->execute($params);
        $resultado = $stmt->fetchColumn();

        return (float) ($resultado !== false ? $resultado : 0);
    }

    public function obtenerSaldoDisponible(string $placa): float
    {
        // Suma de aportes en movimientos
        $sqlAportes = 'SELECT IFNULL(SUM(m.valor), 0)
                       FROM fondo_repo_movimientos m
                       INNER JOIN vehiculos v ON v.id = m.vehiculo_id
                       WHERE v.placa = :placa';
        $stmtA = $this->pdo->prepare($sqlAportes);
        $stmtA->execute([':placa' => $placa]);
        $aportes = Http::decimal((string) $stmtA->fetchColumn());

        // Suma de retiros en retiros_produc
        $sqlRetiros = 'SELECT IFNULL(SUM(monto), 0)
                       FROM fondo_repo_retiros_produc
                       WHERE placa = :placa AND (activo = 1 OR activo IS NULL)';
        $stmtR = $this->pdo->prepare($sqlRetiros);
        $stmtR->execute([':placa' => $placa]);
        $retiros = Http::decimal((string) $stmtR->fetchColumn());

        return $aportes - $retiros;
    }

    public function crearRetiro(string $placa, float $monto, ?string $observacion, string $usuario, ?string $rutaAdjunto = null): void
    {
        $sql = 'INSERT INTO fondo_repo_retiros_produc (placa, monto, observacion, usuario, activo, fecha, ruta_adjunto )
                VALUES (:placa, :monto, :obs, :usuario, 1, NOW(), :rutaAdjunto)';
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':placa' => $placa,
            ':monto' => $monto,
            ':obs' => $observacion,
            ':usuario' => $usuario,
            ':rutaAdjunto' => $rutaAdjunto,
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
/**
 * @return list<array<string, mixed>>
 */
    public function obtenerRetirosPorPlaca(string $placa, ?int $anio = null): array
    {
    $where = ['placa = :placa', '(activo = 1 OR activo IS NULL)'];
    $params = [':placa' => $placa];

    // Si viene un año válido, aplicamos el filtro en la consulta SQL
    if ($anio !== null && $anio > 0) {
        $where[] = 'YEAR(fecha) = :anio';
        $params[':anio'] = $anio;
    }

    $sqlWhere = implode(' AND ', $where);

    $sql = "SELECT id, fecha, monto AS monto, observacion, usuario, ruta_adjunto, activo
            FROM fondo_repo_retiros_produc
            WHERE {$sqlWhere}
            ORDER BY fecha DESC";
    
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);
    
    $lista = [];
    while ($row = $stmt->fetch()) {
        $fecha = $row['fecha'] ?? null;
        $fechaStr = $fecha ? date('Y-m-d\TH:i:s', strtotime((string) $fecha)) : null;

        $lista[] = [
            'id' => (int) $row['id'],
            'placa' => $placa,
            'fecha' => $fechaStr,
            'monto' => Http::decimal((string) $row['monto']),
            'observacion' => $row['observacion'] !== null ? (string) $row['observacion'] : null,
            'usuario' => (string) $row['usuario'],
            'activo' => true,
            'rutaAdjunto' => $row['ruta_adjunto'] !== null ? (string) $row['ruta_adjunto'] : null,
        ];
    }
    return $lista;
    }

    /**
     * @return list<array{mes:string,valor:float}>
     */
    public function obtenerFlujoMensual(): array
    {
        $sql = 'SELECT mes AS mes_num, SUM(valor) AS total
                     FROM fondo_repo_movimientos
                     GROUP BY mes
                     ORDER BY mes_num ASC';
        
        $stmt = $this->pdo->query($sql);
        $map = [];
        while ($row = $stmt->fetch()) {
            $map[(int) $row['mes_num']] = Http::decimal((string) $row['total']);
        }

        $mesNombres = [
            1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
            5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
        ];

        $lista = [];
        foreach ($mesNombres as $num => $nombre) {
            $lista[] = [
                'mes' => $nombre,
                'valor' => $map[$num] ?? 0.0,
            ];
        }
        return $lista;
    }

    public function obtenerPresupuestoUtilizado(): float
    {
        $reposicion = $this->obtenerTotalReposicion();
        $retiros = $this->obtenerTotalRetiros();

        if ($reposicion <= 0.0) {
            return 0.0;
        }

        return round(($retiros / $reposicion) * 100, 2);
    }

    public function obtenerUsuariosActivos(): int
    {
        $val = $this->pdo->query('SELECT COUNT(*) FROM usuarios WHERE activo = 1')->fetchColumn();
        return (int) $val;
    }

    public function obtenerUsuarioPorNombre(string $nombreUsuario): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, usuario, nombre_completo, password_hash, password_salt, rol, activo
             FROM usuarios WHERE usuario = :nombre'
        );
        $stmt->execute([':nombre' => $nombreUsuario]);
        $row = $stmt->fetch();
        if ($row === false) {
            return null;
        }
        return [
            'id' => (int) $row['id'],
            'nombreUsuario' => (string) $row['usuario'],
            'nombreCompleto' => (string) $row['nombre_completo'],
            'passwordHash' => (string) $row['password_hash'],
            'passwordSalt' => (string) ($row['password_salt'] ?? ''),
            'rol' => (string) $row['rol'],
            'activo' => ((int) $row['activo']) === 1,
        ];
    }

    /**
     * @return list<string>
     */
    public function obtenerPermisosPorUsuario(string $nombreUsuario): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT p.codigo
             FROM usuarios u
             JOIN roles r ON r.codigo = u.rol
             JOIN rol_permisos rp ON rp.rol_id = r.id
             JOIN permisos p ON p.id = rp.permiso_id
             WHERE u.usuario = :usuario AND u.activo = 1'
        );
        $stmt->execute([':usuario' => $nombreUsuario]);
        $permisos = [];
        while ($row = $stmt->fetch()) {
            $permisos[] = (string) $row['codigo'];
        }
        return $permisos;
    }

    /**
     * @return list<array{id:int,nombre:string,permisos:list<int>}>
     */
    public function obtenerRoles(): array
    {
        $sql = 'SELECT r.id, r.codigo AS nombre, p.id AS permiso_id
                FROM roles r
                LEFT JOIN rol_permisos rp ON rp.rol_id = r.id
                LEFT JOIN permisos p ON rp.permiso_id = p.id
                WHERE r.activo = 1';
        $stmt = $this->pdo->query($sql);
        $roles = [];
        while ($row = $stmt->fetch()) {
            $rolId = (int) $row['id'];
            if (!isset($roles[$rolId])) {
                $roles[$rolId] = [
                    'id' => $rolId,
                    'nombre' => (string) $row['nombre'],
                    'permisos' => [],
                ];
            }
            if ($row['permiso_id'] !== null) {
                $roles[$rolId]['permisos'][] = (int) $row['permiso_id'];
            }
        }
        return array_values($roles);
    }

    public function crearRol(string $codigo, string $descripcion): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO roles (codigo, descripcion, activo) VALUES (:c, :d, 1)'
        );
        $stmt->execute([':c' => $codigo, ':d' => $descripcion]);
    }

    /**
     * @return list<array{id:int,codigo:string,descripcion:string}>
     */
    public function obtenerPermisos(): array
    {
        $stmt = $this->pdo->query('SELECT id, codigo, descripcion FROM permisos');
        $permisos = [];
        while ($row = $stmt->fetch()) {
            $permisos[] = [
                'id' => (int) $row['id'],
                'codigo' => (string) $row['codigo'],
                'descripcion' => (string) $row['descripcion'],
            ];
        }
        return $permisos;
    }

    public function asignarPermisoRol(int $rolId, int $permisoId): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT IGNORE INTO rol_permisos (rol_id, permiso_id) VALUES (:r, :p)'
        );
        $stmt->execute([':r' => $rolId, ':p' => $permisoId]);
    }

    public function quitarPermisoRol(int $rolId, int $permisoId): void
    {
        $stmt = $this->pdo->prepare(
            'DELETE FROM rol_permisos WHERE rol_id = :r AND permiso_id = :p'
        );
        $stmt->execute([':r' => $rolId, ':p' => $permisoId]);
    }

    /**
     * @return list<array{id:int,nombreUsuario:string,nombreCompleto:string,rol:string,activo:bool}>
     */
    public function obtenerUsuarios(): array
    {
        $stmt = $this->pdo->query(
            'SELECT u.id, u.usuario, u.nombre_completo, u.rol, u.activo
             FROM usuarios u ORDER BY u.usuario'
        );
        $usuarios = [];
        while ($row = $stmt->fetch()) {
            $usuarios[] = [
                'id' => (int) $row['id'],
                'nombreUsuario' => (string) $row['usuario'],
                'nombreCompleto' => (string) $row['nombre_completo'],
                'rol' => (string) $row['rol'],
                'activo' => ((int) $row['activo']) === 1,
            ];
        }
        return $usuarios;
    }

    public function crearUsuario(string $usuario, string $nombreCompleto, string $hash, string $salt, string $rol, bool $activo = true): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO usuarios (usuario, nombre_completo, password_hash, password_salt, rol, activo)
             VALUES (:u, :n, :h, :s, :r, :a)'
        );
        $stmt->execute([
            ':u' => $usuario,
            ':n' => $nombreCompleto,
            ':h' => $hash,
            ':s' => $salt,
            ':r' => $rol,
            ':a' => $activo ? 1 : 0,
        ]);
    }

    public function editarUsuario(int $id, string $nombreUsuario, string $nombreCompleto, string $rol, bool $activo): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE usuarios SET usuario = :u, nombre_completo = :n, rol = :r, activo = :a WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $id,
            ':u' => $nombreUsuario,
            ':n' => $nombreCompleto,
            ':r' => $rol,
            ':a' => $activo ? 1 : 0,
        ]);
    }

    public function cambiarPassword(int $id, string $hash, string $salt): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE usuarios SET password_hash = :h, password_salt = :s WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $id,
            ':h' => $hash,
            ':s' => $salt,
        ]);
    }

    public function inhabilitarUsuario(int $id): void
    {
        $stmt = $this->pdo->prepare('UPDATE usuarios SET activo = 0 WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }

    public function eliminarUsuario(int $id): void
    {
        $this->inhabilitarUsuario($id);
    }

    public function toggleEstadoUsuario(int $id): void
    {
        $stmt = $this->pdo->prepare('UPDATE usuarios SET activo = NOT activo WHERE id = :id');
        $stmt->execute([':id' => $id]);
    }

    private function ensureSolicitudesTableExists(): void
    {
        $this->pdo->exec(
            'CREATE TABLE IF NOT EXISTS fondo_repo_solicitudes_produc (
                id INT AUTO_INCREMENT PRIMARY KEY,
                placa VARCHAR(10) NOT NULL,
                valor_estimado DECIMAL(18,2) NOT NULL,
                nombre_completo VARCHAR(255) NOT NULL,
                naturaleza VARCHAR(50) NOT NULL,
                descripcion TEXT NOT NULL,
                estado VARCHAR(50) NOT NULL,
                archivo_ruta VARCHAR(500) NULL,
                usuario VARCHAR(100) NULL,
                fecha_creacion DATETIME NOT NULL
            )'
        );
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function obtenerSolicitudes(): array
    {
        $this->ensureSolicitudesTableExists();
        $stmt = $this->pdo->query(
            'SELECT id, placa, valor_estimado, nombre_completo, naturaleza, descripcion, estado, archivo_ruta, fecha_creacion
             FROM fondo_repo_solicitudes_produc
             ORDER BY fecha_creacion DESC, id DESC'
        );
        return $this->mapSolicitudes($stmt);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function obtenerSolicitudesPorPlaca(string $placa): array
    {
        $this->ensureSolicitudesTableExists();
        $stmt = $this->pdo->prepare(
            'SELECT id, placa, valor_estimado, nombre_completo, naturaleza, descripcion, estado, archivo_ruta, fecha_creacion
             FROM fondo_repo_solicitudes_produc
             WHERE placa = :placa
             ORDER BY fecha_creacion DESC, id DESC'
        );
        $stmt->execute([':placa' => $placa]);
        return $this->mapSolicitudes($stmt);
    }

    public function crearSolicitud(
        string $placa,
        float $valorEstimado,
        string $nombreCompleto,
        string $naturaleza,
        string $descripcion,
        ?string $rutaAdjunto,
        ?string $usuario
    ): array {
        $this->ensureSolicitudesTableExists();
        $fecha = gmdate('Y-m-d H:i:s');
        $estado = 'Radicado';
        $stmt = $this->pdo->prepare(
            'INSERT INTO fondo_repo_solicitudes_produc
                (placa, valor_estimado, nombre_completo, naturaleza, descripcion, estado, archivo_ruta, usuario, fecha_creacion)
             VALUES
                (:placa, :valor, :nombre, :naturaleza, :descripcion, :estado, :archivo, :usuario, :fecha)'
        );
        $stmt->execute([
            ':placa' => $placa,
            ':valor' => $valorEstimado,
            ':nombre' => $nombreCompleto,
            ':naturaleza' => $naturaleza,
            ':descripcion' => $descripcion,
            ':estado' => $estado,
            ':archivo' => $rutaAdjunto,
            ':usuario' => $usuario,
            ':fecha' => $fecha,
        ]);
        $id = (int) $this->pdo->lastInsertId();
        return [
            'id' => $id,
            'placa' => $placa,
            'valorEstimado' => $valorEstimado,
            'nombreCompleto' => $nombreCompleto,
            'naturaleza' => $naturaleza,
            'descripcion' => $descripcion,
            'estado' => $estado,
            'archivoRuta' => $rutaAdjunto,
            'fechaCreacion' => date('Y-m-d\\TH:i:s', strtotime($fecha . ' UTC')),
        ];
    }

    public function actualizarEstadoSolicitud(int $id, string $nuevoEstado): bool
    {
        $this->ensureSolicitudesTableExists();
        $stmt = $this->pdo->prepare(
            'UPDATE fondo_repo_solicitudes_produc SET estado = :estado WHERE id = :id'
        );
        $stmt->execute([':estado' => $nuevoEstado, ':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function mapSolicitudes(\PDOStatement $stmt): array
    {
        $lista = [];
        while ($row = $stmt->fetch()) {
            $fecha = $row['fecha_creacion'] ?? null;
            $fechaStr = $fecha ? date('Y-m-d\\TH:i:s', strtotime((string) $fecha)) : null;

            $lista[] = [
                'id' => (int) $row['id'],
                'placa' => (string) $row['placa'],
                'valorEstimado' => Http::decimal((string) $row['valor_estimado']),
                'nombreCompleto' => (string) $row['nombre_completo'],
                'naturaleza' => (string) $row['naturaleza'],
                'descripcion' => (string) $row['descripcion'],
                'estado' => (string) $row['estado'],
                'archivoRuta' => $row['archivo_ruta'] !== null ? (string) $row['archivo_ruta'] : null,
                'fechaCreacion' => $fechaStr,
            ];
        }
        return $lista;
    }

    /**
     * @return list<string>
     */
    public function obtenerEmpresas(): array
    {
        $stmt = $this->pdo->query(
            'SELECT DISTINCT empresa_vinculacion_actual 
             FROM vehiculos 
             WHERE empresa_vinculacion_actual IS NOT NULL 
             AND empresa_vinculacion_actual != "" 
             ORDER BY empresa_vinculacion_actual ASC'
        );
        $empresas = [];
        while ($row = $stmt->fetch()) {
            $empresas[] = (string) $row['empresa_vinculacion_actual'];
        }
        return $empresas;
    }

    /**
     * @param list<string> $placas
     * @return array<string, array{id:int, placa:string, numero_interno:int, modelo:int, carroceria:string, propietario:string, empresa_vinculacion:string, vida_util_anios:int, observaciones:string}>
     */
    public function obtenerVehiculosPorPlacas(array $placas): array
    {
        if (empty($placas)) {
            return [];
        }

        $placeholders = str_repeat('?,', count($placas) - 1) . '?';
        $sql = 'SELECT id, placa, interno_actual, modelo, carroceria, 
                       propietario_actual, empresa_vinculacion_actual, vida_util_anios, observaciones
                FROM vehiculos 
                WHERE placa IN (' . $placeholders . ')';
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($placas);
        
        $vehiculos = [];
        while ($row = $stmt->fetch()) {
            $vehiculos[(string) $row['placa']] = [
                'id' => (int) $row['id'],
                'placa' => (string) $row['placa'],
                'numero_interno' => (int) $row['interno_actual'],
                'modelo' => (int) $row['modelo'],
                'carroceria' => (string) ($row['carroceria'] ?? ''),
                'propietario' => (string) ($row['propietario_actual'] ?? ''),
                'empresa_vinculacion' => (string) ($row['empresa_vinculacion_actual'] ?? ''),
                'vida_util_anios' => (int) ($row['vida_util_anios'] ?? 0),
                'observaciones' => (string) ($row['observaciones'] ?? ''),
            ];
        }
        return $vehiculos;
    }

    /**
     * @return int
     */
    public function crearVehiculo(
        string $placa,
        ?int $interno_actual = null,
        ?string $propietario_actual = null,
        ?int $modelo = null,
        ?string $carroceria = null,
        ?string $empresa_vinculacion_actual = null,
        ?string $observaciones = null
    ): int {
        $sql = 'INSERT INTO vehiculos (placa, interno_actual, propietario_actual, modelo, carroceria, empresa_vinculacion_actual, observaciones, vida_util_anios)
                VALUES (:placa, :interno_actual, :propietario_actual, :modelo, :carroceria, :empresa_vinculacion_actual, :observaciones, 10)';
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':placa' => $placa,
            ':interno_actual' => $interno_actual,
            ':propietario_actual' => $propietario_actual ?? '',
            ':modelo' => $modelo ?? (int) date('Y'),
            ':carroceria' => $carroceria ?? '',
            ':empresa_vinculacion_actual' => $empresa_vinculacion_actual ?? '',
            ':observaciones' => $observaciones,
        ]);
        
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * @param list<array<string, mixed>> $vehiculos
     * @return array<string, int> Mapeo placa -> nuevo ID
     */
    public function crearVehiculosPorLote(array $vehiculos): array
    {
        $mapeoIds = [];
        
        foreach ($vehiculos as $vehiculo) {
            // Se leen ambas variantes de nombres de llaves para evitar 'Undefined array key'
            $interno = $vehiculo['numero_interno'] ?? $vehiculo['interno_actual'] ?? null;
            $propietario = $vehiculo['propietario'] ?? $vehiculo['propietario_actual'] ?? '';
            $empresa = $vehiculo['empresa_vinculacion'] ?? $vehiculo['empresa_vinculacion_actual'] ?? '';
            $modelo = $vehiculo['modelo'] ?? null;
            $carroceria = $vehiculo['carroceria'] ?? '';
            $observaciones = $vehiculo['observaciones'] ?? null;

            $nuevoId = $this->crearVehiculo(
                (string) $vehiculo['placa'],
                $interno !== null ? (int) $interno : null,
                (string) $propietario,
                $modelo !== null ? (int) $modelo : null,
                (string) $carroceria,
                (string) $empresa,
                $observaciones !== null ? (string) $observaciones : null
            );
            
            $mapeoIds[$vehiculo['placa']] = $nuevoId;
        }
        
        return $mapeoIds;
    }
     
    /**
     * @return int
     */
    public function crearMovimiento(
        int $vehiculoId,
        string $fecha,
        float $monto,
        string $usuario,
        string $tipoMovimiento = 'APORTE'
    ): int {
        $sql = 'INSERT INTO fondo_repo_movimientos (vehiculo_id, fecha_movimiento, valor, usuario, tipo_movimiento)
                VALUES (:vehiculo_id, :fecha_movimiento, :valor, :usuario, :tipo_movimiento)';
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':vehiculo_id' => $vehiculoId,
            ':fecha_movimiento' => $fecha,
            ':valor' => $monto,
            ':usuario' => $usuario,
            ':tipo_movimiento' => $tipoMovimiento,
        ]);
        
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * @param list<array<string, mixed>> $movimientos
     * @param array<string, int> $vehiculoIds Mapeo placa -> vehiculo_id
     * @param string $usuario Usuario autenticado
     * @return int Cantidad de movimientos insertados
     */
    public function crearMovimientosPorLote(array $movimientos, array $vehiculoIds, string $usuario): int
    {
        $sql = 'INSERT INTO fondo_repo_movimientos (vehiculo_id, fecha_movimiento, anio, mes, valor, observacion, usuario, tipo_movimiento)
                VALUES (:vehiculo_id, :fecha_movimiento, :anio, :mes, :valor, :observacion, :usuario, :tipo_movimiento)';
        
        $stmt = $this->pdo->prepare($sql);
        $count = 0;
        
        foreach ($movimientos as $movimiento) {
            $placa = $movimiento['placa'] ?? null;
            if (!$placa || !isset($vehiculoIds[$placa])) {
                continue; // Skip si no existe el vehículo
            }
            
            $vehiculoId = $vehiculoIds[$placa];
            $anio = (int) ($movimiento['anio'] ?? date('Y'));
            $mes = (int) ($movimiento['mes'] ?? date('n'));
            $fecha = sprintf('%04d-%02d-01', $anio, $mes);
            
            // Garantiza que tipo_movimiento nunca sea null ni vacío
            $tipoMovimiento = !empty($movimiento['tipo_movimiento']) 
                ? (string) $movimiento['tipo_movimiento'] 
                : 'APORTE';

            $stmt->execute([
                ':vehiculo_id' => $vehiculoId,
                ':fecha_movimiento' => $fecha,
                ':anio' => $anio,
                ':mes' => $mes,
                ':valor' => (float) ($movimiento['valor'] ?? 0),
                ':observacion' => $movimiento['observacion'] ?? null,
                ':usuario' => $usuario,
                ':tipo_movimiento' => $tipoMovimiento,
            ]);
            
            $count++;
        }
        
        return $count;
    
    }
    public function obtenerDocumentosPorSolicitud(int $solicitudId): array
    {
        $sql = 'SELECT * FROM fondo_repo_documentacion WHERE solicitud_id = :solicitud_id ORDER BY fecha_creacion DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':solicitud_id' => $solicitudId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function registrarDocumento(array $data): bool
    {
        $sql = 'INSERT INTO fondo_repo_documentacion (solicitud_id, tipo_documento, nombre_archivo, ruta_archivo, observaciones, estado_asociado) 
                VALUES (:solicitud_id, :tipo_documento, :nombre_archivo, :ruta_archivo, :observaciones, :estado_asociado)';
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ':solicitud_id' => $data['solicitud_id'],
            ':tipo_documento' => $data['tipo_documento'],
            ':nombre_archivo' => $data['nombre_archivo'],
            ':ruta_archivo' => $data['ruta_archivo'],
            ':observaciones' => $data['observaciones'] ?? null,
            ':estado_asociado' => $data['estado_asociado']
        ]);
    }

}