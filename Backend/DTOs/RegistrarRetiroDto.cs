public class RegistrarRetiroDto
{
    public int Id { get; set; }
    public string Placa { get; set; } = null!;
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public string? Observacion { get; set; }
    public string Usuario { get; set; } = null!;
    public bool Activo { get; set; }
    public string? RutaAdjunto { get; set; }
}

public class CrearRetiroDto
{
    public string Placa { get; set; } = null!;
    public decimal Monto { get; set; }
    public string? Observacion { get; set; }
    public string? RutaAdjunto { get; set; }
}
