# DESCRIPCIÓN TÉCNICA DEL PROYECTO
## Fondo de Reposición Gacela V1 - SideGround

Este documento explica cómo está construido el sistema, qué hace cada parte, dónde está la API, cómo la consume el frontend y qué conecta con qué.

---

## 1. Visión general

El proyecto es una aplicación web para gestionar el fondo de reposición de vehículos. La idea principal es:

- consultar información de cada vehículo por placa;
- revisar aportes, retiros y saldo disponible;
- consultar resumen financiero por año y por mes;
- registrar retiros del fondo;
- subir archivos adjuntos cuando aplica;
- gestionar usuarios, roles y permisos;
- consultar el dashboard principal con indicadores del fondo.

La arquitectura está dividida en dos grandes partes:

- Frontend: React + Vite en la carpeta Frontend.
- Backend/API: PHP + Slim Framework en la carpeta api.
- Base de datos: MySQL.
- Autenticación: JWT (JSON Web Token).

---

## 2. Estructura real del proyecto

### 2.1 Backend (API PHP)

La API vive en la carpeta api y su punto de entrada es:

- api/index.php

Desde ahí se crea la aplicación Slim, se cargan los middlewares, se registran las rutas y se inicializa la conexión a base de datos.

Carpetas y archivos relevantes:

- api/index.php: arranque de la API.
- api/src/Config.php: carga variables de entorno desde .env y expone funciones para acceder a la configuración.
- api/src/DbProvider.php: único punto de acceso a PDO/MYSQL. Aquí están las consultas principales.
- api/src/AuthService.php: lógica de login y validación de credenciales.
- api/src/JwtHelper.php: creación y validación de JWT.
- api/src/Middleware/AuthMiddleware.php: valida el token Bearer y verifica permisos.
- api/src/Middleware/CorsMiddleware.php: habilita CORS para que el frontend pueda llamar desde otro origen.
- api/src/Controllers/: controladores HTTP por módulo.
  - AuthController.php
  - DashboardController.php
  - VehiculosController.php
  - RetirosController.php
  - UsuariosController.php
  - RolesController.php
  - FondoCargueController.php
  - SolicitudesController.php
  - AdjuntosController.php
- api/uploads/: archivos subidos por usuarios, por ejemplo adjuntos de retiros.

### 2.2 Frontend (React)

La app frontend está en la carpeta Frontend.

Puntos clave:

- Frontend/src/App.jsx: define las rutas de la aplicación y resuelve si el usuario está autenticado.
- Frontend/src/pages/Login.jsx: pantalla de login.
- Frontend/src/components/ProtectedRoute.jsx: protege rutas según permisos.
- Frontend/src/Services/: servicios que consumen la API.
- Frontend/src/api/axios.jsx: cliente global de Axios con el token JWT.
- Frontend/src/Utils/auth.js: validación del token y permisos desde localStorage.

---

## 3. Cómo funciona la arquitectura completa

### 3.1 Flujo general

1. El usuario entra a la app React.
2. La app verifica si existe un token en localStorage.
3. Si no existe, lo manda a login.
4. En login, el frontend llama a la API con usuario y contraseña.
5. La API valida el usuario en MySQL.
6. Si es válido, genera un JWT con nombre, rol y permisos.
7. El frontend guarda el token y redirige al dashboard.
8. Cada llamada posterior al backend incluye el header Authorization: Bearer <token>.
9. El backend verifica el token en AuthMiddleware.
10. Si el token es válido y tiene los permisos requeridos, procesa la petición.
11. El resultado vuelve al frontend y se renderiza en la interfaz.

---

## 4. Conexión de cada parte con la siguiente

### 4.1 Frontend y API

El frontend no llama al backend "a mano" en cada componente; usa un cliente centralizado:

- Frontend/src/api/axios.jsx

Ese archivo hace esto:

- crea una instancia de Axios;
- define la base URL:
  - `import.meta.env.VITE_API_URL || "http://localhost:5092"`
  - luego añade `/api` a la URL base;
- en cada request, lee el token de localStorage y lo envía en el header `Authorization`.

Ejemplo real:

- baseURL = http://localhost:5092/api
- request = GET /dashboard/resumen
- final = http://localhost:5092/api/dashboard/resumen

Esto está definido en:

- Frontend/src/api/axios.jsx

Y es consumido desde servicios como:

- Frontend/src/Services/authService.js
- Frontend/src/Services/dashboardService.js

### 4.2 Login: cómo entra el usuario al sistema

El flujo real del login es:

- Login.jsx captura usuario y contraseña.
- llama a `login(usuario, password)` desde Frontend/src/Services/authService.js
- ese servicio hace una petición POST a la ruta `/auth/login`
- la API recibe esa petición en:
  - api/src/Controllers/AuthController.php
- el controlador llama a:
  - api/src/AuthService.php
- AuthService consulta el usuario con DbProvider y valida la contraseña.
- si es correcto, genera el JWT con JwtHelper.
- la API responde con un JSON que incluye:
  - token
  - nombreCompleto
  - usuario
  - rol
- el frontend guarda esos valores en localStorage y el estado cambia a autenticado.

### 4.3 Validación del token y permisos

La autenticación del backend está en:

- api/src/Middleware/AuthMiddleware.php

Este middleware:

- lee el header Authorization;
- espera formato `Bearer <token>`;
- decodifica el JWT con JwtHelper::decode();
- carga el usuario y sus permisos;
- si la ruta requiere un permiso específico, compara el permiso solicitado contra la lista del usuario;
- devuelve 401 si el token no es válido;
- devuelve 403 si el usuario no tiene permiso.

El frontend también valida el token de forma local para decidir si puede mostrar UI protegida:

- Frontend/src/Utils/auth.js
- `isAuthenticated()` decodifica el JWT con jwt-decode y compara `exp` con la hora actual.
- `getUserPermissions()` devuelve los permisos guardados en el token para proteger rutas.

### 4.4 Rutas protegidas del frontend

En App.jsx se definen rutas y se usan componente de protección:

- Frontend/src/components/ProtectedRoute.jsx

Este componente:

- lee los permisos del usuario desde el token;
- si el usuario no tiene el permiso solicitado, redirige a `/unauthorized`;
- si no hay token, redirige a `/login`.

Esto hace que el front no muestre secciones restringidas, pero el backend sigue siendo la validación real y segura.

---

## 5. Cómo funciona el backend por módulos

### 5.1 API principal y ruteo

La API se registra en api/index.php con rutas como:

- POST /auth/login
- GET /dashboard/resumen
- GET /vehiculos/{placa}
- GET /vehiculos/{placa}/resumen
- GET /vehiculos/{placa}/fondos/{anio}
- GET /retiros/{placa}
- POST /retiros
- POST /retiros/with-file
- GET /usuarios
- GET /roles
- POST /fondo/cargue
- GET /solicitudes
- POST /solicitudes

Cada ruta está asociada a un controlador. Por ejemplo:

- AuthController -> login
- DashboardController -> resumen general
- VehiculosController -> detalle y resumen de vehículo
- RetirosController -> consulta y creación de retiros
- UsuariosController -> CRUD de usuarios
- RolesController -> permisos y roles
- FondoCargueController -> carga masiva de movimientos
- SolicitudesController -> gestión de solicitudes

### 5.2 Qué hacen los controladores

Los controladores no escriben SQL directamente. Su trabajo es:

- leer el request;
- validar parámetros;
- llamar al `DbProvider` o al servicio correspondiente;
- devolver JSON con la respuesta.

La lógica de negocio central está en DbProvider y en los servicios.

### 5.3 Qué hace DbProvider

DbProvider es el punto central de acceso a la base de datos. Aquí están los métodos que:

- consultan información de vehículos;
- calculan saldos y aportes por año;
- calculan total de retiros;
- ejecutan inserts de retiros;
- consultan usuarios, roles y permisos;
- leen fondos mensuales para el dashboard;
- actualizan datos relacionados con cargues y solicitudes.

Es la capa que conecta la API con MySQL.

---

## 6. Flujo de negocio más importante

### 6.1 Login y autenticación

1. Frontend manda usuario y contraseña.
2. AuthController recibe la petición.
3. AuthService valida usuario y contraseña.
4. `DbProvider` busca el usuario y sus permisos.
5. `JwtHelper` genera el JWT con claims del usuario.
6. Frontend guarda el token.
7. Backend valida cada petición con el middleware.

### 6.2 Consulta de un vehículo y su resumen

1. El usuario busca una placa desde Dashboard o Vehiculos.
2. El frontend llama a `GET /vehiculos/{placa}/resumen` o `GET /vehiculos/{placa}`.
3. `VehiculosController` delega a `DbProvider`.
4. `DbProvider` consulta:
   - datos del vehículo en tabla `vehiculos`;
   - sumas de aportes en `fondo_repo_movimientos`;
   - retiros asociados en `fondo_repo_retiros_produc`.
5. La respuesta vuelve al frontend.
6. El componente de dashboard o de vehículos renderiza los números.

### 6.3 Retiros del fondo

1. El usuario selecciona una placa y llena el formulario.
2. El frontend llama a `POST /retiros` o `POST /retiros/with-file`.
3. La API valida el saldo disponible.
4. `DbProvider` inserta un registro en `fondo_repo_retiros_produc`.
5. Si se adjuntó archivo, el backend guarda el archivo en uploads/adjuntos y guarda la ruta en la base de datos.
6. El frontend actualiza la vista con el nuevo total de retiros y el nuevo saldo residual.

### 6.4 Dashboard general

1. El frontend llama a `/dashboard/resumen`.
2. DashboardController consulta datos agregados en DB.
3. `DbProvider` calcula:
   - total aportado;
   - total retirado;
   - saldo disponible;
   - datos por año o por placa.
4. El frontend muestra KPIs, gráficas y tablas resumidas.

---

## 7. Relación de tablas clave

### 7.1 vehículos

Tabla principal de los activos. Aquí se guarda la información del vehículo, su placa, propietario, modelo, vida útil y observaciones.

Relación:

- una placa puede tener muchos movimientos en `fondo_repo_movimientos`;
- una placa puede tener muchos retiros en `fondo_repo_retiros_produc`;
- una placa puede tener varias solicitudes.

### 7.2 fondo_repo_movimientos

Es la tabla de aportes al fondo. Cada registro representa un movimiento de dinero asociado a un vehículo y una fecha.

### 7.3 fondo_repo_retiros_produc

Es la tabla de egresos del fondo. Guarda el monto retirado, la observación, el usuario que lo registró y la ruta del archivo adjunto si existe.

### 7.4 usuarios

Guarda credenciales, nombre de usuario, estado y relación con roles/permisos.

### 7.5 roles y permisos

Se usan para definir qué puede hacer cada usuario en el sistema. El backend se encarga de verificar esos permisos con JWT.

---

## 8. Dónde está la API y cómo se ejecuta

La API está en la carpeta api y se inicia normalmente desde:

- php -S localhost:5092 -t api

o bien desde un servidor web real (Apache/SiteGround) apuntando a api/index.php como entrada principal.

La configuración de host y base URL se toma de variables de entorno y del archivo .env ubicado en la raíz de api. En el frontend, la variable `VITE_API_URL` define el host del backend. Por defecto se usa:

- http://localhost:5092

El cliente Axios configúra entonces la ruta base como:

- http://localhost:5092/api

Es decir, la API queda bajo la ruta `/api` del backend y el frontend la consume con ese prefijo.

---

## 9. Resumen corto de la arquitectura

En pocas palabras:

- El frontend React renderiza la interfaz.
- El usuario inicia sesión en Login.jsx.
- La API PHP valida credenciales y devuelve un JWT.
- El JWT lleva el usuario, su rol y los permisos.
- El frontend guarda el token y lo envía en todas las peticiones.
- El backend valida el token con AuthMiddleware.
- `DbProvider` hace las consultas a MySQL.
- El frontend muestra la data devuelta por la API.

Esto hace que el sistema sea modular, con separación clara entre:

- interfaz de usuario;
- lógica de autenticación;
- validación de permisos;
- consultas a base de datos;
- archivo de almacenamiento.

---

## 10. En una línea

El sistema está montado como una SPA React que consume una API REST PHP con Slim, autenticada por JWT, conectada a MySQL, y con permisos por usuario que protegen tanto la interfaz como cada endpoint del backend.
- `nombre_completo` (VARCHAR): Nombre completo del usuario
- `password_hash` (VARCHAR): Hash de la contraseña (BCrypt o HMAC-SHA512)
- `password_salt` (VARCHAR): Salt para hash (solo HMAC-SHA512)
- `rol` (VARCHAR): Código del rol asignado
- `activo` (BOOLEAN): Estado del usuario (1=activo, 0=inactivo)

**Archivos donde se consulta/modifica:**
- `api/src/DbProvider.php`:
  - `obtenerUsuarioPorNombre()` - SELECT por nombre de usuario
  - `obtenerPermisosPorUsuario()` - JOIN con roles y permisos
  - `obtenerUsuarios()` - SELECT todos los usuarios
  - `crearUsuario()` - INSERT nuevo usuario
  - `editarUsuario()` - UPDATE usuario existente
  - `inhabilitarUsuario()` - UPDATE estado a inactivo
  - `toggleEstadoUsuario()` - UPDATE toggle estado
  - `eliminarUsuario()` - Soft delete (inhabilitar)

**Relaciones:**
- N:1 con `roles` (rol → codigo)

#### 2.1.5 Tabla: `roles`
**Propósito:** Define los roles del sistema y sus permisos asociados.

**Columnas principales:**
- `id` (INT, PK): Identificador único del rol
- `codigo` (VARCHAR): Código del rol (ej. ADMIN, OPERADOR)
- `descripcion` (VARCHAR): Descripción del rol
- `activo` (BOOLEAN): Estado del rol

**Archivos donde se consulta/modifica:**
- `api/src/DbProvider.php`:
  - `obtenerRoles()` - SELECT con JOIN a permisos
  - `crearRol()` - INSERT nuevo rol

**Relaciones:**
- 1:N con `usuarios` (codigo → rol)
- N:M con `permisos` (through `rol_permisos`)

#### 2.1.6 Tabla: `permisos`
**Propósito:** Define los permisos individuales del sistema.

**Columnas principales:**
- `id` (INT, PK): Identificador único del permiso
- `codigo` (VARCHAR): Código del permiso (ej. VEHICULO_CONSULTAR)
- `descripcion` (VARCHAR): Descripción del permiso

**Archivos donde se consulta/modifica:**
- `api/src/DbProvider.php`:
  - `obtenerPermisos()` - SELECT todos los permisos

**Relaciones:**
- N:M con `roles` (through `rol_permisos`)

#### 2.1.7 Tabla: `rol_permisos`
**Propósito:** Tabla intermedia para la relación N:M entre roles y permisos.

**Columnas principales:**
- `rol_id` (INT, FK): ID del rol
- `permiso_id` (INT, FK): ID del permiso

**Archivos donde se consulta/modifica:**
- `api/src/DbProvider.php`:
  - `asignarPermisoRol()` - INSERT IGNORE
  - `quitarPermisoRol()` - DELETE

**Relaciones:**
- N:1 con `roles` (rol_id → id)
- N:1 con `permisos` (permiso_id → id)

#### 2.1.8 Tabla: `fondo_repo_solicitudes_produc`
**Propósito:** Almacena las solicitudes de reposición radicadas por los usuarios.

**Columnas principales:**
- `id` (INT, PK): Identificador único de la solicitud
- `placa` (VARCHAR): Placa del vehículo
- `valor_estimado` (DECIMAL): Valor estimado del retiro
- `nombre_completo` (VARCHAR): Nombre de quien solicita
- `naturaleza` (VARCHAR): Naturaleza (propietario/apoderado/administrador)
- `descripcion` (TEXT): Descripción de la solicitud
- `estado` (VARCHAR): Estado (Radicado/En Revision/Aprobado/Rechazado)
- `archivo_ruta` (VARCHAR): Ruta del archivo adjunto (opcional)
- `usuario` (VARCHAR): Usuario que radicó
- `fecha_creacion` (DATETIME): Fecha de creación

**Archivos donde se consulta/modifica:**
- `api/src/DbProvider.php`:
  - `ensureSolicitudesTableExists()` - CREATE TABLE IF NOT EXISTS
  - `obtenerSolicitudes()` - SELECT todas las solicitudes
  - `obtenerSolicitudesPorPlaca()` - SELECT por placa
  - `crearSolicitud()` - INSERT nueva solicitud
  - `actualizarEstadoSolicitud()` - UPDATE estado

**Relaciones:**
- N:1 con `vehiculos` (placa → placa)

---

## 3. CONEXIONES, FLUJOS Y COMUNICACIÓN ENTRE ARCHIVOS

### 3.1 Flujo de Llamadas Arquitectónico

#### 3.1.1 Flujo Frontend → Backend → Base de Datos

**Patrón General:**
```
Componente React → Service → Axios → API Endpoint → Controller → DbProvider → MySQL
```

**Ejemplo: Consulta de Vehículo**
1. **Frontend:** `Vehiculos.jsx` → Usuario ingresa placa y presiona "Buscar"
2. **Service:** `axios.get('/vehiculos/${placa}')` (llamada directa a axios.jsx)
3. **HTTP Request:** GET `http://localhost:5092/api/vehiculos/ABC-123`
4. **Middleware:** `CorsMiddleware` → `AuthMiddleware` (si aplica)
5. **Controller:** `VehiculosController::obtenerPorPlaca()`
6. **DbProvider:** `DbProvider::obtenerVehiculoPorPlaca('ABC-123')`
7. **MySQL:** SELECT FROM vehiculos WHERE placa = 'ABC-123'
8. **Return:** JSON response → Frontend actualiza estado

**Ejemplo: Login**
1. **Frontend:** `Login.jsx` → Usuario ingresa credenciales
2. **Service:** `authService.login(usuario, password)`
3. **HTTP Request:** POST `http://localhost:5092/api/auth/login`
4. **Controller:** `AuthController::login()`
5. **AuthService:** `AuthService::login(usuario, password)`
6. **DbProvider:** `DbProvider::obtenerUsuarioPorNombre(usuario)`
7. **DbProvider:** `DbProvider::obtenerPermisosPorUsuario(usuario)`
8. **PasswordHasher:** Verificación de contraseña
9. **JwtHelper:** Generación de token JWT
10. **Return:** JSON con token, nombreCompleto, usuario, rol
11. **Frontend:** Almacena token en localStorage, redirige a Dashboard

### 3.2 Dependencias e Importaciones

#### 3.2.1 Backend (PHP)

**index.php (Punto de entrada)**
- Importa: Todos los Controllers, DbProvider, AuthService, Middlewares, Slim Framework
- Propósito: Configurar aplicación Slim, definir rutas, inyectar dependencias

**Controllers → DbProvider**
- Todos los controllers dependen de `DbProvider` para acceso a datos
- `AuthController` additionally depende de `AuthService`

**AuthService → DbProvider + PasswordHasher + JwtHelper**
- `AuthService` usa `DbProvider` para consultar usuarios
- Usa `PasswordHasher` para verificar contraseñas
- Usa `JwtHelper` para generar tokens

**DbProvider → Config + Http + FondoRepoSchema**
- `DbProvider` usa `Config` para obtener credenciales de BD
- Usa `Http` para formatear respuestas
- Usa `FondoRepoSchema` para validaciones de columnas

**Controllers → Http**
- Todos los controllers usan `Http::json()`, `Http::text()`, `Http::empty()` para respuestas

**FileStorage → Config**
- `FileStorage` usa `Config::uploadsDir()` para rutas de archivos

#### 3.2.2 Frontend (React)

**App.jsx (Componente Principal)**
- Importa: React Router, Layouts, Pages, Components, Utils
- Propósito: Definir rutas, manejar estado de autenticación

**Pages → Services**
- `Dashboard.jsx` → `dashboardService.js`
- `Login.jsx` → `authService.js`
- `Vehiculos.jsx` → `axios` directo
- `Usuarios.jsx` → `usuariosService.js`
- `Roles.jsx` → `rolesService.js`
- `CargueFondo.jsx` → `axios` directo
- `NuevaSolicitud.jsx` → `axios` directo
- `Solicitudes.jsx` → `axios` directo

**Services → api/axios.jsx**
- Todos los services importan el cliente Axios configurado
- Propósito: Mantener configuración centralizada (baseURL, token interceptor)

**Components → Services + Utils**
- `VehiculoRetiros.jsx` → `retiroService.js`
- `ListaSolicitudes.jsx` → `axios` directo
- `Resumen.jsx` → `axios` directo
- `DetalleAnual.jsx` → `axios` directo
- `Sidebar.jsx` → `auth.js` (Utils)
- `Header.jsx` → `auth.js` (Utils)
- `ProtectedRoute.jsx` → `auth.js` (Utils)

**Utils → jwt-decode**
- `auth.js` usa `jwt-decode` para decodificar tokens y extraer permisos

### 3.3 Mapa de Dependencias Críticas

**Backend - Módulo de Autenticación:**
```
index.php → AuthController → AuthService → DbProvider → MySQL
                                    ↓
                            PasswordHasher
                                    ↓
                            JwtHelper → Config
```

**Backend - Módulo de Vehículos:**
```
index.php → VehiculosController → DbProvider → MySQL
                                    ↓
                            Http (formateo)
```

**Frontend - Módulo de Dashboard:**
```
App.jsx → Dashboard.jsx → dashboardService.js → api/axios.jsx → Backend
```

**Frontend - Módulo de Usuarios:**
```
App.jsx → Usuarios.jsx → usuariosService.js → api/axios.jsx → Backend
```

---

## 4. ANÁLISIS DETALLADO FUNCIÓN POR FUNCIÓN

### 4.1 Backend - Archivo: api/index.php

**Función: Configuración de la aplicación Slim**
- **Propósito:** Punto de entrada de la API, configura rutas y middlewares
- **Parámetros:** Ninguno (configuración global)
- **Invocación:** Inicialización del servidor PHP
- **Dependencias:** Slim Framework, todos los controllers y servicios
- **Consultas BD:** Ninguna directa (delega a controllers)

**Rutas definidas:**
- `POST /auth/login` → AuthController::login
- `GET /dashboard/resumen` → DashboardController::resumen
- `GET /vehiculos/{placa}/fondos/{anio}` → VehiculosController::obtenerFondos
- `GET /vehiculos/{placa}/resumen` → VehiculosController::obtenerResumen
- `GET /vehiculos/{placa}` → VehiculosController::obtenerPorPlaca
- `GET /retiros/saldo/{placa}` → RetirosController::obtenerSaldo
- `POST /retiros/with-file` → RetirosController::crearRetiroConAdjunto
- `GET /retiros/{placa}` → RetirosController::obtenerRetiros
- `POST /retiros` → RetirosController::crearRetiro
- `GET /usuarios/roles` → UsuariosController::obtenerRolesParaDropdown
- `GET /usuarios` → UsuariosController::obtenerUsuarios
- `POST /usuarios` → UsuariosController::crear
- `PUT /usuarios/{id}/estado` → UsuariosController::cambiarEstado
- `PATCH /usuarios/{id}/inhabilitar` → UsuariosController::inhabilitar
- `PUT /usuarios/{id}` → UsuariosController::editar
- `DELETE /usuarios/{id}` → UsuariosController::eliminar
- `GET /roles/permisos` → RolesController::obtenerPermisos
- `GET /roles` → RolesController::obtenerRoles
- `POST /roles` → RolesController::crearRol
- `POST /roles/asignar` → RolesController::asignarPermiso
- `POST /roles/quitar` → RolesController::quitarPermiso
- `POST /fondo/cargue` → FondoCargueController::cargue
- `GET /solicitudes/vehiculo/{placa}` → SolicitudesController::getByPlaca
- `GET /solicitudes` → SolicitudesController::getAll
- `POST /solicitudes` → SolicitudesController::create
- `PUT /solicitudes/{id}/estado` → SolicitudesController::updateEstado
- `GET /adjuntos/ver` → AdjuntosController::ver

### 4.2 Backend - Archivo: api/src/Config.php

**Función: Config::load()**
- **Propósito:** Carga variables de entorno desde archivo .env
- **Parámetros:** Ninguno
- **Invocación:** Al inicio de index.php
- **Dependencias:** vlucas/phpdotenv
- **Consultas BD:** Ninguna

**Función: Config::get(string $key, ?string $default = null)**
- **Propósito:** Obtiene valor de variable de entorno
- **Parámetros:** $key (nombre de variable), $default (valor por defecto)
- **Invocación:** Por todos los servicios que necesitan configuración
- **Dependencias:** $_ENV, getenv()
- **Consultas BD:** Ninguna

**Función: Config::jwtKey()**
- **Propósito:** Obtiene clave JWT desde configuración
- **Parámetros:** Ninguno
- **Invocación:** JwtHelper::generateToken(), JwtHelper::decode()
- **Dependencias:** Config::get('JWT_KEY')
- **Consultas BD:** Ninguna

**Función: Config::dsn()**
- **Propósito:** Construye DSN de conexión MySQL
- **Parámetros:** Ninguno
- **Invocación:** DbProvider::__construct()
- **Dependencias:** Config::get() para host, port, name
- **Consultas BD:** Ninguna

### 4.3 Backend - Archivo: api/src/DbProvider.php

**Función: DbProvider::__construct()**
- **Propósito:** Constructor que establece conexión PDO a MySQL
- **Parámetros:** Ninguno
- **Invocación:** Al instanciar DbProvider en index.php
- **Dependencias:** Config::dsn(), Config::dbUser(), Config::dbPass()
- **Consultas BD:** Ninguna (solo conexión)

**Función: DbProvider::obtenerVehiculoPorPlaca(string $placa)**
- **Propósito:** Obtiene información completa de un vehículo por placa
- **Parámetros:** $placa (placa del vehículo)
- **Invocación:** VehiculosController::obtenerPorPlaca()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:** 
  - SELECT FROM vehiculos WHERE placa = :placa
  - SELECT YEAR(m.fecha), SUM(m.monto) FROM fondo_repo_movimientos JOIN vehiculos WHERE placa = :placa GROUP BY YEAR
- **Retorno:** Array con datos del vehículo y totales anuales

**Función: DbProvider::obtenerFondosMensuales(string $placa, int $anio)**
- **Propósito:** Obtiene fondos mensuales de un vehículo para un año específico
- **Parámetros:** $placa, $anio
- **Invocación:** VehiculosController::obtenerFondos()
- **Dependencias:** PDO, FondoRepoSchema::numeroAMesKey(), Http::decimal()
- **Consultas BD:** SELECT MONTH(m.fecha), SUM(m.monto) FROM fondo_repo_movimientos JOIN vehiculos WHERE placa = :placa AND YEAR(fecha) = :anio GROUP BY MONTH
- **Retorno:** Array con valores mensuales

**Función: DbProvider::obtenerResumen(string $placa)**
- **Propósito:** Obtiene resumen financiero de un vehículo
- **Parámetros:** $placa
- **Invocación:** VehiculosController::obtenerResumen()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:**
  - SELECT placa, vida_util_anios FROM vehiculos WHERE placa = :placa
  - SELECT YEAR(m.fecha), SUM(m.monto) FROM fondo_repo_movimientos JOIN vehiculos WHERE placa = :placa GROUP BY YEAR
  - SELECT SUM(valor_retirar) FROM fondo_repo_retiros_produc WHERE placa = :placa AND activo = 1
- **Retorno:** Array con totales anuales, total general, promedio mensual

**Función: DbProvider::obtenerTotalReposicion()**
- **Propósito:** Obtiene suma total de todos los aportes al fondo
- **Parámetros:** Ninguno
- **Invocación:** DashboardController::resumen()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:** SELECT SUM(monto) FROM fondo_repo_movimientos
- **Retorno:** Float con total

**Función: DbProvider::obtenerTotalRetiros()**
- **Propósito:** Obtiene suma total de todos los retiros
- **Parámetros:** Ninguno
- **Invocación:** DashboardController::resumen()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:** SELECT SUM(valor_retirar) FROM fondo_repo_retiros_produc WHERE activo = 1
- **Retorno:** Float con total

**Función: DbProvider::obtenerSaldoDisponible(string $placa)**
- **Propósito:** Calcula saldo disponible para una placa (aportes - retiros)
- **Parámetros:** $placa
- **Invocación:** RetirosController::obtenerSaldo()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:**
  - SELECT SUM(m.monto) FROM fondo_repo_movimientos JOIN vehiculos WHERE placa = :placa
  - SELECT SUM(valor_retirar) FROM fondo_repo_retiros_produc WHERE placa = :placa AND activo = 1
- **Retorno:** Float con saldo

**Función: DbProvider::crearRetiro(string $placa, float $monto, ?string $observacion, string $usuario, ?string $rutaAdjunto)**
- **Propósito:** Registra un nuevo retiro en la base de datos
- **Parámetros:** $placa, $monto, $observacion, $usuario, $rutaAdjunto
- **Invocación:** RetirosController::crearRetiroInterno()
- **Dependencias:** PDO
- **Consultas BD:** INSERT INTO fondo_repo_retiros_produc (placa, valor_retirar, observacion, usuario, ruta_adjunto, fecha, activo)
- **Retorno:** Void

**Función: DbProvider::obtenerRetirosPorPlaca(string $placa)**
- **Propósito:** Obtiene historial de retiros de un vehículo
- **Parámetros:** $placa
- **Invocación:** RetirosController::obtenerRetiros()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:** SELECT id, fecha, valor_retirar, observacion, usuario, ruta_adjunto, activo FROM fondo_repo_retiros_produc WHERE placa = :placa AND activo = 1 ORDER BY fecha DESC
- **Retorno:** Array de retiros

**Función: DbProvider::obtenerFlujoMensual()**
- **Propósito:** Obtiene flujo mensual de aportes para dashboard
- **Parámetros:** Ninguno
- **Invocación:** DashboardController::resumen()
- **Dependencias:** PDO, Http::decimal()
- **Consultas BD:** SELECT MONTH(fecha), SUM(monto) FROM fondo_repo_movimientos GROUP BY MONTH ORDER BY MONTH
- **Retorno:** Array con 12 meses (Ene-Dic)

**Función: DbProvider::obtenerPresupuestoUtilizado()**
- **Propósito:** Calcula porcentaje de presupuesto utilizado
- **Parámetros:** Ninguno
- **Invocación:** DashboardController::resumen()
- **Dependencias:** obtenerTotalReposicion(), obtenerTotalRetiros()
- **Consultas BD:** Ninguna (usa otras funciones)
- **Retorno:** Float con porcentaje

**Función: DbProvider::obtenerUsuariosActivos()**
- **Propósito:** Cuenta usuarios activos en el sistema
- **Parámetros:** Ninguno
- **Invocación:** DashboardController::resumen()
- **Dependencias:** PDO
- **Consultas BD:** SELECT COUNT(*) FROM usuarios WHERE activo = 1
- **Retorno:** Int con conteo

**Función: DbProvider::obtenerUsuarioPorNombre(string $nombreUsuario)**
- **Propósito:** Obtiene datos de un usuario por nombre
- **Parámetros:** $nombreUsuario
- **Invocación:** AuthService::login()
- **Dependencias:** PDO
- **Consultas BD:** SELECT id, usuario, nombre_completo, password_hash, password_salt, rol, activo FROM usuarios WHERE usuario = :nombre
- **Retorno:** Array con datos del usuario o null

**Función: DbProvider::obtenerPermisosPorUsuario(string $nombreUsuario)**
- **Propósito:** Obtiene permisos de un usuario basado en su rol
- **Parámetros:** $nombreUsuario
- **Invocación:** AuthService::login()
- **Dependencias:** PDO
- **Consultas BD:** SELECT p.codigo FROM usuarios u JOIN roles r ON r.codigo = u.rol JOIN rol_permisos rp ON rp.rol_id = r.id JOIN permisos p ON p.id = rp.permiso_id WHERE u.usuario = :usuario AND u.activo = 1
- **Retorno:** Array de códigos de permisos

**Función: DbProvider::obtenerRoles()**
- **Propósito:** Obtiene todos los roles con sus permisos
- **Parámetros:** Ninguno
- **Invocación:** UsuariosController::obtenerRolesParaDropdown(), RolesController::obtenerRoles()
- **Dependencias:** PDO
- **Consultas BD:** SELECT r.id, r.codigo, p.id AS permiso_id FROM roles r LEFT JOIN rol_permisos rp ON rp.rol_id = r.id LEFT JOIN permisos p ON rp.permiso_id = p.id WHERE r.activo = 1
- **Retorno:** Array de roles con permisos

**Función: DbProvider::crearRol(string $codigo, string $descripcion)**
- **Propósito:** Crea un nuevo rol en el sistema
- **Parámetros:** $codigo, $descripcion
- **Invocación:** RolesController::crearRol()
- **Dependencias:** PDO
- **Consultas BD:** INSERT INTO roles (codigo, descripcion, activo) VALUES (:c, :d, 1)
- **Retorno:** Void

**Función: DbProvider::obtenerPermisos()**
- **Propósito:** Obtiene todos los permisos del sistema
- **Parámetros:** Ninguno
- **Invocación:** RolesController::obtenerPermisos()
- **Dependencias:** PDO
- **Consultas BD:** SELECT id, codigo, descripcion FROM permisos
- **Retorno:** Array de permisos

**Función: DbProvider::asignarPermisoRol(int $rolId, int $permisoId)**
- **Propósito:** Asigna un permiso a un rol
- **Parámetros:** $rolId, $permisoId
- **Invocación:** RolesController::asignarPermiso()
- **Dependencias:** PDO
- **Consultas BD:** INSERT IGNORE INTO rol_permisos (rol_id, permiso_id) VALUES (:r, :p)
- **Retorno:** Void

**Función: DbProvider::quitarPermisoRol(int $rolId, int $permisoId)**
- **Propósito:** Quita un permiso de un rol
- **Parámetros:** $rolId, $permisoId
- **Invocación:** RolesController::quitarPermiso()
- **Dependencias:** PDO
- **Consultas BD:** DELETE FROM rol_permisos WHERE rol_id = :r AND permiso_id = :p
- **Retorno:** Void

**Función: DbProvider::obtenerUsuarios()**
- **Propósito:** Obtiene todos los usuarios del sistema
- **Parámetros:** Ninguno
- **Invocación:** UsuariosController::obtenerUsuarios()
- **Dependencias:** PDO
- **Consultas BD:** SELECT u.id, u.usuario, u.nombre_completo, u.rol, u.activo FROM usuarios u ORDER BY u.usuario
- **Retorno:** Array de usuarios

**Función: DbProvider::crearUsuario(string $usuario, string $nombreCompleto, string $hash, string $salt, string $rol, bool $activo)**
- **Propósito:** Crea un nuevo usuario
- **Parámetros:** $usuario, $nombreCompleto, $hash, $salt, $rol, $activo
- **Invocación:** UsuariosController::crear()
- **Dependencias:** PDO
- **Consultas BD:** INSERT INTO usuarios (usuario, nombre_completo, password_hash, password_salt, rol, activo) VALUES (:u, :n, :h, :s, :r, :a)
- **Retorno:** Void

**Función: DbProvider::editarUsuario(int $id, string $nombreUsuario, string $nombreCompleto, string $rol, bool $activo)**
- **Propósito:** Edita un usuario existente
- **Parámetros:** $id, $nombreUsuario, $nombreCompleto, $rol, $activo
- **Invocación:** UsuariosController::editar()
- **Dependencias:** PDO
- **Consultas BD:** UPDATE usuarios SET usuario = :u, nombre_completo = :n, rol = :r, activo = :a WHERE id = :id
- **Retorno:** Void

**Función: DbProvider::inhabilitarUsuario(int $id)**
- **Propósito:** Inhabilita un usuario
- **Parámetros:** $id
- **Invocación:** UsuariosController::inhabilitar(), eliminarUsuario()
- **Dependencias:** PDO
- **Consultas BD:** UPDATE usuarios SET activo = 0 WHERE id = :id
- **Retorno:** Void

**Función: DbProvider::toggleEstadoUsuario(int $id)**
- **Propósito:** Cambia el estado de un usuario (toggle)
- **Parámetros:** $id
- **Invocación:** UsuariosController::cambiarEstado()
- **Dependencias:** PDO
- **Consultas BD:** UPDATE usuarios SET activo = NOT activo WHERE id = :id
- **Retorno:** Void

**Función: DbProvider::ensureSolicitudesTableExists()**
- **Propósito:** Crea tabla de solicitudes si no existe
- **Parámetros:** Ninguno
- **Invocación:** obtenerSolicitudes(), obtenerSolicitudesPorPlaca(), crearSolicitud(), actualizarEstadoSolicitud()
- **Dependencias:** PDO
- **Consultas BD:** CREATE TABLE IF NOT EXISTS fondo_repo_solicitudes_produc (...)
- **Retorno:** Void

**Función: DbProvider::obtenerSolicitudes()**
- **Propósito:** Obtiene todas las solicitudes
- **Parámetros:** Ninguno
- **Invocación:** SolicitudesController::getAll()
- **Dependencias:** PDO, ensureSolicitudesTableExists()
- **Consultas BD:** SELECT id, placa, valor_estimado, nombre_completo, naturaleza, descripcion, estado, archivo_ruta, fecha_creacion FROM fondo_repo_solicitudes_produc ORDER BY fecha_creacion DESC, id DESC
- **Retorno:** Array de solicitudes

**Función: DbProvider::obtenerSolicitudesPorPlaca(string $placa)**
- **Propósito:** Obtiene solicitudes de un vehículo específico
- **Parámetros:** $placa
- **Invocación:** SolicitudesController::getByPlaca()
- **Dependencias:** PDO, ensureSolicitudesTableExists()
- **Consultas BD:** SELECT id, placa, valor_estimado, nombre_completo, naturaleza, descripcion, estado, archivo_ruta, fecha_creacion FROM fondo_repo_solicitudes_produc WHERE placa = :placa ORDER BY fecha_creacion DESC, id DESC
- **Retorno:** Array de solicitudes

**Función: DbProvider::crearSolicitud(string $placa, float $valorEstimado, string $nombreCompleto, string $naturaleza, string $descripcion, ?string $rutaAdjunto, ?string $usuario)**
- **Propósito:** Crea una nueva solicitud
- **Parámetros:** $placa, $valorEstimado, $nombreCompleto, $naturaleza, $descripcion, $rutaAdjunto, $usuario
- **Invocación:** SolicitudesController::create()
- **Dependencias:** PDO, ensureSolicitudesTableExists()
- **Consultas BD:** INSERT INTO fondo_repo_solicitudes_produc (placa, valor_estimado, nombre_completo, naturaleza, descripcion, estado, archivo_ruta, usuario, fecha_creacion) VALUES (...)
- **Retorno:** Array con la solicitud creada

**Función: DbProvider::actualizarEstadoSolicitud(int $id, string $nuevoEstado)**
- **Propósito:** Actualiza el estado de una solicitud
- **Parámetros:** $id, $nuevoEstado
- **Invocación:** SolicitudesController::updateEstado()
- **Dependencias:** PDO, ensureSolicitudesTableExists()
- **Consultas BD:** UPDATE fondo_repo_solicitudes_produc SET estado = :estado WHERE id = :id
- **Retorno:** Bool (true si se actualizó, false si no)

### 4.4 Backend - Archivo: api/src/Controllers/AuthController.php

**Función: AuthController::login(Request $request, Response $response)**
- **Propósito:** Maneja la solicitud de login
- **Parámetros:** $request (HTTP request), $response (HTTP response)
- **Invocación:** POST /api/auth/login
- **Dependencias:** AuthService, Http
- **Consultas BD:** Delega a AuthService
- **Retorno:** JSON con token y datos del usuario o 401 si falla

### 4.5 Backend - Archivo: api/src/Controllers/VehiculosController.php

**Función: VehiculosController::obtenerPorPlaca(Request $request, Response $response, array $args)**
- **Propósito:** Obtiene vehículo por placa
- **Parámetros:** $request, $response, $args (contiene placa)
- **Invocación:** GET /api/vehiculos/{placa}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerVehiculoPorPlaca()
- **Retorno:** JSON con datos del vehículo o 404

**Función: VehiculosController::obtenerFondos(Request $request, Response $response, array $args)**
- **Propósito:** Obtiene fondos mensuales por año
- **Parámetros:** $request, $response, $args (contiene placa y anio)
- **Invocación:** GET /api/vehiculos/{placa}/fondos/{anio}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerFondosMensuales()
- **Retorno:** JSON con fondos mensuales

**Función: VehiculosController::obtenerResumen(Request $request, Response $response, array $args)**
- **Propósito:** Obtiene resumen financiero del vehículo
- **Parámetros:** $request, $response, $args (contiene placa)
- **Invocación:** GET /api/vehiculos/{placa}/resumen
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerResumen()
- **Retorno:** JSON con resumen o 404

### 4.6 Backend - Archivo: api/src/Controllers/RetirosController.php

**Función: RetirosController::obtenerSaldo(Request $request, Response $response, array $args)**
- **Propósito:** Obtiene saldo disponible de un vehículo
- **Parámetros:** $request, $response, $args (contiene placa)
- **Invocación:** GET /api/retiros/saldo/{placa}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerSaldoDisponible()
- **Retorno:** JSON con saldo

**Función: RetirosController::obtenerRetiros(Request $request, Response $response, array $args)**
- **Propósito:** Obtiene historial de retiros
- **Parámetros:** $request, $response, $args (contiene placa)
- **Invocación:** GET /api/retiros/{placa}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerRetirosPorPlaca()
- **Retorno:** JSON con lista de retiros

**Función: RetirosController::crearRetiro(Request $request, Response $response)**
- **Propósito:** Crea retiro sin archivo adjunto
- **Parámetros:** $request, $response
- **Invocación:** POST /api/retiros
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::crearRetiro(), obtenerSaldoDisponible()
- **Retorno:** JSON con mensaje y saldo restante o error

**Función: RetirosController::crearRetiroConAdjunto(Request $request, Response $response)**
- **Propósito:** Crea retiro con archivo adjunto
- **Parámetros:** $request, $response
- **Invocación:** POST /api/retiros/with-file
- **Dependencias:** DbProvider, FileStorage, Http
- **Consultas BD:** DbProvider::crearRetiro(), obtenerSaldoDisponible()
- **Retorno:** JSON con mensaje y saldo restante o error

**Función: RetirosController::crearRetiroInterno(Request $request, Response $response, string $placa, float $monto, ?string $observacion, ?string $rutaAdjunto)**
- **Propósito:** Lógica interna compartida para crear retiros
- **Parámetros:** $request, $response, $placa, $monto, $observacion, $rutaAdjunto
- **Invocación:** crearRetiro(), crearRetiroConAdjunto()
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::crearRetiro(), obtenerSaldoDisponible()
- **Retorno:** JSON con resultado

### 4.7 Backend - Archivo: api/src/Controllers/DashboardController.php

**Función: DashboardController::resumen(Request $request, Response $response)**
- **Propósito:** Obtiene resumen del dashboard
- **Parámetros:** $request, $response
- **Invocación:** GET /api/dashboard/resumen
- **Dependencias:** DbProvider, Http
- **Consultas BD:** obtenerTotalReposicion(), obtenerTotalRetiros(), obtenerUsuariosActivos(), obtenerPresupuestoUtilizado(), obtenerFlujoMensual()
- **Retorno:** JSON con métricas del dashboard

### 4.8 Backend - Archivo: api/src/Controllers/UsuariosController.php

**Función: UsuariosController::obtenerRolesParaDropdown(Request $request, Response $response)**
- **Propósito:** Obtiene roles formateados para dropdown
- **Parámetros:** $request, $response
- **Invocación:** GET /api/usuarios/roles
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerRoles()
- **Retorno:** JSON con array {value, label}

**Función: UsuariosController::obtenerUsuarios(Request $request, Response $response)**
- **Propósito:** Obtiene todos los usuarios
- **Parámetros:** $request, $response
- **Invocación:** GET /api/usuarios
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerUsuarios()
- **Retorno:** JSON con usuarios o error 500

**Función: UsuariosController::crear(Request $request, Response $response)**
- **Propósito:** Crea nuevo usuario
- **Parámetros:** $request, $response
- **Invocación:** POST /api/usuarios
- **Dependencias:** DbProvider, PasswordHasher, Http
- **Consultas BD:** DbProvider::crearUsuario()
- **Retorno:** 200 si éxito

**Función: UsuariosController::editar(Request $request, Response $response, array $args)**
- **Propósito:** Edita usuario existente
- **Parámetros:** $request, $response, $args (contiene id)
- **Invocación:** PUT /api/usuarios/{id}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::editarUsuario()
- **Retorno:** 200 si éxito

**Función: UsuariosController::cambiarEstado(Request $request, Response $response, array $args)**
- **Propósito:** Cambia estado de usuario (toggle)
- **Parámetros:** $request, $response, $args (contiene id)
- **Invocación:** PUT /api/usuarios/{id}/estado
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::toggleEstadoUsuario()
- **Retorno:** 200 si éxito

**Función: UsuariosController::inhabilitar(Request $request, Response $response, array $args)**
- **Propósito:** Inhabilita usuario
- **Parámetros:** $request, $response, $args (contiene id)
- **Invocación:** PATCH /api/usuarios/{id}/inhabilitar
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::inhabilitarUsuario()
- **Retorno:** 200 si éxito

**Función: UsuariosController::eliminar(Request $request, Response $response, array $args)**
- **Propósito:** Elimina (inhabilita) usuario
- **Parámetros:** $request, $response, $args (contiene id)
- **Invocación:** DELETE /api/usuarios/{id}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::eliminarUsuario()
- **Retorno:** 200 si éxito

### 4.9 Backend - Archivo: api/src/Controllers/RolesController.php

**Función: RolesController::obtenerRoles(Request $request, Response $response)**
- **Propósito:** Obtiene todos los roles
- **Parámetros:** $request, $response
- **Invocación:** GET /api/roles
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerRoles()
- **Retorno:** JSON con roles

**Función: RolesController::crearRol(Request $request, Response $response)**
- **Propósito:** Crea nuevo rol
- **Parámetros:** $request, $response
- **Invocación:** POST /api/roles
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::crearRol()
- **Retorno:** 200 si éxito

**Función: RolesController::obtenerPermisos(Request $request, Response $response)**
- **Propósito:** Obtiene todos los permisos
- **Parámetros:** $request, $response
- **Invocación:** GET /api/roles/permisos
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerPermisos()
- **Retorno:** JSON con permisos

**Función: RolesController::asignarPermiso(Request $request, Response $response)**
- **Propósito:** Asigna permiso a rol
- **Parámetros:** $request, $response
- **Invocación:** POST /api/roles/asignar
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::asignarPermisoRol()
- **Retorno:** 200 si éxito

**Función: RolesController::quitarPermiso(Request $request, Response $response)**
- **Propósito:** Quita permiso de rol
- **Parámetros:** $request, $response
- **Invocación:** POST /api/roles/quitar
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::quitarPermisoRol()
- **Retorno:** 200 si éxito

### 4.10 Backend - Archivo: api/src/Controllers/FondoCargueController.php

**Función: FondoCargueController::cargue(Request $request, Response $response)**
- **Propósito:** Procesa cargue masivo de datos desde CSV
- **Parámetros:** $request, $response
- **Invocación:** POST /api/fondo/cargue
- **Dependencias:** DbProvider, Http
- **Consultas BD:** Llama a $this->db->cargarColumnaFondo() (MÉTODO NO IMPLEMENTADO)
- **Retorno:** JSON con mensaje de éxito o error

**NOTA IMPORTANTE:** El método `cargarColumnaFondo()` es invocado en línea 112 pero NO está implementado en DbProvider.php. Esto indica que la funcionalidad de cargue masivo está incompleta en el código actual.

### 4.11 Backend - Archivo: api/src/Controllers/SolicitudesController.php

**Función: SolicitudesController::getAll(Request $request, Response $response)**
- **Propósito:** Obtiene todas las solicitudes
- **Parámetros:** $request, $response
- **Invocación:** GET /api/solicitudes
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerSolicitudes()
- **Retorno:** JSON con solicitudes

**Función: SolicitudesController::getByPlaca(Request $request, Response $response, array $args)**
- **Propósito:** Obtiene solicitudes de un vehículo
- **Parámetros:** $request, $response, $args (contiene placa)
- **Invocación:** GET /api/solicitudes/vehiculo/{placa}
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::obtenerSolicitudesPorPlaca()
- **Retorno:** JSON con solicitudes

**Función: SolicitudesController::create(Request $request, Response $response)**
- **Propósito:** Crea nueva solicitud
- **Parámetros:** $request, $response
- **Invocación:** POST /api/solicitudes
- **Dependencias:** DbProvider, FileStorage, Http
- **Consultas BD:** DbProvider::obtenerVehiculoPorPlaca(), crearSolicitud()
- **Retorno:** JSON con solicitud creada o error

**Función: SolicitudesController::updateEstado(Request $request, Response $response, array $args)**
- **Propósito:** Actualiza estado de solicitud
- **Parámetros:** $request, $response, $args (contiene id)
- **Invocación:** PUT /api/solicitudes/{id}/estado
- **Dependencias:** DbProvider, Http
- **Consultas BD:** DbProvider::actualizarEstadoSolicitud()
- **Retorno:** 200 si éxito, 404 si no existe

### 4.12 Backend - Archivo: api/src/Controllers/AdjuntosController.php

**Función: AdjuntosController::ver(Request $request, Response $response)**
- **Propósito:** Sirve archivos adjuntos
- **Parámetros:** $request, $response
- **Invocación:** GET /api/adjuntos/ver?ruta=...
- **Dependencias:** FileStorage, Http
- **Consultas BD:** Ninguna (sistema de archivos)
- **Retorno:** Archivo binario o error

### 4.13 Backend - Archivo: api/src/AuthService.php

**Función: AuthService::login(string $usuario, string $password)**
- **Propósito:** Autentica usuario y genera token
- **Parámetros:** $usuario, $password
- **Invocación:** AuthController::login()
- **Dependencias:** DbProvider, PasswordHasher, JwtHelper
- **Consultas BD:** DbProvider::obtenerUsuarioPorNombre(), obtenerPermisosPorUsuario()
- **Retorno:** Array con token y datos del usuario o array con nulls si falla

### 4.14 Backend - Archivo: api/src/JwtHelper.php

**Función: JwtHelper::generateToken(string $usuario, string $rol, array $permisos)**
- **Propósito:** Genera token JWT
- **Parámetros:** $usuario, $rol, $permisos
- **Invocación:** AuthService::login()
- **Dependencias:** Firebase\JWT\JWT, Config
- **Consultas BD:** Ninguna
- **Retorno:** String con token JWT

**Función: JwtHelper::decode(string $token)**
- **Propósito:** Decodifica y valida token JWT
- **Parámetros:** $token
- **Invocación:** AuthMiddleware::process()
- **Dependencias:** Firebase\JWT\JWT, Config
- **Consultas BD:** Ninguna
- **Retorno:** Object con payload del token

**Función: JwtHelper::usuarioFromPayload(object $payload)**
- **Propósito:** Extrae nombre de usuario del payload
- **Parámetros:** $payload
- **Invocación:** AuthMiddleware::process()
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** String con nombre de usuario

**Función: JwtHelper::permisosFromPayload(object $payload)**
- **Propósito:** Extrae permisos del payload
- **Parámetros:** $payload
- **Invocación:** AuthMiddleware::process()
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Array de permisos

### 4.15 Backend - Archivo: api/src/PasswordHasher.php

**Función: PasswordHasher::crearHash(string $password)**
- **Propósito:** Crea hash de contraseña usando BCrypt
- **Parámetros:** $password
- **Invocación:** UsuariosController::crear()
- **Dependencias:** password_hash() de PHP
- **Consultas BD:** Ninguna
- **Retorno:** Array [$hash, 'bcrypt']

**Función: PasswordHasher::verificar(string $password, string $storedHash, string $storedSalt)**
- **Propósito:** Verifica contraseña (soporta BCrypt y HMAC-SHA512)
- **Parámetros:** $password, $storedHash, $storedSalt
- **Invocación:** AuthService::login()
- **Dependencias:** password_verify(), hash_hmac()
- **Consultas BD:** Ninguna
- **Retorno:** Bool (true si coincide, false si no)

### 4.16 Backend - Archivo: api/src/FileStorage.php

**Función: FileStorage::saveAdjunto(?UploadedFileInterface $file, string $subdir = '')**
- **Propósito:** Guarda archivo adjunto de retiro
- **Parámetros:** $file, $subdir
- **Invocación:** RetirosController::crearRetiroConAdjunto()
- **Dependencias:** Config
- **Consultas BD:** Ninguna (sistema de archivos)
- **Retorno:** String con ruta web o null

**Función: FileStorage::saveAdjuntoSolicitud(?UploadedFileInterface $file)**
- **Propósito:** Guarda archivo adjunto de solicitud
- **Parámetros:** $file
- **Invocación:** SolicitudesController::create()
- **Dependencias:** Config
- **Consultas BD:** Ninguna (sistema de archivos)
- **Retorno:** String con ruta web o null

**Función: FileStorage::resolveAdjuntoPath(string $ruta)**
- **Propósito:** Resuelve ruta web a ruta física del archivo
- **Parámetros:** $ruta
- **Invocación:** AdjuntosController::ver()
- **Dependencias:** Config
- **Consultas BD:** Ninguna (sistema de archivos)
- **Retorno:** String con ruta física o null

**Función: FileStorage::contentType(string $filename)**
- **Propósito:** Determina Content-Type basado en extensión
- **Parámetros:** $filename
- **Invocación:** AdjuntosController::ver()
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** String con Content-Type

### 4.17 Backend - Archivo: api/src/FondoRepoSchema.php

**Función: FondoRepoSchema::quoteIdent(string $name)**
- **Propósito:** Escapa identificador de SQL
- **Parámetros:** $name
- **Invocación:** Para construir consultas dinámicas
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** String con identificador escapado

**Función: FondoRepoSchema::validarNombreColumna(string $col)**
- **Propósito:** Valida formato de nombre de columna
- **Parámetros:** $col
- **Invocación:** Para validar nombres de columnas dinámicas
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Bool

**Función: FondoRepoSchema::getMesesPrefixes()**
- **Propósito:** Retorna prefijos de meses
- **Parámetros:** Ninguno
- **Invocación:** Para mapeo de meses
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Array ['ene', 'feb', 'mar', ...]

**Función: FondoRepoSchema::numeroAMesKey(int $mesNum)**
- **Propósito:** Convierte número de mes a clave
- **Parámetros:** $mesNum (1-12)
- **Invocación:** DbProvider::obtenerFondosMensuales()
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** String (ej. 'ene', 'feb')

**Función: FondoRepoSchema::mesKeyANumero(string $mesKey)**
- **Propósito:** Convierte clave de mes a número
- **Parámetros:** $mesKey
- **Invocación:** Para conversión inversa
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Int (1-12)

**Función: FondoRepoSchema::hasColumn(\PDO $pdo, string $table, string $column)**
- **Propósito:** Verifica si existe columna en tabla
- **Parámetros:** $pdo, $table, $column
- **Invocación:** Para consultas dinámicas
- **Dependencias:** PDO
- **Consultas BD:** SELECT FROM INFORMATION_SCHEMA.COLUMNS
- **Retorno:** Bool

### 4.18 Backend - Archivo: api/src/Middleware/AuthMiddleware.php

**Función: AuthMiddleware::process(Request $request, RequestHandler $handler)**
- **Propósito:** Valida token JWT y extrae usuario/permisos
- **Parámetros:** $request, $handler
- **Invocación:** Antes de cada ruta protegida
- **Dependencias:** JwtHelper, Http
- **Consultas BD:** Ninguna (solo validación de token)
- **Retorno:** Response con atributos de usuario o 401/403

**Función: AuthMiddleware::require(?string $permiso = null)**
- **Propósito:** Factory para crear instancia con permiso específico
- **Parámetros:** $permiso
- **Invocación:** En index.php para configurar rutas
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Instancia de AuthMiddleware

### 4.19 Backend - Archivo: api/src/Middleware/CorsMiddleware.php

**Función: CorsMiddleware::process(Request $request, RequestHandler $handler)**
- **Propósito:** Agrega headers CORS a respuestas
- **Parámetros:** $request, $handler
- **Invocación:** En todas las requests
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Response con headers CORS

### 4.20 Frontend - Archivo: Frontend/src/main.jsx

**Función: main()**
- **Propósito:** Punto de entrada de React, renderiza aplicación
- **Parámetros:** Ninguno
- **Invocación:** Al cargar la aplicación
- **Dependencias:** React, ReactDOM, App
- **Consultas BD:** Ninguna
- **Retorno:** Renderiza App en DOM

### 4.21 Frontend - Archivo: Frontend/src/App.jsx

**Función: App()**
- **Propósito:** Componente principal, define rutas y maneja autenticación
- **Parámetros:** Ninguno
- **Invocación:** Desde main.jsx
- **Dependencias:** React Router, Layouts, Pages, Components
- **Consultas BD:** Ninguna (delega a páginas)
- **Retorno:** JSX con BrowserRouter y rutas

**Estado local:**
- `isAuth`: Boolean indicando si usuario está autenticado
- `handleLogin()`: Función para establecer autenticación
- `handleLogout()`: Función para cerrar sesión

**Rutas definidas:**
- `/login` → Login (si no autenticado)
- `/` → Dashboard (requiere autenticación)
- `/vehiculos` → Vehiculos (requiere VEHICULO_CONSULTAR)
- `/vehiculos/resumen` → Vehiculos (requiere VEHICULO_RESUMEN)
- `/usuarios` → Usuarios (requiere USUARIO_CREAR)
- `/roles` → Roles (requiere USUARIO_EDITAR)
- `/fondo/cargue` → CargueFondo (requiere VEHICULO_CONSULTAR)
- `/nueva-solicitud` → NuevaSolicitud (requiere VEHICULO_CONSULTAR)
- `/solicitudes` → Solicitudes (requiere VEHICULO_CONSULTAR)
- `/unauthorized` → Unauthorized
- `*` → Redirect a / o /login

### 4.22 Frontend - Archivo: Frontend/src/api/axios.jsx

**Función: axios.create()**
- **Propósito:** Crea instancia de Axios configurada
- **Parámetros:** Configuración baseURL
- **Invocación:** Al importar el módulo
- **Dependencias:** axios
- **Consultas BD:** Ninguna
- **Retorno:** Instancia de Axios

**Interceptor request:**
- **Propósito:** Agrega token JWT a headers Authorization
- **Parámetros:** config de la request
- **Invocación:** Automáticamente en cada request
- **Dependencias:** localStorage
- **Consultas BD:** Ninguna
- **Retorno:** Config modificado

### 4.23 Frontend - Archivo: Frontend/src/Services/authService.js

**Función: login(usuario, password)**
- **Propósito:** Autentica usuario y almacena token
- **Parámetros:** $usuario, $password
- **Invocación:** Login.jsx al submit del formulario
- **Dependencias:** api (axios)
- **Consultas BD:** POST /api/auth/login
- **Retorno:** Token o error

**Función: logout()**
- **Propósito:** Limpia localStorage y redirige
- **Parámetros:** Ninguno
- **Invocación:** Al hacer click en cerrar sesión
- **Dependencias:** localStorage, window.location
- **Consultas BD:** Ninguna
- **Retorno:** Void

### 4.24 Frontend - Archivo: Frontend/src/Services/dashboardService.js

**Función: getDashboardResumen()**
- **Propósito:** Obtiene métricas del dashboard
- **Parámetros:** Ninguno
- **Invocación:** Dashboard.jsx
- **Dependencias:** axios
- **Consultas BD:** GET /api/dashboard/resumen
- **Retorno:** Promise con datos del dashboard

**Función: getVehiculoResumen(placa)**
- **Propósito:** Obtiene resumen de vehículo
- **Parámetros:** $placa
- **Invocación:** Vehiculos.jsx (componente Resumen)
- **Dependencias:** axios
- **Consultas BD:** GET /api/vehiculos/{placa}/resumen
- **Retorno:** Promise con resumen

**Función: getVehiculoFondosMensuales(placa, anio)**
- **Propósito:** Obtiene fondos mensuales
- **Parámetros:** $placa, $anio
- **Invocación:** Vehiculos.jsx (componente DetalleAnual)
- **Dependencias:** axios
- **Consultas BD:** GET /api/vehiculos/{placa}/fondos/{anio}
- **Retorno:** Promise con fondos mensuales

**Función: getRetirosPorPlaca(placa)**
- **Propósito:** Obtiene retiros de vehículo
- **Parámetros:** $placa
- **Invocación:** Dashboard.jsx (modo placa)
- **Dependencias:** axios
- **Consultas BD:** GET /api/retiros/{placa}
- **Retorno:** Promise con retiros

### 4.25 Frontend - Archivo: Frontend/src/Services/retiroService.js

**Función: obtenerSaldoDisponible(placa)**
- **Propósito:** Obtiene saldo disponible
- **Parámetros:** $placa
- **Invocación:** VehiculoRetiros.jsx
- **Dependencias:** api
- **Consultas BD:** GET /api/retiros/saldo/{placa}
- **Retorno:** Promise con saldo

**Función: obtenerRetirosPorPlaca(placa)**
- **Propósito:** Obtiene retiros de vehículo
- **Parámetros:** $placa
- **Invocación:** VehiculoRetiros.jsx
- **Dependencias:** api
- **Consultas BD:** GET /api/retiros/{placa}
- **Retorno:** Promise con retiros

**Función: crearRetiro(data)**
- **Propósito:** Crea retiro sin archivo
- **Parámetros:** $data (objeto con placa, monto, observacion)
- **Invocación:** VehiculoRetiros.jsx
- **Dependencias:** api
- **Consultas BD:** POST /api/retiros
- **Retorno:** Promise con resultado

**Función: crearRetiroConAdjunto(formData)**
- **Propósito:** Crea retiro con archivo
- **Parámetros:** $formData (FormData)
- **Invocación:** VehiculoRetiros.jsx
- **Dependencias:** api
- **Consultas BD:** POST /api/retiros/with-file
- **Retorno:** Promise con resultado

### 4.26 Frontend - Archivo: Frontend/src/Services/rolesService.js

**Función: getRoles()**
- **Propósito:** Obtiene roles
- **Parámetros:** Ninguno
- **Invocación:** Roles.jsx
- **Dependencias:** axios
- **Consultas BD:** GET /api/roles
- **Retorno:** Promise con roles

**Función: getPermisos()**
- **Propósito:** Obtiene permisos
- **Parámetros:** Ninguno
- **Invocación:** Roles.jsx
- **Dependencias:** axios
- **Consultas BD:** GET /api/roles/permisos
- **Retorno:** Promise con permisos

**Función: asignarPermiso(rolId, permisoId)**
- **Propósito:** Asigna permiso a rol
- **Parámetros:** $rolId, $permisoId
- **Invocación:** Roles.jsx
- **Dependencias:** axios
- **Consultas BD:** POST /api/roles/asignar
- **Retorno:** Promise

**Función: quitarPermiso(rolId, permisoId)**
- **Propósito:** Quita permiso de rol
- **Parámetros:** $rolId, $permisoId
- **Invocación:** Roles.jsx
- **Dependencias:** axios
- **Consultas BD:** POST /api/roles/quitar
- **Retorno:** Promise

### 4.27 Frontend - Archivo: Frontend/src/Services/usuariosService.js

**Función: obtenerUsuarios()**
- **Propósito:** Obtiene usuarios
- **Parámetros:** Ninguno
- **Invocación:** Usuarios.jsx
- **Dependencias:** api
- **Consultas BD:** GET /api/usuarios
- **Retorno:** Promise con usuarios

**Función: obtenerRoles()**
- **Propósito:** Obtiene roles para dropdown
- **Parámetros:** Ninguno
- **Invocación:** Usuarios.jsx
- **Dependencias:** api
- **Consultas BD:** GET /api/usuarios/roles
- **Retorno:** Promise con roles

**Función: crearUsuario(data)**
- **Propósito:** Crea usuario
- **Parámetros:** $data
- **Invocación:** Usuarios.jsx
- **Dependencias:** api
- **Consultas BD:** POST /api/usuarios
- **Retorno:** Promise

**Función: editarUsuario(id, data)**
- **Propósito:** Edita usuario
- **Parámetros:** $id, $data
- **Invocación:** Usuarios.jsx
- **Dependencias:** api
- **Consultas BD:** PUT /api/usuarios/{id}
- **Retorno:** Promise

**Función: cambiarEstadoUsuario(id)**
- **Propósito:** Cambia estado de usuario
- **Parámetros:** $id
- **Invocación:** Usuarios.jsx
- **Dependencias:** api
- **Consultas BD:** PUT /api/usuarios/{id}/estado
- **Retorno:** Promise

**Función: eliminarUsuario(id)**
- **Propósito:** Elimina usuario
- **Parámetros:** $id
- **Invocación:** Usuarios.jsx
- **Dependencias:** api
- **Consultas BD:** DELETE /api/usuarios/{id}
- **Retorno:** Promise

### 4.28 Frontend - Archivo: Frontend/src/Utils/auth.js

**Función: isAuthenticated()**
- **Propósito:** Verifica si hay token válido
- **Parámetros:** Ninguno
- **Invocación:** App.jsx, ProtectedRoute.jsx
- **Dependencias:** jwt-decode, localStorage
- **Consultas BD:** Ninguna
- **Retorno:** Bool

**Función: getUser()**
- **Propósito:** Obtiene nombre de usuario
- **Parámetros:** Ninguno
- **Invocación:** Sidebar.jsx, Header.jsx
- **Dependencias:** jwt-decode, localStorage
- **Consultas BD:** Ninguna
- **Retorno:** String o null

**Función: getUserRole()**
- **Propósito:** Obtiene rol del usuario
- **Parámetros:** Ninguno
- **Invocación:** Sidebar.jsx
- **Dependencias:** jwt-decode, localStorage
- **Consultas BD:** Ninguna
- **Retorno:** String o null

**Función: getUserPermissions()**
- **Propósito:** Obtiene permisos del usuario
- **Parámetros:** Ninguno
- **Invocación:** ProtectedRoute.jsx, Sidebar.jsx
- **Dependencias:** jwt-decode, localStorage
- **Consultas BD:** Ninguna
- **Retorno:** Array de permisos

**Función: logout()**
- **Propósito:** Cierra sesión
- **Parámetros:** Ninguno
- **Invocación:** Sidebar.jsx, MainLayout.jsx
- **Dependencias:** localStorage, window.location
- **Consultas BD:** Ninguna
- **Retorno:** Void

### 4.29 Frontend - Archivo: Frontend/src/Utils/format.js

**Función: formatCurrencyCOP(value)**
- **Propósito:** Formatea valor como moneda COP
- **Parámetros:** $value
- **Invocación:** Dashboard.jsx, varios componentes
- **Dependencias:** Intl.NumberFormat
- **Consultas BD:** Ninguna
- **Retorno:** String formateado

### 4.30 Frontend - Archivo: Frontend/src/config/menu.js

**Export: menuItems**
- **Propósito:** Configuración del menú de navegación
- **Parámetros:** Ninguno
- **Invocación:** Sidebar.jsx, Header.jsx
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Array de objetos de menú

**Estructura de items:**
- label: Texto del menú
- path: Ruta de React Router
- permiso: Permiso requerido (opcional)
- icon: Icono de Material Symbols
- categoria: Categoría (principal/operaciones/soporte)

### 4.31 Frontend - Archivo: Frontend/src/pages/Dashboard.jsx

**Función: Dashboard()**
- **Propósito:** Componente principal del dashboard
- **Parámetros:** Ninguno
- **Invocación:** Ruta "/" en App.jsx
- **Dependencias:** React, dashboardService, format.js, Recharts
- **Consultas BD:** 
  - getDashboardResumen() → GET /api/dashboard/resumen
  - getVehiculoResumen() → GET /api/vehiculos/{placa}/resumen
  - getVehiculoFondosMensuales() → GET /api/vehiculos/{placa}/fondos/{anio}
  - getRetirosPorPlaca() → GET /api/retiros/{placa}
- **Retorno:** JSX con dashboard

**Estado local:**
- `data`: Datos del dashboard
- `loading`: Estado de carga
- `placaInput`: Input de placa
- `placaQuery`: Placa a buscar
- `modo`: 'general' o 'placa'
- `error`: Mensaje de error
- `anio`: Año seleccionado

**Funciones internas:**
- `formatMillions()`: Formatea valores grandes
- `formatPlaca()`: Formatea input de placa
- `sumValues()`: Suma valores de objeto
- `isPlacaCompleta()`: Valida formato de placa

### 4.32 Frontend - Archivo: Frontend/src/pages/Login.jsx

**Función: Login({ onLogin })**
- **Propósito:** Página de login
- **Parámetros:** $onLogin (callback)
- **Invocación:** Ruta "/login" en App.jsx
- **Dependencias:** React, authService
- **Consultas BD:** POST /api/auth/login
- **Retorno:** JSX con formulario de login

**Estado local:**
- `usuario`: Input de usuario
- `password`: Input de contraseña
- `error`: Mensaje de error
- `loading`: Estado de carga
- `showPassword`: Toggle visibilidad contraseña

**Función: handleSubmit(e)**
- **Propósito:** Maneja submit del formulario
- **Parámetros:** $e (evento)
- **Invocación:** Al submit del formulario
- **Dependencias:** authService.login()
- **Consultas BD:** POST /api/auth/login
- **Retorno:** Void

### 4.33 Frontend - Archivo: Frontend/src/pages/Vehiculos.jsx

**Función: Vehiculos()**
- **Propósito:** Página de consulta de vehículos
- **Parámetros:** Ninguno
- **Invocación:** Ruta "/vehiculos" en App.jsx
- **Dependencias:** React, axios, componentes
- **Consultas BD:** GET /api/vehiculos/{placa}
- **Retorno:** JSX con consulta de vehículos

**Estado local:**
- `placa`: Input de placa
- `vehiculo`: Datos del vehículo
- `vista`: 'consulta', 'resumen', 'detalle', 'retiros', 'solicitudes'
- `anioSeleccionado`: Año para detalle
- `loading`: Estado de carga
- `refreshSolicitudes`: Trigger refresh solicitudes

**Función: buscar()**
- **Propósito:** Busca vehículo por placa
- **Parámetros:** Ninguno
- **Invocación:** Al presionar "Buscar"
- **Dependencias:** axios
- **Consultas BD:** GET /api/vehiculos/{placa}
- **Retorno:** Void

**Función: handlePlacaChange(e)**
- **Propósito:** Formatea input de placa
- **Parámetros:** $e (evento)
- **Invocación:** Al cambiar input de placa
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Void

### 4.34 Frontend - Archivo: Frontend/src/pages/Usuarios.jsx

**Función: Usuarios()**
- **Propósito:** Página de gestión de usuarios
- **Parámetros:** Ninguno
- **Invocación:** Ruta "/usuarios" en App.jsx
- **Dependencias:** React, usuariosService
- **Consultas BD:** 
  - GET /api/usuarios
  - GET /api/usuarios/roles
  - POST /api/usuarios
  - PUT /api/usuarios/{id}
  - PUT /api/usuarios/{id}/estado
  - DELETE /api/usuarios/{id}
- **Retorno:** JSX con gestión de usuarios

**Estado local:**
- `usuarios`: Lista de usuarios
- `roles`: Lista de roles
- `loading`: Estado de carga
- `error`: Mensaje de error
- `busqueda`: Texto de búsqueda
- `pagina`: Página actual
- `modalCrear`: Estado modal crear
- `modalEditar`: Usuario a editar
- `modalEliminar`: Usuario a eliminar
- `guardando`: Estado de guardado

**Función: cargarDatos()**
- **Propósito:** Carga usuarios y roles
- **Parámetros:** Ninguno
- **Invocación:** Al montar y después de cambios
- **Dependencias:** usuariosService
- **Consultas BD:** GET /api/usuarios, GET /api/usuarios/roles
- **Retorno:** Void

**Función: toggleActivo(id)**
- **Propósito:** Cambia estado de usuario
- **Parámetros:** $id
- **Invocación:** Al presionar botón "Inactivar/Activar"
- **Dependencias:** usuariosService
- **Consultas BD:** PUT /api/usuarios/{id}/estado
- **Retorno:** Void

**Función: handleCrear(e)**
- **Propósito:** Crea nuevo usuario
- **Parámetros:** $e (evento)
- **Invocación:** Al submit del modal crear
- **Dependencias:** usuariosService, PasswordHasher (en backend)
- **Consultas BD:** POST /api/usuarios
- **Retorno:** Void

**Función: handleEditar(e)**
- **Propósito:** Edita usuario existente
- **Parámetros:** $e (evento)
- **Invocación:** Al submit del modal editar
- **Dependencias:** usuariosService
- **Consultas BD:** PUT /api/usuarios/{id}
- **Retorno:** Void

**Función: handleEliminar()**
- **Propósito:** Elimina usuario
- **Parámetros:** Ninguno
- **Invocación:** Al confirmar en modal eliminar
- **Dependencias:** usuariosService
- **Consultas BD:** DELETE /api/usuarios/{id}
- **Retorno:** Void

### 4.35 Frontend - Archivo: Frontend/src/pages/Roles.jsx

**Función: Roles()**
- **Propósito:** Página de gestión de roles y permisos
- **Parámetros:** Ninguno
- **Invocación:** Ruta "/roles" en App.jsx
- **Dependencias:** React, rolesService
- **Consultas BD:** 
  - GET /api/roles
  - GET /api/roles/permisos
  - POST /api/roles/asignar
  - POST /api/roles/quitar
- **Retorno:** JSX con gestión de roles

**Estado local:**
- `roles`: Lista de roles
- `permisos`: Lista de permisos
- `rolSeleccionado`: Rol seleccionado
- `permisosRol`: Permisos del rol seleccionado
- `mensaje`: Mensaje de confirmación

**Función: cargarDatos()**
- **Propósito:** Carga roles y permisos
- **Parámetros:** Ninguno
- **Invocación:** Al montar
- **Dependencias:** rolesService
- **Consultas BD:** GET /api/roles, GET /api/roles/permisos
- **Retorno:** Void

**Función: togglePermiso(permisoId)**
- **Propósito:** Asigna/quita permiso a rol
- **Parámetros:** $permisoId
- **Invocación:** Al cambiar toggle de permiso
- **Dependencias:** rolesService
- **Consultas BD:** POST /api/roles/asignar o POST /api/roles/quitar
- **Retorno:** Void

**Función: seleccionarRol(rol)**
- **Propósito:** Selecciona rol para editar permisos
- **Parámetros:** $rol
- **Invocación:** Al hacer click en rol
- **Dependencias:** Ninguna
- **Consultas BD:** Ninguna
- **Retorno:** Void

### 4.36 Frontend - Archivo: Frontend/src/pages/CargueFondo.jsx

**Función: CargueFondo()**
- **Propósito:** Página de cargue masivo de datos
- **Parámetros:** Ninguno
- **Invocación:** Ruta "/fondo/cargue" en App.jsx
- **Dependencias:** React, api
- **Consultas BD:** POST /api/fondo/cargue
- **Retorno:** JSX con formulario de cargue

**Estado local:**
- `archivo`: Archivo CSV seleccionado
- `nombreColumna`: Nombre de columna
- `cargando`: Estado de carga
- `mensaje`: Mensaje de éxito
- `error`: Mensaje de error

**Función: handleSubmit(e)**
- **Propósito:** Procesa cargue de CSV
- **Parámetros:** $e (evento)
- **Invocación:** Al submit del formulario
- **Dependencias:** api
- **Consultas BD:** POST /api/fondo/cargue
- **Retorno:** Void

**NOTA:** Esta funcionalidad está incompleta en el backend ya que el método `cargarColumnaFondo()` no está implementado en DbProvider.php.

### 4.37 Frontend - Archivo: Frontend/src/pages/NuevaSolicitud.jsx

**Función: NuevaSolicitud({ placaVehiculo, onCreated })**
- **Propósito:** Formulario de nueva solicitud
- **Parámetros:** $placaVehiculo (opcional), $onCreated (callback)
- **Invocación:** Solicitudes.jsx o Vehiculos.jsx
- **Dependencias:** React, api
- **Consultas BD:** 
  - GET /api/vehiculos/{placa} (validación)
  - POST /api/solicitudes
- **Retorno:** JSX con formulario de solicitud

**Estado local:**
- `placa`: Placa del vehículo
- `form`: Datos del formulario
- `archivo`: Archivo adjunto
- `enviado`: Estado de enviado
- `cargando`: Estado de carga
- `validandoPlaca`: Estado de validación
- `placaValida`: Resultado de validación
- `error`: Mensaje de error

**Función: validarPlacaExiste(placaToValidate)**
- **Propósito:** Valida que la placa exista
- **Parámetros:** $placaToValidate
- **Invocación:** Al blur del input de placa
- **Dependencias:** api
- **Consultas BD:** GET /api/vehiculos/{placa}
- **Retorno:** Bool

**Función: handleSubmit()**
- **Propósito:** Envía solicitud
- **Parámetros:** Ninguno
- **Invocación:** Al presionar "Enviar solicitud"
- **Dependencias:** api
- **Consultas BD:** POST /api/solicitudes
- **Retorno:** Void

### 4.38 Frontend - Archivo: Frontend/src/pages/Solicitudes.jsx

**Función: Solicitudes()**
- **Propósito:** Página de solicitudes
- **Parámetros:** Ninguno
- **Invocación:** Ruta "/solicitudes" en App.jsx
- **Dependencias:** React, componentes
- **Consultas BD:** Ninguna (delega a componentes)
- **Retorno:** JSX con lista y formulario de solicitudes

**Estado local:**
- `refresh`: Trigger para refrescar lista

### 4.39 Frontend - Archivo: Frontend/src/Layouts/MainLayout.jsx

**Función: MainLayout()**
- **Propósito:** Layout principal con sidebar y header
- **Parámetros:** Ninguno
- **Invocación:** Rutas protegidas en App.jsx
- **Dependencias:** React Router, componentes
- **Consultas BD:** Ninguna
- **Retorno:** JSX con layout

**Función: onLogout()**
- **Propósito:** Maneja logout
- **Parámetros:** Ninguno
- **Invocación:** Desde Sidebar
- **Dependencias:** auth.js
- **Consultas BD:** Ninguna
- **Retorno:** Void

### 4.40 Frontend - Archivo: Frontend/src/components/Sidebar.jsx

**Función: Sidebar({ onLogout })**
- **Propósito:** Sidebar de navegación
- **Parámetros:** $onLogout (callback)
- **Invocación:** MainLayout.jsx
- **Dependencias:** React Router, auth.js, menu.js
- **Consultas BD:** Ninguna
- **Retorno:** JSX con sidebar

**Función interna:**
- Filtrado de menuItems según permisos del usuario
- Visualización de usuario logueado y rol
- Links de navegación

### 4.41 Frontend - Archivo: Frontend/src/components/Header.jsx

**Función: Header()**
- **Propósito:** Header de la aplicación
- **Parámetros:** Ninguno
- **Invocación:** MainLayout.jsx
- **Dependencias:** React Router, auth.js, menu.js
- **Consultas BD:** Ninguna
- **Retorno:** JSX con header

**Funciones:**
- Breadcrumb basado en ruta actual
- Toggle de dark mode
- Display de nombre de usuario

### 4.42 Frontend - Archivo: Frontend/src/components/ProtectedRoute.jsx

**Función: ProtectedRoute({ permiso, children })**
- **Propósito:** Protege rutas por permisos
- **Parámetros:** $permiso, $children
- **Invocación:** Rutas en App.jsx
- **Dependencias:** React Router, auth.js
- **Consultas BD:** Ninguna
- **Retorno:** Children o Navigate a /unauthorized

### 4.43 Frontend - Archivo: Frontend/src/components/Retiros/VehiculoRetiros.jsx

**Función: VehiculoRetiros({ placa })**
- **Propósito:** Gestión de retiros por vehículo
- **Parámetros:** $placa
- **Invocación:** Vehiculos.jsx (vista retiros)
- **Dependencias:** React, retiroService, api
- **Consultas BD:** 
  - GET /api/retiros/saldo/{placa}
  - GET /api/retiros/{placa}
  - POST /api/retiros o POST /api/retiros/with-file
- **Retorno:** JSX con gestión de retiros

**Estado local:**
- `saldo`: Saldo disponible
- `retiros`: Lista de retiros
- `monto`: Input de monto
- `observacion`: Input de observación
- `archivo`: Archivo adjunto
- `subiendo`: Estado de carga
- `error`: Mensaje de error
- `loading`: Estado de carga inicial

**Función: cargarDatos()**
- **Propósito:** Carga saldo y retiros
- **Parámetros:** Ninguno
- **Invocación:** Al montar y después de cambios
- **Dependencias:** retiroService
- **Consultas BD:** GET /api/retiros/saldo/{placa}, GET /api/retiros/{placa}
- **Retorno:** Void

**Función: registrarRetiro()**
- **Propósito:** Registra nuevo retiro
- **Parámetros:** Ninguno
- **Invocación:** Al presionar "Registrar retiro"
- **Dependencias:** retiroService
- **Consultas BD:** POST /api/retiros o POST /api/retiros/with-file
- **Retorno:** Void

**Función: VerAdjuntoLink({ ruta })**
- **Propósito:** Componente para ver adjunto
- **Parámetros:** $ruta
- **Invocación:** En tabla de retiros
- **Dependencias:** api
- **Consultas BD:** GET /api/adjuntos/ver
- **Retorno:** JSX con botón

### 4.44 Frontend - Archivo: Frontend/src/components/Solicitudes/ListaSolicitudes.jsx

**Función: ListaSolicitudes({ placaVehiculo })**
- **Propósito:** Lista de solicitudes
- **Parámetros:** $placaVehiculo (opcional)
- **Invocación:** Solicitudes.jsx o Vehiculos.jsx
- **Dependencias:** React, api
- **Consultas BD:** 
  - GET /api/solicitudes o GET /api/solicitudes/vehiculo/{placa}
  - PUT /api/solicitudes/{id}/estado
- **Retorno:** JSX con tabla de solicitudes

**Estado local:**
- `solicitudes`: Lista de solicitudes
- `cargando`: Estado de carga

**Función: cargarSolicitudes()**
- **Propósito:** Carga solicitudes
- **Parámetros:** Ninguno
- **Invocación:** Al montar y cuando cambia placaVehiculo
- **Dependencias:** api
- **Consultas BD:** GET /api/solicitudes o GET /api/solicitudes/vehiculo/{placa}
- **Retorno:** Void

**Función: cambiarEstado(id, nuevoEstado)**
- **Propósito:** Cambia estado de solicitud
- **Parámetros:** $id, $nuevoEstado
- **Invocación:** Al cambiar select de estado
- **Dependencias:** api
- **Consultas BD:** PUT /api/solicitudes/{id}/estado
- **Retorno:** Void

**Función: verAdjunto(ruta)**
- **Propósito:** Abre archivo adjunto
- **Parámetros:** $ruta
- **Invocación:** Al hacer click en "Ver"
- **Dependencias:** api
- **Consultas BD:** GET /api/adjuntos/ver
- **Retorno:** Void

### 4.45 Frontend - Archivo: Frontend/src/components/Resumen.jsx

**Función: Resumen({ vehiculo, onSelectAnio })**
- **Propósito:** Resumen financiero de vehículo
- **Parámetros:** $vehiculo, $onSelectAnio (callback)
- **Invocación:** Vehiculos.jsx (vista resumen)
- **Dependencias:** React, axios
- **Consultas BD:** GET /api/vehiculos/{placa}/resumen
- **Retorno:** JSX con resumen

**Estado local:**
- `data`: Datos del resumen
- `loading`: Estado de carga

**Función: cargarResumen()**
- **Propósito:** Carga resumen del vehículo
- **Parámetros:** Ninguno
- **Invocación:** Al montar y cuando cambia placa
- **Dependencias:** axios
- **Consultas BD:** GET /api/vehiculos/{placa}/resumen
- **Retorno:** Void

### 4.46 Frontend - Archivo: Frontend/src/components/DetalleAnual.jsx

**Función: DetalleAnual({ placa, anio, onSelectAnio })**
- **Propósito:** Detalle mensual por año
- **Parámetros:** $placa, $anio, $onSelectAnio (callback)
- **Invocación:** Vehiculos.jsx (vista detalle)
- **Dependencias:** React, axios
- **Consultas BD:** GET /api/vehiculos/{placa}/fondos/{anio}
- **Retorno:** JSX con detalle mensual

**Estado local:**
- `data`: Datos del detalle
- `loading`: Estado de carga

**Función: cargar()**
- **Propósito:** Carga detalle mensual
- **Parámetros:** Ninguno
- **Invocación:** Al montar y cuando cambia placa o anio
- **Dependencias:** axios
- **Consultas BD:** GET /api/vehiculos/{placa}/fondos/{anio}
- **Retorno:** Void

---

## 5. PUNTOS DE ENTRADA Y ENDPOINTS

### 5.1 Backend - API REST Endpoints

#### 5.1.1 Autenticación
- **POST** `/api/auth/login`
  - **Controller:** AuthController::login
  - **Middleware:** Ninguno (pública)
  - **Propósito:** Autenticar usuario y obtener token JWT
  - **Request Body:** `{ usuario: string, password: string }`
  - **Response:** `{ token: string, nombreCompleto: string, usuario: string, rol: string }` o 401

#### 5.1.2 Dashboard
- **GET** `/api/dashboard/resumen`
  - **Controller:** DashboardController::resumen
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Obtener métricas del dashboard
  - **Response:** `{ totalReposicion: float, totalRetiros: float, usuariosActivos: int, presupuestoUtilizado: float, flujoMensual: array }`

#### 5.1.3 Vehículos
- **GET** `/api/vehiculos/{placa}`
  - **Controller:** VehiculosController::obtenerPorPlaca
  - **Middleware:** AuthMiddleware (permiso VEHICULO_CONSULTAR)
  - **Propósito:** Obtener información de vehículo por placa
  - **Response:** Datos del vehículo con totales anuales o 404

- **GET** `/api/vehiculos/{placa}/resumen`
  - **Controller:** VehiculosController::obtenerResumen
  - **Middleware:** AuthMiddleware (permiso VEHICULO_RESUMEN)
  - **Propósito:** Obtener resumen financiero del vehículo
  - **Response:** Resumen con totales anuales y general o 404

- **GET** `/api/vehiculos/{placa}/fondos/{anio}`
  - **Controller:** VehiculosController::obtenerFondos
  - **Middleware:** AuthMiddleware (permiso VEHICULO_DETALLE)
  - **Propósito:** Obtener fondos mensuales por año
  - **Response:** `{ placa: string, anio: int, valores: object }`

#### 5.1.4 Retiros
- **GET** `/api/retiros/saldo/{placa}`
  - **Controller:** RetirosController::obtenerSaldo
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Obtener saldo disponible del vehículo
  - **Response:** `float` con saldo

- **GET** `/api/retiros/{placa}`
  - **Controller:** RetirosController::obtenerRetiros
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Obtener historial de retiros del vehículo
  - **Response:** Array de retiros

- **POST** `/api/retiros`
  - **Controller:** RetirosController::crearRetiro
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Crear retiro sin archivo adjunto
  - **Request Body:** `{ placa: string, monto: float, observacion?: string, rutaAdjunto?: string }`
  - **Response:** `{ mensaje: string, saldoRestante: float }` o error

- **POST** `/api/retiros/with-file`
  - **Controller:** RetirosController::crearRetiroConAdjunto
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Crear retiro con archivo adjunto
  - **Request Body:** FormData (placa, monto, observacion, archivo)
  - **Response:** `{ mensaje: string, saldoRestante: float }` o error

#### 5.1.5 Usuarios
- **GET** `/api/usuarios/roles`
  - **Controller:** UsuariosController::obtenerRolesParaDropdown
  - **Middleware:** AuthMiddleware (permiso USUARIO_CREAR)
  - **Propósito:** Obtener roles para dropdown
  - **Response:** Array de `{ value: string, label: string }`

- **GET** `/api/usuarios`
  - **Controller:** UsuariosController::obtenerUsuarios
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Obtener todos los usuarios
  - **Response:** Array de usuarios

- **POST** `/api/usuarios`
  - **Controller:** UsuariosController::crear
  - **Middleware:** AuthMiddleware (permiso USUARIO_CREAR)
  - **Propósito:** Crear nuevo usuario
  - **Request Body:** `{ nombreUsuario: string, nombreCompleto: string, password: string, rol: string }`
  - **Response:** 200 si éxito

- **PUT** `/api/usuarios/{id}`
  - **Controller:** UsuariosController::editar
  - **Middleware:** AuthMiddleware (permiso USUARIO_EDITAR)
  - **Propósito:** Editar usuario existente
  - **Request Body:** `{ nombreUsuario: string, nombreCompleto: string, rol: string, activo: boolean }`
  - **Response:** 200 si éxito

- **PUT** `/api/usuarios/{id}/estado`
  - **Controller:** UsuariosController::cambiarEstado
  - **Middleware:** AuthMiddleware (permiso USUARIO_EDITAR)
  - **Propósito:** Cambiar estado de usuario (toggle)
  - **Response:** 200 si éxito

- **PATCH** `/api/usuarios/{id}/inhabilitar`
  - **Controller:** UsuariosController::inhabilitar
  - **Middleware:** AuthMiddleware (permiso USUARIO_EDITAR)
  - **Propósito:** Inhabilitar usuario
  - **Response:** 200 si éxito

- **DELETE** `/api/usuarios/{id}`
  - **Controller:** UsuariosController::eliminar
  - **Middleware:** AuthMiddleware (permiso USUARIO_EDITAR)
  - **Propósito:** Eliminar (inhabilitar) usuario
  - **Response:** 200 si éxito

#### 5.1.6 Roles y Permisos
- **GET** `/api/roles/permisos`
  - **Controller:** RolesController::obtenerPermisos
  - **Middleware:** AuthMiddleware (permiso USUARIO_CONSULTAR)
  - **Propósito:** Obtener todos los permisos
  - **Response:** Array de permisos

- **GET** `/api/roles`
  - **Controller:** RolesController::obtenerRoles
  - **Middleware:** AuthMiddleware (permiso USUARIO_CONSULTAR)
  - **Propósito:** Obtener todos los roles con permisos
  - **Response:** Array de roles con permisos

- **POST** `/api/roles`
  - **Controller:** RolesController::crearRol
  - **Middleware:** AuthMiddleware (permiso USUARIO_CREAR)
  - **Propósito:** Crear nuevo rol
  - **Request Body:** `{ codigo: string, descripcion: string }`
  - **Response:** 200 si éxito

- **POST** `/api/roles/asignar`
  - **Controller:** RolesController::asignarPermiso
  - **Middleware:** AuthMiddleware (permiso USUARIO_EDITAR)
  - **Propósito:** Asignar permiso a rol
  - **Request Body:** `{ rolId: int, permisoId: int }`
  - **Response:** 200 si éxito

- **POST** `/api/roles/quitar`
  - **Controller:** RolesController::quitarPermiso
  - **Middleware:** AuthMiddleware (permiso USUARIO_EDITAR)
  - **Propósito:** Quitar permiso de rol
  - **Request Body:** `{ rolId: int, permisoId: int }`
  - **Response:** 200 si éxito

#### 5.1.7 Cargue de Datos
- **POST** `/api/fondo/cargue`
  - **Controller:** FondoCargueController::cargue
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Cargar datos masivos desde CSV
  - **Request Body:** FormData (archivo, nombreColumna)
  - **Response:** `{ mensaje: string }` o error
  - **NOTA:** Funcionalidad incompleta (método cargarColumnaFondo no implementado)

#### 5.1.8 Solicitudes
- **GET** `/api/solicitudes/vehiculo/{placa}`
  - **Controller:** SolicitudesController::getByPlaca
  - **Middleware:** AuthMiddleware (permiso VEHICULO_CONSULTAR)
  - **Propósito:** Obtener solicitudes de un vehículo
  - **Response:** Array de solicitudes

- **GET** `/api/solicitudes`
  - **Controller:** SolicitudesController::getAll
  - **Middleware:** AuthMiddleware (permiso VEHICULO_CONSULTAR)
  - **Propósito:** Obtener todas las solicitudes
  - **Response:** Array de solicitudes

- **POST** `/api/solicitudes`
  - **Controller:** SolicitudesController::create
  - **Middleware:** AuthMiddleware (permiso VEHICULO_CONSULTAR)
  - **Propósito:** Crear nueva solicitud
  - **Request Body:** FormData (placa, valorEstimado, nombreCompleto, naturaleza, descripcion, archivo)
  - **Response:** Solicitud creada o error

- **PUT** `/api/solicitudes/{id}/estado`
  - **Controller:** SolicitudesController::updateEstado
  - **Middleware:** AuthMiddleware (permiso VEHICULO_CONSULTAR)
  - **Propósito:** Actualizar estado de solicitud
  - **Request Body:** `{ estado: string }`
  - **Response:** 200 si éxito, 404 si no existe

#### 5.1.9 Archivos Adjuntos
- **GET** `/api/adjuntos/ver`
  - **Controller:** AdjuntosController::ver
  - **Middleware:** AuthMiddleware (requiere autenticación)
  - **Propósito:** Servir archivos adjuntos
  - **Query Params:** ruta (ruta del archivo)
  - **Response:** Archivo binario o error

### 5.2 Frontend - Rutas de React Router

#### 5.2.1 Rutas Públicas
- `/login` → Login.jsx (solo si no autenticado)

#### 5.2.2 Rutas Protegidas (requieren autenticación)
- `/` → Dashboard.jsx
- `/vehiculos` → Vehiculos.jsx (requiere VEHICULO_CONSULTAR)
- `/vehiculos/resumen` → Vehiculos.jsx (requiere VEHICULO_RESUMEN)
- `/usuarios` → Usuarios.jsx (requiere USUARIO_CREAR)
- `/roles` → Roles.jsx (requiere USUARIO_EDITAR)
- `/fondo/cargue` → CargueFondo.jsx (requiere VEHICULO_CONSULTAR)
- `/nueva-solicitud` → NuevaSolicitud.jsx (requiere VEHICULO_CONSULTAR)
- `/solicitudes` → Solicitudes.jsx (requiere VEHICULO_CONSULTAR)

#### 5.2.3 Rutas de Error
- `/unauthorized` → Unauthorized.jsx
- `*` → Redirect a / o /login según autenticación

### 5.3 Puntos de Entrada del Sistema

#### 5.3.1 Backend
- **Archivo:** `api/index.php`
- **Propósito:** Punto de entrada de la API REST
- **Función:** Configura aplicación Slim, define rutas, inicializa middlewares
- **Invocación:** Request HTTP al servidor PHP

#### 5.3.2 Frontend
- **Archivo:** `Frontend/src/main.jsx`
- **Propósito:** Punto de entrada de la aplicación React
- **Función:** Renderiza componente App en el DOM
- **Invocación:** Al cargar la página en el navegador

#### 5.3.3 Configuración
- **Backend:** `api/src/Config.php` (carga variables de entorno)
- **Frontend:** `Frontend/src/api/axios.jsx` (configuración de cliente HTTP)

---

## 6. OBSERVACIONES Y NOTAS DE MANTENIMIENTO

### 6.1 Funcionalidades Incompletas

1. **Cargue Masivo de Datos:**
   - El método `DbProvider::cargarColumnaFondo()` es invocado en `FondoCargueController::cargue()` pero NO está implementado en DbProvider.php
   - Esto hace que la funcionalidad de cargue de CSV no funcione correctamente
   - Se requiere implementar este método para procesar archivos CSV y crear/actualizar columnas dinámicamente

2. **Componentes Vacíos:**
   - `Frontend/src/auth/AuthContext.jsx` - Archivo vacío
   - `Frontend/src/auth/RequiereAuth.jsx` - Archivo vacío
   - `Frontend/src/components/Retiros/FormRetiro.jsx` - Archivo vacío
   - `Frontend/src/components/Retiros/ListaRetiros.jsx` - Archivo vacío
   - Estos archivos no están siendo utilizados en el código actual

### 6.2 Patrones de Diseño Identificados

1. **Backend:**
   - Arquitectura MVC simplificada (Controllers → DbProvider → MySQL)
   - Middleware para autenticación y CORS
   - Servicio centralizado de autenticación (AuthService)
   - Helper para respuestas HTTP (Http class)
   - Inyección de dependencias manual en index.php

2. **Frontend:**
   - Arquitectura de componentes React
   - Custom hooks para lógica reutilizable
   - Services para separar lógica de API
   - Contexto de autenticación (no utilizado actualmente)
   - Rutas protegidas por permisos

### 6.3 Seguridad

1. **Autenticación:**
   - JWT con expiración de 8 horas
   - Contraseñas hasheadas con BCrypt (nuevos usuarios) o HMAC-SHA512 (heredados)
   - Validación de permisos por ruta en backend y frontend

2. **Autorización:**
   - Sistema de roles y permisos granular
   - Middleware de autenticación en todas las rutas protegidas
   - Validación de permisos en frontend (ProtectedRoute)

3. **Archivos:**
   - Validación de rutas para evitar path traversal
   - Límite de tamaño de archivos (10 MB en frontend)
   - Sanitización de nombres de archivos

### 6.4 Configuración Requerida

1. **Backend (.env):**
   - JWT_KEY: Clave para firmar tokens
   - JWT_ISSUER: Emisor del token (default: FondoReposicion)
   - JWT_AUDIENCE: Audiencia del token (default: FondoReposicionUsuarios)
   - DB_HOST: Host de MySQL
   - DB_PORT: Puerto de MySQL (default: 3306)
   - DB_NAME: Nombre de la base de datos
   - DB_USER: Usuario de MySQL
   - DB_PASS: Contraseña de MySQL

2. **Frontend (.env.production):**
   - VITE_API_URL: URL base de la API (default: http://localhost:5092)

### 6.5 Dependencias Críticas

1. **Backend:**
   - slim/slim ^4.14: Framework PHP
   - firebase/php-jwt ^6.10: Generación/validación JWT
   - vlucas/phpdotenv ^5.6: Variables de entorno
   - ext-pdo, ext-pdo_mysql: Conexión a MySQL

2. **Frontend:**
   - react ^19.2.0: Framework UI
   - react-router-dom ^7.12.0: Enrutamiento
   - axios: Cliente HTTP
   - jwt-decode ^4.0.0: Decodificación JWT
   - recharts ^3.7.0: Gráficos
   - tailwindcss ^4.1.18: Estilos

---

## 7. CONCLUSIÓN

El proyecto "Fondo de Reposición Gacela V1 - SideGround" es una aplicación web completa con arquitectura cliente-servidor, implementada con PHP/Slim Framework en el backend y React/Vite en el frontend. El sistema proporciona funcionalidades completas para la gestión del fondo de reposición de vehículos, incluyendo consulta de información, registro de retiros, gestión de usuarios y roles, y radicación de solicitudes.

El código sigue patrones de diseño claros con separación de responsabilidades, aunque se identifican algunas funcionalidades incompletas (principalmente el cargue masivo de datos) que requieren atención para el correcto funcionamiento del sistema.

La documentación proporcionada debe servir como referencia completa para el mantenimiento, extensión y comprensión del sistema por parte de desarrolladores futuros.
