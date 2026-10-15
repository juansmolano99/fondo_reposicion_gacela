# Flujos de Ejecución - Fondo de Reposicion Gacela

## 1. Flujo de Inicio de la Aplicación

### Frontend
1. `main.jsx` → Aplica dark mode desde localStorage
2. `main.jsx` → ReactDOM.createRoot() en elemento 'root'
3. `App.jsx` → Verifica token en localStorage con `isAuthenticated()`
4. `App.jsx` → Configura estado `isAuth`
5. `App.jsx` → Configura rutas con React Router

### Backend
1. `index.php` → `Config::load()` carga .env
2. `index.php` → Crea aplicación Slim
3. `index.php` → Configura middlewares (CORS, body parsing, routing)
4. `index.php` → Crea DbProvider, AuthService, Controllers
5. `index.php` → Registra rutas API
6. `index.php` → `$app->run()`

---

## 2. Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en Login.jsx
2. Frontend → `authService.login(usuario, password)`
3. Frontend → `POST /api/auth/login`
4. Backend → `AuthController.login()`
5. Backend → `AuthService.login()`
6. Backend → `DbProvider.obtenerUsuarioPorNombre()`
7. Backend → `PasswordHasher.verificar()`
8. Backend → `DbProvider.obtenerPermisosPorUsuario()`
9. Backend → `JwtHelper.generateToken()`
10. Backend → Retorna {token, nombreCompleto, usuario, rol}
11. Frontend → Almacena en localStorage
12. Frontend → Redirige a Dashboard

### Validación en Rutas Protegidas
1. Usuario navega a ruta protegida
2. Frontend → `ProtectedRoute` verifica token
3. Frontend → `auth.js.getUserPermissions()` decodifica JWT
4. Frontend → Verifica permiso requerido
5. Si falta: Redirige a /unauthorized
6. Si token falta: Redirige a /login

### Validación en Backend (Middleware)
1. Request llega con header `Authorization: Bearer ...`
2. `AuthMiddleware` → Extrae token
3. `AuthMiddleware` → `JwtHelper.decode()`
4. `AuthMiddleware` → Verifica firma y expiración
5. `AuthMiddleware` → Verifica permiso si está configurado
6. Si válido: Agrega atributos al request y continúa
7. Si inválido: Retorna 401 o 403

---

## 3. Flujo de Consulta de Vehículo

1. Usuario ingresa placa en Vehiculos.jsx
2. Frontend → Formatea placa (XXX-000)
3. Frontend → `GET /api/vehiculos/{placa}`
4. Backend → `AuthMiddleware` verifica VEHICULO_CONSULTAR
5. Backend → `VehiculosController.obtenerPorPlaca()`
6. Backend → `DbProvider.obtenerVehiculoPorPlaca()`
7. Backend → `DbProvider` calcula totales anuales
8. Backend → Retorna vehículo + totales
9. Frontend → Muestra información

---

## 4. Flujo de Registro de Retiro

1. Usuario accede a pestaña Retiros
2. Frontend → Carga saldo: `GET /api/retiros/saldo/{placa}`
3. Backend → Calcula: suma aportes - suma retiros
4. Frontend → Carga historial: `GET /api/retiros/{placa}`
5. Usuario ingresa monto, observación, archivo (opcional)
6. Frontend → `POST /api/retiros` o `/api/retiros/with-file`
7. Backend → Valida monto > 0
8. Backend → Valida saldo suficiente
9. Backend → Si hay archivo: `FileStorage.saveAdjunto()`
10. Backend → `DbProvider.crearRetiro()`
11. Backend → Inserta en fondo_repo_retiros_produc
12. Frontend → Actualiza vista con nuevo saldo

---

## 5. Flujo de Cargue Masivo

1. Usuario descarga plantilla CSV
2. Usuario sube archivo CSV
3. Frontend → `POST /api/fondo/cargue`
4. Backend → Parsea CSV
5. Backend → Valida columnas (placa, anio, mes, valor)
6. Backend → Valida datos por línea
7. Backend → Busca placas en BD
8. Si faltan placas: Retorna error especial 'requires_vehicles'
9. Frontend → Muestra formulario para registrar vehículos
10. Usuario completa datos de vehículos
11. Frontend → `POST /api/fondo/cargue-completo`
12. Backend → Inicia transacción
13. Backend → Crea vehículos faltantes
14. Backend → Crea movimientos
15. Backend → Commit transacción
16. Frontend → Muestra resultados

---

## 6. Puntos de Fallo Posibles

| Flujo | Punto de Fallo | Consecuencia |
|-------|----------------|--------------|
| Inicio | .env no existe | Error fatal en Config.php |
| Login | Usuario no encontrado | Error 401 |
| Login | Contraseña incorrecta | Error 401 |
| Login | Usuario inactivo | Error 401 |
| Autenticación | Token expirado (8h) | Redirección a login |
| Consulta vehículo | Placa no existe | Error 404 |
| Retiro | Saldo insuficiente | Error 400 |
| Retiro | Error al guardar archivo | Error 500 |
| Cargue masivo | CSV inválido | Error 400 |
| Cargue masivo | Datos inválidos | Error 400 |
| Cargue masivo | Error en transacción | Rollback completo |
