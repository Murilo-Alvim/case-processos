import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  GitBranchPlus,
  LayoutDashboard,
  Menu,
  Network,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/areas", label: "Áreas", icon: Building2 },
  { to: "/mapa", label: "Mapa de Processos", icon: Network },
  { to: "/ferramentas", label: "Ferramentas", icon: Wrench },
  { to: "/responsaveis", label: "Responsáveis", icon: Users },
];

export function Layout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentTitle =
    nav.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
    )?.label ?? "";

  // Close drawer when navigating
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Backdrop (mobile only) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-64 shrink-0 border-r border-line bg-panel/95 lg:bg-panel/60 backdrop-blur-xl flex flex-col transform transition-transform duration-200 ease-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-5 py-5 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow">
              <GitBranchPlus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-ink leading-tight">ProcessMap</div>
              <div className="text-[10px] uppercase tracking-widest text-muted">
                Stage Consulting
              </div>
            </div>
            <button
              className="lg:hidden text-muted hover:text-ink p-1.5 rounded-lg hover:bg-card"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-brand-500/15 text-brand-200 border border-brand-500/30"
                    : "text-muted hover:text-ink hover:bg-card border border-transparent"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="rounded-lg bg-gradient-to-br from-brand-700/30 to-brand-500/10 border border-brand-500/20 p-3">
            <p className="text-xs font-semibold text-brand-200">Case Full-Stack</p>
            <p className="text-[11px] text-muted mt-1 leading-relaxed">
              Mapeamento hierárquico de processos com visualização interativa.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 border-b border-line bg-panel/50 backdrop-blur-xl flex items-center px-4 sm:px-6 shrink-0 gap-3">
          <button
            className="lg:hidden text-muted hover:text-ink p-1.5 -ml-1.5 rounded-lg hover:bg-card"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm truncate">
            <span className="text-muted hidden sm:inline">Workspace</span>
            <span className="text-muted mx-2 hidden sm:inline">/</span>
            <span className="text-ink font-medium">{currentTitle}</span>
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted hidden md:inline">
              v1.0 • Stage Consulting
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-xs font-bold text-white">
              MA
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
