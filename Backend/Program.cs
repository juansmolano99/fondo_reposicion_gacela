using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseWebRoot("wwwroot");

// =======================
// Servicios base
// =======================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Fondo_Reposicion_Gacela.API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingrese SOLO el token JWT, sin escribir 'Bearer'"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// =======================
// Servicios propios
// =======================
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IDataProvider, MySqlDataProvider>();

// =======================
// JWT
// =======================
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("Jwt:Key NO está configurado en appsettings.json");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("USUARIO_CONSULTAR",
        policy => policy.RequireClaim("permiso", "USUARIO_CONSULTAR"));

    options.AddPolicy("USUARIO_CREAR",
        policy => policy.RequireClaim("permiso", "USUARIO_CREAR"));

    options.AddPolicy("USUARIO_EDITAR",
        policy => policy.RequireClaim("permiso", "USUARIO_EDITAR"));

    options.AddPolicy("USUARIO_ELIMINAR",
        policy => policy.RequireClaim("permiso", "USUARIO_ELIMINAR"));

    options.AddPolicy("VEHICULO_CONSULTAR",
        policy => policy.RequireClaim("permiso", "VEHICULO_CONSULTAR"));

    options.AddPolicy("VEHICULO_RESUMEN",
        policy => policy.RequireClaim("permiso", "VEHICULO_RESUMEN"));

    options.AddPolicy("VEHICULO_DETALLE",
        policy => policy.RequireClaim("permiso", "VEHICULO_DETALLE"));
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});



// =======================
// BUILD + PIPELINE (ESTO FALTABA)
// =======================
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseStaticFiles(); // archivos estáticos (adjuntos en wwwroot/adjuntos)

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
