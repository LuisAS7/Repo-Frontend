import type { ButtonHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
    const sizes: Record<string, string> = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
    };
    const variants: Record<string, string> = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400",
    };

    return (
        <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>
            {children}
        </button>
    );
}