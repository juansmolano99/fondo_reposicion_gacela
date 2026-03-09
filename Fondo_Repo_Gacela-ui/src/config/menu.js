export const menuItems = [
  {
    label: "Dashboard",  // Aquí añadimos el enlace al Dashboard
    path: "/",
    icon: "DASHBOARD",
  },
  {
    label: "Consultar Vehículo",
    path: "/vehiculos",
    permiso: "VEHICULO_CONSULTAR",
  },
  // Eliminamos o modificamos el enlace de Detalle Anual
  // {
  //   label: "Detalle Anual",
  //   path: "/vehiculos/detalle",
  //   permiso: "VEHICULO_DETALLE",
  // },
    {
    label: "Usuarios",
    path: "/usuarios",
    permiso: "USUARIO_CREAR",
  },
  {
    label: "Roles y Permisos",
    path: "/roles",
    permiso: "USUARIO_EDITAR",
  },
  {
    label: "Cargue de datos",
    path: "/fondo/cargue",
    permiso: "VEHICULO_CONSULTAR",
  },
];
