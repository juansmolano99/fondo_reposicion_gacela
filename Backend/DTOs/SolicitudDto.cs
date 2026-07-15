using Microsoft.AspNetCore.Http;
using System;

public class CrearSolicitudRequestDto
{
    public string Placa { get; set; } = "";
    public decimal ValorEstimado { get; set; }
    public string NombreCompleto { get; set; } = "";
    public string Naturaleza { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public IFormFile? Archivo { get; set; }
}

public class CrearSolicitudDto
{
    public string Placa { get; set; } = "";
    public decimal ValorEstimado { get; set; }
    public string NombreCompleto { get; set; } = "";
    public string Naturaleza { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string? RutaAdjunto { get; set; }
    public string? Usuario { get; set; }
}

public class SolicitudDtoResponse
{
    public int Id { get; set; }
    public string Placa { get; set; } = "";
    public decimal ValorEstimado { get; set; }
    public string NombreCompleto { get; set; } = "";
    public string Naturaleza { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string Estado { get; set; } = "";
    public string? ArchivoRuta { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class UpdateEstadoDto
{
    public string Estado { get; set; } = "";
}