# Auditoría de Archivos - Fondo de Reposicion Gacela

## 1. Archivos Redundantes, Duplicados o Sin Uso

### Tabla de Archivos

| Ruta del Archivo | Tipo de Problema | Evidencia | Certeza | Riesgo de Eliminación |
|-----------------|------------------|-----------|---------|----------------------|
| **Frontend/src/api/authhhh.js** | Vacío / Sin uso | Archivo de 0 bytes. Nombre sugiere error de tipografía (authhhh vs auth). | Alta | Nulo - Archivo vacío sin referencias |
| **Frontend/src/auth/AuthContext.jsx** | Vacío / Sin uso | Archivo de 0 bytes. No contiene código. No es importado por ningún otro archivo. | Alta | Nulo - Archivo vacío sin referencias |
| **Frontend/src/auth/RequiereAuth.jsx** | Vacío / Sin uso | Archivo de 0 bytes. No contiene código. No es importado por ningún otro archivo. | Alta | Nulo - Archivo vacío sin referencias |
| **Frontend/src/Services/api.js** | Redundante | Re-export simple de axios.jsx (3 líneas). Solo es importado por usuariosService, vehiculosService y retiroService. | Alta | Bajo - Debería consolidar imports en archivos que lo usan |
| **Frontend/src/components/Navbar.jsx** | Sin uso | Componente de navegación simple no utilizado. El sistema usa Sidebar.jsx para navegación. | Alta | Nulo - No usado en el sistema actual |
| **Frontend/src/components/ProtectedButton.jsx** | Sin uso | Componente para botones protegidos por permisos. No es importado por ningún archivo. | Alta | Nulo - No usado en el sistema actual |
| **Frontend/src/components/Retiros/ListaRetiros.jsx** | Sin uso | Componente lista de retiros no utilizado. VehiculoRetiros.jsx implementa su propia tabla. | Alta | Bajo - Podría ser funcionalidad alternativa no integrada |
| **Frontend/src/components/Retiros/FormRetiro.jsx** | Sin uso | Componente formulario de retiros no utilizado. VehiculoRetiros.jsx implementa su propio formulario. | Alta | Bajo - Podría ser funcionalidad alternativa no integrada |
| **postcss.config.js.old** | Versión antigua | Archivo de configuración .old. Tailwind CSS 4 usa @tailwindcss/vite plugin. | Alta | Nulo - Configuración obsoleta de versión anterior |
| **tailwind.config.js** (raíz) | Redundante | Configuración Tailwind en raíz del proyecto. Tailwind CSS 4 se configura vía @theme en style.css. | Media | Bajo - Verificar si alguna herramienta lo usa antes de eliminar |
| **README.md** | Documentación desactualizada | Menciona estructura Backend/ y tecnología ASP.NET Core 8. El proyecto actual usa api/ con PHP. | Alta | Medio - Debe actualizarse para reflejar arquitectura actual |
| **DOCUMENTACION.md** | Documentación desactualizada | Menciona estructura Backend/ y tecnología ASP.NET Core 8. Referencia rutas que no existen. | Alta | Medio - Debe actualizarse para reflejar arquitectura actual |
| **Frontend/README.md** | Documentación desactualizada | Indica que la API está en puerto 5092, pero .env.production usa 8000. | Alta | Bajo - Solo documentación, no afecta funcionamiento |
| **api/uploads/adjuntos/solicitudes/*.png** | Archivos de datos/prueba | 2 archivos de imagen cargados durante pruebas/desarrollo. | Alta | Bajo - Son datos de prueba, no código. Considerar limpieza si son solo pruebas |
| **Frontend/src/Utils/auth.js** | Comentario legacy | Línea 62 contiene comentario "// ASP.NET Core guarda los claims personalizados así". | Media | Nulo - Solo comentario, código funciona correctamente con PHP |

---

## 2. Resumen por Categoría

### Archivos Eliminables (Sin Riesgo)

- **Frontend/src/api/authhhh.js** - Archivo vacío
- **Frontend/src/auth/AuthContext.jsx** - Archivo vacío  
- **Frontend/src/auth/RequiereAuth.jsx** - Archivo vacío
- **Frontend/src/components/Navbar.jsx** - No utilizado
- **Frontend/src/components/ProtectedButton.jsx** - No utilizado
- **postcss.config.js.old** - Configuración obsoleta

### Archivos Requieren Investigación Adicional

- **Frontend/src/Services/api.js** - Redundante pero usado por 3 servicios
- **Frontend/src/components/Retiros/ListaRetiros.jsx** - Podría ser código alternativo
- **Frontend/src/components/Retiros/FormRetiro.jsx** - Podría ser código alternativo
- **tailwind.config.js** (raíz) - Verificar si alguna herramienta lo referencia

### Documentación Requiere Actualización

- **README.md** - Actualizar estructura (Backend/ → api/) y tecnología (ASP.NET → PHP)
- **DOCUMENTACION.md** - Actualizar estructura y referencias a scripts ASP.NET
- **Frontend/README.md** - Corregir puerto de API (5092 → 8000)

### Archivos de Datos (Considerar Limpieza)

- **api/uploads/adjuntos/solicitudes/*.png** - 2 archivos de prueba

---

## 3. Recomendaciones de Acción

### 1. Eliminación Inmediata

Los 6 archivos marcados como "sin riesgo" pueden eliminarse directamente:
```bash
rm Frontend/src/api/authhhh.js
rm Frontend/src/auth/AuthContext.jsx
rm Frontend/src/auth/RequiereAuth.jsx
rm Frontend/src/components/Navbar.jsx
rm Frontend/src/components/ProtectedButton.jsx
rm postcss.config.js.old
```

### 2. Consolidación

Reemplazar imports de `Services/api.js` por imports directos a `api/axios.jsx` en los 3 archivos que lo usan, luego eliminar `Services/api.js`.

### 3. Decisión Funcional

Revisar con el equipo si `ListaRetiros.jsx` y `FormRetiros.jsx` son funcionalidades planeadas o código abandonado antes de eliminar.

### 4. Actualización de Documentación

Priorizar actualizar README.md y DOCUMENTACION.md para reflejar la arquitectura PHP actual.

### 5. Limpieza de Datos

Evaluar si los archivos en `api/uploads/adjuntos/solicitudes/` son datos de producción o solo pruebas. Si son pruebas, eliminarlos.
