public class CargueFondoRequest
{
    public IFormFile Archivo { get; set; } = null!;
    public string? NombreColumna { get; set; }
}