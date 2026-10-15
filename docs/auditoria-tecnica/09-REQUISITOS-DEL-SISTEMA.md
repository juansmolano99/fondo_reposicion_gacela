# Requisitos del Sistema - Fondo de Reposición Gacela

## 1. Requisitos Funcionales

### RF-001: Autenticación de Usuarios

**Nombre**: Inicio de sesión en el sistema  
**Descripción**: Permitir a los usuarios autenticarse en el sistema mediante usuario y contraseña  
**Actor**: Usuario del sistema  
**Condiciones previas**: Usuario registrado en base de datos con credenciales válidas  
**Flujo principal**:
1. Usuario ingresa usuario y contraseña en formulario de Login
2. Frontend valida campos no vacíos
3. Frontenv envía POST /api/auth/login
4. Backend valida credenciales contra tabla usuarios
5. Backend genera token JWT con usuario, rol y permisos
6. Frontend almacena token en localStorage
7. Sistema redirige al Dashboard

**Resultado esperado**: Usuario autenticado con acceso al sistema  
**Validaciones**:
- Usuario y contraseña obligatorios
- Usuario debe existir en base de datos
- Usuario debe estar activo (activo = 1)
- Contraseña debe coincidir con hash almacenado

**Excepciones**:
- Usuario no encontrado: Error 401
- Contraseña incorrecta: Error 401
- Usuario inactivo: Error 401
- Token expirado: Redirección a login

**Módulo involucrado**: Login, Authentication  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\Login.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\AuthController.php" />

---

### RF-002: Consulta de Vehículos

**Nombre**: Consulta de información de vehículos por placa  
**Descripción**: Permitir consultar información detallada de un vehículo mediante su placa  
**Actor**: Usuario con permiso VEHICULO_CONSULTAR  
**Condiciones previas**: Usuario autenticado con permiso VEHICULO_CONSULTAR  
**Flujo principal**:
1. Usuario ingresa placa en formato AAA-123
2. Frontend formatea placa automáticamente
3. Usuario hace clic en "Buscar"
4. Frontend envía GET /api/vehiculos/{placa}
5. Backend consulta tabla vehiculos
6. Backend calcula totales anuales desde fondo_repo_movimientos
7. Sistema muestra información del vehículo y totales por año

**Resultado esperado**: Información completa del vehículo con totales de aportes por año  
**Validaciones**:
- Placa en formato válido (AAA-123)
- Placa debe existir en base de datos
- Usuario debe tener permiso VEHICULO_CONSULTAR

**Excepciones**:
- Placa no encontrada: Error 404
- Formato inválido: Error de validación en frontend
- Sin permisos: Error 403

**Módulo involucrado**: Vehículos  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\Vehiculos.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\VehiculosController.php" />

---

### RF-003: Dashboard General

**Nombre**: Visualización de métricas del fondo de reposición  
**Descripción**: Mostrar KPIs generales del sistema: total aportado, total retirado, saldo disponible, flujo mensual  
**Actor**: Usuario autenticado  
**Condiciones previas**: Usuario autenticado  
**Flujo principal**:
1. Usuario accede a Dashboard
2. Frontend carga datos de GET /api/dashboard?anio=X
3. Backend calcula métricas agregadas
4. Sistema muestra KPIs y gráfico de flujo mensual
5. Usuario puede filtrar por año o por placa específica

**Resultado esperado**: Vista consolidada del estado del fondo  
**Validaciones**:
- Usuario autenticado requerido
- Año válido (2000-2100) si se especifica

**Excepciones**:
- Token inválido: Error 401
- Error en cálculo: Error 500 con detalles

**Módulo involucrado**: Dashboard  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\Dashboard.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\DashboardController.php" />

---

### RF-004: Registro de Retiros

**Nombre**: Registro de retiros del fondo de reposición  
**Descripción**: Permitir registrar retiros de dinero del fondo por vehículo, con opción de adjuntar documento soporte  
**Actor**: Usuario autenticado  
**Condiciones previas**: Usuario autenticado, vehículo con saldo suficiente  
**Flujo principal**:
1. Usuario accede a pestaña "Retiros" de un vehículo
2. Sistema muestra saldo disponible
3. Usuario ingresa monto y observación
4. Usuario puede adjuntar archivo (opcional)
5. Frontend envía POST /api/retiros o /api/retiros/with-file
6. Backend valida saldo suficiente
7. Backend inserta registro en fondo_repo_retiros_produc
8. Si hay archivo, se guarda en uploads/adjuntos/
9. Sistema actualiza vista con nuevo saldo

**Resultado esperado**: Retiro registrado con saldo actualizado  
**Validaciones**:
- Monto > 0
- Monto <= saldo disponible
- Placa no vacía
- Archivo opcional (si se incluye, debe ser válido)

**Excepciones**:
- Saldo insuficiente: Error 400
- Monto inválido: Error 400
- Error al guardar archivo: Error 500

**Módulo involucrado**: Retiros  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\components\Retiros\VehiculoRetiros.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\RetirosController.php" />

---

### RF-005: Solicitudes de Reposición

**Nombre**: Radicación de solicitudes de reposición  
**Descripción**: Permitir radicar solicitudes de reposición con valor estimado, solicitante y documento soporte  
**Actor**: Usuario con permiso VEHICULO_CONSULTAR  
**Condiciones previas**: Usuario autenticado con permiso VEHICULO_CONSULTAR, vehículo registrado  
**Flujo principal**:
1. Usuario accede a página Solicitudes
2. Usuario crea nueva solicitud
3. Usuario ingresa placa, valor estimado, naturaleza, descripción
4. Usuario adjunta archivo (opcional)
5. Frontend envía POST /api/solicitudes
6. Backend valida placa existe
7. Backend inserta en fondo_repo_solicitudes_produc con estado "Radicado"
8. Sistema muestra lista de solicitudes con estados

**Resultado esperado**: Solicitud radicada con estado inicial  
**Validaciones**:
- Placa debe existir en base de datos
- Valor estimado > 0
- Naturaleza debe ser válida (propietario/apoderado/administrador)
- Campos obligatorios completos

**Excepciones**:
- Placa no encontrada: Error 400
- Datos inválidos: Error 400

**Módulo involucrado**: Solicitudes  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\Solicitudes.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\SolicitudesController.php" />

---

### RF-006: Gestión de Usuarios

**Nombre**: CRUD completo de usuarios del sistema  
**Descripción**: Permitir crear, editar, eliminar, activar/inactivar usuarios y restablecer contraseñas  
**Actor**: Usuario con permisos USUARIO_CREAR, USUARIO_EDITAR  
**Condiciones previas**: Usuario autenticado con permisos correspondientes  
**Flujo principal**:
1. Usuario con permiso accede a página Usuarios
2. Sistema lista todos los usuarios
3. Para crear: Usuario ingresa datos, contraseña y rol
4. Para editar: Usuario modifica datos excepto contraseña
5. Para activar/inactivar: Usuario toggle estado
6. Para restablecer contraseña: Usuario genera nueva contraseña
7. Para eliminar: Usuario inhabilita (soft delete)

**Resultado esperado**: Usuarios gestionados correctamente  
**Validaciones**:
- Usuario único (no se valida explícitamente)
- Contraseña obligatoria al crear
- Rol válido asignado
- Campos obligatorios completos

**Excepciones**:
- Sin permisos: Error 403
- Datos inválidos: Error 400
- BUG: Restablecimiento de contraseña roto (método inexistente)

**Módulo involucrado**: Usuarios  
**Estado de implementación**: ⚠️ Implementado con bug crítico en restablecimiento de contraseña  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\Usuarios.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\UsuariosController.php" />

---

### RF-007: Gestión de Roles y Permisos

**Nombre**: Asignación de permisos a roles  
**Descripción**: Permitir crear roles y asignar/quitar permisos granulares  
**Actor**: Usuario con permisos USUARIO_EDITAR  
**Condiciones previas**: Usuario autenticado con permiso USUARIO_EDITAR  
**Flujo principal**:
1. Usuario accede a página Roles
2. Sistema lista roles y permisos disponibles
3. Usuario selecciona un rol
4. Sistema muestra permisos con toggles
5. Usuario activa/desactiva permisos
6. Sistema actualiza tabla rol_permisos

**Resultado esperado**: Permisos asignados correctamente  
**Validaciones**:
- Rol válido seleccionado
- Permiso válido existe

**Excepciones**:
- Sin permisos: Error 403

**Módulo involucrado**: Roles  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\Roles.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\RolesController.php" />

---

### RF-008: Cargue Masivo de Datos

**Nombre**: Carga masiva de movimientos del fondo mediante CSV  
**Descripción**: Permitir cargar movimientos de aporte al fondo desde archivo CSV, creando vehículos si es necesario  
**Actor**: Usuario autenticado  
**Condiciones previas**: Usuario autenticado, archivo CSV válido  
**Flujo principal**:
1. Usuario descarga plantilla CSV
2. Usuario sube archivo CSV
3. Backend valida formato (placa, anio, mes, valor)
4. Backend verifica placas existentes
5. Si faltan placas: Sistema solicita datos de vehículos
6. Usuario completa datos de vehículos faltantes
7. Backend crea vehículos y movimientos en transacción
8. Sistema reporte resultados

**Resultado esperado**: Movimientos cargados correctamente  
**Validaciones**:
- CSV con columnas requeridas
- Año entre 2000-2100
- Mes entre 1-12
- Valor > 0
- Placa no vacía

**Excepciones**:
- Formato CSV inválido: Error 400
- Datos inválidos: Error 400
- Error en transacción: Rollback completo

**Módulo involucrado**: Cargue Fondo  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\pages\CargueFondo.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\FondoCargueController.php" />

---

### RF-009: Gestión de Documentación

**Nombre**: Adjuntar documentos a solicitudes  
**Descripción**: Permitir adjuntar documentos de soporte a las solicitudes de reposición  
**Actor**: Usuario autenticado  
**Condiciones previas**: Usuario autenticado, solicitud existente  
**Flujo principal**:
1. Usuario accede a documentos de una solicitud
2. Sistema lista documentos existentes
3. Usuario sube nuevo documento
4. Backend guarda archivo en uploads/adjuntos/documentacion/
5. Backend inserta registro en fondo_repo_documentacion
6. Sistema actualiza lista

**Resultado esperado**: Documento adjuntado correctamente  
**Validaciones**:
- Archivo válido
- Solicitud existe

**Excepciones**:
- Error al guardar archivo: Error 500

**Módulo involucrado**: Documentación  
**Estado de implementación**: ✅ Implementado y comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\components\Solicitudes\NuevaDocumentacion.jsx" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\DocumentacionController.php" />

---

## 2. Requisitos No Funcionales

### RNF-001: Seguridad - Autenticación JWT

**Descripción**: El sistema debe utilizar tokens JWT para autenticación  
**Estado**: ✅ Implementado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\JwtHelper.php" lines="15-33" />  
**Observaciones**: Token expira en 8 horas, algoritmo HS256  
**Riesgo**: Duración de 8 horas puede ser muy larga para aplicaciones sensibles

---

### RNF-002: Seguridad - Autorización RBAC

**Descripción**: El sistema debe implementar control de acceso basado en roles (RBAC)  
**Estado**: ✅ Implementado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Middleware\AuthMiddleware.php" />  
**Observaciones**: Permisos granulares por endpoint, middleware implementa validación  
**Riesgo**: Operaciones financieras (retiros, cargue) solo requieren autenticación, no permisos específicos

---

### RNF-003: Seguridad - CORS

**Descripción**: El sistema debe configurar CORS adecuadamente  
**Estado**: 🔴 CRÍTICO - Implementado incorrectamente  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Middleware\CorsMiddleware.php" />  
**Observaciones**: Access-Control-Allow-Origin: * permite cualquier origen  
**Riesgo**: Habilita ataques CSRF y exploits desde cualquier dominio

---

### RNF-004: Integridad de Datos

**Descripción**: El sistema debe garantizar integridad de datos en operaciones críticas  
**Estado**: ⚠️ Parcialmente implementado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\FondoCargueController.php" />  
**Observaciones**: Solo el cargue completo usa transacciones. Retiros y otras operaciones críticas sin transacciones  
**Riesgo**: Posible inconsistencia de datos en caso de fallo parcial

---

### RNF-005: Mantenibilidad

**Descripción**: El código debe estar organizado para facilitar mantenimiento  
**Estado**: ✅ Implementado  
**Evidencia**: Separación por capas (Controllers, Services, DbProvider), inyección de dependencias  
**Observaciones**: Código bien estructurado,遵循 principios SRP  
**Riesgo**: Bajo

---

### RNF-006: Compatibilidad

**Descripción**: El sistema debe ser compatible con navegadores modernos  
**Estado**: ✅ Implementado  
**Evidencia**: React 19 soporta navegadores modernos, no hay polyfills evidentes  
**Observaciones**: Vite genera código compatible con ES2020+  
**Riesgo**: No compatible con navegadores antiguos (IE11)

---

### RNF-007: Observabilidad

**Descripción**: El sistema debe registrar eventos para diagnóstico  
**Estado**: ⚠️ Implementación básica  
**Evidencia**: error_log() usado en FileStorage.php y VehiculosController  
**Observaciones**: Logs básicos, sin sistema centralizado de logging  
**Riesgo**: Dificultad para diagnóstico de incidentes en producción

---

### RNF-008: Recuperación ante Fallos

**Descripción**: El sistema debe tener estrategia de backups y recuperación  
**Estado**: ❌ No implementado (no hay evidencia)  
**Observaciones**: No se encontraron scripts de backup, configuración de automatización  
**Riesgo**: Pérdida de datos en caso de fallo

---

## 3. Requisitos de Infraestructura

### RINF-001: Sistema Operativo

**Descripción**: Linux para producción, Windows/Linux para desarrollo  
**Estado**: Comprobado  
**Evidencia**: Documentación de despliegue en SiteGround menciona Linux, desarrollo actual en Windows  
**Requisitos**: Linux (Ubuntu/Debian/CentOS) o Windows 10+

---

### RINF-002: Runtime PHP

**Descripción**: PHP 8.2 o superior  
**Estado**: Comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\composer.json" lines="5-7" />  
**Requisitos**: PHP 8.2+, extensiones ext-pdo, ext-pdo_mysql, ext-json

---

### RINF-003: Runtime Node.js

**Descripción**: Node.js para desarrollo de frontend  
**Estado**: Comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\package.json" />  
**Requisitos**: Node.js 18+ (recomendado para Vite 7)

---

### RINF-004: Base de Datos MySQL

**Descripción**: MySQL 5.7+ o MariaDB 10.3+  
**Estado**: Comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\DESPLEGUE_SITEGROUND.md" lines="8-11" />  
**Requisitos**: MySQL 5.7+ / MariaDB 10.3+, soporte para PDO MySQL

---

### RINF-005: Gestores de Paquetes

**Descripción**: Composer (PHP) y npm (Node.js)  
**Estado**: Comprobado  
**Evidencia**: composer.json y package.json presentes  
**Requisitos**: Composer 2.x, npm 9.x+

---

### RINF-006: Puertos

**Descripción**: Backend en puerto 8000, frontend en 5173 (dev)  
**Estado**: Comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\api\axios.jsx" line="3" />, configuración Vite  
**Requisitos**: Puertos 8000 y 5173 disponibles, no firewall bloqueando

---

### RINF-007: Variables de Entorno

**Descripción**: Archivo .env con configuración de JWT y base de datos  
**Estado**: Comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\.env.example" />  
**Requisitos**: JWT_KEY, JWT_ISSUER, JWT_AUDIENCE, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS

---

### RINF-008: Almacenamiento

**Descripción**: Directorio uploads/ para archivos adjuntos  
**Estado**: Comprobado  
**Evidencia**: <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\FileStorage.php" />  
**Requisitos**: Permisos de escritura en api/uploads/, límite de upload_max_filesize configurado en .htaccess (12M)

---

### RINF-009: Espacio Requerido

**Descripción**: No especificado  
**Estado**: ❌ No determinado  
**Observaciones**: No hay documentación de requisitos de espacio  
**Requisitos**: Pendiente de validar en producción

---

## 4. Recomendaciones No Implementadas

Las siguientes recomendaciones no están implementadas actualmente pero mejorarían el sistema:

1. **Implementar refresh tokens** para mayor seguridad JWT
2. **Agregar transacciones** en operaciones de retiros
3. **Implementar sistema de logging centralizado**
4. **Configurar estrategia de backups automatizados**
5. **Agregar cache** para respuestas frecuentes (dashboard)
6. **Implementar rate limiting** en endpoints críticos
7. **Migrar frontend a TypeScript** para mayor seguridad de tipos
8. **Agregar tests unitarios** para Services y Controllers
9. **Implementar validación de schemas** (Joi/Zod)
10. **Reducir duración de JWT** a 1-2 horas
