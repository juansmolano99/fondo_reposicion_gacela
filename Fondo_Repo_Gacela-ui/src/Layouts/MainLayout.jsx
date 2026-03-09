import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { logout } from "../Utils/auth";

export default function MainLayout() {

  const onLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-slate-950">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
