# Frontend - Fondo de Reposición Gacela

Aplicación React para la gestión del fondo de reposición de vehículos del Grupo Gacela.

## Tecnologías

- **React 19** - Framework UI
- **Vite 7** - Build tool y dev server
- **Tailwind CSS 4** - Framework de estilos
- **React Router DOM 7** - Enrutamiento
- **Recharts 3** - Gráficos para el dashboard
- **JWT Decode** - Decodificación de tokens

## Instalación

```bash
npm install
```

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint

## Configuración

La URL base de la API se configura en `src/api/axios.jsx`. Por defecto apunta a `http://192.168.10.142:5092/api`.

## Estructura del proyecto

```
src/
├── api/              # Cliente axios configurado
├── components/       # Componentes reutilizables
├── config/           # Configuración de menú y rutas
├── hooks/            # Custom hooks
├── Layouts/          # Layouts principales
├── pages/            # Páginas de la aplicación
├── Services/         # Servicios de API
└── Utils/            # Utilidades (auth, format)
```

## Documentación completa

Para más información sobre la arquitectura general, instalación del backend y configuración de la base de datos, consulta [DOCUMENTACION.md](../DOCUMENTACION.md)
