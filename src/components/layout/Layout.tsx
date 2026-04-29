import { Outlet, Navigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { User } from "../../types/auth";

export function Layout({ user, onLogout }: { user: User | null; onLogout: () => void }) {

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
        <Sidebar user={user} onLogout={onLogout}/>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header user={user}/>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Outlet />
            </main>
        </div>
        </div>
    );
}