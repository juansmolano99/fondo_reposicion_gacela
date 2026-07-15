export const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: "dashboard",
    categoria: "principal",
  },
  {
    label: "Consultar Vehículo",
    path: "/vehiculos",
    permiso: "VEHICULO_CONSULTAR",
    icon: "directions_car",
    categoria: "operaciones",
  },
  {
    label: "Cargue de datos",
    path: "/fondo/cargue",
    permiso: "VEHICULO_CONSULTAR",
    icon: "upload_file",
    categoria: "operaciones",
  },
  {
    label: "Solicitudes",
    path: "/solicitudes",
    permiso: "VEHICULO_CONSULTAR",
    icon: "upload_file",
    categoria: "operaciones",
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    permiso: "USUARIO_CREAR",
    icon: "group",
    categoria: "soporte",
  },
  {
    label: "Roles y Permisos",
    path: "/roles",
    permiso: "USUARIO_EDITAR",
    icon: "admin_panel_settings",
    categoria: "soporte",
  },
];