import { Calendar, Users, XCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const appointments = [
    { id: 1, patient: "María García", time: "09:00 AM", doctor: "Dr. Torres", status: "scheduled" },
    { id: 2, patient: "Juan Pérez", time: "09:15 AM", doctor: "Dra. Ruiz", status: "waiting" },
    { id: 3, patient: "Ana López", time: "09:30 AM", doctor: "Dr. Torres", status: "completed" },
    { id: 4, patient: "Carlos Díaz", time: "10:00 AM", doctor: "Dra. Ruiz", status: "canceled" },
    { id: 5, patient: "Elena Silva", time: "10:15 AM", doctor: "Dr. Méndez", status: "scheduled" },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "scheduled": return <Badge variant="default">Programada</Badge>;
        case "waiting": return <Badge variant="warning">En Espera</Badge>;
        case "completed": return <Badge variant="success">Completada</Badge>;
        case "canceled": return <Badge variant="danger">Cancelada</Badge>;
        default: return <Badge variant="neutral">{status}</Badge>;
    }
};

export function Dashboard() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Resumen general de la clínica de hoy.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="size-6" />
                </div>
                <div>
                <p className="text-sm font-medium text-slate-500">Citas de Hoy</p>
                <h3 className="text-2xl font-bold text-slate-900">42</h3>
                </div>
            </CardContent>
            </Card>
            
            <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Users className="size-6" />
                </div>
                <div>
                <p className="text-sm font-medium text-slate-500">Pacientes en Espera</p>
                <h3 className="text-2xl font-bold text-slate-900">8</h3>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <XCircle className="size-6" />
                </div>
                <div>
                <p className="text-sm font-medium text-slate-500">Citas Canceladas</p>
                <h3 className="text-2xl font-bold text-slate-900">3</h3>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Recent Appointments Table */}
        <Card>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Citas Recientes</h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-3 font-medium">Paciente</th>
                    <th className="px-6 py-3 font-medium">Hora</th>
                    <th className="px-6 py-3 font-medium">Médico Asignado</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{apt.patient}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.time}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.doctor}</td>
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </Card>
        </div>
    );
}