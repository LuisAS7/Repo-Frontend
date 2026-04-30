import type  { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral" | "teal" | "purple";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    const variants = {
        default: "bg-blue-100 text-blue-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        danger: "bg-red-100 text-red-700",
        neutral: "bg-slate-100 text-slate-700",
        teal: "bg-teal-100 text-teal-700",
        purple: "bg-purple-100 text-purple-700",
    };

    return (
        <span
        className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            variants[variant],
            className
        )}
        >
        {children}
        </span>
    );
}