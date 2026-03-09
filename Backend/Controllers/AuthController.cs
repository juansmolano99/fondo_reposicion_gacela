using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var (token, nombreCompleto, usuario, rol) = _auth.Login(dto.Usuario, dto.Password);
        if (token == null) return Unauthorized();

        return Ok(new { token, nombreCompleto, usuario, rol });
    }
}

