using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/adjuntos")]
[Authorize]
public class AdjuntosController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public AdjuntosController(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>
    /// Sirve un archivo adjunto de retiros. GET /api/adjuntos/ver?ruta=/adjuntos/20250101120000_doc.pdf
    /// </summary>
    [HttpGet("ver")]
    public IActionResult Ver([FromQuery] string ruta)
    {
        if (string.IsNullOrWhiteSpace(ruta) || !ruta.StartsWith("/adjuntos/"))
            return BadRequest("Ruta inválida");
        var filename = ruta.TrimStart('/').Replace("adjuntos/", "");
        if (string.IsNullOrEmpty(filename) || filename.Contains(".."))
            return BadRequest("Nombre de archivo inválido");
        var wwwroot = string.IsNullOrEmpty(_env.WebRootPath)
            ? Path.Combine(_env.ContentRootPath, "wwwroot")
            : _env.WebRootPath;
        var fullPath = Path.Combine(wwwroot, "adjuntos", filename);
        if (!System.IO.File.Exists(fullPath))
            return NotFound();
        var contentType = "application/octet-stream";
        var ext = Path.GetExtension(filename).ToLowerInvariant();
        if (ext == ".pdf") contentType = "application/pdf";
        else if (ext == ".jpg" || ext == ".jpeg") contentType = "image/jpeg";
        else if (ext == ".png") contentType = "image/png";
        return PhysicalFile(fullPath, contentType, filename);
    }
}
