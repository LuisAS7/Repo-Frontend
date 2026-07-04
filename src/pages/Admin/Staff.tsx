import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { toast } from "react-hot-toast";
import {t} from "../../utils/translations";
import { useNotificationStore } from "../../context/useNotificationStore";
import { staffService } from "../../services/staffService";
import { catalogService } from "../../services/catalogService";
import type { StaffResponse, SpecialtyResponse, StaffRole } from "../../types/reception";

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
  const [staff, setStaff]               = useState<StaffResponse[]>([])
  const [specialties, setSpecialties]   = useState<SpecialtyResponse[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [submitting, setSubmitting]     = useState(false)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const { addNotification } = useNotificationStore()

  // Form state
  const [firstName, setFirstName]   = useState("")
  const [lastName, setLastName]     = useState("")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [selectedRole, setSelectedRole] = useState<StaffRole | "">("")
  const [medicalLicense, setMedicalLicense] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
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
    load();
  }, [addNotification]);

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPassword("")
    setSelectedRole(""); setMedicalLicense(""); setSelectedSpecialty("")
  }

  const handleCloseModal = () => { setIsModalOpen(false); resetForm() }

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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: selectedRole,
        is_active: true,
      };

      if (selectedRole === "DOCTOR") {
        payload.doctor_profile = {
          medical_license: medicalLicense,
          specialty_id: selectedSpecialty,
        };
      }

      const newStaff = await staffService.create(payload);
      setStaff(prev => [newStaff, ...prev]);
      handleCloseModal();
      toast.success("Personal creado correctamente");
      addNotification("success", "Personal creado correctamente");
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || err.message || "Error al crear el personal";
      toast.error(message);
      addNotification("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando personal...</div>
  if (error)   return <div className="p-12 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Personal</h1>
          <p className="text-slate-500 mt-1">Administración de usuarios y roles del sistema.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
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
              {staff.map(employee => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {employee.first_name} {employee.last_name}
                    {employee.doctor_profile && (
                      <span className="block text-xs text-slate-400 font-normal">
                        {employee.doctor_profile.specialty.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{employee.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(employee.role)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleStatus(employee.id, employee.is_active)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      style={{ backgroundColor: employee.is_active ? "#14b8a6" : "#cbd5e1" }}
                      role="switch"
                      aria-checked={employee.is_active}
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

      <Modal
        open={isModalOpen}
        onOpenChange={open => !open && handleCloseModal()}
        title="Añadir Nuevo Personal"
        description="Crea una nueva cuenta para que un miembro del staff pueda acceder a ValSync."
      >
        <form className="space-y-4" onSubmit={handleAddStaff}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input
                type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Apellido</label>
              <input
                type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contraseña Provisional</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rol del Sistema</label>
            <select
              value={selectedRole}
              onChange={e => { setSelectedRole(e.target.value as StaffRole); setMedicalLicense(""); setSelectedSpecialty("") }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="" disabled>Seleccionar rol...</option>
              <option value="ADMIN">Administrador</option>
              <option value="DOCTOR">Médico</option>
              <option value="NURSE">Enfermera(o)</option>
              <option value="RECEPTIONIST">Recepcionista</option>
            </select>
          </div>

          {selectedRole === "DOCTOR" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Número de Licencia Médica</label>
                <input
                  type="text" value={medicalLicense} onChange={e => setMedicalLicense(e.target.value)}
                  placeholder="Ej: CMP-12345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Especialidad</label>
                <select
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="" disabled>Seleccionar especialidad...</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button" onClick={handleCloseModal}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Guardar Personal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}