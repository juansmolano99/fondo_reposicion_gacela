public class FondoMensualDto
{
    public string Placa { get; set; } = string.Empty;
    public int Anio { get; set; }
    public Dictionary<string, decimal> Valores { get; set; } = new();
}
