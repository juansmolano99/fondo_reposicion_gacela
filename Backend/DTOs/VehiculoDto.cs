public class VehiculoDto
{
    public string Placa { get; set; } = "";
    public int NumeroInternoActual { get; set; }
    public int Modelo { get; set; }
    public string Carroceria { get; set; } = "";
    public string PropietarioActual { get; set; } = "";
    public string EmpresaVinculacionActual { get; set; } = "";
    public int VidaUtilAnios { get; set; }
    public decimal Total2023 { get; set; }
    public decimal Total2024 { get; set; }
    public decimal Total2025 { get; set; }
    public decimal TotalGeneral { get; set; }
    public string Observaciones { get; set; } = "";
    /// <summary>Totales por año leídos dinámicamente (ej. total_2026).</summary>
    public Dictionary<string, decimal> TotalesAnuales { get; set; } = new();
}
