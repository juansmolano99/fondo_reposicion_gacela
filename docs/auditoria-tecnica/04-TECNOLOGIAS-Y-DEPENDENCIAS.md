# Tecnologías y Dependencias - Fondo de Reposicion Gacela

## 1. Tecnologías Frontend

### 1.1 Framework y Build Tools

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| React | ^19.2.0 | Framework UI | package.json |
| React DOM | ^19.2.0 | Renderizado React | package.json |
| Vite | ^7.2.4 | Build tool y dev server | package.json |
| React Router DOM | ^7.12.0 | Enrutamiento SPA | package.json |

### 1.2 Estilos

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| Tailwind CSS | ^4.1.18 | Framework de estilos | package.json |
| @tailwindcss/vite | Latest | Plugin Vite para Tailwind 4 | package.json |
| @tailwindcss/postcss | Latest | Plugin PostCSS para Tailwind 4 | package.json |

### 1.3 Utilidades

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| Recharts | ^3.7.0 | Gráficos para dashboard | package.json |
| jwt-decode | ^4.0.0 | Decodificación de tokens JWT | package.json |
| Axios | ^1.x | Cliente HTTP (usado implícitamente) | package.json (no visible, código sí) |

### 1.4 Calidad de Código

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| ESLint | ^9.39.1 | Linting de JavaScript | package.json |

---

## 2. Tecnologías Backend

### 2.1 Framework y Core

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| PHP | >= 8.2 | Lenguaje de programación | composer.json |
| Slim Framework | ^4.14 | Framework API REST | composer.json |
| Slim PSR-7 | ^1.7 | Implementación PSR-7 | composer.json |

### 2.2 Autenticación y Seguridad

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| Firebase JWT | ^6.10 | Generación/validación JWT | composer.json |
| PHP dotenv | ^5.6 | Carga de variables de entorno | composer.json |

### 2.3 Base de Datos

| Tecnología | Versión | Propósito | Fuente |
|-----------|---------|-----------|--------|
| PDO | Extensión PHP | Abstracción de base de datos | DbProvider.php |
| pdo_mysql | Extensión PHP | Driver MySQL | Config.php |

### 2.4 Extensiones PHP Requeridas

| Extensión | Propósito |
|-----------|-----------|
| ext-pdo | Abstracción de base de datos |
| ext-pdo_mysql | Driver MySQL |
| ext-json | Manipulación JSON |
| ext-fileinfo | Validación de tipos de archivo (recomendado, no usado) |

---

## 3. Dependencias de Desarrollo

### Frontend

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| eslint | ^9.39.1 | Linting |
| globals | Latest | Variables globales ESLint |
| eslint-plugin-react-hooks | Latest | Reglas React Hooks |
| eslint-plugin-react-refresh | Latest | Optimización React Refresh |

### Backend

No hay dependencias de desarrollo explícitas en composer.json.

---

## 4. Configuraciones de Build

### Frontend (Vite)

**Archivo:** `Frontend/vite.config.js`

- Plugin: React
- Puerto: 5173 (default)
- Proxy: No configurado (axios directo)

### Backend (PHP)

**Archivo:** `api/index.php`

- Punto de entrada: index.php
- Router: Slim 4
- Error handling: JSON con detalles

---

## 5. Versiones Mínimas Requeridas

| Herramienta | Versión Mínima | Motivo |
|-------------|---------------|--------|
| PHP | 8.2 | Constructor properties, types estrictos |
| Node.js | 18 | Vite 7 requiere Node 18+ |
| npm | 9 | Gestión de dependencias modernas |
| Composer | 2 | Gestión de dependencias PHP |
| MySQL | 5.7+ / MariaDB 10.3+ | Soporte de características usadas |

---

## 6. Dependencias Transitivas

### Frontend

Vite 7 instala automáticamente:
- esbuild (minificación)
- postcss (procesamiento CSS)
- rollup (bundling)

### Backend

Slim 4 instala automáticamente:
- nyholm/psr-7 (implementación PSR-7)
- php-di (contenedor de inyección de dependencias, si se usa)
- slim/psr-7 (middleware PSR-7)

---

## 7. Licencias

Las dependencias principales tienen licencias permissivas (MIT, Apache 2.0, BSD), compatibles con uso comercial.
