public class FondoResumenDto
{
    public string Placa { get; set; } = "";
    public int VidaUtilAnios { get; set; }
    public decimal Total2023 { get; set; }
    public decimal Total2024 { get; set; }
    public decimal Total2025 { get; set; }
    public decimal TotalGeneral { get; set; }
    public decimal PromedioMensual { get; set; }
    /// <summary>Totales por año calculados dinámicamente (ej. 26).</summary>
    public Dictionary<string, decimal> TotalesAnuales { get; set; } = new();
}
