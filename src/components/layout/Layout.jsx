import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex flex-col h-screen">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 p-6 ${
            !sidebarOpen ? "ml-0" : "ml-32"
          } transition-all duration-300`}
        >
          <Outlet />
        </main>
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
export default Layout;