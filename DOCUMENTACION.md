# Documentación del proyecto · Fondo de Reposición Gacela

## 1. Descripción general

Aplicación web para la gestión del **fondo de reposición** de vehículos: consulta por placa, resúmenes por año, retiros con opción de adjuntos y cargue masivo de datos (ej. nuevos periodos como Ene_2026). Incluye módulos de usuarios, roles, permisos y dashboard.

- **Frontend:** React 19 + Vite + Tailwind CSS 4 (SPA).
- **Backend:** ASP.NET Core 8, API REST con JWT.
- **Base de datos:** MySQL (tablas `fondo_repo_produc`, `fondo_repo_retiros_produc`, `usuarios`, `roles`, `permisos`, `rol_permisos`).

---

## 2. Estructura del proyecto

```
Fondo_Reposicion_Gacela/
├── Fondo_Repo_Gacela-ui/     # Frontend React
│   ├── src/
│   │   ├── api/              # Cliente axios (baseURL, token)
│   │   ├── components/       # Sidebar, Header, ProtectedRoute, Retiros, etc.
│   │   ├── config/           # menu.js (rutas y permisos)
│   │   ├── hooks/            # useRetiros
│   │   ├── Layouts/           # MainLayout
│   │   ├── pages/             # Dashboard, Login, Vehiculos, Usuarios, Roles, CargueFondo
│   │   ├── Services/          # authService, dashboardService, retiroService, rolesService, api
│   │   └── Utils/             # auth.js (JWT, permisos), format.js
│   ├── vite.config.js
│   └── package.json
├── Backend/
│   ├── Controllers/          # Auth, Dashboard, Retiros, Usuarios, Roles, Vehiculos, FondoCargue
│   ├── DTOs/
│   ├── Models/
│   ├── Services/             # MySqlDataProvider, FondoRepoSchema, AuthService, PasswordHasher
│   ├── Scripts/              # add_ruta_adjunto_retiros.sql
│   ├── Program.cs
│   └── appsettings.json
└── DOCUMENTACION.md          # Este archivo
```

---

## 3. Funcionalidades principales

### 3.1 Autenticación y usuario en sidebar

- Login con usuario/contraseña; el backend devuelve un JWT.
- El **nombre de usuario** y **rol** del usuario logueado se muestran en la parte **inferior izquierda** del sidebar (reemplazando el valor fijo anterior).
- Las rutas y el menú se filtran por permisos (claims del JWT).

### 3.2 Retiros con archivos adjuntos

- Al registrar un retiro (por placa) se puede adjuntar un archivo (opcional).
- **Backend:** `POST /api/retiros` (JSON) o `POST /api/retiros/with-file` (multipart). Los archivos se guardan en `wwwroot/adjuntos` y la ruta se almacena en `fondo_repo_retiros_produc.ruta_adjunto`.
- **Frontend:** En la sección de retiros por vehículo hay un campo “Archivo adjunto” y en la tabla de historial una columna “Adjunto” con enlace para ver el archivo.
- **Base de datos:** Ejecutar el script `Backend/Scripts/add_ruta_adjunto_retiros.sql` si la columna `ruta_adjunto` no existe.

### 3.3 Consultas MySQL dinámicas

- Las consultas sobre `fondo_repo_produc` ya **no dependen de columnas fijas** en el código.
- El servicio `FondoRepoSchemaHelper` obtiene las columnas de la tabla desde `INFORMATION_SCHEMA` y se usan para:
  - **Vehículo por placa:** columnas base + todas las `total_*` (total_2023, total_2024, total_2026, etc.).
  - **Fondos mensuales por año:** columnas del tipo `ene_24`, `feb_24`, … (sufijo = año en 2 dígitos).
  - **Resumen:** suma dinámica de todas las `total_*` menos retiros.
  - **Saldo disponible:** suma dinámica de `total_*` menos retiros.
  - **Flujo mensual (dashboard):** suma por mes usando todas las columnas mensuales existentes.
- Al agregar nuevas columnas en la tabla (ej. `ene_2026`, `total_2026`) **no es necesario cambiar código** en el backend.

### 3.4 Cargue de información (nuevos periodos)

- **Ruta:** Menú “Cargue de datos” → `/fondo/cargue`.
- **Uso:** Subir un archivo CSV con:
  - Cabecera: `placa` y nombre de la columna (ej. `ene_2026`) o bien cabecera `placa, valor` e indicar el nombre de columna en el formulario.
  - Filas: placa y valor numérico.
- **Backend:** `POST /api/fondo/cargue` (multipart: `archivo`, opcional `nombreColumna`). Si la columna no existe en `fondo_repo_produc`, se crea con `ALTER TABLE ... ADD COLUMN` y luego se actualizan los valores por placa.
- Nombres de columna permitidos: tipo `ene_2026`, `ene_26`, `total_2026`, etc. (validación por expresión regular).

---

## 4. API principal (Backend)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login (usuario, contraseña) |
| GET | /api/dashboard/resumen | Resumen para dashboard |
| GET | /api/vehiculos/{placa} | Vehículo por placa |
| GET | /api/vehiculos/{placa}/resumen | Resumen fondo por placa |
| GET | /api/vehiculos/{placa}/fondos/{anio} | Fondos mensuales por año |
| GET | /api/retiros/saldo/{placa} | Saldo disponible |
| GET | /api/retiros/{placa} | Listado de retiros por placa |
| POST | /api/retiros | Crear retiro (JSON) |
| POST | /api/retiros/with-file | Crear retiro con adjunto (multipart) |
| GET | /api/usuarios | Lista usuarios |
| PUT | /api/usuarios/{id}/estado | Activar/inactivar usuario |
| GET | /api/roles | Roles |
| GET | /api/roles/permisos | Permisos |
| POST | /api/fondo/cargue | Cargue masivo CSV (multipart) |

Todas las rutas excepto login requieren `Authorization: Bearer <token>`.

---

## 5. Cómo ejecutar

### Frontend

```bash
cd Fondo_Repo_Gacela-ui
npm install
npm run dev
```

Por defecto se sirve en `http://localhost:5173`. La API se espera en `http://localhost:5092/api` (configurable en `src/api/axios.jsx`).

### Backend

- Configurar en `appsettings.json` la cadena de conexión `MySql` y `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`.
- Crear la carpeta `wwwroot` en Backend y dentro `wwwroot/adjuntos` para que los adjuntos de retiros se guarden y se sirvan en `/adjuntos/...`.
- Ejecutar el script `Scripts/add_ruta_adjunto_retiros.sql` en la base MySQL si se usan adjuntos en retiros.

```bash
cd Backend
dotnet run
```

La API queda en `http://localhost:5092` (puerto según configuración).

---

## 6. Base de datos

- **fondo_repo_produc:** una fila por vehículo (placa); columnas fijas (placa, interno_actual, modelo, …) y columnas dinámicas por periodo: `total_2023`, `total_2024`, `ene_24`, `feb_24`, …, `dic_25`, y las que se agreguen (ej. `ene_2026`).
- **fondo_repo_retiros_produc:** retiros (placa, monto, observacion, usuario, fecha, activo, **ruta_adjunto**).
- **usuarios, roles, permisos, rol_permisos:** autenticación y autorización.

---

## 7. Cambios realizados (resumen)

1. **Sidebar:** se muestra el usuario logueado y su rol en la parte inferior izquierda; eliminado `console.log` de permisos.
2. **Retiros:** soporte de archivo adjunto (backend multipart, columna `ruta_adjunto`, frontend con input file y enlace “Ver” en la tabla).
3. **MySQL dinámico:** `FondoRepoSchemaHelper` + refactor de `MySqlDataProvider` para construir consultas según columnas reales de `fondo_repo_produc`.
4. **Cargue de datos:** nueva página y endpoint para subir CSV y actualizar/crear una columna (ej. Ene_2026) sin tocar código.
5. **Usuarios:** uso del cliente `api` unificado (axios con token) y manejo de errores en activar/inactivar.
6. **Servicio de retiros (frontend):** URLs corregidas (`/retiros/{placa}`) y nuevo método `crearRetiroConAdjunto`; componente de retiros usa servicios en lugar de axios directo.

---

## 8. Notas de mantenimiento

- Al agregar un nuevo año o mes en la tabla (ej. `ene_2026`), basta con crear la columna en MySQL (o usar el cargue con un CSV); el backend la detecta y la incluye en consultas y totales.
- Los adjuntos de retiros se guardan en el servidor en `wwwroot/adjuntos`; en producción conviene definir política de respaldo y límite de tamaño (el endpoint limita a 10 MB).
- La URL base del API y la del frontend se pueden externalizar a variables de entorno para distintos entornos.
