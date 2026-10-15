# Hallazgos y Deuda Técnica - Fondo de Reposicion Gacela

## 1. Errores Confirmados

### ER-001: BUG en Restablecimiento de Contraseña (CRÍTICO)

**Problema:** Método `PasswordHasher::hash()` no existe, pero es llamado en UsuariosController.php  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\UsuariosController.php" line="84" />  
**Impacto:** La funcionalidad de restablecimiento de contraseña fallará con error fatal en tiempo de ejecución  
**Prioridad:** ALTA  
**Recomendación:** Usar `PasswordHasher::crearHash()` correctamente (método que sí existe)  
**Riesgo de eliminación:** Nulo - código está roto actualmente

---

### ER-002: Código Incompleto en DbProvider (MEDIO)

**Problema:** Líneas 164-167 en DbProvider.php tienen variables no inicializadas ($sumAportes, $totalRetiros)  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\DbProvider.php" lines="164-167" />  
**Impacto:** Método `obtenerResumen()` puede retornar valores incorrectos si no se inicializan correctamente  
**Prioridad:** MEDIA  
**Recomendación:** Inicializar variables antes de usar o eliminar código comentado  
**Riesgo de eliminación:** Bajo - puede ser código en desarrollo

---

## 2. Inconsistencias Entre Frontend y Backend

### IN-001: Documentación Desactualizada (ALTA)

**Problema:** DOCUMENTACION.md y README.md mencionan ASP.NET Core 8, pero el backend es PHP  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\DOCUMENTACION.md" line="8" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\README.md" line="31" />  
**Impacto:** Confusión para desarrolladores nuevos, documentación no refleja arquitectura actual  
**Prioridad:** ALTA  
**Recomendación:** Actualizar toda la documentación para reflejar PHP + Slim Framework  
**Riesgo de eliminación:** Nulo - solo documentación

---

### IN-002: Estructura de Directorios en Documentación (ALTA)

**Problema:** Documentación menciona estructura Backend/ pero el directorio real es api/  
**Evidencia:** DOCUMENTACION.md línea 29 menciona Backend/  
**Impacto:** Desorientación para navegación del proyecto  
**Prioridad:** ALTA  
**Recomendación:** Actualizar referencias de Backend/ a api/ en toda la documentación  
**Riesgo de eliminación:** Nulo - solo documentación

---

### IN-003: Referencias a Scripts SQL Inexistentes (MEDIA)

**Problema:** DOCUMENTACION.md menciona Scripts/add_ruta_adjunto_retiros.sql que no existe  
**Evidencia:** DOCUMENTACION.md línea 55  
**Impacto:** Desorientación, procedimiento no ejecutable  
**Prioridad:** MEDIA  
**Recomendación:** Eliminar referencias a scripts inexistentes o crear los scripts si son necesarios  
**Riesgo de eliminación:** Bajo - solo documentación

---

### IN-004: Puerto Inconsistente en Documentación Frontend (BAJA)

**Problema:** Frontend/README.md indica API en puerto 5092, pero .env.production usa 8000  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\README.md" line="29" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\.env.production" />  
**Impacto:** Confusión para configuración de entorno  
**Prioridad:** BAJA  
**Recomendación:** Unificar puertos en documentación  
**Riesgo de eliminación:** Nulo - solo documentación

---

## 3. Riesgos de Seguridad

### SE-001: CORS Demasiado Permisivo (CRÍTICO)

**Problema:** Access-Control-Allow-Origin: * permite cualquier origen  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Middleware\CorsMiddleware.php" line="29" />  
**Impacto:** Habilita ataques CSRF y exploits desde cualquier dominio  
**Prioridad:** CRÍTICA  
**Recomendación:** Configurar orígenes específicos por entorno (localhost en dev, dominio prod en producción)  
**Riesgo de eliminación:** Nulo - es una configuración que debe cambiarse

---

### SE-002: Sin Validación de Tamaño de Archivo (CRÍTICO)

**Problema:** FileStorage.php no valida tamaño máximo de archivo subido  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\FileStorage.php" />  
**Impacto:** Riesgo de DoS por llenado de disco del servidor  
**Prioridad:** CRÍTICA  
**Recomendación:** Validar tamaño máximo (recomendado: 10MB) antes de guardar  
**Riesgo de eliminación:** Nulo - es una validación que debe agregarse

---

### SE-003: Sin Validación de Tipo de Archivo por Contenido (CRÍTICO)

**Problema:** FileStorage.contentType() solo valida por extensión, no por magic bytes  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\FileStorage.php" lines="103-113" />  
**Impacto:** Permite upload de malware renombrado a extensión permitida (ej: malware.exe → malware.pdf)  
**Prioridad:** CRÍTICA  
**Recomendación:** Validar magic bytes usando finfo_file() o librería equivalente  
**Riesgo de eliminación:** Nulo - es una validación que debe agregarse

---

### SE-004: Secretos Débiles en .env.example (CRÍTICO)

**Problema:** JWT_KEY y DB_PASS en .env.example tienen valores por defecto débiles  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\.env.example" lines="1,9" />  
**Impacto:** Si se usa en producción, sistema completamente comprometido  
**Prioridad:** CRÍTICA  
**Recomendación:** Usar placeholders seguros (ej: CHANGE_ME, GENERATE_SECURE_KEY) y generar en producción  
**Riesgo de eliminación:** Nulo - es un archivo de ejemplo

---

### SE-005: Duración de Token Muy Larga (MEDIA)

**Problema:** JWT expira en 8 horas, tiempo muy largo para aplicaciones sensibles  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\JwtHelper.php" line="23" />  
**Impacto:** Si token es comprometido, atacante tiene acceso por 8 horas  
**Prioridad:** MEDIA  
**Recomendación:** Reducir a 1-2 horas, implementar refresh tokens  
**Riesgo de eliminación:** Nulo - es una configuración que debe ajustarse

---

### SE-006: Endpoints Críticos Sin Permisos Específicos (MEDIA)

**Problema:** Retiros y cargue masivo solo requieren autenticación, no permisos específicos  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\index.php" lines="105-107, 124-125" />  
**Impacto:** Cualquier usuario autenticado puede realizar operaciones financieras  
**Prioridad:** MEDIA  
**Recomendación:** Agregar permisos específicos (ej: RETIRO_REGISTRAR, FONDO_CARGUE)  
**Riesgo de eliminación:** Nulo - es una configuración que debe ajustarse

---

### SE-007: Exposición de Detalles de Error (MEDIA)

**Problema:** VehiculosController y FondoCargueController exponen file, line y stack trace en errores  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\VehiculosController.php" lines="44-48" />, <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Controllers\FondoCargueController.php" lines="173-179" />  
**Impacto:** Exposición de información interna que puede ser útil para atacantes  
**Prioridad:** MEDIA  
**Recomendación:** Loggear internamente, no exponer detalles en producción  
**Riesgo de eliminación:** Nulo - es una configuración que debe ajustarse

---

## 4. Archivos Redundantes y Sin Uso

### AR-001: Archivos Vacíos (SIN RIESGO)

**Archivos identificados:**
1. `Frontend/src/api/authhhh.js` - 0 bytes, sin referencias
2. `Frontend/src/auth/AuthContext.jsx` - 0 bytes, sin referencias
3. `Frontend/src/auth/RequiereAuth.jsx` - 0 bytes, sin referencias

**Certeza:** ALTA  
**Recomendación:** Eliminar estos archivos  
**Riesgo de eliminación:** NULO - no tienen código ni referencias

---

### AR-002: Componentes No Utilizados (SIN RIESGO)

**Archivos identificados:**
1. `Frontend/src/components/Navbar.jsx` - No importado, Sidebar se usa para navegación
2. `Frontend/src/components/ProtectedButton.jsx` - No importado, ProtectedRoute se usa para protección
3. `Frontend/src/components/Retiros/ListaRetiros.jsx` - No importado, VehiculoRetiros implementa su propia tabla
4. `Frontend/src/components/Retiros/FormRetiro.jsx` - No importado, VehiculoRetiros implementa su propio formulario

**Certeza:** ALTA  
**Recomendación:** Eliminar o confirmar si son funcionalidad planificada antes de eliminar  
**Riesgo de eliminación:** BAJO - podría ser código alternativo en desarrollo

---

### AR-003: Archivo Redundante (BAJO RIESGO)

**Archivo identificado:**
- `Frontend/src/Services/api.js` - Re-export simple de axios.jsx (3 líneas)

**Certeza:** ALTA  
**Recomendación:** Reemplazar imports directos a api/axios.jsx en los 3 archivos que lo usan  
**Riesgo de eliminación:** BAJO - requiere cambios en usuariosService, vehiculosService, retiroService

---

### AR-004: Configuración Antigua (SIN RIESGO)

**Archivo identificado:**
- `postcss.config.js.old` - Configuración de PostCSS antigua (Tailwind 4 usa @tailwindcss/vite)

**Certeza:** ALTA  
**Recomendación:** Eliminar  
**Riesgo de eliminación:** NULO - es backup de versión anterior

---

### AR-005: Configuración Duplicada (MEDIA RIESGO)

**Archivo identificado:**
- `tailwind.config.js` en raíz - Duplicado de Frontend/tailwind.config.js

**Certeza:** MEDIA  
**Recomendación:** Verificar si alguna herramienta lo referencia antes de eliminar  
**Riesgo de eliminación:** MEDIO - podría ser usado por alguna herramienta CLI

---

## 5. Código Duplicado

### CD-001: Funcionalidad de Retiros (BAJO)

**Problema:** ListaRetiros.jsx y FormRetiro.jsx no se usan, VehiculoRetiros.jsx implementa funcionalidad similar  
**Evidencia:** Análisis de imports mostró que estos archivos no son importados  
**Impacto:** Código duplicado, posible confusión  
**Prioridad:** BAJA  
**Recomendación:** Confirmar con equipo si son código alternativo o abandonado, luego eliminar  
**Riesgo de eliminación:** BAJO - no está siendo usado actualmente

---

## 6. Problemas de Rendimiento

### PE-001: Sin Estrategia de Cache (MEDIA)

**Problema:** No hay evidencia de cache en el sistema  
**Evidencia:** No se encontró configuración de cache (Redis, Memcached, etc.)  
**Impacto:** Cada solicitud ejecuta consultas a base de datos  
**Prioridad:** MEDIA  
**Recomendación:** Considerar cache para respuestas frecuentes (dashboard)  
**Riesgo de eliminación:** NULO - es una mejora

---

### PE-002: Posibles Consultas N+1 (BAJA)

**Problema:** DbProvider podría tener consultas N+1 en bucles (no evidencia directa)  
**Evidencia:** Análisis estático sugiere posible problema en algunos métodos  
**Impacto:** Degradación de rendimiento con muchos registros  
**Prioridad:** BAJA  
**Recomendación:** Revisar DbProvider y optimizar con JOINs o eager loading  
**Riesgo de eliminación:** NULO - es una optimización

---

## 7. Problemas de Escalabilidad

### ES-001: Arquitectura Monolítica (MEDIA)

**Problema:** Sistema es monolítico, no hay microservicios  
**Evidencia:** Arquitectura cliente-servidor único, backend monolítico PHP  
**Impacto:** Escalabilidad limitada, escalado vertical solo  
**Prioridad:** MEDIA  
**Recomendación:** Evaluar si es necesario migrar a microservicios a futuro  
**Riesgo de eliminación:** NULO - es una decisión arquitectónica

---

### ES-002: Sin Cache Distribuido (MEDIA)

**Problema:** No hay estrategia de cache distribuido para escalado horizontal  
**Evidencia:** Solo localStorage en frontend para estado  
**Impacto:** Dificultad para escalar horizontalmente  
**Prioridad:** MEDIA  
**Recomendación:** Considerar Redis para cache distribuido si se escala horizontalmente  
**Riesgo de eliminación:** NULO - es una mejora

---

## 8. Acoplamiento Excesivo

### AC-001: localStorage Directo (BAJA)

**Problema:** localStorage usado directamente en múltiples componentes sin abstracción  
**Evidencia:** auth.js y componentes acceden localStorage directamente  
**Impacto:** Dificultad para cambiar estrategia de persistencia  
**Prioridad:** BAJA  
**Recomendación:** Considerar usar Context API o Zustand para estado global  
**Riesgo de eliminación:** NULO - es una mejora

---

## 9. Falta de Pruebas

### FT-001: Sin Framework de Pruebas (ALTA)

**Problema:** No hay framework de pruebas configurado, ni tests unitarios ni de integración  
**Evidencia:** Análisis completo en documento 13-PRUEBAS-Y-CALIDAD.md  
**Impacto:** Alto riesgo de regressiones, bugs no detectados hasta producción  
**Prioridad:** ALTA  
**Recomendación:** Implementar suite de pruebas (Vitest para frontend, PHPUnit para backend)  
**Riesgo de eliminación:** NULO - es una mejora

---

## 10. Configuraciones Exclusivas de Desarrollo

### CE-001: Valores Hardcoded (BAJA)

**Problema:** Puerto 8000 hardcoded como default en axios.jsx  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\Frontend\src\api\axios.jsx" line="3" />  
**Impacto:** Dificultad para cambiar entorno sin modificar código  
**Prioridad:** BAJA  
**Recomendación**: Ya existe VITE_API_URL como variable de entorno, usarla en todos los casos  
**Riesgo de eliminación:** NULO - es una mejora

---

## 11: Funcionalidades Incompletas

### FI-001: AuthContext Vacío (BAJA)

**Problema:** AuthContext.jsx existe pero está vacío (0 bytes)  
**Evidencia:** Archivo existe pero sin contenido  
**Impacto:** Se planeó usar Context API para estado global pero no se implementó  
**Prioridad:** BAJA  
**Recomendación:** Implementar AuthContext o eliminar archivo  
**Riesgo de eliminación:** NULO - no está siendo usado

---

## 12: Posibles Fallos en Despliegue

### PD-001: Dependencia de Archivo .env (MEDIA)

**Problema:** Sistema falla si .env no existe o no tiene JWT_KEY  
**Evidencia:** <ref_file file="C:\Users\jmolano\Fondo_Reposicion_Gacela_V1_SideGround\api\src\Config.php" lines="29-32" />  
**Impacto:** Error fatal al iniciar si .env no está configurado  
**Prioridad:** MEDIA  
**Recomendación:** Validar existencia de .env al inicio, dar error claro si falta  
**Riesgo de eliminación:** NULO - es una mejora

---

## Tabla Resumen de Hallazgos

| ID | Problema | Criticidad | Estado | Prioridad |
|----|---------|------------|--------|----------|
| ER-001 | BUG en restablecimiento de contraseña | CRÍTICO | Confirmado | ALTA |
| ER-002 | Código incompleto en DbProvider | MEDIO | Confirmado | MEDIA |
| IN-001 | Documentación desactualizada (ASP.NET vs PHP) | ALTA | Confirmado | ALTA |
| IN-002 | Estructura de directorios en documentación | ALTA | Confirmado | ALTA |
| IN-003 | Referencias a scripts SQL inexistentes | MEDIA | Confirmado | MEDIA |
| IN-004 | Puerto inconsistente en documentación | BAJA | Confirmado | BAJA |
| SE-001 | CORS demasiado permisivo | CRÍTICO | Confirmado | CRÍTICA |
| SE-002 | Sin validación de tamaño de archivo | CRÍTICO | Confirmado | CRÍTICA |
| SE-003 | Sin validación de tipo de archivo por contenido | CRÍTICO | Confirmado | CRÍTICA |
| SE-004 | Secretos débiles en .env.example | CRÍTICO | Confirmado | CRÍTICA |
| SE-005 | Duración de token muy larga | MEDIA | Confirmado | MEDIA |
| SE-006 | Endpoints críticos sin permisos específicos | MEDIA | Confirmado | MEDIA |
| SE-007 | Exposición de detalles de error | MEDIA | Confirmado | MEDIA |
| AR-001 | Archivos vacíos sin uso | - | Confirmado | BAJA |
| AR-002 | Componentes no utilizados | - | Confirmado | BAJA |
| AR-003 | Archivo redundante (api.js) | - | Confirmado | BAJA |
| AR-004 | Configuración antigua (.old) | - | Confirmado | BAJA |
| AR-005 | Configuración duplicada (tailwind) | - | Confirmado | MEDIA |
| CD-001 | Funcionalidad de retiros duplicada | - | Confirmado | BAJA |
| PE-001 | Sin estrategia de cache | - | Inferido | MEDIA |
| PE-002 | Posibles consultas N+1 | - | Inferido | BAJA |
| ES-001 | Arquitectura monolítica | - | Confirmado | MEDIA |
| ES-002 | Sin cache distribuido | - | Inferido | MEDIA |
| AC-001 | localStorage directo | - | Confirmado | BAJA |
| FT-001 | Sin framework de pruebas | ALTA | Confirmado | ALTA |
| CE-001 | Valores hardcoded | - | Confirmado | BAJA |
| FI-001 | AuthContext vacío | - | Confirmado | BAJA |
| PD-001 | Dependencia de archivo .env | - | Confirmado | MEDIA |

---

## Recomendaciones Prioritarias

### Inmediatas (Hacer Antes de Próximo Deployment)

1. **Corregir bug de restablecimiento de contraseña** (ER-001)
2. **Cambiar CORS de * a dominios específicos** (SE-001)
3. **Agregar validación de tamaño de archivo** (SE-002)
4. **Agregar validación de tipo de archivo por contenido** (SE-003)
5. **Cambiar secretos en .env.example a placeholders** (SE-004)

### Corto Plazo (Esta Semana)

1. **Actualizar documentación** (IN-001, IN-002, IN-003)
2. **Agregar permisos específicos para operaciones financieras** (SE-006)
3. **Remover exposición de detalles de error en producción** (SE-007)
4. **Eliminar archivos vacíos** (AR-001)
5. **Implementar framework de pruebas** (FT-001)

### Largo Plazo (Próximo Mes)

1. **Reducir duración de JWT y implementar refresh tokens** (SE-005)
2. **Implementar cache para dashboard** (PE-001)
3. **Implementar AuthContext para estado global** (FI-001)
4. **Agregar transacciones en operaciones de retiros** (RNF-004)
5. **Configurar sistema de logging centralizado** (RNF-007)
