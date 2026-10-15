# Guía de Despliegue en SiteGround - API PHP Fondo de Reposición Gacela


## 🚀 Pasos de Despliegue en SiteGround

### 1. Preparación del Entorno

SiteGround utiliza un stack LAMP estándar. Verificar que tu plan incluya:
- PHP 8.2 o superior
- MySQL 5.7 o superior / MariaDB 10.3+
- Acceso SSH (opcional pero recomendado)

### 2. Subida de Archivos

#### Opción A: Via cPanel File Manager
1. Acceder a cPanel → File Manager
2. Navegar a `public_html` o el subdominio deseado
3. Crear carpeta `api` (si no existe)
4. Subir todo el contenido de la carpeta `/api` local:
   - `composer.json` y `composer.lock`
   - `index.php`
   - `.htaccess`
   - Carpeta `src/` completa
   - Carpeta `uploads/` completa
   - `.env.example` (como base para crear `.env`)

