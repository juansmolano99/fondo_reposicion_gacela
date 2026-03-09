using System.Security.Cryptography;
using System.Text;

public static class PasswordHasher
{
    public static (string Hash, string Salt) CrearHash(string password)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA512();

        var salt = Convert.ToBase64String(hmac.Key);
        var hash = Convert.ToBase64String(
            hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password))
        );

        return (hash, salt);
    }

    public static bool Verificar(
        string password,
        string storedHash,
        string storedSalt)
    {
        var saltBytes = Convert.FromBase64String(storedSalt);
        using var hmac = new System.Security.Cryptography.HMACSHA512(saltBytes);

        var computedHash = Convert.ToBase64String(
            hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password))
        );

        return computedHash == storedHash;
    }


}
