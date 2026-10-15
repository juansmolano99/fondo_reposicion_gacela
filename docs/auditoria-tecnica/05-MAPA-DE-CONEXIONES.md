# Mapa de Conexiones - Fondo de Reposicion Gacela

## 1. Conexiones Frontend → Backend

### 1.1 Cliente Axios

**Archivo:** `Frontend/src/api/axios.jsx`

**Configuración:**
- Base URL: `VITE_API_URL || http://localhost:8000`
- Sufijo: `/api`
- Interceptor: Agrega header `Authorization: Bearer {token}`

**Ejemplo de conexión:**
```jsx
api.get('/vehiculos/ABC-123')
// → http://localhost:8000/api/vehiculos/ABC-123
// → Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 2. Conexiones Backend → Base de Datos

### 2.1 DbProvider → MySQL

**Archivo:** `api/src/DbProvider.php`

**Conexión PDO:**
```php
$pdo = new \PDO(
    Config::dsn(),  // mysql:host=localhost;port=3306;dbname=fondo_repo_local
    Config::dbUser(),
    Config::dbPass(),
    [
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES => false,
    ]
);
```

**Características:**
- Conexión persistente (única instancia)
- Prepared statements nativos
- Fetch mode asociativo
- Errores como excepciones

---

## 3. Conexiones Entre Componentes Backend

### 3.1 Inyección de Dependencias

**Flujo:**
```
index.php
    → crea DbProvider
    → crea AuthService(DbProvider)
    → crea AuthController(AuthService)
    → crea DashboardController(DbProvider)
    → crea VehiculosController(DbProvider)
    → etc.
```

**Ejemplo:**
```php
$db = new DbProvider();
$authService = new AuthService($db);
$authCtrl = new AuthController($authService);
```

---

## 4. Conexiones Entre Componentes Frontend

### 4.1 Páginas → Services

**Ejemplo:**
```jsx
// Dashboard.jsx
import { getDashboardResumen } from '../Services/dashboardService';

const data = await getDashboardResumen(anio);
```

### 4.2 Services → Axios

**Ejemplo:**
```jsx
// dashboardService.js
import api from '../api/axios';

export const getDashboardResumen = (anio) => 
  api.get('/dashboard', { params: { anio } });
```

### 4.3 Components → Utils

**Ejemplo:**
```jsx
// ProtectedRoute.jsx
import { getUserPermissions } from '../Utils/auth';

const permissions = getUserPermissions();
```

---

## 5. Conexiones a Archivos

### 5.1 FileStorage → uploads/

**Archivo:** `api/src/FileStorage.php`

**Directorios:**
- `api/uploads/adjuntos/` - Adjuntos generales
- `api/uploads/adjuntos/solicitudes/` - Adjuntos de solicitudes
- `api/uploads/adjuntos/documentacion/` - Adjuntos de documentación

**Ruta web:** `/adjuntos/...`

---

## 6. Diagrama de Conexiones

```mermaid
graph LR
    subgraph "Frontend"
        Pages[Páginas]
        Services[Services]
        Axios[Axios Client]
        Utils[Utils]
    end
    
    subgraph "Backend"
        Index[index.php]
        Controllers[Controllers]
        Services[Services]
        DbProvider[DbProvider]
        FileStorage[FileStorage]
    end
    
    subgraph "Infraestructura"
        MySQL[(MySQL)]
        Uploads[uploads/]
    end
    
    Pages --> Services
    Services --> Axios
    Pages --> Utils
    Axios --> Index
    Index --> Controllers
    Controllers --> Services
    Controllers --> DbProvider
    Controllers --> FileStorage
    DbProvider --> MySQL
    FileStorage --> Uploads
    
    style Pages fill:#e1f5ff
    style Controllers fill:#fff4e1
    style DbProvider fill:#f0e1ff
    style MySQL fill:#e1ffe1
```
