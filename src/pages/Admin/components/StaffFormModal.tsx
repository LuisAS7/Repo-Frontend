import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { SearchableDropdown } from "../../../components/ui/SearchableDropdown";
import { useNotificationStore } from "../../../context/useNotificationStore";
import { staffService } from "../../../services/staffService";
import { t } from "../../../utils/translations";
import type { StaffResponse, SpecialtyResponse, StaffRole } from "../../../types/reception";

interface StaffFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
    specialties: SpecialtyResponse[];
    staffToEdit: StaffResponse | null; 
}

export function StaffFormModal({
    open,
    onOpenChange,
    onSaved,
    specialties,
    staffToEdit,
    }: StaffFormModalProps) {
    const { addNotification } = useNotificationStore();
    const [submitting, setSubmitting] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<StaffRole | "">("");
    const [medicalLicense, setMedicalLicense] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("");

    const isEditing = !!staffToEdit;

    useEffect(() => {
        if (open) {
        if (staffToEdit) {
            setFirstName(staffToEdit.first_name);
            setLastName(staffToEdit.last_name);
            setEmail(staffToEdit.email);
            setPassword(""); 
            setSelectedRole(staffToEdit.role);
            
            if (staffToEdit.doctor_profile) {
            setMedicalLicense(staffToEdit.doctor_profile.medical_license);
            setSelectedSpecialty(staffToEdit.doctor_profile.specialty_id);
            } else {
            setMedicalLicense("");
            setSelectedSpecialty("");
            }
        } else {
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setSelectedRole("");
            setMedicalLicense("");
            setSelectedSpecialty("");
        }
        }
    }, [open, staffToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        
        setSubmitting(true);
        
        try {
        const payload: any = {
            first_name: firstName,
            last_name: lastName,
            email,
            role: selectedRole,
        };

        if (password) payload.password = password;

        if (selectedRole === "DOCTOR") {
            payload.doctor_profile = {
            medical_license: medicalLicense,
            specialty_id: selectedSpecialty,
            };
        }

        if (isEditing) {
            await staffService.update(staffToEdit.id, payload);
            toast.success("Personal actualizado correctamente");
            addNotification("success", `Perfil de ${firstName} actualizado`);
        } else {
            payload.is_active = true;
            await staffService.create(payload);
            toast.success("Personal añadido correctamente");
            addNotification("success", `Nuevo usuario creado: ${firstName} ${lastName}`);
        }
        
        onSaved(); 
        onOpenChange(false);
        } catch (err: any) {
        const message = t.error(err.response?.data?.detail) || err.message || "Error al procesar la solicitud";
        toast.error(message);
        addNotification("error", message);
        } finally {
        setSubmitting(false);
        }
    };

    const specialtyOptions = specialties.map(s => ({
        value: s.id,
        label: t.catalog(s.name)
    }));

    const roleOptions = [
        { value: "ADMIN", label: "Administrador" },
        { value: "DOCTOR", label: "Médico" },
        { value: "NURSE", label: "Enfermera(o)" },
        { value: "RECEPTIONIST", label: "Recepcionista" }
    ];

    return (
        <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={isEditing ? "Editar Personal" : "Añadir Nuevo Personal"}
        description={isEditing ? "Actualiza los datos del usuario." : "Crea una nueva cuenta para que un miembro del staff acceda a ValSync."}
        >
        <form className="space-y-5 mt-2" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <Input label="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>

            <Input type="email" label="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} required />

            <Input 
            type="password" 
            label={isEditing ? "Nueva Contraseña (Opcional)" : "Contraseña Provisional"} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required={!isEditing} 
            placeholder={isEditing ? "Dejar en blanco para mantener la actual" : "Mínimo 8 caracteres"}
            />

            {/* Separador oscuro sutil */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <SearchableDropdown
                label="Rol del Sistema"
                placeholder="Seleccione un rol..."
                value={selectedRole}
                options={roleOptions}
                onChange={(val) => {
                setSelectedRole(val as StaffRole);
                if (val !== "DOCTOR") {
                    setMedicalLicense("");
                    setSelectedSpecialty("");
                }
                }}
                disabled={isEditing} 
            />
            </div>

            {selectedRole === "DOCTOR" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 mt-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                <Input 
                label="Licencia Médica" 
                placeholder="Ej: CMP-12345" 
                value={medicalLicense} 
                onChange={e => setMedicalLicense(e.target.value)} 
                required 
                />
                <SearchableDropdown
                label="Especialidad"
                placeholder="Seleccione especialidad..."
                value={selectedSpecialty}
                options={specialtyOptions}
                onChange={setSelectedSpecialty}
                />
            </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !selectedRole}>
                {submitting ? "Guardando..." : isEditing ? "Actualizar Cambios" : "Guardar Personal"}
            </Button>
            </div>
        </form>
        </Modal>
    );
}