import { useEffect } from "react";

export default function UnauthorizedPage() {

    useEffect(() => {
        const timer = setTimeout(() => {
        window.location.href = "/";
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                    Módulo no disponible
                </h1>
                <p className="text-slate-500 mt-2">
                    Este rol aún no tiene panel asignado.
                </p>

                <button
                    onClick={() => (window.location.href = "/")}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Volver al Inicio
                </button>
            </div>
        </div>
    );
}
