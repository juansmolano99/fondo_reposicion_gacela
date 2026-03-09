using MySql.Data.MySqlClient;

public class MySqlDataProvider : IDataProvider
{
    private readonly string _connectionString;

    public MySqlDataProvider(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("MySql")!;
    }

    private MySqlConnection GetConnection()
    {
        return new MySqlConnection(_connectionString);
    }

    //*Vehiculo* (consultas dinámicas según columnas de la tabla)

    public VehiculoDto? ObtenerVehiculoPorPlaca(string placa)
    {
        var columnas = FondoRepoSchemaHelper.GetColumnNames(_connectionString);
        var totalCols = FondoRepoSchemaHelper.GetTotalAnualColumns(_connectionString);
        var baseCols = new[] { "placa", "interno_actual", "modelo", "carroceria", "propietario_actual", "empresa_vinculacion_actual", "vida_util_anios", "observaciones" };
        var selectCols = baseCols.Where(c => columnas.Contains(c, StringComparer.OrdinalIgnoreCase))
            .Concat(totalCols)
            .Distinct()
            .ToList();
        if (selectCols.Count == 0) return null;

        var sql = $"SELECT {string.Join(", ", selectCols)} FROM fondo_repo_produc WHERE placa = @placa";
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@placa", placa);
        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        var dto = new VehiculoDto();
        foreach (var col in baseCols)
        {
            var idx = GetOrdinalSafe(reader, col);
            if (idx < 0) continue;
            switch (col.ToLowerInvariant())
            {
                case "placa": dto.Placa = reader.GetString(idx); break;
                case "interno_actual": dto.NumeroInternoActual = reader.GetInt32(idx); break;
                case "modelo": dto.Modelo = reader.GetInt32(idx); break;
                case "carroceria": dto.Carroceria = reader.GetString(idx); break;
                case "propietario_actual": dto.PropietarioActual = reader.GetString(idx); break;
                case "empresa_vinculacion_actual": dto.EmpresaVinculacionActual = reader.GetString(idx); break;
                case "vida_util_anios": dto.VidaUtilAnios = reader.GetInt32(idx); break;
                case "observaciones": dto.Observaciones = reader.IsDBNull(idx) ? "" : reader.GetString(idx); break;
            }
        }
        foreach (var col in totalCols)
        {
            var idx = GetOrdinalSafe(reader, col);
            if (idx >= 0 && !reader.IsDBNull(idx))
            {
                var val = reader.GetDecimal(idx);
                dto.TotalesAnuales[col] = val;
                if (col.Equals("total_2023", StringComparison.OrdinalIgnoreCase)) dto.Total2023 = val;
                if (col.Equals("total_2024", StringComparison.OrdinalIgnoreCase)) dto.Total2024 = val;
                if (col.Equals("total_2025", StringComparison.OrdinalIgnoreCase)) dto.Total2025 = val;
            }
        }
        return dto;
    }

    private static int GetOrdinalSafe(MySqlDataReader reader, string name)
    {
        try { return reader.GetOrdinal(name); }
        catch { return -1; }
    }

    public FondoMensualDto? ObtenerFondosMensuales(string placa, int anio)
    {
        var cols = FondoRepoSchemaHelper.GetMensualColumnsForAnio(_connectionString, anio);
        if (cols.Count == 0) return new FondoMensualDto { Placa = placa, Anio = anio, Valores = new Dictionary<string, decimal>() };

        var sql = $"SELECT {string.Join(", ", cols)} FROM fondo_repo_produc WHERE placa = @placa";
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@placa", placa);
        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        var valores = new Dictionary<string, decimal>();
        foreach (var col in cols)
        {
            var idx = GetOrdinalSafe(reader, col);
            if (idx >= 0 && !reader.IsDBNull(idx))
                valores[FondoRepoSchemaHelper.ColumnToMesKey(col)] = reader.GetDecimal(idx);
        }
        return new FondoMensualDto { Placa = placa, Anio = anio, Valores = valores };
    }

    public FondoResumenDto? ObtenerResumen(string placa)
    {
        var totalCols = FondoRepoSchemaHelper.GetTotalAnualColumns(_connectionString);
        if (totalCols.Count == 0) return null;

        var sumTotal = string.Join(" + ", totalCols.Select(c => $"IFNULL(fr.{c}, 0)"));
        var groupBy = string.Join(", ", totalCols.Select(c => "fr." + c));
        var sql = $@"
            SELECT fr.placa, fr.vida_util_anios, {string.Join(", ", totalCols.Select(c => "fr." + c))},
                IFNULL(SUM(r.monto), 0) AS total_retiros
            FROM fondo_repo_produc fr
            LEFT JOIN fondo_repo_retiros_produc r ON r.placa = fr.placa AND r.activo = 1
            WHERE fr.placa = @placa
            GROUP BY fr.placa, fr.vida_util_anios, {groupBy}";

        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@placa", placa);
        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        decimal sumAnual = 0;
        var totalesAnuales = new Dictionary<string, decimal>();
        foreach (var col in totalCols)
        {
            var idx = GetOrdinalSafe(reader, col);
            if (idx >= 0 && !reader.IsDBNull(idx))
            {
                var v = reader.GetDecimal(idx);
                totalesAnuales[col] = v;
                sumAnual += v;
            }
        }
        var totalRetiros = reader.GetDecimal(reader.GetOrdinal("total_retiros"));
        var totalGeneral = sumAnual - totalRetiros;

        var dto = new FondoResumenDto
        {
            Placa = reader.GetString(reader.GetOrdinal("placa")),
            VidaUtilAnios = reader.GetInt32(reader.GetOrdinal("vida_util_anios")),
            Total2023 = totalesAnuales.GetValueOrDefault("total_2023"),
            Total2024 = totalesAnuales.GetValueOrDefault("total_2024"),
            Total2025 = totalesAnuales.GetValueOrDefault("total_2025"),
            TotalGeneral = totalGeneral,
            PromedioMensual = totalGeneral / 24,
            TotalesAnuales = totalesAnuales
        };
        return dto;
    }

    public void CrearUsuario(string usuario, string nombreCompleto, string hash, string salt, string rol)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var sql = @"
            INSERT INTO usuarios (usuario, nombre_completo, password_hash, password_salt, rol)
            VALUES (@usuario, @nombreCompleto, @hash, @salt, @rol)
        ";

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@usuario", usuario);
        cmd.Parameters.AddWithValue("@nombreCompleto", nombreCompleto);
        cmd.Parameters.AddWithValue("@hash", hash);
        cmd.Parameters.AddWithValue("@salt", salt);
        cmd.Parameters.AddWithValue("@rol", rol);

        cmd.ExecuteNonQuery();
    }

    public void CrearUsuario(Usuario u)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var sql = @"INSERT INTO usuarios
            (usuario, nombre_completo, password_hash, password_salt, rol, activo)
            VALUES (@u, @n, @h, @s, @r, @a)";

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@u", u.NombreUsuario);
        cmd.Parameters.AddWithValue("@n", u.NombreCompleto);
        cmd.Parameters.AddWithValue("@h", u.PasswordHash);
        cmd.Parameters.AddWithValue("@s", u.PasswordSalt);
        cmd.Parameters.AddWithValue("@r", u.Rol);
        cmd.Parameters.AddWithValue("@a", u.Activo);

        cmd.ExecuteNonQuery();
    }

    public Usuario? ObtenerUsuarioPorNombre(string nombreUsuario)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var sql = @"SELECT id, usuario, nombre_completo, password_hash, password_salt, rol, activo
                    FROM usuarios
                    WHERE usuario = @nombre";

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@nombre", nombreUsuario);

        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) return null;

        return new Usuario
        {
            Id = reader.GetInt32("id"),
            NombreUsuario = reader.GetString("usuario"),
            NombreCompleto = reader.GetString("nombre_completo"),
            PasswordHash = reader.GetString("password_hash"),
            PasswordSalt = reader.GetString("password_salt"),
            Rol = reader.GetString("rol"),
            Activo = reader.GetBoolean("activo")
        };
    }

    // PERMISOS POR USER//

    public List<string> ObtenerPermisosPorUsuario(string nombreUsuario)
    {
        var permisos = new List<string>();

        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var sql = @"
            SELECT p.codigo
            FROM usuarios u
            JOIN roles r ON r.codigo = u.rol
            JOIN rol_permisos rp ON rp.rol_id = r.id
            JOIN permisos p ON p.id = rp.permiso_id
            WHERE u.usuario = @usuario
            AND u.activo = 1
            ";

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@usuario", nombreUsuario);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            permisos.Add(reader.GetString("codigo"));
        }

        return permisos;
    }

    //ROLES//

    public List<RolDto> ObtenerRoles()
    {
        var roles = new Dictionary<int, RolDto>();

        using var conn = GetConnection();
        conn.Open();

        var cmd = new MySqlCommand(@"
            SELECT 
                r.id,
                r.codigo AS nombre,
                p.id AS permiso_id
            FROM roles r
            LEFT JOIN rol_permisos rp ON rp.rol_id = r.id
            LEFT JOIN permisos p ON rp.permiso_id = p.id
            WHERE r.activo = 1

        ", conn);

        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            var rolId = reader.GetInt32("id");

            if (!roles.ContainsKey(rolId))
            {
                roles[rolId] = new RolDto
                {
                    Id = rolId,
                    Nombre = reader.GetString("nombre"),
                    Permisos = new List<int>()
                };
            }

            if (!reader.IsDBNull(reader.GetOrdinal("permiso_id")))
            {
                roles[rolId].Permisos.Add(
                    reader.GetInt32("permiso_id")
                );
            }
        }

        return roles.Values.ToList();
    }

    public void CrearRol(CrearRolDto dto)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var cmd = new MySqlCommand(
        "INSERT INTO roles (codigo, descripcion, activo) VALUES (@c, @d, 1)",
        conn
        );

        cmd.Parameters.AddWithValue("@c", dto.Codigo);
        cmd.Parameters.AddWithValue("@d", dto.Descripcion);
        cmd.ExecuteNonQuery();
    }

    //PERMISOS//

    public List<PermisoDto> ObtenerPermisos()
    {
        var permisos = new List<PermisoDto>();

        using var conn = GetConnection();
        conn.Open();

        var cmd = new MySqlCommand(
            "SELECT id, codigo, descripcion FROM permisos",
            conn
        );

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            permisos.Add(new PermisoDto
            {
                Id = reader.GetInt32("id"),
                Codigo = reader.GetString("codigo"),
                Descripcion = reader.GetString("descripcion")
            });
        }

        return permisos;
    }

    //ASIGNAR O RETIRAR PERMISOS//

    public void AsignarPermisoRol(int rolId, int permisoId)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var cmd = new MySqlCommand(
            "INSERT IGNORE INTO rol_permisos (rol_id, permiso_id) VALUES (@r, @p)",
            conn
        );

        cmd.Parameters.AddWithValue("@r", rolId);
        cmd.Parameters.AddWithValue("@p", permisoId);
        cmd.ExecuteNonQuery();
    }

    public void QuitarPermisoRol(int rolId, int permisoId)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var cmd = new MySqlCommand(
            "DELETE FROM rol_permisos WHERE rol_id = @r AND permiso_id = @p",
            conn
        );

        cmd.Parameters.AddWithValue("@r", rolId);
        cmd.Parameters.AddWithValue("@p", permisoId);
        cmd.ExecuteNonQuery();
    }

    // ===== DASHBOARD =====

    public decimal ObtenerTotalReposicion()
    {
        var totalCols = FondoRepoSchemaHelper.GetTotalAnualColumns(_connectionString);
        if (totalCols.Count == 0) return 0;
        var sumExpr = string.Join(" + ", totalCols.Select(c => $"IFNULL(SUM({c}), 0)"));
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        var cmd = new MySqlCommand($"SELECT {sumExpr} FROM fondo_repo_produc", conn);
        return Convert.ToDecimal(cmd.ExecuteScalar() ?? 0);
    }


    public decimal ObtenerTotalRetiros()
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var cmd = new MySqlCommand(@"
            SELECT 
                IFNULL(SUM(monto),0)
            FROM fondo_repo_retiros_produc
        ", conn);

        return Convert.ToDecimal(cmd.ExecuteScalar());
    }

    public int ObtenerUsuariosActivos()
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var cmd = new MySqlCommand(
            "SELECT COUNT(*) FROM usuarios WHERE activo = 1",
            conn
        );

        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    public List<FlujoMensualDto> ObtenerFlujoMensual()
    {
        var cols = FondoRepoSchemaHelper.GetTodasColumnasMensuales(_connectionString);
        if (cols.Count == 0) return new List<FlujoMensualDto>();

        var mesNombres = new[] { ("Ene", "ene"), ("Feb", "feb"), ("Mar", "mar"), ("Abr", "abr"), ("May", "may"), ("Jun", "jun"), ("Jul", "jul"), ("Ago", "ago"), ("Sep", "sep"), ("Oct", "oct"), ("Nov", "nov"), ("Dic", "dic") };
        var partes = new List<string>();
        foreach (var (nombre, prefijo) in mesNombres)
        {
            var delMes = cols.Where(c => c.StartsWith(prefijo + "_", StringComparison.OrdinalIgnoreCase)).ToList();
            if (delMes.Count == 0) continue;
            var sumando = string.Join(" + ", delMes.Select(c => $"IFNULL({c}, 0)"));
            partes.Add($"SELECT '{nombre}' AS mes, SUM({sumando}) AS valor FROM fondo_repo_produc");
        }
        if (partes.Count == 0) return new List<FlujoMensualDto>();
        var sql = string.Join(" UNION ALL ", partes);
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        using var cmd = new MySqlCommand(sql, conn);
        var lista = new List<FlujoMensualDto>();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
            lista.Add(new FlujoMensualDto { Mes = reader.GetString(0), Valor = reader.GetDecimal(1) });
        return lista;
    }

    public List<UsuarioDto> ObtenerUsuarios()
    {
    var usuarios = new List<UsuarioDto>();

    using var conn = new MySqlConnection(_connectionString);
    conn.Open();

    var sql = @"
        SELECT 
            u.id,
            u.usuario,
            u.nombre_completo,
            u.rol,
            u.activo
        FROM usuarios u
        ORDER BY u.usuario
    ";

    using var cmd = new MySqlCommand(sql, conn);
    using var reader = cmd.ExecuteReader();

    while (reader.Read())
    {
        usuarios.Add(new UsuarioDto
        {
            Id = reader.GetInt32("id"),
            NombreUsuario = reader.GetString("usuario"),
            NombreCompleto = reader.GetString("nombre_completo"),
            Rol = reader.GetString("rol"),
            Activo = reader.GetBoolean("activo")
        });
    }

    return usuarios;
    }

    //*Retiros*//


public decimal ObtenerSaldoDisponible(string placa)
{
    var totalCols = FondoRepoSchemaHelper.GetTotalAnualColumns(_connectionString);
    if (totalCols.Count == 0) return 0;
    var sumExpr = string.Join(" + ", totalCols.Select(c => $"IFNULL(fr.{c}, 0)"));
    using var conn = new MySqlConnection(_connectionString);
    conn.Open();
    var sql = $@"
        SELECT ({sumExpr}) - IFNULL(SUM(r.monto), 0) AS saldo
        FROM fondo_repo_produc fr
        LEFT JOIN fondo_repo_retiros_produc r ON fr.placa = r.placa AND r.activo = 1
        WHERE fr.placa = @placa
        GROUP BY fr.placa";
    using var cmd = new MySqlCommand(sql, conn);
    cmd.Parameters.AddWithValue("@placa", placa);
    var result = cmd.ExecuteScalar();
    return result == null ? 0 : Convert.ToDecimal(result);
}

public void RegistrarRetiro(
    string placa,
    decimal monto,
    string? observacion,
    string usuario
)
{
    CrearRetiro(placa, monto, observacion, usuario, null);
}

public void CrearRetiro(
    string placa,
    decimal monto,
    string? observacion,
    string usuario,
    string? rutaAdjunto = null
)
{
    using var conn = new MySqlConnection(_connectionString);
    conn.Open();

    var incluirAdjunto = false;
    try
    {
        var check = new MySqlCommand("SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fondo_repo_retiros_produc' AND COLUMN_NAME = 'ruta_adjunto'", conn);
        incluirAdjunto = check.ExecuteScalar() != null;
    }
    catch { /* sin columna ruta_adjunto */ }

    string sql;
    if (incluirAdjunto)
    {
        sql = "INSERT INTO fondo_repo_retiros_produc (placa, monto, observacion, usuario, activo, ruta_adjunto) VALUES (@placa, @monto, @obs, @usuario, 1, @rutaAdjunto)";
    }
    else
    {
        sql = "INSERT INTO fondo_repo_retiros_produc (placa, monto, observacion, usuario, activo) VALUES (@placa, @monto, @obs, @usuario, 1)";
    }

    using var cmd = new MySqlCommand(sql, conn);
    cmd.Parameters.AddWithValue("@placa", placa);
    cmd.Parameters.AddWithValue("@monto", monto);
    cmd.Parameters.AddWithValue("@obs", observacion ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("@usuario", usuario);
    if (incluirAdjunto)
        cmd.Parameters.AddWithValue("@rutaAdjunto", (object?)rutaAdjunto ?? DBNull.Value);
    cmd.ExecuteNonQuery();
}

public List<RegistrarRetiroDto> ObtenerRetirosPorPlaca(string placa)
{
    var lista = new List<RegistrarRetiroDto>();

    using var conn = new MySqlConnection(_connectionString);
    conn.Open();

    var columnas = new List<string> { "id", "fecha", "monto", "observacion", "usuario" };
    try
    {
        using var checkConn = new MySqlConnection(_connectionString);
        checkConn.Open();
        var checkCmd = new MySqlCommand("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fondo_repo_retiros_produc' AND COLUMN_NAME = 'ruta_adjunto'", checkConn);
        if (checkCmd.ExecuteScalar() != null)
            columnas.Add("ruta_adjunto");
    }
    catch { /* ignorar */ }

    var sql = $@"SELECT {string.Join(", ", columnas)} FROM fondo_repo_retiros_produc WHERE placa = @placa AND activo = 1 ORDER BY fecha DESC";
    using var cmd = new MySqlCommand(sql, conn);
    cmd.Parameters.AddWithValue("@placa", placa);
    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        var rutaAdj = columnas.Contains("ruta_adjunto")
            ? (reader.IsDBNull(reader.GetOrdinal("ruta_adjunto")) ? null : reader.GetString(reader.GetOrdinal("ruta_adjunto")))
            : null;
        lista.Add(new RegistrarRetiroDto
        {
            Id = reader.GetInt32("id"),
            Placa = placa,
            Fecha = reader.GetDateTime("fecha"),
            Monto = reader.GetDecimal("monto"),
            Observacion = reader.IsDBNull(reader.GetOrdinal("observacion")) ? null : reader.GetString(reader.GetOrdinal("observacion")),
            Usuario = reader.GetString("usuario"),
            RutaAdjunto = rutaAdj
        });
    }

    return lista;
}

public void ActualizarSaldoDisponible(string placa, decimal monto)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();

        var sql = @"UPDATE fondo_repo_produc 
                    SET total_2024 = total_2024 - @monto
                    WHERE placa = @placa";

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@placa", placa);
        cmd.Parameters.AddWithValue("@monto", monto);

        cmd.ExecuteNonQuery();
    }



//* Fin Registro Retiros *///

    // ===== CARGUE DE INFORMACIÓN (nueva columna ej. Ene_26) =====

    public void CargarColumnaFondo(string nombreColumna, List<(string placa, decimal valor)> datos)
    {
        if (string.IsNullOrWhiteSpace(nombreColumna) || datos == null || datos.Count == 0)
            return;
        var col = nombreColumna.Trim().ToLowerInvariant();
        if (!System.Text.RegularExpressions.Regex.IsMatch(col, @"^[a-z]+_[0-9]{2,4}$|^total_[0-9]{4}$"))
            throw new ArgumentException("Nombre de columna no permitido (ej. ene_26, total_2026).");
        var columnas = FondoRepoSchemaHelper.GetColumnNames(_connectionString);
        if (!columnas.Contains(col, StringComparer.OrdinalIgnoreCase))
        {
            using var connAlt = new MySqlConnection(_connectionString);
            connAlt.Open();
            var alter = new MySqlCommand($"ALTER TABLE fondo_repo_produc ADD COLUMN `{col}` DECIMAL(18,2) NULL", connAlt);
            alter.ExecuteNonQuery();
        }
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        foreach (var (placa, valor) in datos)
        {
            var upd = new MySqlCommand($"UPDATE fondo_repo_produc SET `{col}` = @v WHERE placa = @p", conn);
            upd.Parameters.AddWithValue("@p", placa);
            upd.Parameters.AddWithValue("@v", valor);
            upd.ExecuteNonQuery();
        }
    }

    public void EditarUsuario(int id, EditarUsuarioDto dto)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        var cmd = new MySqlCommand(
            "UPDATE usuarios SET usuario = @u, nombre_completo = @n, rol = @r, activo = @a WHERE id = @id",
            conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@u", dto.NombreUsuario);
        cmd.Parameters.AddWithValue("@n", dto.NombreCompleto);
        cmd.Parameters.AddWithValue("@r", dto.Rol);
        cmd.Parameters.AddWithValue("@a", dto.Activo);
        cmd.ExecuteNonQuery();
    }

    public void InhabilitarUsuario(int id)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        var cmd = new MySqlCommand("UPDATE usuarios SET activo = 0 WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.ExecuteNonQuery();
    }

    public void EliminarUsuario(int id)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        var cmd = new MySqlCommand("UPDATE usuarios SET activo = 0 WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.ExecuteNonQuery();
    }

    public void ToggleEstadoUsuario(int id)
    {
        using var conn = new MySqlConnection(_connectionString);
        conn.Open();
        var cmd = new MySqlCommand("UPDATE usuarios SET activo = NOT activo WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.ExecuteNonQuery();
    }

    public List<int> ObtenerPermisosPorRol(int rolId)
    {
        throw new NotImplementedException();
    }
}
