using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDataProvider _provider;

    public DashboardController(IDataProvider provider)
    {
        _provider = provider;
    }

    // GET: api/dashboard/resumen
    [HttpGet("resumen")]
    public IActionResult ObtenerResumen()
    {
        var totalReposicion = _provider.ObtenerTotalReposicion();
        var totalRetiros = _provider.ObtenerTotalRetiros();
        var usuariosActivos = _provider.ObtenerUsuariosActivos();
        var flujoMensual = _provider.ObtenerFlujoMensual();

        return Ok(new
        {
            totalReposicion,
            totalRetiros,
            usuariosActivos,
            presupuestoUtilizado = 0,   // placeholder si aplica
            flujoMensual
        });
    }
}
