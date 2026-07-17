import type { InputHTMLAttributes, ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    icon?: ReactNode;
    wrapperClassName?: string;
};

export function Input({ label, icon, wrapperClassName, className, ...props }: InputProps) {
    return (
        <label className={wrapperClassName}>
            {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
        <div className="mt-2 relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">{icon}</div>}
            <input
                {...props}
                className={cn(
                    "w-full rounded-xl border px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none",
                    icon ? "pl-10" : "pl-3",
                    "border-slate-300 dark:border-slate-700",
                    className
                )}
            />
        </div>
        </label>
    );
}