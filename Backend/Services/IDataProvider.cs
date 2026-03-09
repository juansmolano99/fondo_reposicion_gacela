using Microsoft.AspNetCore.SignalR;

public interface IDataProvider
{
    // ===== VEHÍCULOS =====
    VehiculoDto? ObtenerVehiculoPorPlaca(string placa);
    FondoMensualDto? ObtenerFondosMensuales(string placa, int anio);
    FondoResumenDto? ObtenerResumen(string placa);

    // ===== USUARIOS =====
    void CrearUsuario(Usuario usuario);
    Usuario? ObtenerUsuarioPorNombre(string nombreUsuario);
    List<UsuarioDto> ObtenerUsuarios();
    void EditarUsuario(int id, EditarUsuarioDto dto);
    void InhabilitarUsuario(int id);
    void EliminarUsuario(int id);
    void ToggleEstadoUsuario(int id);

    // ===== ROLES =====
    List<RolDto> ObtenerRoles();
    void CrearRol(CrearRolDto dto);

    // ===== PERMISOS =====
    List<PermisoDto> ObtenerPermisos();
    List<int> ObtenerPermisosPorRol(int rolId);
    List<string> ObtenerPermisosPorUsuario(string nombreUsuario);
    void AsignarPermisoRol(int rolId, int permisoId);
    void QuitarPermisoRol(int rolId, int permisoId);

    // -------- Totales Dashboard -------- ///
    decimal ObtenerTotalReposicion();
    decimal ObtenerTotalRetiros();
    int ObtenerUsuariosActivos();
    List<FlujoMensualDto> ObtenerFlujoMensual();

    // -------- Retiros --------- ///
    decimal ObtenerSaldoDisponible(string placa);
    void RegistrarRetiro(
        string placa,
        decimal monto,
        string? observacion,
        string usuario
    );
    List<RegistrarRetiroDto> ObtenerRetirosPorPlaca(string placa);
    void CrearRetiro(string placa, decimal monto, string? observacion, string usuario, string? rutaAdjunto = null);

    void ActualizarSaldoDisponible(string placa, decimal monto);

    /// <summary>Cargue masivo: actualiza o agrega valores en una columna de fondo_repo_produc (ej. ene_26).</summary>
    void CargarColumnaFondo(string nombreColumna, List<(string placa, decimal valor)> datos);
}

