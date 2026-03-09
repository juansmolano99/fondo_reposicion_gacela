public class RolDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public List<int> Permisos { get; set; } = new();
}


public class AsignarPermisoDto
{
    public int PermisoId { get; set; }
}
