# Glosario Técnico - Fondo de Reposicion Gacela

## A

- **API**: Application Programming Interface - Interfaz de programación de aplicaciones. En este proyecto, API REST en PHP con Slim Framework.
- **ASP.NET Core**: Framework de Microsoft para aplicaciones web. Mencionado en documentación desactualizada, pero el backend actual es PHP.
- **AuthContext**: Componente de React Context API para manejo de estado global de autenticación. Archivo existe pero está vacío, no implementado.
- **AuthMiddleware**: Middleware PHP que implementa autenticación y autorización basada en JWT y permisos.
- **AuthService**: Servicio PHP que encapsula lógica de autenticación (login, validación de contraseña, generación de token).
- **Axios**: Cliente HTTP para JavaScript/TypeScript. Usado en frontend para comunicarse con la API backend.

## B

- **Backend**: Capa del servidor que contiene la API REST, lógica de negocio y acceso a datos. En este proyecto, PHP con Slim Framework en el directorio `api/`.
- **BCrypt**: Algoritmo de hashing de contraseñas. Usado en PasswordHasher.php para nuevos usuarios.
- **Body Parsing**: Middleware que parsea el cuerpo de las requests HTTP (JSON, form-data). Configurado en Slim Framework.

## C

- **Composer**: Gestor de dependencias para PHP. Similar a npm para Node.js.
- **Controller**: Capa que maneja requests HTTP y orquesta la lógica. En este proyecto, archivos en `api/src/Controllers/`.
- **CORS**: Cross-Origin Resource Sharing - Mecanismo de seguridad que permite o deniega requests de diferentes orígenes. Configurado en CorsMiddleware.php.
- **Csrf**: Cross-Site Request Forgery - Ataque de seguridad. El sistema es vulnerable debido a CORS demasiado permisivo.

## D

- **Dashboard**: Página principal del sistema que muestra métricas y KPIs del fondo de reposición.
- **DbProvider**: Clase PHP que implementa el patrón Repository para acceso a datos. Encapsula conexiones PDO y consultas SQL.
- **Dependency Injection**: Patrón de diseño donde las dependencias se inyectan en lugar de instanciarse internamente. Implementado en backend via constructor injection.
- **DTO**: Data Transfer Object - Objeto que transporta datos entre capas. No explícitamente usado, arrays asociativos cumplen este rol.

## E

- **ESLint**: Herramienta de linting para JavaScript/TypeScript. Configurado en frontend.
- **ESLint Flat Config**: Nueva configuración de ESLint (versión 9+). Usada en este proyecto.

## F

- **FileStorage**: Clase PHP que gestiona la subida y almacenamiento de archivos adjuntos.
- **Frontend**: Capa del cliente que contiene la interfaz de usuario. En este proyecto, React SPA en el directorio `Frontend/`.
- **FSR**: Fast Refresh React - Característica de Vite que permite actualizaciones rápidas sin perder estado. Configurado en ESLint.

## H

- **HMAC-SHA512**: Algoritmo de hashing. Usado en PasswordHasher.php para compatibilidad con contraseñas heredadas de ASP.NET.
- **Hook**: Función especial en React que permite usar estado y otras características de React. Ejemplo: useRetiros.
- **Http**: Clase PHP con utilidades HTTP (respuestas JSON, parsing de body).

## I

- **Inyección de Dependencias**: Ver Dependency Injection.
- **Index**: Punto de entrada del backend. En este proyecto, `api/index.php`.
- **JWT**: JSON Web Token - Token estándar para autenticación. Usado con algoritmo HS256 y validez de 8 horas.
- **JwtHelper**: Clase PHP que encapsula generación y validación de tokens JWT.

## J

- **JSON**: JavaScript Object Notation - Formato de intercambio de datos. Usado para todas las respuestas de la API.
- **jwt-decode**: Librería JavaScript para decodificar tokens JWT en el frontend.

## L

- **Login**: Proceso de autenticación donde el usuario ingresa credenciales y recibe un token.
- **LocalStorage**: API del navegador para almacenar datos persistentes. Usado para almacenar token JWT y datos de usuario.
- **LocalStorage Directo**: Acceso directo a localStorage desde múltiples componentes sin abstracción. Identificado como acoplamiento excesivo.

## M

- **Magic Bytes**: Primeros bytes de un archivo que identifican su tipo real. No validados en FileStorage.php (solo extensión).
- **Middleware**: Componente que procesa requests antes de que lleguen al controlador. Implementado con PSR-15 en Slim Framework.
- **Monolítico**: Arquitectura donde toda la aplicación es una sola unidad desplegable. Este proyecto es monolítico modular.
- **Mvc**: Model-View-Controller - Patrón de diseño. Este proyecto usa una variación: Controller-Service-Repository.

## N

- **Node.js**: Runtime de JavaScript para el servidor. Usado para desarrollo de frontend con Vite.
- **npm**: Gestor de paquetes para Node.js. Usado para instalar dependencias de frontend.

## O

- **OCP**: Open/Closed Principle - Principio SOLID. Parcialmente cumplido en este proyecto.
- **Options Method**: Método HTTP para CORS preflight. Implementado en index.php.

## P

- **Package.json**: Archivo de configuración de dependencias para Node.js.
- **PasswordHasher**: Clase PHP que encapsula hashing y verificación de contraseñas.
- **PDO**: PHP Data Objects - Abstracción de base de datos en PHP. Usado en DbProvider.
- **Permissions**: Permisos granulares del sistema (ej: USUARIO_CONSULTAR, VEHICULO_CONSULTAR).
- **Phpdotenv**: Librería PHP para cargar variables de entorno desde archivo .env.
- **PostCSS**: Herramienta de procesamiento CSS. Usado por Tailwind CSS.
- **ProtectedRoute**: Componente React que protege rutas basándose en autenticación y permisos.
- **ProtectedButton**: Componente React para botones protegidos por permisos. Existe pero no se usa.
- **PSR-7**: PHP Standard Recommendation 7 - Interfaces para HTTP messages. Usado por Slim Framework.
- **PSR-15**: PHP Standard Recommendation 15 - Interfaces para HTTP middleware. Implementado en AuthMiddleware.

## R

- **RBAC**: Role-Based Access Control - Control de acceso basado en roles. Implementado en este proyecto.
- **React**: Framework de JavaScript para construir interfaces de usuario. Versión 19.2.0.
- **Recharts**: Librería de gráficos para React. Usada en Dashboard.
- **Repository**: Patrón de diseño para abstraer acceso a datos. Implementado en DbProvider.
- **Retiros**: Operación de retirar dinero del fondo de reposición.
- **Roles**: Roles de usuario (ej: ADMIN, OPERADOR). Cada rol tiene permisos asignados.
- **Router**: Componente que maneja navegación en SPA. React Router DOM usado en este proyecto.
- **Routes**: Rutas definidas en React Router para navegación.

## S

- **Service**: Capa que contiene lógica de negocio. En este proyecto, archivos como AuthService, FileStorage.
- **Slim Framework**: Framework PHP micro para crear APIs REST. Versión 4.14.
- **Singleton**: Patrón de diseño. No implementado clásicamente, pero Config es pseudo-singleton estático.
- **SPA**: Single Page Application - Aplicación web que carga una sola página y actualiza dinámicamente. React SPA en este proyecto.
- **SRP**: Single Responsibility Principle - Principio SOLID. Cumplido en este proyecto.
- **Strategy**: Patrón de diseño. Implementado en PasswordHasher para soportar múltiples estrategias de hashing.

## T

- **Tailwind CSS**: Framework de utilidades CSS. Versión 4.1.18.
- **Token**: Ver JWT.
- **Transacción**: Operación atómica en base de datos. Solo implementada en cargue completo.

## U

- **Usuarios**: Tabla y entidad del sistema que representa usuarios autenticados.
- **Uploads**: Directorio donde se almacenan archivos adjuntos subidos por usuarios.

## V

- **Vehiculos**: Tabla y entidad del sistema que representa vehículos del sistema.
- **Vite**: Build tool y dev server para frontend. Versión 7.2.4.

## W

- **Webpack**: Bundler de JavaScript. No usado, Vite lo reemplaza.

## Y

- **Yarn**: Gestor de paquetes alternativo a npm. No usado, se usa npm.

## Z

- **Zustand**: Librería de gestión de estado para React. No usada, se usa useState local y localStorage.

## Términos Específicos del Dominio

- **Fondo de Reposición**: Fondo financiero para reposición de vehículos de transporte.
- **Placa**: Identificador único de vehículo (formato AAA-123).
- **Aporte**: Deposito de dinero al fondo de reposición.
- **Retiro**: Extracción de dinero del fondo de reposición.
- **Solicitud**: Petición de reposición con valor estimado.
- **Naturaleza**: Tipo de solicitante (propietario/apoderado/administrador).
- **Cargue Masivo**: Proceso de cargar múltiples movimientos desde archivo CSV.
- **Saldo Disponible**: Total aportes - Total retiros.
