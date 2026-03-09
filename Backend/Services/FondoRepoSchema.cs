using MySql.Data.MySqlClient;

/// <summary>
/// Descubre columnas de fondo_repo_produc para construir consultas dinámicas
/// y evitar cambiar código al agregar nuevos periodos (ej. Ene_26).
/// </summary>
public static class FondoRepoSchemaHelper
{
    private const string TableName = "fondo_repo_produc";

    public static List<string> GetColumnNames(string connectionString)
    {
        var list = new List<string>();
        using var conn = new MySqlConnection(connectionString);
        conn.Open();
        var cmd = new MySqlCommand(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @t ORDER BY ORDINAL_POSITION",
            conn);
        cmd.Parameters.AddWithValue("@t", TableName);
        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(r.GetString(0));
        return list;
    }

    /// <summary>Columnas que son totales por año: total_2023, total_2024, ...</summary>
    public static List<string> GetTotalAnualColumns(string connectionString)
    {
        return GetColumnNames(connectionString)
            .Where(c => c.StartsWith("total_", StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    /// <summary>Columnas mensuales para un año dado: ene_24, feb_24 o ene_2024, feb_2024.</summary>
    public static List<string> GetMensualColumnsForAnio(string connectionString, int anio)
    {
        var suffix2 = (anio % 100).ToString("00");
        var suffix4 = anio.ToString();
        var prefixos = new[] { "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic" };
        var todas = GetColumnNames(connectionString);
        var columnas = new List<string>();
        foreach (var p in prefixos)
        {
            if (todas.Contains(p + "_" + suffix2, StringComparer.OrdinalIgnoreCase))
                columnas.Add(todas.First(c => c.Equals(p + "_" + suffix2, StringComparison.OrdinalIgnoreCase)));
            else if (todas.Contains(p + "_" + suffix4, StringComparer.OrdinalIgnoreCase))
                columnas.Add(todas.First(c => c.Equals(p + "_" + suffix4, StringComparison.OrdinalIgnoreCase)));
        }
        return columnas;
    }

    /// <summary>Columnas que parecen mensuales: ene_23, feb_23, ene_24, ...</summary>
    public static List<string> GetTodasColumnasMensuales(string connectionString)
    {
        var todas = GetColumnNames(connectionString);
        var prefixos = new[] { "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic" };
        return todas
            .Where(c => prefixos.Any(p => c.StartsWith(p + "_", StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }

    /// <summary>Nombre del mes (ene, feb, ...) a partir del nombre de columna (ene_24, feb_24, ...).</summary>
    public static string ColumnToMesKey(string columnName)
    {
        var idx = columnName.IndexOf('_');
        return idx > 0 ? columnName[..idx].ToLowerInvariant() : columnName.ToLowerInvariant();
    }
}
