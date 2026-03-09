using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly IDataProvider _provider;

    public UsuariosController(IDataProvider provider)
    {
        _provider = provider;
    }

    // 📋 Listar roles (para dropdown en crear/editar)
    [Authorize(Policy = "USUARIO_CREAR")]
    [HttpGet("roles")]
    public IActionResult ObtenerRolesParaDropdown()
    {
        var roles = _provider.ObtenerRoles();
        return Ok(roles.Select(r => new { value = r.Nombre, label = r.Nombre }));
    }

    // 📋 Listar
    [HttpGet]
    public IActionResult ObtenerUsuarios()
    {
    try
    {
        var usuarios = _provider.ObtenerUsuarios();  // Verifica que este método no esté causando el error
        return Ok(usuarios);
    }
    catch (Exception ex)
    {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);  // Asegúrate de capturar los errores
    }
    }


    // ➕ Crear
    [Authorize(Policy = "USUARIO_CREAR")]
    [HttpPost]
    public IActionResult Crear([FromBody] CrearUsuarioDto dto)
    {
        var (hash, salt) = PasswordHasher.CrearHash(dto.Password);

        _provider.CrearUsuario(new Usuario
        {
            NombreUsuario = dto.NombreUsuario,
            NombreCompleto = dto.NombreCompleto,
            PasswordHash = hash,
            PasswordSalt = salt,
            Rol = dto.Rol,
            Activo = true
        });

        return Ok();
    }

    // ✏️ Editar
    [Authorize(Policy = "USUARIO_EDITAR")]
    [HttpPut("{id}")]
    public IActionResult Editar(int id, [FromBody] EditarUsuarioDto dto)
    {
        _provider.EditarUsuario(id, dto);
        return Ok();
    }

    // 🔄 Cambiar estado (activar/inactivar)
    [Authorize(Policy = "USUARIO_EDITAR")]
    [HttpPut("{id}/estado")]
    public IActionResult CambiarEstado(int id)
    {
        _provider.ToggleEstadoUsuario(id);
        return Ok();
    }

    // 🚫 Inhabilitar
    [Authorize(Policy = "USUARIO_EDITAR")]
    [HttpPatch("{id}/inhabilitar")]
    public IActionResult Inhabilitar(int id)
    {
        _provider.InhabilitarUsuario(id);
        return Ok();
    }

    // 🗑️ Eliminar (inactiva)
    [Authorize(Policy = "USUARIO_EDITAR")]
    [HttpDelete("{id}")]
    public IActionResult Eliminar(int id)
    {
        _provider.EliminarUsuario(id);
        return Ok();
    }
}
