# Guía de Instalación y Configuración - Fondo de Reposición Gacela

## 1. Prerrequisitos

### 1.1 Herramientas Requeridas

**Para Desarrollo:**
- **PHP**: 8.2 o superior
- **Node.js**: 18 o superior (recomendado para Vite 7)
- **Composer**: 2.x
- **npm**: 9.x
- **MySQL**: 5.7+ o MariaDB 10.3+
- **Git**: para control de versiones

**Sistema Operativo:**
- Windows 10/11 (desarrollo actual)
- Linux (Ubuntu/Debian/CentOS) para producción

**Editor de Código:**
- VS Code (recomendado)
- Windsurf (usado actualmente)

### 1.2 Versiones Comprobadas

Basado en el análisis del proyecto:

| Herramienta | Versión | Fuente |
|-------------|---------|--------|
| PHP | >= 8.2 | <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\composer.json" lines="5-7" /> |
| Slim Framework | ^4.14 | <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\composer.json" line="10" /> |
| Firebase JWT | ^6.10 | <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\composer.json" line="12" /> |
| React | ^19.2.0 | <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\package.json" line="14" /> |
| Vite | ^7.2.4 | <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\package.json" line="33" /> |
| Tailwind CSS | ^4.1.18 | <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\package.json" line="32" /> |

---

## 2. Obtención del Código Fuente

```bash
# Clonar el repositorio (si aplica)
git clone <url-del-repositorio>
cd Fondo_Reposicion_Gacela_V1_SideGround
```

**Estructura del proyecto:**
```
Fondo_Reposicion_Gacela_V1_SideGround/
├── api/                 # Backend PHP
├── Frontend/            # Frontend React
├── docs/                # Documentación (creado por auditoría)
├── .gitignore
├── README.md
└── DOCUMENTACION.md
```

---

## 3. Configuración de Variables de Entorno

### 3.1 Backend (PHP)

**Ubicación**: `api/.env`

Crear archivo basado en `api/.env.example`:

```bash
cd api
cp .env.example .env
```

**Editar `.env` con valores reales:**

```env
JWT_KEY=<clave-secreta-para-JWT-generar-una-segura>
JWT_ISSUER=FondoReposicion
JWT_AUDIENCE=FondoReposicionUsuarios

DB_HOST=localhost
DB_PORT=3306
DB_NAME=fondo_repo_local
DB_USER=root
DB_PASS=<tu-contraseña-mysql>
```

**⚠️ NOTA DE SEGURIDAD:**
- NO usar los valores por defecto de .env.example en producción
- Generar JWT_KEY aleatorio y seguro (mínimo 32 caracteres)
- Usar usuario MySQL con permisos limitados en producción

### 3.2 Frontend (React)

**Ubicación**: `Frontend/.env.production` (ya existe)

```env
VITE_API_URL=http://localhost:8000/
```

**Para desarrollo local:** crear `Frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/
```

---

## 4. Preparación de la Base de Datos

### 4.1 Crear Base de Datos

```sql
CREATE DATABASE fondo_repo_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4.2 Crear Tablas

**NOTA:** No se encontraron scripts SQL DDL en el repositorio. Las tablas se infieren del código en DbProvider.php.

**Tablas requeridas (según análisis de código):**

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255),
    rol VARCHAR(50) NOT NULL,
    activo INT DEFAULT 1
);

-- Tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo INT DEFAULT 1
);

-- Tabla de permisos
CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- Tabla de relación roles-permisos
CREATE TABLE rol_permisos (
    rol_id INT,
    permiso_id INT,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    interno_actual INT,
    modelo INT,
    carroceria VARCHAR(100),
    propietario_actual VARCHAR(255),
    empresa_vinculacion_actual VARCHAR(255),
    vida_util_anios INT DEFAULT 10,
    observaciones TEXT
);

-- Tabla de movimientos del fondo
CREATE TABLE fondo_repo_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT,
    placa VARCHAR(10),
    fecha_movimiento DATE,
    anio INT,
    mes INT,
    valor DECIMAL(18,2),
    observacion TEXT,
    usuario VARCHAR(100),
    tipo_movimiento VARCHAR(20),
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
);

-- Tabla de retiros
CREATE TABLE fondo_repo_retiros_produc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    monto DECIMAL(18,2) NOT NULL,
    observacion TEXT,
    usuario VARCHAR(100),
    activo INT DEFAULT 1,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    ruta_adjunto VARCHAR(500)
);

-- Tabla de solicitudes
CREATE TABLE fondo_repo_solicitudes_produc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    valor_estimado DECIMAL(18,2) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    naturaleza VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Radicado',
    archivo_ruta VARCHAR(500),
    usuario VARCHAR(100),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de documentación
CREATE TABLE fondo_repo_documentacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT,
    tipo_documento VARCHAR(100),
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(500),
    observaciones TEXT,
    estado_asociado VARCHAR(50),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES fondo_repo_solicitudes_produc(id)
);
```

### 4.3 Datos Iniciales

**Crear usuario administrador inicial:**

```sql
INSERT INTO usuarios (usuario, nombre_completo, password_hash, rol, activo)
VALUES ('admin', 'Administrador del Sistema', '$2y$10$hash-generado-con-password_hash', 'ADMIN', 1);
```

**NOTA:** El hash debe generarse con password_hash() de PHP.

---

## 5. Instalación de Dependencias

### 5.1 Backend (PHP)

```bash
cd api
composer install
```

Esto instalará:
- Slim Framework 4.14
- Firebase JWT 6.10
- vlucas/phpdotenv 5.6
- Dependencias PSR-7

### 5.2 Frontend (React)

```bash
cd Frontend
npm install
```

Esto instalará:
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 4.1.18
- React Router 7.12.0
- Recharts 3.7.0
- jwt-decode 4.0.0

---

## 6. Ejecución del Backend

### 6.1 Servidor de Desarrollo PHP

```bash
cd api
php -S localhost:8000
```

El backend estará disponible en: `http://localhost:8000`

**NOTA:** El punto de entrada es `api/index.php`

### 6.2 Verificación de la API

```bash
# Test de salud (debería devolver 404 ya que / no es ruta válida)
curl http://localhost:8000/

# Test de login (requiere usuario en BD)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"tu-password"}'
```

---

## 7. Ejecución del Frontend

### 7.1 Servidor de Desarrollo Vite

```bash
cd Frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 7.2 Configuración de Puertos

**Backend:** Puerto 8000 (configurado en axios.jsx default)  
**Frontend:** Puerto 5173 (default de Vite)

**Para acceso desde otros equipos en LAN:**

Frontend (Vite) configura server.host en vite.config.js si es necesario.

---

## 8. Acceso desde el Equipo Local

1. **Backend:** `http://localhost:8000/api`
2. **Frontend:** `http://localhost:5173`

**Primer acceso:**
1. Navegar a `http://localhost:5173`
2. Sistema redirige a `/login`
3. Ingresar credenciales del usuario administrador
4. Sistema redirige al Dashboard

---

## 9. Acceso desde Otros Equipos de Red LAN

### 9.1 Backend

El servidor PHP debe configurarse para escuchar en todas las interfaces:

```bash
php -S 0.0.0.0:8000
```

O configurar servidor web (Apache/Nginx) para production.

### 9.2 Frontend

Configurar Vite para acceso externo (opcional para desarrollo):

**Frontend/vite.config.js:**
```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  // ...
})
```

---

## 10. Verificación de la API

### 10.1 Endpoints de Prueba

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"password"}'

# Dashboard (requiere token)
curl http://localhost:8000/api/dashboard/resumen \
  -H "Authorization: Bearer <token>"

# Vehículos (requiere token y permiso)
curl http://localhost:8000/api/vehiculos/ABC-123 \
  -H "Authorization: Bearer <token>"
```

---

## 11. Ejecución de Pruebas

**Estado actual:** No hay framework de pruebas configurado.  
**Comando:** No existe script de test en package.json  
**Acción:** Pendiente de implementar suite de pruebas

---

## 12. Diagnóstico de Errores Frecuentes

### 12.1 Error: "JWT_KEY no está configurado"

**Causa:** Archivo .env no existe o JWT_KEY no está definido  
**Solución:** Crear archivo .env en api/ con JWT_KEY válido

### 12.2 Error: "Connection refused"

**Causa:** Backend no está ejecutándose  
**Solución:** Iniciar servidor PHP con `php -S localhost:8000`

### 12.3 Error: "Database connection failed"

**Causa:** Credenciales incorrectas en .env o MySQL no iniciado  
**Solución:** Verificar DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS en .env

### 12.4 Error: "Vehículo no encontrado"

**Causa:** Placa no existe en base de datos  
**Solución:** Registrar vehículo previamente o usar placa válida

### 12.5 Error: "Saldo insuficiente"

**Causa**: Monto de retiro excede saldo disponible  
**Solución:** Registrar monto menor al saldo disponible

### 12.6 BUG: Error en restablecimiento de contraseña

**Causa:** Método PasswordHasher::hash() no existe  
**Solución:** Usar PasswordHasher::crearHash() (requiere corrección de código)

---

## 13. Procedimiento de Parada y Reinicio

### 13.1 Parar Backend

**En terminal:** `Ctrl + C` en la terminal donde se ejecutó `php -S`

### 13.2 Parar Frontend

**En terminal:** `Ctrl + C` en la terminal donde se ejecutó `npm run dev`

### 13.3 Reinicio

**Backend:** Repetir comando `php -S localhost:8000`  
**Frontend:** Repetir comando `npm run dev`

---

## 14. Preparación para Despliegue

### 14.1 Build de Frontend para Producción

```bash
cd Frontend
npm run build
```

Esto genera carpeta `dist/` con archivos optimizados.

### 14.2 Configuración de Producción

**Backend:**
- Configurar servidor web (Apache/Nginx) apuntando a api/index.php
- Configurar .env con valores de producción
- Asegurar permisos de escritura en api/uploads/
- Configurar upload_max_filesize en php.ini (mínimo 12M)

**Frontend:**
- Subir carpeta dist/ a servidor web
- Configurar servidor web para servir archivos estáticos
- Configurar VITE_API_URL en .env.production con URL de producción

### 14.3 Consideraciones para SiteGround

Ver documento: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\DESPLEGUE_SITEGROUND.md" />

**Resumen:**
- Subir contenido de api/ a public_html/api/
- Ejecutar `composer install` en servidor
- Crear .env desde .env.example
- Configurar base de datos en cPanel

---

## 15. Resumen de Comandos

| Tarea | Comando | Directorio |
|-------|---------|-----------|
| Instalar dependencias backend | `composer install` | api/ |
| Instalar dependencias frontend | `npm install` | Frontend/ |
| Iniciar backend dev | `php -S localhost:8000` | api/ |
| Iniciar frontend dev | `npm run dev` | Frontend/ |
| Build frontend prod | `npm run build` | Frontend/ |
| Lint frontend | `npm run lint` | Frontend/ |

---

## 16. Verificación de Instalación

### Checklist

- [ ] PHP 8.2+ instalado
- [ ] Node.js 18+ instalado
- [ ] Composer instalado
- [ ] npm instalado
- [ ] MySQL/MariaDB iniciado
- [ ] Base de datos creada
- [ ] Tablas creadas
- [ ] Usuario inicial creado
- [ ] .env configurado en api/
- [ ] Dependencias backend instaladas
- [ ] Dependencias frontend instaladas
- [ ] Backend ejecutándose en puerto 8000
- [ ] Frontend ejecutándose en puerto 5173
- [ ] Login funcional
- [ ] Dashboard accesible

---

## 17. Troubleshooting Avanzado

### 17.1 CORS Issues

Si el frontend no puede conectar al backend:

1. Verificar CorsMiddleware.php - Access-Control-Allow-Origin está en `*` (permite todo)
2. Si cambiaste a dominio específico, agregar a lista permitida
3. Verificar que el backend esté ejecutándose

### 17.2 JWT Expirado

Si el token expira frecuentemente:

1. Duración actual: 8 horas (JwtHelper.php línea 23)
2. Para cambiar: Modificar línea 23 en api/src/JwtHelper.php
3. Recomendación: Reducir a 1-2 horas, implementar refresh token

### 17.3 Permisos de Archivos

Si hay errores al subir archivos:

1. Verificar permisos de api/uploads/
2. Verificar .htaccess en api/uploads/
3. Verificar upload_max_filesize en php.ini o .htaccess (actualmente 12M)

---

## 18. Notas Importantes

### ⚠️ Bug Conocido

**Restablecimiento de contraseña roto:** El método `PasswordHasher::hash()` no existe en UsuariosController.php línea 84. Esta funcionalidad no funcionará hasta corregirse.

### 📝 Documentación Desactualizada

README.md y DOCUMENTACION.md mencionan ASP.NET Core 8, pero el backend actual es PHP. Ignorar esas referencias.

### 🔐 Secretos

NO usar los valores por defecto de .env.example en producción. Generar secretos aleatorios y seguros.
