namespace Fondo_Reposicion_Gacela.API.Models 
{
    public class Solicitud
    {
        public int Id { get; set; }
        public string Placa { get; set; } = string.Empty;
        public decimal ValorEstimado { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Naturaleza { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string? ArchivoRuta { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}