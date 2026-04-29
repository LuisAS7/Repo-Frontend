import type { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
        {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return <div className={cn("px-6 py-5 border-b border-slate-100", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
    return <h3 className={cn("text-base font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardContent({ children, className }: CardProps) {
    return <div className={cn("p-6", className)}>{children}</div>;
}