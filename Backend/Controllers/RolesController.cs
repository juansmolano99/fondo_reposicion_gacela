using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IDataProvider _provider;

    public RolesController(IDataProvider provider)
    {
        _provider = provider;
    }

    // ==========================
    // LISTAR ROLES
    // ==========================
    [Authorize(Policy = "USUARIO_CONSULTAR")]
    [HttpGet]
    public IActionResult ObtenerRoles()
    {
        return Ok(_provider.ObtenerRoles());
    }

    // ==========================
    // CREAR ROL
    // ==========================
    [Authorize(Policy = "USUARIO_CREAR")]
    [HttpPost]
    public IActionResult CrearRol([FromBody] CrearRolDto dto)
    {
        _provider.CrearRol(dto);
        return Ok();
    }

    // ==========================
    // LISTAR PERMISOS
    // ==========================
    [Authorize(Policy = "USUARIO_CONSULTAR")]
    [HttpGet("permisos")]
    public IActionResult ObtenerPermisos()
    {
        return Ok(_provider.ObtenerPermisos());
    }

    // ==========================
    // ASIGNAR PERMISO
    // ==========================
    [Authorize(Policy = "USUARIO_EDITAR")]
    [HttpPost("asignar")]
    public IActionResult AsignarPermiso([FromBody] RolPermisoDto dto)
    {
        _provider.AsignarPermisoRol(dto.RolId, dto.PermisoId);
        return Ok();
    }

    // ==========================
    // QUITAR PERMISO
    // ==========================
    [Authorize(Policy = "USUARIO_EDITAR")]
    [HttpPost("quitar")]
    public IActionResult QuitarPermiso([FromBody] RolPermisoDto dto)
    {
        _provider.QuitarPermisoRol(dto.RolId, dto.PermisoId);
        return Ok();
    }
}
