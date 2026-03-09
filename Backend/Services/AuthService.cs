using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly IDataProvider _provider;

    public AuthService(IConfiguration config, IDataProvider provider)
    {
        _config = config;
        _provider = provider;
    }

    public (string? Token, string? NombreCompleto, string? Usuario, string? Rol) Login(string usuario, string password)
    {
        var user = _provider.ObtenerUsuarioPorNombre(usuario);

        if (user == null || !user.Activo)
            return (null, null, null, null);

        if (!PasswordHasher.Verificar(password, user.PasswordHash, user.PasswordSalt))
            return (null, null, null, null);

        // 🔹 CLAIMS BASE
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.NombreUsuario),
            new Claim(ClaimTypes.Role, user.Rol)
        };

        // 🔹 PERMISOS DINÁMICOS
        var permisos = _provider.ObtenerPermisosPorUsuario(user.NombreUsuario);

        foreach (var permiso in permisos)
        {
            claims.Add(new Claim("permiso", permiso));
        }

        // 🔹 JWT
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return (tokenString, user.NombreCompleto, user.NombreUsuario, user.Rol);
    }
}
