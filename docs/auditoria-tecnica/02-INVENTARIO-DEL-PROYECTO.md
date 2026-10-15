# Inventario del Proyecto - Fondo de Reposicion Gacela

## 1. Estructura General del Proyecto

```
Fondo_Reposicion_Gacela_V1_SideGround/
├── api/                           # Backend PHP
│   ├── src/                       # Código fuente backend
│   │   ├── Controllers/           # Controladores API
│   │   ├── Middleware/            # Middleware (Auth, CORS)
│   │   ├── Config.php             # Configuración centralizada
│   │   ├── AuthService.php        # Lógica de autenticación
│   │   ├── JwtHelper.php          # Helper JWT
│   │   ├── PasswordHasher.php     # Hashing de contraseñas
│   │   ├── FileStorage.php        # Gestión de archivos
│   │   ├── Http.php               # Utilidades HTTP
│   │   └── DbProvider.php         # Acceso a datos (Repository)
│   ├── uploads/                   # Archivos adjuntos
│   │   └── adjuntos/              # PDF, imágenes
│   ├── vendor/                    # Dependencias PHP (generado)
│   ├── index.php                  # Punto de entrada backend
│   ├── composer.json              # Dependencias PHP
│   ├── composer.lock              # Lock file
│   ├── .env.example               # Plantilla de variables de entorno
│   ├── .htaccess                  # Configuración Apache
│   └── DESPLIEGUE_SITEGROUND.md    # Guía de despliegue
├── Frontend/                      # Frontend React
│   ├── src/                       # Código fuente frontend
│   │   ├── api/                   # Cliente Axios
│   │   ├── components/            # Componentes React
│   │   ├── config/                # Configuración (menú)
│   │   ├── hooks/                 # Hooks personalizados
│   │   ├── Layouts/               # Layouts
│   │   ├── pages/                 # Páginas principales
│   │   ├── Services/              # Servicios API
│   │   └── Utils/                 # Utilidades
│   ├── public/                    # Archivos estáticos
│   ├── node_modules/              # Dependencias Node (generado)
│   ├── dist/                      # Build de producción (generado)
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Dependencias Node
│   ├── package-lock.json          # Lock file
│   ├── vite.config.js             # Configuración Vite
│   ├── eslint.config.js           # Configuración ESLint
│   ├── tailwind.config.js         # Configuración Tailwind
│   ├── postcss.config.js          # Configuración PostCSS
│   ├── .env.production            # Variables de entorno prod
│   └── README.md                  # Documentación frontend
├── docs/                         # Documentación (creado por auditoría)
│   └── auditoria-tecnica/         # Documentos de auditoría
├── .gitignore                    # Exclusiones Git
├── README.md                      # Documentación principal
├── DOCUMENTACION.md               # Documentación técnica
├── DESCRIPCION_PROYECTO.md        # Descripción del proyecto
└── .devin/                       # Configuración Devin
```

---

## 2. Inventario de Archivos Backend (api/)

### 2.1 Archivos de Configuración (7 archivos)

| Archivo | Líneas | Propósito | Estado |
|---------|--------|-----------|--------|
| `composer.json` | 30 | Dependencias PHP | ✅ Activo |
| `composer.lock` | 1500+ | Lock de dependencias | ✅ Activo |
| `.env.example` | 9 | Plantilla de variables de entorno | ✅ Activo |
| `.htaccess` | 31 | Configuración Apache, seguridad | ✅ Activo |
| `DESPLEGUE_SITEGROUND.md` | 26 | Guía de despliegue | ✅ Activo |
| `index.php` | 120 | Punto de entrada, router | ✅ Activo |

### 2.2 Código Fuente (src/) - 12 archivos

| Archivo | Líneas | Propósito | Estado |
|---------|--------|-----------|--------|
| `Config.php` | 40 | Configuración centralizada, .env | ✅ Activo |
| `DbProvider.php` | 400+ | Acceso a datos, Repository | ✅ Activo |
| `AuthService.php` | 50 | Lógica de autenticación | ✅ Activo |
| `JwtHelper.php` | 40 | Generación/validación JWT | ✅ Activo |
| `PasswordHasher.php` | 50 | Hashing de contraseñas | ✅ Activo |
| `FileStorage.php` | 114 | Gestión de archivos adjuntos | ✅ Activo |
| `Http.php` | 30 | Utilidades HTTP | ✅ Activo |
| `Controllers/AuthController.php` | 40 | Endpoint login | ✅ Activo |
| `Controllers/DashboardController.php` | 50 | Endpoint dashboard | ✅ Activo |
| `Controllers/VehiculosController.php` | 120 | Endpoint vehículos | ✅ Activo |
| `Controllers/RetirosController.php` | 150 | Endpoint retiros | ✅ Activo |
| `Controllers/UsuariosController.php` | 200 | Endpoint usuarios | ⚠️ BUG en línea 84 |
| `Controllers/RolesController.php` | 80 | Endpoint roles | ✅ Activo |
| `Controllers/FondoCargueController.php` | 200 | Endpoint cargue | ✅ Activo |
| `Controllers/SolicitudesController.php` | 100 | Endpoint solicitudes | ✅ Activo |
| `Controllers/DocumentacionController.php` | 60 | Endpoint documentación | ✅ Activo |
| `Controllers/AdjuntosController.php` | 40 | Endpoint adjuntos | ✅ Activo |
| `Middleware/AuthMiddleware.php` | 60 | Middleware de autenticación | ✅ Activo |
| `Middleware/CorsMiddleware.php` | 40 | Middleware CORS | 🔴 Riesgo (origen *) |

### 2.3 Directorios Especiales (3)

| Directorio | Propósito | Estado |
|------------|-----------|--------|
| `vendor/` | Dependencias PHP (generado) | ⚠️ No en git |
| `uploads/` | Archivos adjuntos | ⚠️ No en git |
| `uploads/adjuntos/` | PDF, imágenes subidas | ⚠️ No en git |

---

## 3. Inventario de Archivos Frontend (Frontend/)

### 3.1 Archivos de Configuración (8 archivos)

| Archivo | Líneas | Propósito | Estado |
|---------|--------|-----------|--------|
| `package.json` | 40 | Dependencias Node | ✅ Activo |
| `package-lock.json` | 10000+ | Lock de dependencias | ✅ Activo |
| `vite.config.js` | 30 | Configuración Vite | ✅ Activo |
| `eslint.config.js` | 29 | Configuración ESLint | ✅ Activo |
| `tailwind.config.js` | 50 | Configuración Tailwind | ⚠️ Duplicado en raíz |
| `postcss.config.js` | 15 | Configuración PostCSS | ✅ Activo |
| `.env.production` | 1 | Variables de entorno prod | ✅ Activo |
| `README.md` | 47 | Documentación frontend | ⚠️ Desactualizado (puerto) |

### 3.2 Código Fuente (src/) - 30+ archivos

#### api/ (2 archivos)
| Archivo | Líneas | Propósito | Estado |
|---------|--------|-----------|--------|
| `axios.jsx` | 17 | Cliente Axios configurado | ✅ Activo |
| `authhhh.js` | 0 | Vacío, sin uso | 🔴 Eliminar |

#### components/ (15+ archivos)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `Header.jsx` | Cabecera de aplicación | ✅ Activo |
| `Sidebar.jsx` | Barra lateral navegación | ✅ Activo |
| `Navbar.jsx` | Barra navegación | 🔴 No usado |
| `ProtectedRoute.jsx` | Ruta protegida | ✅ Activo |
| `ProtectedButton.jsx` | Botón protegido | 🔴 No usado |
| `Resumen.jsx` | Componente resumen | ✅ Activo |
| `DetalleAnual.jsx` | Detalle anual | ✅ Activo |
| `Retiros/VehiculoRetiros.jsx` | Retiros por vehículo | ✅ Activo |
| `Retiros/FormRetiro.jsx` | Formulario retiros | 🔴 No usado |
| `Retiros/ListaRetiros.jsx` | Lista retiros | 🔴 No usado |
| `Solicitudes/ListaSolicitudes.jsx` | Lista solicitudes | ✅ Activo |
| `Solicitudes/NuevaDocumentacion.jsx` | Nueva documentación | ✅ Activo |
| `Documentacion/ListaDocumentacion.jsx` | Lista documentación | ✅ Activo |

#### pages/ (10 archivos)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `Dashboard.jsx` | Dashboard principal | ✅ Activo |
| `Login.jsx` | Página login | ✅ Activo |
| `Vehiculos.jsx` | Consulta vehículos | ✅ Activo |
| `Usuarios.jsx` | Gestión usuarios | ✅ Activo |
| `Roles.jsx` | Gestión roles | ✅ Activo |
| `CargueFondo.jsx` | Cargue masivo | ✅ Activo |
| `NuevaSolicitud.jsx` | Nueva solicitud | ✅ Activo |
| `Solicitudes.jsx` | Lista solicitudes | ✅ Activo |
| `Documentacion.jsx` | Documentación | ⚠️ Sin ruta en App.jsx |
| `Unauthorized.jsx` | Página error | ✅ Activo |

#### Services/ (7 archivos)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `api.js` | Re-export axios | ⚠️ Redundante |
| `authService.js` | Servicios auth | ✅ Activo |
| `dashboardService.js` | Servicios dashboard | ✅ Activo |
| `retiroService.js` | Servicios retiros | ✅ Activo |
| `rolesService.js` | Servicios roles | ✅ Activo |
| `usuariosService.js` | Servicios usuarios | ✅ Activo |
| `vehiculosService.js` | Servicios vehículos | ✅ Activo |

#### Utils/ (2 archivos)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `auth.js` | Utilidades auth JWT | ✅ Activo |
| `format.js` | Formateo moneda | ✅ Activo |

#### auth/ (2 archivos)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `AuthContext.jsx` | Context API | 🔴 Vacío, sin uso |
| `RequiereAuth.jsx` | Protección ruta | 🔴 Vacío, sin uso |

#### hooks/ (1 archivo)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `useRetiros.js` | Hook retiros | ✅ Activo |

#### config/ (1 archivo)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `menu.js` | Configuración menú | ✅ Activo |

#### Layouts/ (1 archivo)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `MainLayout.jsx` | Layout principal | ✅ Activo |

#### Otros (1 archivo)
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `App.jsx` | Router + Auth state | ✅ Activo |
| `main.jsx` | Entry point React | ✅ Activo |

### 3.3 Directorios Especiales (3)

| Directorio | Propósito | Estado |
|------------|-----------|--------|
| `node_modules/` | Dependencias Node (generado) | ⚠️ No en git |
| `dist/` | Build producción (generado) | ⚠️ No en git |
| `public/` | Archivos estáticos | ✅ Activo |

---

## 4. Inventario de Raíz (5 archivos)

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `README.md` | Documentación principal | ⚠️ Desactualizado (ASP.NET vs PHP) |
| `DOCUMENTACION.md` | Documentación técnica | ⚠️ Desactualizado (ASP.NET vs PHP) |
| `DESCRIPCION_PROYECTO.md` | Descripción proyecto | ✅ Correcto (PHP) |
| `.gitignore` | Exclusiones Git | ✅ Activo |
| `postcss.config.js.old` | Config antigua | 🔴 Eliminar |
| `tailwind.config.js` | Config Tailwind | ⚠️ Duplicado |

---

## 5. Resumen de Totales

| Categoría | Total Archivos | Activos | Inactivos/Sin Uso | Riesgo |
|----------|----------------|---------|-------------------|--------|
| Backend (api/) | 26 | 24 | 2 (vendor, uploads) | Bajo |
| Frontend (Frontend/) | 40+ | 34 | 6+ (vacíos, no usados) | Medio |
| Raíz | 6 | 4 | 2 (antiguos, duplicados) | Bajo |
| **TOTAL** | **72+** | **62** | **10+** | Medio |

---

## 6. Archivos No Versionados (Excluidos de Git)

### backend/
- `vendor/` - Dependencias PHP
- `uploads/` - Archivos adjuntos
- `.env` - Variables de entorno (debe existir pero no versionarse)

### Frontend/
- `node_modules/` - Dependencias Node
- `dist/` - Build de producción
- `.env` - Variables de entorno (para desarrollo)

---

## 7. Tamaño Aproximado de Archivos

**Estimación:**
- Backend (sin vendor): ~200 KB de código fuente
- Frontend (sin node_modules): ~100 KB de código fuente
- vendor: ~50 MB
- node_modules: ~300 MB
- uploads: Variable (depende de archivos subidos)
