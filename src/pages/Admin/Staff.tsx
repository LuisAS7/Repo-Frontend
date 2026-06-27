import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { storageService } from "../../services/storageService";
import type { Staff } from "../../services/storageService";

const getRoleBadge = (role: string) => {
    switch (role) {
        case "Admin": return <Badge variant="default">Administrador</Badge>;
        case "Doctor": return <Badge variant="teal">Médico</Badge>;
        case "Nurse": return <Badge variant="purple">Enfermera(o)</Badge>;
        case "Receptionist": return <Badge variant="neutral">Recepcionista</Badge>;
        default: return <Badge variant="neutral">{role}</Badge>;
    }
};

export function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>(() => storageService.getStaff());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    const toggleStatus = (id: number) => {
        storageService.toggleStaffStatus(id); // Update status in storage
        setStaff(storageService.getStaff());
    };

    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();
        
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const specialtyElement = document.getElementById('specialty') as HTMLSelectElement | null;

        const newEmployee: Staff = {
            id: Date.now(),
            name: `${firstName} ${lastName}`,
            email: email,
            role: selectedRole,
            active: true,
            specialty: specialtyElement ? specialtyElement.value : undefined
        };

        storageService.addStaff(newEmployee);
        setStaff(storageService.getStaff()); // Refresh table
        setIsModalOpen(false);
        setSelectedRole("");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-end">
            <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Personal</h1>
            <p className="text-slate-500 mt-1">Administración de usuarios y roles del sistema.</p>
            </div>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
            <Plus className="size-5" />
            Añadir Personal
            </button>
        </div>

        <Card>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-medium">Nombre del Empleado</th>
                    <th className="px-6 py-4 font-medium">Correo Electrónico</th>
                    <th className="px-6 py-4 font-medium">Rol Asignado</th>
                    <th className="px-6 py-4 font-medium text-right">Estado</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {staff.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                        {employee.name}
                        {employee.specialty && <span className="block text-xs text-slate-400 font-normal">{employee.specialty}</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{employee.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(employee.role)}</td>
                    <td className="px-6 py-4 text-right">
                        <button
                        onClick={() => toggleStatus(employee.id)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        style={{ backgroundColor: employee.active ? '#14b8a6' : '#cbd5e1' }}
                        role="switch"
                        aria-checked={employee.active}
                        aria-label={`Toggle status for ${employee.name}`}
                        >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            employee.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </Card>

        <Modal 
            open={isModalOpen} 
            onOpenChange={setIsModalOpen}
            title="Añadir Nuevo Personal"
            description="Crea una nueva cuenta para que un miembro del staff pueda acceder a ValSync."
        >
            <form className="space-y-4" onSubmit={handleAddStaff}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="firstName">Nombre</label>
                <input id="firstName" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="lastName">Apellido</label>
                <input id="lastName" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Correo Electrónico</label>
                <input id="email" type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">Contraseña Provisional</label>
                <input id="password" type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="role">Rol del Sistema</label>
                <select 
                id="role" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                required 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                >
                <option value="" disabled>Seleccionar rol...</option>
                <option value="Admin">Administrador</option>
                <option value="Doctor">Médico</option>
                <option value="Nurse">Enfermera(o)</option>
                <option value="Receptionist">Recepcionista</option>
                </select>
            </div>

            {selectedRole === "Doctor" && (
                <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="specialty">Especialidad</label>
                <select 
                    id="specialty" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                    required 
                    defaultValue=""
                >
                    <option value="" disabled>Seleccionar especialidad...</option>
                    <option value="Cardiology">Cardiología</option>
                    <option value="Pediatrics">Pediatría</option>
                    <option value="General Medicine">Medicina General</option>
                    <option value="Dermatology">Dermatología</option>
                    <option value="Neurology">Neurología</option>
                </select>
                </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                Cancelar
                </button>
                <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                Guardar Personal
                </button>
            </div>
            </form>
        </Modal>
        </div>
    );
}