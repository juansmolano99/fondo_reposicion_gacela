# Documentación Funcional - Fondo de Reposicion Gacela

## 1. Módulos Funcionales

### Tabla de Módulos

| Módulo | Página Frontend | Controlador Backend | Endpoints API | Tablas BD | Funcionalidad Principal | Permisos Requeridos |
|--------|----------------|---------------------|---------------|-----------|------------------------|---------------------|
| **1. Login/Authentication** | `Frontend/src/pages/Login.jsx` | `AuthController.php` | `POST /api/auth/login` | `usuarios` | Autenticación de usuarios mediante usuario/contraseña. Genera token JWT y almacena datos de sesión en localStorage. | Ninguno (público) |
| **2. Dashboard** | `Frontend/src/pages/Dashboard.jsx` | `DashboardController.php` | `GET /api/dashboard`, `GET /api/dashboard/resumen` | `fondo_repo_movimientos`, `fondo_repo_retiros_produc`, `usuarios` | Vista general del sistema con KPIs: total reposición, total retiros, presupuesto utilizado. Modo general (toda la flota) y modo por placa. Gráfico de flujo mensual. Filtro por año. | Autenticación (`$auth`) |
| **3. Consulta de Vehículos** | `Frontend/src/pages/Vehiculos.jsx` | `VehiculosController.php` | `GET /api/vehiculos/{placa}`, `GET /api/vehiculos/{placa}/resumen`, `GET /api/vehiculos/{placa}/fondos`, `GET /api/vehiculos/empresas` | `vehiculos`, `fondo_repo_movimientos` | Búsqueda de vehículos por placa. Muestra información general (modelo, carrocería, propietario, empresa). Vistas: Consulta, Resumen, Detalle anual, Retiros, Solicitudes. Totales por año (2023-2026). | `VEHICULO_CONSULTAR`, `VEHICULO_RESUMEN`, `VEHICULO_DETALLE` |
| **4. Retiros del Fondo** | `Frontend/src/components/Retiros/VehiculoRetiros.jsx` | `RetirosController.php` | `GET /api/retiros/saldo/{placa}`, `GET /api/retiros/{placa}`, `POST /api/retiros`, `POST /api/retiros/with-file` | `fondo_repo_retiros_produc`, `vehiculos`, `fondo_repo_movimientos` | Gestión de retiros del fondo por vehículo. Muestra saldo disponible. Permite registrar retiros con monto, observación y archivo adjunto. Historial de retiros con fecha, monto, usuario y adjunto. | Autenticación (`$auth`) |
| **5. Solicitudes de Reposición** | `Frontend/src/pages/Solicitudes.jsx`, `Frontend/src/pages/NuevaSolicitud.jsx` | `SolicitudesController.php` | `GET /api/solicitudes`, `GET /api/solicitudes/vehiculo/{placa}`, `POST /api/solicitudes`, `PUT /api/solicitudes/{id}/estado` | `fondo_repo_solicitudes_produc`, `vehiculos` | Radicación de solicitudes de reposición con valor estimado, solicitante, naturaleza (propietario/apoderado/administrador), descripción y archivo adjunto. Lista de solicitudes con estados: Radicado, En Revisión, Pdte Documentación, Aprobado, Rechazado. Cambio de estado de solicitudes. | `VEHICULO_CONSULTAR` |
| **6. Documentación** | `Frontend/src/pages/Documentacion.jsx`, `Frontend/src/components/Solicitudes/NuevaDocumentacion.jsx` | `DocumentacionController.php` | `GET /api/solicitudes/{id}/documentacion`, `POST /api/documentacion` | `fondo_repo_documentacion`, `fondo_repo_solicitudes_produc` | Gestión de documentos de soporte para solicitudes. Permite adjuntar PDF/imagenes con tipo de documento, observaciones y estado asociado. Listado de documentos por solicitud. | Autenticación (`$auth`) |
| **7. Usuarios** | `Frontend/src/pages/Usuarios.jsx` | `UsuariosController.php` | `GET /api/usuarios`, `POST /api/usuarios`, `PUT /api/usuarios/{id}`, `PUT /api/usuarios/{id}/estado`, `PUT /api/usuarios/{id}/password`, `DELETE /api/usuarios/{id}`, `GET /api/usuarios/roles` | `usuarios`, `roles` | CRUD completo de usuarios. Crear, editar, eliminar, activar/inactivar usuarios. Restablecer contraseña. Asignación de roles. Paginación y búsqueda. KPIs: total usuarios, usuarios activos, roles definidos. | `USUARIO_CONSULTAR`, `USUARIO_CREAR`, `USUARIO_EDITAR` |
| **8. Roles y Permisos** | `Frontend/src/pages/Roles.jsx` | `RolesController.php` | `GET /api/roles`, `GET /api/roles/permisos`, `POST /api/roles/asignar`, `POST /api/roles/quitar` | `roles`, `permisos`, `rol_permisos` | Gestión granular de permisos por rol. Lista de roles con sus permisos asignados. Toggle para asignar/quitar permisos a roles. Permisos basados en códigos técnicos. | `USUARIO_CONSULTAR`, `USUARIO_EDITAR` |
| **9. Cargue Masivo de Datos** | `Frontend/src/pages/CargueFondo.jsx` | `FondoCargueController.php` | `POST /api/fondo/cargue`, `POST /api/fondo/cargue-completo` | `vehiculos`, `fondo_repo_movimientos` | Carga masiva de movimientos del fondo mediante CSV. Si detecta placas no registradas, permite registrar los vehículos faltantes antes de procesar el cargue. Validación de formato CSV (placa, año, mes, valor). | Autenticación (`$auth`) |
| **10. Adjuntos/Archivos** | Componentes reutilizables | `AdjuntosController.php` | `GET /api/adjuntos/ver` | Sistema de archivos (uploads/) | Visualización de archivos adjuntos (PDF, imágenes) almacenados en el servidor. Usado por solicitudes, retiros y documentación. | Autenticación (`$auth`) |
| **11. Unauthorized** | `Frontend/src/pages/Unauthorized.jsx` | N/A | N/A | N/A | Página de error para acceso denegado cuando el usuario no tiene permisos. | N/A |

---

## 2. Permisos del Sistema

### Tabla de Permisos

| Código Permiso | Descripción | Usado en |
|----------------|-------------|-----------|
| `USUARIO_CONSULTAR` | Consultar usuarios y roles | GET /api/usuarios, GET /api/roles, GET /api/roles/permisos |
| `USUARIO_CREAR` | Crear usuarios | POST /api/usuarios, POST /api/roles |
| `USUARIO_EDITAR` | Editar usuarios y asignar permisos | PUT /api/usuarios/{id}, PUT /api/usuarios/{id}/estado, PUT /api/usuarios/{id}/password, DELETE /api/usuarios/{id}, POST /api/roles/asignar, POST /api/roles/quitar |
| `VEHICULO_CONSULTAR` | Consultar vehículos y solicitudes | GET /api/vehiculos/{placa}, GET /api/solicitudes, GET /api/solicitudes/vehiculo/{placa}, POST /api/solicitudes, PUT /api/solicitudes/{id}/estado |
| `VEHICULO_RESUMEN` | Ver resumen de vehículo | GET /api/vehiculos/{placa}/resumen |
| `VEHICULO_DETALLE` | Ver detalle mensual de fondos | GET /api/vehiculos/{placa}/fondos |

---

## 3. Tablas de Base de Datos Identificadas

| Tabla | Propósito |
|-------|-----------|
| `usuarios` | Usuarios del sistema con credenciales y roles |
| `roles` | Roles definidos en el sistema |
| `permisos` | Permisos granulares del sistema |
| `rol_permisos` | Relación muchos a muchos entre roles y permisos |
| `vehiculos` | Catálogo de vehículos (placa, modelo, carrocería, propietario, empresa) |
| `fondo_repo_movimientos` | Movimientos de aporte al fondo (por vehículo, año, mes) |
| `fondo_repo_retiros_produc` | Retiros del fondo (placa, monto, fecha, observación, adjunto) |
| `fondo_repo_solicitudes_produc` | Solicitudes de reposición (placa, valor estimado, estado, adjunto) |
| `fondo_repo_documentacion` | Documentos de soporte vinculados a solicitudes |

---

## 4. Estados de Solicitudes

### Flujo de Estados

1. **Radicado** - Estado inicial al crear la solicitud
2. **En Revisión** - En proceso de revisión por administrador
3. **Pdte Documentación** - Requiere documentación adicional
4. **Aprobado** - Solicitud aprobada
5. **Rechazado** - Solicitud rechazada

**Transiciones permitidas:**
- Radicado → En Revisión
- En Revisión → Pdte Documentación
- En Revisión → Aprobado
- En Revisión → Rechazado
- Pdte Documentación → En Revisión
- Pdte Documentación → Aprobado
- Pdte Documentación → Rechazado

---

## 5. Naturaleza de Solicitudes

Tipos de naturaleza permitidos:
- **Propietario** - Solicitante es el propietario del vehículo
- **Apoderado** - Solicitante es apoderado del propietario
- **Administrador** - Solicitante es administrador de la empresa

---

## 6. Tipos de Documentos

Los tipos de documentos no están enumerados en código, son valores de texto libre en `tipo_documento` de la tabla `fondo_repo_documentacion`.

---

## 7. Cálculos de Saldo

### Fórmula de Saldo Disponible

```
Saldo Disponible = Total Aportes - Total Retiros
```

**Implementación en DbProvider.php:**
```php
SELECT 
    (SELECT COALESCE(SUM(valor), 0) FROM fondo_repo_movimientos WHERE placa = :placa) 
    - 
    (SELECT COALESCE(SUM(monto), 0) FROM fondo_repo_retiros_produc WHERE placa = :placa AND activo = 1)
AS saldo
```

---

## 8. Formatos de Archivos Permitidos

**Extensiones permitidas en FileStorage.php:**
- pdf → application/pdf
- png → image/png
- jpg, jpeg → image/jpeg
- txt → text/plain
- Otros → application/octet-stream

**NOTA:** Validación solo por extensión, no por magic bytes (riesgo de seguridad identificado).
