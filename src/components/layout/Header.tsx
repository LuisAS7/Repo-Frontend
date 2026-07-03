import { Bell, Moon, Sun, CheckCircle, AlertCircle, Info, AlertTriangle, CheckCheck, Trash2 } from "lucide-react";
import type { User } from "../../types/auth";
import { useEffect, useState, useRef } from "react";
import { useNotificationStore } from "../../context/useNotificationStore";

// Función para obtener un saludo basado en la hora del día
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 20) return "Buenas tardes";
    return "Buenas noches";
}

// Función para obtener el icono correspondiente al tipo de notificación
const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircle className="size-5 text-green-500" />;
        case 'error': return <AlertCircle className="size-5 text-red-500" />;
        case 'warning': return <AlertTriangle className="size-5 text-amber-500" />;
        default: return <Info className="size-5 text-blue-500" />;
    }
};

export function Header({ user }: { user: User | null }) {
    const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {notifications, markAsRead, markAllAsRead, clearNotifications, getUnreadCount} = useNotificationStore();
    const unreadCount = getUnreadCount();

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    // Cierra el dropdown de notificaciones al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotiOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDarkMode = () => {
        setIsDark(prev => !prev);
    };
    
    if (!user) return null;

    const roleLabels: Record<string, string> = {
        admin: "Administrador",
        doctor: "Médico",
        receptionist: "Recepción",
        nurse: "Enfermería"
    };

    const initials = user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 transition-colors">
            {/* Greeting */}
            <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400">
                {getGreeting()},{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
            </p>

            <div className="flex items-center gap-6">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                    aria-label="Toggle Dark Mode"
                >
                    {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsNotiOpen(!isNotiOpen)}
                        className={`relative p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full ${isNotiOpen ? 'text-blue-600 bg-blue-50 dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        aria-label="Notificaciones"
                    >
                        <Bell className="size-5" />
                        {/* El puntito rojo solo aparece si hay no leídas */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex size-4 items-center justify-center bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 text-[9px] font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Menú Desplegable */}
                    {isNotiOpen && (
                        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notificaciones</h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors" title="Marcar todas como leídas">
                                            <CheckCheck className="size-4" />
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button onClick={clearNotifications} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors" title="Limpiar historial">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="overflow-y-auto overflow-x-hidden flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        <Bell className="size-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No tienes notificaciones nuevas</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => !notif.read && markAsRead(notif.id)}
                                                className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className="shrink-0 mt-0.5">
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notif.read ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="shrink-0 size-2 bg-blue-500 rounded-full mt-1.5" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-6">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none mb-1">
                            {user.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 leading-none">
                            {roleLabels[user.role]}
                        </span>
                    </div>
                    <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}