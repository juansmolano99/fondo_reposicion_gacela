# Seguridad y Permisos - Fondo de Reposicion Gacela

## 1. Autenticación

### 1.1 JWT (JSON Web Tokens)

**Archivo:** `api/src/JwtHelper.php`

**Configuración:**
- Algoritmo: HS256
- Duración: 8 horas
- Claim de expiración: `exp = $now + (8 * 3600)`
- Issuer: JWT_ISSUER (desde .env)
- Audience: JWT_AUDIENCE (desde .env)

**Claims incluidos:**
- `iss` - Issuer
- `aud` - Audience
- `iat` - Issued at
- `exp` - Expiration
- `name` - Nombre del usuario
- `unique_name` - Usuario (duplicado)
- `role` - Rol del usuario
- `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` - Rol (duplicado, formato Microsoft)
- `permiso` - Array de permisos

**Problema:** Claims duplicados para nombre y rol (legado de migración desde ASP.NET).

---

### 1.2 Password Hashing

**Archivo:** `api/src/PasswordHasher.php`

**Estrategias soportadas:**

1. **BCrypt** (usuarios nuevos):
   ```php
   password_verify($password, $hash)
   ```

2. **HMAC-SHA512** (usuarios heredados de .NET):
   ```php
   hash_hmac('sha512', $password, $salt, true)
   ```

**Motivo:** Compatibilidad con migración desde ASP.NET Core.

---

## 2. Autorización

### 2.1 Middleware de Autenticación

**Archivo:** `api/src/Middleware/AuthMiddleware.php`

**Flujo:**
1. Extrae token del header `Authorization: Bearer ...`
2. Verifica firma y expiración con `JwtHelper.decode()`
3. Extrae usuario y permisos del payload
4. Si se requiere permiso específico, verifica que esté en array
5. Agrega atributos al request: `usuario`, `permisos`, `jwt`
6. Continúa al siguiente handler o retorna 401/403

---

### 2.2 Permisos Implementados

| Código | Descripción | Endpoint |
|--------|-------------|----------|
| `USUARIO_CONSULTAR` | Consultar usuarios y roles | GET /api/usuarios, GET /api/roles |
| `USUARIO_CREAR` | Crear usuarios | POST /api/usuarios |
| `USUARIO_EDITAR` | Editar usuarios y permisos | PUT /api/usuarios/{id}, POST /api/roles/asignar |
| `VEHICULO_CONSULTAR` | Consultar vehículos y solicitudes | GET /api/vehiculos, GET /api/solicitudes |
| `VEHICULO_RESUMEN` | Ver resumen de vehículo | GET /api/vehiculos/{placa}/resumen |
| `VEHICULO_DETALLE` | Ver detalle mensual | GET /api/vehiculos/{placa}/fondos |

---

### 2.3 Endpoints Solo con Autenticación

Sin permisos específicos (solo requieren token válido):
- `GET /api/dashboard` - Dashboard
- `GET /api/dashboard/resumen` - Resumen dashboard
- `GET /api/retiros/saldo/{placa}` - Saldo de retiros
- `GET /api/retiros/{placa}` - Lista retiros
- `POST /api/retiros` - Crear retiro
- `POST /api/retiros/with-file` - Crear retiro con archivo
- `POST /api/fondo/cargue` - Cargue masivo
- `POST /api/fondo/cargue-completo` - Cargue completo
- `GET /api/solicitudes/{id}/documentacion` - Documentación
- `POST /api/documentacion` - Crear documentación
- `GET /api/adjuntos/ver` - Ver adjuntos

**Riesgo:** Operaciones financieras (retiros, cargue) no requieren permisos específicos.

---

## 3. Configuración CORS

### 3.1 Middleware CORS

**Archivo:** `api/src/Middleware/CorsMiddleware.php`

**Configuración actual:**
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Problema CRÍTICO:** `Access-Control-Allow-Origin: *` permite cualquier origen.

**Riesgo:** Habilita ataques CSRF y exploits desde cualquier dominio.

**Recomendación:** Configurar orígenes específicos por entorno.

---

## 4. Validación de Archivos

### 4.1 Validación de Tamaño

**Estado:** ❌ NO IMPLEMENTADO

**Archivo:** `api/src/FileStorage.php`

**Problema:** No hay validación de tamaño máximo de archivo subido.

**Riesgo:** DoS por llenado de disco del servidor.

**Configuración .htaccess:** Límite de 12MB, pero esto es solo configuración PHP, no validación en código.

---

### 4.2 Validación de Tipo

**Estado:** ⚠️ PARCIAL (solo por extensión)

**Archivo:** `api/src/FileStorage.php` líneas 103-113

```php
public static function contentType(string $filename): string
{
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return match ($ext) {
        'pdf' => 'application/pdf',
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'txt' => 'text/plain',
        default => 'application/octet-stream',
    };
}
```

**Problema:** Solo valida por extensión, no por magic bytes.

**Riesgo:** Permite upload de malware renombrado (ej: malware.exe → malware.pdf).

**Recomendación:** Validar magic bytes usando `finfo_file()`.

---

## 5. Protección de Archivos Sensibles

### 5.1 .htaccess

**Archivo:** `api/.htaccess`

**Protecciones:**
- Bloquea acceso HTTP a `src/` y `vendor/`
- Bloquea acceso a `composer.json`, `composer.lock`
- Bloquea acceso a `.env`
- Bloquea ejecución de PHP en `uploads/`

**Configuración upload:**
```apache
php_value upload_max_filesize 12M
php_value post_max_size 12M
```

---

## 6. Secretos

### 6.1 Variables de Entorno

**Archivo:** `api/.env.example`

**Valores actuales:**
```env
JWT_KEY=Gacela_FondoReposicion_Technology_Gacela
DB_PASS=Gacelator*
```

**Problema CRÍTICO:** Valores por defecto débiles y previsibles.

**Riesgo:** Si se usan en producción, sistema completamente comprometido.

**Recomendación:** Usar placeholders seguros (CHANGE_ME, GENERATE_SECURE_KEY) y generar en producción.

---

## 7. Exposición de Errores

### 7.1 Detalles de Error

**Archivos afectados:**
- `VehiculosController.php` líneas 44-48 - Expone file, line, trace
- `FondoCargueController.php` líneas 173-179 - Expone stack trace

**Problema:** Exposición de información interna útil para atacantes.

**Recomendación:** Loggear internamente, no exponer detalles en producción.

---

## 8. Protección de Rutas Frontend

### 8.1 ProtectedRoute

**Archivo:** `Frontend/src/components/ProtectedRoute.jsx`

**Funcionalidad:**
- Verifica token en localStorage
- Decodifica JWT con `jwt-decode`
- Verifica permiso requerido
- Redirige a /unauthorized si falta permiso
- Redirige a /login si falta token

**Limitación:** Protección solo en frontend, no reemplaza validación backend.

---

## 9. Recomendaciones de Seguridad

### Inmediatas (CRÍTICO)

1. **Cambiar CORS de * a dominios específicos**
2. **Agregar validación de tamaño de archivo** (máximo 10MB)
3. **Agregar validación de tipo de archivo por magic bytes**
4. **Cambiar secretos en .env.example a placeholders seguros**
5. **Agregar permisos específicos para operaciones financieras**

### Corto Plazo

1. **Reducir duración de JWT a 1-2 horas**
2. **Implementar refresh tokens**
3. **Remover exposición de detalles de error en producción**
4. **Agregar rate limiting en endpoints críticos**

### Largo Plazo

1. **Implementar 2FA para usuarios administrativos**
2. **Agregar logging de acciones de seguridad**
3. **Implementar detección de anomalías**
4. **Auditoría regular de permisos y accesos**
