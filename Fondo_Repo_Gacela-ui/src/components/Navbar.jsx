export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex gap-4">
      <a href="/vehiculos">Vehículos</a>
      <a href="/usuarios">Usuarios</a>
      <a href="/roles">Roles</a>
      <a href="/dashboard">Dashboard</a>
    </nav>
  );
}
