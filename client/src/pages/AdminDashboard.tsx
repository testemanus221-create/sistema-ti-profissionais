import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Briefcase, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AreasManagement from "@/components/admin/AreasManagement";
import EstadosManagement from "@/components/admin/EstadosManagement";
import CidadesManagement from "@/components/admin/CidadesManagement";
import MunicipiosManagement from "@/components/admin/MunicipiosManagement";
import ProfissionaisManagement from "@/components/admin/ProfissionaisManagement";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("areas");

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const tabs = [
    { id: "areas", label: "Áreas de Atuação" },
    { id: "estados", label: "Estados" },
    { id: "cidades", label: "Cidades" },
    { id: "municipios", label: "Municípios" },
    { id: "profissionais", label: "Profissionais" },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Briefcase size={24} />
              <span className="font-bold">TechConnect</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600'
                  : 'hover:bg-slate-800'
              }`}
              title={tab.label}
            >
              {sidebarOpen ? tab.label : tab.label.charAt(0)}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            {sidebarOpen && "Sair"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "areas" && <AreasManagement />}
          {activeTab === "estados" && <EstadosManagement />}
          {activeTab === "cidades" && <CidadesManagement />}
          {activeTab === "municipios" && <MunicipiosManagement />}
          {activeTab === "profissionais" && <ProfissionaisManagement />}
        </div>
      </main>
    </div>
  );
}
