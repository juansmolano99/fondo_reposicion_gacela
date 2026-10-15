# Matriz de Trazabilidad - Fondo de Reposicion Gacela

## 1. Requisitos Funcionales → Interfaces

| Requisito | Página Frontend | Endpoints API | Estado |
|-----------|----------------|---------------|--------|
| RF-001: Autenticación | Login.jsx | POST /api/auth/login | ✅ Implementado |
| RF-002: Consulta de Vehículos | Vehiculos.jsx | GET /api/vehiculos/{placa}, GET /api/vehiculos/{placa}/resumen, GET /api/vehiculos/{placa}/fondos | ✅ Implementado |
| RF-003: Dashboard General | Dashboard.jsx | GET /api/dashboard, GET /api/dashboard/resumen | ✅ Implementado |
| RF-004: Registro de Retiros | VehiculoRetiros.jsx | GET /api/retiros/saldo/{placa}, GET /api/retiros/{placa}, POST /api/retiros, POST /api/retiros/with-file | ✅ Implementado |
| RF-005: Solicitudes de Reposición | Solicitudes.jsx, NuevaSolicitud.jsx | GET /api/solicitudes, GET /api/solicitudes/vehiculo/{placa}, POST /api/solicitudes, PUT /api/solicitudes/{id}/estado | ✅ Implementado |
| RF-006: Gestión de Usuarios | Usuarios.jsx | GET /api/usuarios, POST /api/usuarios, PUT /api/usuarios/{id}, PUT /api/usuarios/{id}/estado, PUT /api/usuarios/{id}/password, DELETE /api/usuarios/{id} | ⚠️ Implementado con bug |
| RF-007: Gestión de Roles y Permisos | Roles.jsx | GET /api/roles, GET /api/roles/permisos, POST /api/roles/asignar, POST /api/roles/quitar | ✅ Implementado |
| RF-008: Cargue Masivo de Datos | CargueFondo.jsx | POST /api/fondo/cargue, POST /api/fondo/cargue-completo | ✅ Implementado |
| RF-009: Gestión de Documentación | Documentacion.jsx, NuevaDocumentacion.jsx | GET /api/solicitudes/{id}/documentacion, POST /api/documentacion | ✅ Implementado |

---

## 2. Requisitos Funcionales → Lógica Backend

| Requisito | Controlador | Servicio | Método DbProvider | Estado |
|-----------|-------------|----------|-------------------|--------|
| RF-001: Autenticación | AuthController | AuthService | obtenerUsuarioPorNombre(), obtenerPermisosPorUsuario() | ✅ Implementado |
| RF-002: Consulta de Vehículos | VehiculosController | - | obtenerVehiculoPorPlaca(), obtenerFondosMensuales() | ✅ Implementado |
| RF-003: Dashboard General | DashboardController | - | obtenerDashboardMetricas() | ✅ Implementado |
| RF-004: Registro de Retiros | RetirosController | - | obtenerSaldoDisponible(), crearRetiro() | ✅ Implementado |
| RF-005: Solicitudes de Reposición | SolicitudesController | - | crearSolicitud(), obtenerSolicitudesPorVehiculo() | ✅ Implementado |
| RF-006: Gestión de Usuarios | UsuariosController | PasswordHasher | crearUsuario(), editarUsuario(), restablecerPassword() | ⚠️ BUG en restablecerPassword |
| RF-007: Gestión de Roles y Permisos | RolesController | - | obtenerRoles(), obtenerPermisos(), asignarPermiso(), quitarPermiso() | ✅ Implementado |
| RF-008: Cargue Masivo de Datos | FondoCargueController | - | obtenerVehiculosPorPlacas(), crearVehiculosPorLote(), crearMovimientosPorLote() | ✅ Implementado |
| RF-009: Gestión de Documentación | DocumentacionController | FileStorage | obtenerDocumentacionPorSolicitud(), crearDocumentacion() | ✅ Implementado |

---

## 3. Requisitos Funcionales → Persistencia

| Requisito | Tablas BD | Operaciones SQL | Estado |
|-----------|-----------|----------------|--------|
| RF-001: Autenticación | usuarios, roles, permisos, rol_permisos | SELECT usuarios, JOIN roles, permisos | ✅ Implementado |
| RF-002: Consulta de Vehículos | vehiculos, fondo_repo_movimientos | SELECT vehiculos, SELECT SUM(valor) GROUP BY YEAR | ✅ Implementado |
| RF-003: Dashboard General | fondo_repo_movimientos, fondo_repo_retiros_produc, usuarios | SELECT SUM() agregados | ✅ Implementado |
| RF-004: Registro de Retiros | fondo_repo_retiros_produc, fondo_repo_movimientos, vehiculos | SELECT saldo, INSERT retiros | ✅ Implementado |
| RF-005: Solicitudes de Reposición | fondo_repo_solicitudes_produc, vehiculos | SELECT vehiculos, INSERT solicitudes | ✅ Implementado |
| RF-006: Gestión de Usuarios | usuarios, roles | SELECT, INSERT, UPDATE usuarios | ⚠️ BUG en UPDATE password |
| RF-007: Gestión de Roles y Permisos | roles, permisos, rol_permisos | SELECT roles, permisos, INSERT/DELETE rol_permisos | ✅ Implementado |
| RF-008: Cargue Masivo de Datos | vehiculos, fondo_repo_movimientos | SELECT placas, INSERT vehiculos, INSERT movimientos (en transacción) | ✅ Implementado |
| RF-009: Gestión de Documentación | fondo_repo_documentacion, fondo_repo_solicitudes_produc | SELECT documentacion, INSERT documentacion | ✅ Implementado |

---

## 4. Requisitos No Funcionales → Implementación

| Requisito No Funcional | Implementación | Estado |
|------------------------|----------------|--------|
| RNF-001: Seguridad - Autenticación JWT | JwtHelper.php con HS256, 8 horas | ✅ Implementado |
| RNF-002: Seguridad - Autorización RBAC | AuthMiddleware.php con permisos granulares | ✅ Implementado |
| RNF-003: Seguridad - CORS | CorsMiddleware.php con Access-Control-Allow-Origin: * | 🔴 CRÍTICO - Permitir origen * |
| RNF-004: Integridad de Datos | Transacciones solo en cargue completo | ⚠️ Parcial - Falta en retiros |
| RNF-005: Mantenibilidad | Separación por capas, inyección de dependencias | ✅ Implementado |
| RNF-006: Compatibilidad | React 19 para navegadores modernos | ✅ Implementado |
| RNF-007: Observabilidad | error_log() básico en algunos archivos | ⚠️ Básico - Falta logging centralizado |
| RNF-008: Recuperación ante Fallos | ❌ No implementado | ❌ Pendiente |

---

## 5. Permisos → Endpoints

| Permiso | Endpoints que lo requieren | Estado |
|---------|---------------------------|--------|
| USUARIO_CONSULTAR | GET /api/usuarios, GET /api/roles, GET /api/roles/permisos | ✅ Implementado |
| USUARIO_CREAR | POST /api/usuarios, POST /api/roles | ✅ Implementado |
| USUARIO_EDITAR | PUT /api/usuarios/{id}, PUT /api/usuarios/{id}/estado, PUT /api/usuarios/{id}/password, DELETE /api/usuarios/{id}, POST /api/roles/asignar, POST /api/roles/quitar | ✅ Implementado |
| VEHICULO_CONSULTAR | GET /api/vehiculos/{placa}, GET /api/solicitudes, GET /api/solicitudes/vehiculo/{placa}, POST /api/solicitudes, PUT /api/solicitudes/{id}/estado | ✅ Implementado |
| VEHICULO_RESUMEN | GET /api/vehiculos/{placa}/resumen | ✅ Implementado |
| VEHICULO_DETALLE | GET /api/vehiculos/{placa}/fondos | ✅ Implementado |
| (Sin permiso específico) | GET /api/dashboard, POST /api/retiros, POST /api/fondo/cargue | ⚠️ Solo autenticación |

---

## 6. Tablas BD → Endpoints

| Tabla | Endpoints que la usan | Operaciones |
|-------|----------------------|-------------|
| usuarios | POST /api/auth/login, GET /api/usuarios, POST /api/usuarios, PUT /api/usuarios/{id}, PUT /api/usuarios/{id}/estado, PUT /api/usuarios/{id}/password, DELETE /api/usuarios/{id} | SELECT, INSERT, UPDATE |
| roles | GET /api/usuarios/roles, GET /api/roles, POST /api/roles, POST /api/roles/asignar, POST /api/roles/quitar | SELECT, INSERT |
| permisos | GET /api/roles/permisos | SELECT |
| rol_permisos | POST /api/roles/asignar, POST /api/roles/quitar | INSERT, DELETE |
| vehiculos | GET /api/vehiculos/{placa}, GET /api/vehiculos/empresas, POST /api/fondo/cargue-completo | SELECT, INSERT |
| fondo_repo_movimientos | GET /api/dashboard, GET /api/vehiculos/{placa}/resumen, GET /api/vehiculos/{placa}/fondos, POST /api/fondo/cargue-completo | SELECT, INSERT |
| fondo_repo_retiros_produc | GET /api/dashboard, GET /api/retiros/saldo/{placa}, GET /api/retiros/{placa}, POST /api/retiros | SELECT, INSERT |
| fondo_repo_solicitudes_produc | GET /api/solicitudes, GET /api/solicitudes/vehiculo/{placa}, POST /api/solicitudes, PUT /api/solicitudes/{id}/estado, GET /api/solicitudes/{id}/documentacion | SELECT, INSERT, UPDATE |
| fondo_repo_documentacion | GET /api/solicitudes/{id}/documentacion, POST /api/documentacion | SELECT, INSERT |

---

## 7. Componentes Frontend → Servicios

| Componente | Servicio que usa | Método |
|------------|------------------|--------|
| Login.jsx | authService.js | login() |
| Dashboard.jsx | dashboardService.js | getDashboardResumen(), getVehiculoResumen(), getVehiculoFondosMensuales(), getRetirosPorPlaca() |
| Vehiculos.jsx | vehiculosService.js | obtenerVehiculoPorPlaca(), obtenerEmpresas() |
| Usuarios.jsx | usuariosService.js | obtenerUsuarios(), obtenerRoles(), crearUsuario(), editarUsuario(), cambiarEstadoUsuario(), restablecerPasswordUsuario(), eliminarUsuario() |
| Roles.jsx | rolesService.js | obtenerRoles(), obtenerPermisos(), asignarPermiso(), quitarPermiso() |
| CargueFondo.jsx | vehiculosService.js | obtenerEmpresas(), cargueFondo(), cargueFondoCompleto() |
| Solicitudes.jsx | solicitudesService.js | obtenerSolicitudes(), obtenerSolicitudesPorVehiculo(), crearSolicitud(), cambiarEstadoSolicitud() |
| VehiculoRetiros.jsx | retiroService.js | obtenerSaldoDisponible(), obtenerRetirosPorPlaca(), crearRetiro(), crearRetiroConAdjunto() |
| ProtectedRoute.jsx | auth.js | getUserPermissions() |

---

## 8. Notas de Trazabilidad

### Cobertura de Requisitos

- **Requisitos funcionales**: 9/9 implementados (100%)
- **Requisitos no funcionales**: 7/8 implementados (87.5%)
- **Requisitos de infraestructura**: 9/9 documentados (100%)

### Problemas Identificados

1. **RF-006 (Gestión de Usuarios)**: Implementado con bug crítico en restablecimiento de contraseña
2. **RNF-003 (CORS)**: Implementado incorrectamente (origen *)
3. **RNF-004 (Integridad)**: Parcialmente implementado (solo cargue completo con transacciones)
4. **RNF-008 (Recuperación)**: No implementado (sin backups)

### Gaps de Permisos

Operaciones financieras (retiros, cargue) no requieren permisos específicos, solo autenticación. Esto representa un gap en el modelo de autorización.
