public class DashboardResumenDto
{
    public decimal TotalReposicion { get; set; }
    public decimal TotalRetiros { get; set; }
    public int ReposicionesPendientes { get; set; }
    public int UsuariosActivos { get; set; }
    public int PresupuestoUtilizado { get; set; }
    public List<FlujoMensualDto>? FlujoMensual { get; set; }
}