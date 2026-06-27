import { useMemo } from "react";
import { Calendar, Users, XCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { storageService } from "../../services/storageService";

const getStatusBadge = (status: string) => {
    switch (status) {
        case "SCHEDULED": return <Badge variant="default">Programada</Badge>;
        case "WAITING": return <Badge variant="warning">En Espera</Badge>;
        case "READY": return <Badge variant="success">Listo para Consulta</Badge>;
        case "COMPLETED": return <Badge variant="success">Completada</Badge>;
        case "CANCELED": return <Badge variant="danger">Cancelada</Badge>;
        default: return <Badge variant="neutral">{status}</Badge>;
    }
};

export function Dashboard() {
    const appointments = useMemo(() => storageService.getAppointments(), []);

    // Calculate metrics for the dashboard
    const totalAppointments = appointments.length;
    const waitingPatients = appointments.filter(a => a.status === 'WAITING' || a.status === 'READY').length;
    const canceledAppointments = appointments.filter(a => a.status === 'CANCELED').length;

    // Only show the 5 most recent appointments
    const recentAppointments = [...appointments].reverse().slice(0, 5);

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
                <p className="text-sm font-medium text-slate-500">Citas Totales</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalAppointments}</h3>
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
                <h3 className="text-2xl font-bold text-slate-900">{waitingPatients}</h3>
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
                <h3 className="text-2xl font-bold text-slate-900">{canceledAppointments}</h3>
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
                {recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{apt.patient.firstName} {apt.patient.lastName}</td>
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