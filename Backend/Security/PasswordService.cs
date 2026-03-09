using System.Security.Cryptography;
using System.Text;

public static class PasswordService
{
    public static (string hash, string salt) CrearHash(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToBase64String(saltBytes);

        var hash = Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(password + salt))
        );

        return (hash, salt);
    }

    public static bool Verificar(
        string password,
        string hashGuardado,
        string saltGuardado)
    {
        var hashActual = Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(password + saltGuardado))
        );

        return hashActual == hashGuardado;
    }
}
