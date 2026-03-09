using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/fondo")]
[Authorize]
public class FondoCargueController : ControllerBase
{
    private readonly IDataProvider _data;

    public FondoCargueController(IDataProvider data)
    {
        _data = data;
    }

    /// <summary>
    /// Cargue masivo: archivo CSV con columnas "placa" y "valor" (o nombre de columna ej. ene_26).
    /// Si se envía nombreColumna en el form, se usa esa columna; si no, se usa la cabecera del CSV (segunda columna).
    /// La columna se crea en fondo_repo_produc si no existe.
    /// </summary>
    [HttpPost("cargue")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5_242_880)]
    public IActionResult Cargue([FromForm] CargueFondoRequest request)
    {
        var archivo = request.Archivo;
        var nombreColumna = request.NombreColumna;
        if (archivo == null || archivo.Length == 0)
            return BadRequest("Debe enviar un archivo CSV.");
        if (string.IsNullOrWhiteSpace(nombreColumna) && archivo.FileName.Length == 0)
            return BadRequest("Indique el nombre de la columna (ej. ene_26) en el form o en la cabecera del CSV.");

        string? columna = nombreColumna?.Trim();
        var datos = new List<(string placa, decimal valor)>();

        using (var stream = archivo.OpenReadStream())
        using (var reader = new StreamReader(stream))
        {
            var primera = reader.ReadLine();
            if (string.IsNullOrEmpty(primera))
            {
                return BadRequest("El archivo está vacío.");
            }
            var partes = primera.Split(new[] { ',', ';', '\t' }, StringSplitOptions.TrimEntries);
            if (partes.Length < 2)
            {
                return BadRequest("CSV debe tener al menos 2 columnas (placa, valor o nombre de columna).");
            }
            
            int idxPlaca = 0, idxValor = 1;
            if (partes[0].Equals("placa", StringComparison.OrdinalIgnoreCase))
            {
                idxPlaca = 0;
                idxValor = 1;
                if (string.IsNullOrWhiteSpace(columna))
                    columna = partes[1].Trim().ToLowerInvariant();
            }
            else if (partes[1].Equals("placa", StringComparison.OrdinalIgnoreCase))
            {
                idxPlaca = 1;
                idxValor = 0;
                if (string.IsNullOrWhiteSpace(columna))
                    columna = partes[0].Trim().ToLowerInvariant();
            }
            else if (!string.IsNullOrWhiteSpace(columna))
            {
                for (int i = 0; i < partes.Length; i++)
                {
                    if (partes[i].Equals("placa", StringComparison.OrdinalIgnoreCase)) idxPlaca = i;
                    if (partes[i].Equals(columna, StringComparison.OrdinalIgnoreCase) || (columna != null && partes[i].Replace(" ", "_").Equals(columna, StringComparison.OrdinalIgnoreCase))) idxValor = i;
                }
            }
            else
            {
                columna = partes[1].Trim().ToLowerInvariant();
            }

            string? line;
            while ((line = reader.ReadLine()) != null)
            {
                var p = line.Split(new[] { ',', ';', '\t' }, StringSplitOptions.TrimEntries);
                if (p.Length < 2) continue;
                var pl = p[idxPlaca].Trim();
                if (string.IsNullOrEmpty(pl)) continue;
                if (!decimal.TryParse(p[idxValor].Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var val))
                    continue;
                datos.Add((pl, val));
            }
        }

        if (string.IsNullOrWhiteSpace(columna))
            return BadRequest("No se pudo determinar el nombre de la columna.");
        if (datos.Count == 0)
            return BadRequest("No hay filas válidas en el CSV.");

        try
        {
            _data.CargarColumnaFondo(columna, datos);
            return Ok(new { mensaje = $"Cargue correcto: {datos.Count} registros en columna '{columna}'." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
