public class UsuarioDto
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = null!;
    public string NombreCompleto { get; set; } = null!;
    public string Rol { get; set; } = null!;
    public bool Activo { get; set; }
}