import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Activity, Users, UserCog, LogOut, Menu, X, ClipboardList } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import type { User } from "../../types/auth";

export function Sidebar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/login");
    };

    const getNavigation = () => {
        if (!user) return [];
        
        switch (user.role) {
        case "admin":
            return [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { name: "Agenda General", href: "/admin/calendar", icon: Calendar },
            { name: "Personal", href: "/admin/staff", icon: UserCog },
            ];
        case "doctor":
            return [
            { name: "Mi Agenda", href: "/doctor/agenda", icon: Calendar },
            ];
        case "receptionist":
            return [
            { name: "Agenda Diaria", href: "/reception", icon: ClipboardList },
            { name: "Directorio de Pacientes", href: "/reception/directory", icon: Users },
            ];
        case "nurse":
            return [
            { name: "Fila de Triage", href: "/nurse", icon: Activity },
            ];
        default:
            return [];
        }
    };

    const navigation = getNavigation();

    return (
        <>
        {/* Mobile Menu Button */}
        <button
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-slate-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
        >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Sidebar Container */}
        <aside
            className={clsx(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xl tracking-tight">
                <Activity className="size-6 text-teal-500" strokeWidth={2.5} />
                ValSync
            </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navigation.map((item) => (
                <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/admin" || item.href === "/reception" || item.href === "/nurse"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                    clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )
                }
                >
                <item.icon
                    className={clsx("size-5", "shrink-0")}
                    aria-hidden="true"
                />
                {item.name}
                </NavLink>
            ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-200 shrink-0">
            <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                <LogOut className="size-5 shrink-0" aria-hidden="true" />
                Cerrar sesión
            </button>
            </div>
        </aside>

        {/* Mobile Backdrop */}
        {isOpen && (
            <div
            className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            />
        )}
        </>
    );
}