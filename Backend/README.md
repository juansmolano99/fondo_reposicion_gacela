# Backend - Fondo de Reposición Gacela

API REST ASP.NET Core para la gestión del fondo de reposición de vehículos del Grupo Gacela.

## Tecnologías

- **ASP.NET Core 8** - Framework web
- **MySQL** - Base de datos
- **JWT** - Autenticación y autorización
- **Entity Framework Core** - ORM

## Configuración

1. Configurar la cadena de conexión MySQL en `appsettings.json`
2. Configurar las claves JWT en `appsettings.json`:
   - `Jwt:Key`
   - `Jwt:Issuer`
   - `Jwt:Audience`

## Estructura del proyecto

```
Backend/
├── Controllers/      # Controladores de la API
├── DTOs/            # Data Transfer Objects
├── Models/          # Modelos de datos
├── Services/        # Lógica de negocio
├── Scripts/         # Scripts SQL
├── Security/        # Configuración de seguridad
├── Program.cs       # Punto de entrada
└── appsettings.json # Configuración
```

## Ejecución

```bash
dotnet run
```

La API se ejecuta por defecto en `http://192.168.10.142:5092`.

## Configuración de archivos adjuntos

Crear la carpeta `wwwroot` en Backend y dentro `wwwroot/adjuntos` para que los adjuntos de retiros se guarden y se sirvan en `/adjuntos/...`.

## Scripts de base de datos

Ejecutar el script `Scripts/add_ruta_adjunto_retiros.sql` en la base MySQL si se usan adjuntos en retiros.

## Documentación completa

Para más información sobre la arquitectura general, instalación del frontend y configuración de la base de datos, consulta [DOCUMENTACION.md](../DOCUMENTACION.md)
