import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
}

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
    useEffect(() => {
        if (open) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "unset";
        }
        return () => {
        document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Overlay/Backdrop: Lo hacemos un poquitito más oscuro en Dark Mode para resaltar la caja */}
        <div 
            className="absolute inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm transition-opacity" 
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
        />
        
        {/* Caja Principal del Modal: Aquí está la magia del fondo oscuro y borde sutil */}
        <div 
            className="relative bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
        >
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="pr-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                )}
            </div>
            <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                aria-label="Cerrar modal"
            >
                <X className="size-5" />
            </button>
            </div>
            
            {/* Contenido (Children) */}
            <div className="p-6 overflow-y-auto flex-1">
            {children}
            </div>
        </div>
        </div>
    );
}