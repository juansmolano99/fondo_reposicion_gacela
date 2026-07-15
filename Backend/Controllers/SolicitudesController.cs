using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[Route("api/solicitudes")]
[ApiController]
public class SolicitudesController : ControllerBase
{
    private static readonly HashSet<string> NaturalezasPermitidas = new(StringComparer.OrdinalIgnoreCase)
    {
        "propietario",
        "apoderado",
        "administrador"
    };

    private static readonly HashSet<string> EstadosPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "Radicado",
        "En Revision",
        "Aprobado",
        "Rechazado"
    };

    private readonly IDataProvider _data;
    private readonly IWebHostEnvironment _env;

    public SolicitudesController(IDataProvider data, IWebHostEnvironment env)
    {
        _data = data;
        _env = env;
    }

    // 1. Obtener TODAS las solicitudes
    [Authorize(Policy = "VEHICULO_CONSULTAR")]
    [HttpGet]
    public IActionResult GetAll()
    {
        var solicitudes = _data.ObtenerSolicitudes();
        return Ok(solicitudes);
    }

    // 2. Obtener solicitudes por Placa
    [Authorize(Policy = "VEHICULO_CONSULTAR")]
    [HttpGet("vehiculo/{placa}")]
    public IActionResult GetByPlaca(string placa)
    {
        var solicitudes = _data.ObtenerSolicitudesPorPlaca(placa);
        return Ok(solicitudes);
    }

    // 3. Crear nueva solicitud con archivo
    [Authorize(Policy = "VEHICULO_CONSULTAR")]
    [HttpPost]
    [RequestSizeLimit(10_485_760)] // 10 MB
    public async Task<IActionResult> Create([FromForm] CrearSolicitudRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Placa))
            return BadRequest("Placa es requerida");
        if (dto.ValorEstimado <= 0)
            return BadRequest("Valor estimado debe ser mayor a 0");
        if (string.IsNullOrWhiteSpace(dto.NombreCompleto))
            return BadRequest("Nombre de quien solicita es requerido");
        if (string.IsNullOrWhiteSpace(dto.Naturaleza) || !NaturalezasPermitidas.Contains(dto.Naturaleza.Trim()))
            return BadRequest("Naturaleza inválida");
        if (string.IsNullOrWhiteSpace(dto.Descripcion))
            return BadRequest("Descripción es requerida");

        var vehiculo = _data.ObtenerVehiculoPorPlaca(dto.Placa);
        if (vehiculo == null)
            return BadRequest("La placa no existe");

        string? rutaAdjunto = null;
        if (dto.Archivo != null && dto.Archivo.Length > 0)
        {
            var wwwroot = string.IsNullOrEmpty(_env.WebRootPath)
                ? Path.Combine(_env.ContentRootPath, "wwwroot")
                : _env.WebRootPath;
            var adjuntosDir = Path.Combine(wwwroot, "adjuntos", "solicitudes");
            Directory.CreateDirectory(adjuntosDir);
            var nombreSeguro = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}_{Path.GetFileName(dto.Archivo.FileName)}";
            var rutaCompleta = Path.Combine(adjuntosDir, nombreSeguro);
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
                await dto.Archivo.CopyToAsync(stream);
            rutaAdjunto = $"/adjuntos/solicitudes/{nombreSeguro}";
        }

        var usuario = User.Identity?.Name;
        var creada = _data.CrearSolicitud(new CrearSolicitudDto
        {
            Placa = dto.Placa,
            ValorEstimado = dto.ValorEstimado,
            NombreCompleto = dto.NombreCompleto,
            Naturaleza = dto.Naturaleza.Trim(),
            Descripcion = dto.Descripcion,
            RutaAdjunto = rutaAdjunto,
            Usuario = usuario
        });

        return Ok(creada);
    }

    // 4. Actualizar Estado
    [Authorize(Policy = "VEHICULO_CONSULTAR")]
    [HttpPut("{id}/estado")]
    public IActionResult UpdateEstado(int id, [FromBody] UpdateEstadoDto dto)
    {
        if (id <= 0) return BadRequest("Id inválido");
        if (string.IsNullOrWhiteSpace(dto.Estado)) return BadRequest("Estado es requerido");
        if (!EstadosPermitidos.Contains(dto.Estado.Trim())) return BadRequest("Estado inválido");

        var actualizado = _data.ActualizarEstadoSolicitud(id, dto.Estado.Trim());
        if (!actualizado) return NotFound();
        return Ok();
    }
}
