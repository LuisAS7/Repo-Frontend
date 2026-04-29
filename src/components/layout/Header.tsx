import { Bell, Moon, Sun } from "lucide-react";
import type { User } from "../../types/auth";
import { useEffect, useState } from "react";

export function Header({ user }: { user: User | null }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
        setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        setIsDark(false);
        } else {
        root.classList.add('dark');
        setIsDark(true);
        }
    };
    
    if (!user) return null;

    const roleLabels: Record<string, string> = {
        admin: "Administrador",
        doctor: "Médico",
        recepcionist: "Recepción",
        nurse: "Enfermería"
    };

    const initials = user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-4 md:px-6 lg:px-8 shrink-0 transition-colors">
        <div className="flex items-center gap-6">
            {/* Dark Mode Toggle */}
            <button
            onClick={toggleDarkMode}
            className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Toggle Dark Mode"
            >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            {/* Notifications */}
            <button 
            className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Notificaciones"
            >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

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