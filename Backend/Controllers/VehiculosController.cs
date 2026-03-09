using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/vehiculos")]
public class VehiculosController : ControllerBase
{
    private readonly IDataProvider _provider;

    public VehiculosController(IDataProvider provider)
    {
        _provider = provider;
    }

    [Authorize(Policy = "VEHICULO_CONSULTAR")]
    [HttpGet("{placa}")]
    public IActionResult ObtenerPorPlaca(string placa)
    {
        var vehiculo = _provider.ObtenerVehiculoPorPlaca(placa);
        if (vehiculo == null) return NotFound();

        return Ok(vehiculo);
    }

    [Authorize(Policy = "VEHICULO_DETALLE")]
    [HttpGet("{placa}/fondos/{anio}")]
    public IActionResult ObtenerFondos(string placa, int anio)
    {
        var fondos = _provider.ObtenerFondosMensuales(placa, anio);
        return Ok(fondos);
    }

    [Authorize(Policy = "VEHICULO_RESUMEN")]
    [HttpGet("{placa}/resumen")]
    public IActionResult ObtenerResumen(string placa)
    {
        var resumen = _provider.ObtenerResumen(placa);
        if (resumen == null) return NotFound();
        return Ok(resumen);
    }


}