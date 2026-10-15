# Modelo de Datos - Fondo de Reposicion Gacela

## 1. Tablas de Base de Datos

### Tabla: usuarios

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| usuario | VARCHAR(100) | Nombre de usuario para login | UNIQUE |
| nombre_completo | VARCHAR(255) | Nombre completo del usuario | - |
| password_hash | VARCHAR(255) | Hash de contraseña (BCrypt) | - |
| password_salt | VARCHAR(255) | Salt para contraseñas heredadas (HMAC-SHA512) | - |
| rol | VARCHAR(50) | Rol asignado al usuario | FK (roles) |
| activo | INT | Estado activo (1=activo, 0=inactivo) | - |

---

### Tabla: roles

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| codigo | VARCHAR(50) | Código del rol (ej: ADMIN, OPERADOR) | UNIQUE |
| descripcion | VARCHAR(255) | Descripción del rol | - |
| activo | INT | Estado activo | - |

---

### Tabla: permisos

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| codigo | VARCHAR(50) | Código del permiso (ej: USUARIO_CONSULTAR) | UNIQUE |
| descripcion | VARCHAR(255) | Descripción del permiso | - |

---

### Tabla: rol_permisos

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| rol_id | INT | ID del rol | PK, FK (roles) |
| permiso_id | INT | ID del permiso | PK, FK (permisos) |

---

### Tabla: vehiculos

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| placa | VARCHAR(10) | Placa del vehículo | UNIQUE |
| interno_actual | INT | Número interno actual | - |
| modelo | INT | Año del modelo | - |
| carroceria | VARCHAR(100) | Tipo de carrocería | - |
| propietario_actual | VARCHAR(255) | Propietario actual | - |
| empresa_vinculacion_actual | VARCHAR(255) | Empresa de vinculación | - |
| vida_util_anios | INT | Vida útil en años (default 10) | - |
| observaciones | TEXT | Observaciones adicionales | - |

---

### Tabla: fondo_repo_movimientos

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| vehiculo_id | INT | ID del vehículo | FK (vehiculos) |
| placa | VARCHAR(10) | Placa del vehículo (denormalizado) | - |
| fecha_movimiento | DATE | Fecha del movimiento | - |
| anio | INT | Año del movimiento | - |
| mes | INT | Mes del movimiento (1-12) | - |
| valor | DECIMAL(18,2) | Valor del aporte | - |
| observacion | TEXT | Observaciones | - |
| usuario | VARCHAR(100) | Usuario que registró | - |
| tipo_movimiento | VARCHAR(20) | Tipo de movimiento (aporte) | - |

---

### Tabla: fondo_repo_retiros_produc

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| placa | VARCHAR(10) | Placa del vehículo | - |
| monto | DECIMAL(18,2) | Monto del retiro | - |
| observacion | TEXT | Observaciones | - |
| usuario | VARCHAR(100) | Usuario que registró | - |
| activo | INT | Estado activo (1=activo, 0=inactivo) | - |
| fecha | DATETIME | Fecha y hora del retiro | - |
| ruta_adjunto | VARCHAR(500) | Ruta del archivo adjunto | - |

---

### Tabla: fondo_repo_solicitudes_produc

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| placa | VARCHAR(10) | Placa del vehículo | - |
| valor_estimado | DECIMAL(18,2) | Valor estimado de reposición | - |
| nombre_completo | VARCHAR(255) | Nombre del solicitante | - |
| naturaleza | VARCHAR(50) | Naturaleza (propietario/apoderado/administrador) | - |
| descripcion | TEXT | Descripción de la solicitud | - |
| estado | VARCHAR(50) | Estado (Radicado/En Revisión/Pdte Documentación/Aprobado/Rechazado) | - |
| archivo_ruta | VARCHAR(500) | Ruta del archivo adjunto | - |
| usuario | VARCHAR(100) | Usuario que radicó | - |
| fecha_creacion | DATETIME | Fecha de creación | - |

---

### Tabla: fondo_repo_documentacion

| Columna | Tipo | Descripción | PK/FK |
|---------|------|-------------|-------|
| id | INT | Identificador único | PK |
| solicitud_id | INT | ID de la solicitud asociada | FK (fondo_repo_solicitudes_produc) |
| tipo_documento | VARCHAR(100) | Tipo de documento | - |
| nombre_archivo | VARCHAR(255) | Nombre original del archivo | - |
| ruta_archivo | VARCHAR(500) | Ruta del archivo | - |
| observaciones | TEXT | Observaciones | - |
| estado_asociado | VARCHAR(50) | Estado asociado | - |
| fecha_creacion | DATETIME | Fecha de creación | - |

---

## 2. Relaciones

### Relaciones Identificadas

- `usuarios.rol` → `roles.codigo` (FK)
- `rol_permisos.rol_id` → `roles.id` (FK)
- `rol_permisos.permiso_id` → `permisos.id` (FK)
- `fondo_repo_movimientos.vehiculo_id` → `vehiculos.id` (FK)
- `fondo_repo_documentacion.solicitud_id` → `fondo_repo_solicitudes_produc.id` (FK)

### Relaciones Denormalizadas

- `fondo_repo_movimientos.placa` - Denormalización de vehiculos.placa
- `fondo_repo_retiros_produc.placa` - Denormalización de vehiculos.placa
- `fondo_repo_solicitudes_produc.placa` - Denormalización de vehiculos.placa

---

## 3. Índices (Inferidos)

### Índices Probables

- `usuarios.usuario` - UNIQUE
- `roles.codigo` - UNIQUE
- `permisos.codigo` - UNIQUE
- `vehiculos.placa` - UNIQUE
- `fondo_repo_movimientos.placa` - INDEX
- `fondo_repo_movimientos.anio` - INDEX
- `fondo_repo_retiros_produc.placa` - INDEX
- `fondo_repo_solicitudes_produc.placa` - INDEX
- `fondo_repo_solicitudes_produc.estado` - INDEX

---

## 4. Limitaciones del Análisis

**No se encontraron scripts DDL** en el repositorio. El esquema se infiere de:

- Consultas SQL en DbProvider.php
- Estructura de arrays retornados por controllers
- Inferencia lógica de nombres de campos

**Para obtener el esquema exacto**, se recomienda ejecutar en base de datos de producción:

```sql
SHOW CREATE TABLE nombre_tabla;
```

en cada una de las 9 tablas identificadas.
