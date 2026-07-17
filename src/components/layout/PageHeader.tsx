import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={["flex flex-col md:flex-row md:items-end justify-between gap-4", className].join(" ")}>
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}