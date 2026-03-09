using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/retiros")]
[Authorize]
public class RetirosController : ControllerBase
{
    private readonly IDataProvider _data;
    private readonly IWebHostEnvironment _env;

    public RetirosController(IDataProvider data, IWebHostEnvironment env)
    {
        _data = data;
        _env = env;
    }

    // ===== SALDO DISPONIBLE =====
    // GET: api/retiros/saldo/{placa}
    [HttpGet("saldo/{placa}")]
    public IActionResult ObtenerSaldo(string placa)
    {
        var saldo = _data.ObtenerSaldoDisponible(placa);
        return Ok(saldo);
    }

    // ===== LISTADO DE RETIROS =====
    // GET: api/retiros/{placa}
    [HttpGet("{placa}")]
    public IActionResult ObtenerRetiros(string placa)
    {
        var retiros = _data.ObtenerRetirosPorPlaca(placa);
        return Ok(retiros);
    }

    // ===== REGISTRAR RETIRO (JSON) =====
    // POST: api/retiros
    [HttpPost]
    public IActionResult CrearRetiro([FromBody] CrearRetiroDto dto)
    {
        return CrearRetiroInterno(dto.Placa, dto.Monto, dto.Observacion, dto.RutaAdjunto);
    }

    // ===== REGISTRAR RETIRO CON ADJUNTO (multipart/form-data) =====
    // POST: api/retiros/with-file
    [HttpPost("with-file")]
    [RequestSizeLimit(10_485_760)] // 10 MB
    public async Task<IActionResult> CrearRetiroConAdjunto(
        [FromForm] string placa,
        [FromForm] decimal monto,
        [FromForm] string? observacion,
        IFormFile? archivo)
    {
        string? rutaAdjunto = null;
        if (archivo != null && archivo.Length > 0)
        {
            var wwwroot = string.IsNullOrEmpty(_env.WebRootPath)
                ? Path.Combine(_env.ContentRootPath, "wwwroot")
                : _env.WebRootPath;
            var adjuntosDir = Path.Combine(wwwroot, "adjuntos");
            Directory.CreateDirectory(adjuntosDir);
            var nombreSeguro = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Path.GetFileName(archivo.FileName)}";
            var rutaCompleta = Path.Combine(adjuntosDir, nombreSeguro);
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                await archivo.CopyToAsync(stream);
            rutaAdjunto = $"/adjuntos/{nombreSeguro}";
        }
        return CrearRetiroInterno(placa, monto, observacion, rutaAdjunto);
    }

    private IActionResult CrearRetiroInterno(string placa, decimal monto, string? observacion, string? rutaAdjunto)
    {
        if (string.IsNullOrWhiteSpace(placa))
            return BadRequest("Placa es requerida");
        if (monto <= 0)
            return BadRequest("El monto debe ser mayor a 0");

        var saldo = _data.ObtenerSaldoDisponible(placa);
        if (monto > saldo)
            return BadRequest($"Saldo insuficiente. Disponible: {saldo:N2}");

        var usuario = User.Identity!.Name!;
        _data.CrearRetiro(placa, monto, observacion, usuario, rutaAdjunto);

        return Ok(new
        {
            mensaje = "Retiro registrado correctamente",
            saldoRestante = saldo - monto
        });
    }
}
