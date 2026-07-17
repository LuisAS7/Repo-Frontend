import { useState, useEffect } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/layout/PageHeader";
import { toast } from "react-hot-toast";
import { t } from "../../utils/translations";
import { useNotificationStore } from "../../context/useNotificationStore";
import { staffService } from "../../services/staffService";
import { catalogService } from "../../services/catalogService";
import { StaffFormModal } from "./components/StaffFormModal";
import type { StaffResponse, SpecialtyResponse } from "../../types/reception";

const getRoleBadge = (role: string) => {
  switch (role) {
    case "ADMIN":        return <Badge variant="default">Administrador</Badge>;
    case "DOCTOR":       return <Badge variant="teal">Médico</Badge>;
    case "NURSE":        return <Badge variant="purple">Enfermera(o)</Badge>;
    case "RECEPTIONIST": return <Badge variant="neutral">Recepcionista</Badge>;
    default:             return <Badge variant="neutral">{role}</Badge>;
  }
};

export function StaffPage() {
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Control del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffResponse | null>(null);
  
  const { addNotification } = useNotificationStore();

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, specialtiesData] = await Promise.all([
        staffService.getAll(),
        catalogService.getSpecialties(),
      ]);
      setStaff(staffData);
      setSpecialties(specialtiesData);
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || err.message || "Error al cargar datos";
      setError(message);
      toast.error(message);
      addNotification("error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [addNotification]);

  const handleOpenAdd = () => {
    setStaffToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employee: StaffResponse) => {
    setStaffToEdit(employee);
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await staffService.update(id, { is_active: !currentStatus });
      setStaff(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      const message = `Usuario ${!currentStatus ? "activado" : "desactivado"} correctamente`;
      toast.success(message);
      addNotification("success", message);
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || err.message || "Error al cambiar estado";
      toast.error(message);
      addNotification("error", message);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 dark:text-slate-500 animate-pulse">Cargando personal...</div>;
  if (error)   return <div className="p-12 text-center text-red-500 dark:text-red-400">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Usamos tu nuevo componente PageHeader */}
      <PageHeader 
        title="Gestión de Personal" 
        subtitle="Administración de usuarios y roles del sistema."
        actions={
          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="size-5 mr-2" /> Añadir Personal
          </Button>
        }
      />

      {/* Tabla con Modo Oscuro Integrado */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre del Empleado</th>
                <th className="px-6 py-4 font-medium">Correo Electrónico</th>
                <th className="px-6 py-4 font-medium">Rol Asignado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {staff.map(employee => (
                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {employee.first_name} {employee.last_name}
                    {employee.doctor_profile && (
                      <span className="block text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                        {t.catalog(employee.doctor_profile.specialty.name)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(employee.role)}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-4">
                    
                    {/* Botón de Editar */}
                    <button 
                      onClick={() => handleOpenEdit(employee)}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Editar usuario"
                    >
                      <Edit2 className="size-4" />
                    </button>

                    {/* Switch de Estado */}
                    <button
                      onClick={() => toggleStatus(employee.id, employee.is_active)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                      style={{ backgroundColor: employee.is_active ? "#14b8a6" : "#cbd5e1" }}
                      role="switch"
                      aria-checked={employee.is_active}
                      title={employee.is_active ? "Desactivar usuario" : "Activar usuario"}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${employee.is_active ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Independiente */}
      <StaffFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSaved={loadData}
        specialties={specialties}
        staffToEdit={staffToEdit}
      />
      
    </div>
  );
}