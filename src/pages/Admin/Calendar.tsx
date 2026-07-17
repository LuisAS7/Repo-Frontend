import { useState, useEffect, useMemo } from "react";
import { Search, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";
import { toast } from "react-hot-toast";
import { useNotificationStore } from "../../context/useNotificationStore";
import { t } from "../../utils/translations";
import { staffService } from "../../services/staffService";

import { SearchableDropdown, type SearchableDropdownOption } from "../../components/ui/SearchableDropdown";
import { Input } from "../../components/ui/Input";
import { StatusBadge } from "../../components/ui/StatusBadge";

import type { AppointmentResponse, PatientResponse, StaffResponse } from "../../types/reception";

export function CalendarPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients] = useState<Map<string, PatientResponse>>(new Map());
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useNotificationStore();

  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas las especialidades");
  const [selectedDoctor, setSelectedDoctor] = useState("Todos los médicos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [appts, pats, staffData] = await Promise.all([
          appointmentService.getAll(),
          patientService.getAll(),
          staffService.getAll(),
        ]);
        setAppointments(appts);
        setPatients(new Map(pats.map(p => [p.id, p])));
        setStaff(staffData.filter(s => s.role === "DOCTOR" && s.is_active));
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

  const specialtyOptions = useMemo<SearchableDropdownOption[]>(() => {
    const uniqueSpecialties = Array.from(
      new Set(
        staff
          .map((s) => s.doctor_profile?.specialty.name)
          .filter(Boolean) as string[]
      )
    ).sort();

    return [
      { value: "Todas las especialidades", label: "Todas las especialidades" },
      ...uniqueSpecialties.map((name) => ({
        value: name,
        label: t.catalog(name),
      })),
    ];
  }, [staff]);

  const doctorOptions = useMemo<SearchableDropdownOption[]>(() => [
    { value: "Todos los médicos", label: "Todos los médicos" },
    ...staff.map((s) => ({
      value: `${s.first_name} ${s.last_name}`,
      label: `${s.first_name} ${s.last_name}`,
    })),
  ], [staff]);
  
  const getDoctorById = (doctorId: string | null) => {
    if (!doctorId) return null;
    return staff.find(s => s.id === doctorId) ?? null;
  };

  const getPatientName = (patientId: string) => {
    const p = patients.get(patientId);
    return p ? `${p.first_name} ${p.last_name}` : "Cargando...";
  };

  const filteredSchedule = useMemo(() => {
    return appointments.filter(item => {
      const doctor = getDoctorById(item.doctor_id);
      const doctorName = doctor ? `${doctor.first_name} ${doctor.last_name}` : "";
      const specialty = doctor?.doctor_profile?.specialty.name ?? "Sin Asignar";

      const matchSpecialty = selectedSpecialty === "Todas las especialidades" || specialty === selectedSpecialty;
      const matchDoctor    = selectedDoctor === "Todos los médicos" || doctorName === selectedDoctor;

      const patientName = getPatientName(item.patient_id).toLowerCase();
      const matchSearch  = patientName.includes(searchTerm.toLowerCase());

      return matchSpecialty && matchDoctor && matchSearch;
    });
  }, [appointments, selectedSpecialty, selectedDoctor, searchTerm, staff, patients]);

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando agenda...</div>;
  if (error)   return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Supervisión de Agenda General
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Supervisión clínica de todas las citas y especialidades.
        </p>
      </div>

      {/* Summary Cards */}
      <Card className="shrink-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="p-5 flex flex-col lg:flex-row gap-4 justify-between items-end bg-slate-50 dark:bg-slate-800/50 rounded-xl m-1 border border-slate-100 dark:border-slate-800">
          
          <div className="grid gap-4 md:grid-cols-2 flex-1 w-full">
            <SearchableDropdown
              label="Especialidad"
              value={selectedSpecialty}
              options={specialtyOptions}
              onChange={setSelectedSpecialty}
              placeholder="Buscar especialidad..."
            />
            <SearchableDropdown
              label="Médico"
              value={selectedDoctor}
              options={doctorOptions}
              onChange={setSelectedDoctor}
              placeholder="Buscar médico..."
            />
          </div>

          {/* El Input ahora tiene Label, por lo que se alineará perfecto con los dropdowns */}
          <div className="w-full lg:w-72">
            <Input 
              label="Paciente"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

        </div>
      </Card>

      {/* Schedule List */}
      <Card className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Horario General
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Mostrando {filteredSchedule.length} citas
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {filteredSchedule.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No se encontraron citas con los filtros seleccionados.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredSchedule.map(item => {
                const doctor = getDoctorById(item.doctor_id);
                const doctorName = doctor ? `${doctor.first_name} ${doctor.last_name}` : "Sin asignar";
                const docInitials = doctorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                
                // 1. OBTENEMOS Y TRADUCIMOS LA ESPECIALIDAD AQUÍ
                const rawSpecialty = doctor?.doctor_profile?.specialty.name;
                const translatedSpecialty = rawSpecialty ? t.catalog(rawSpecialty) : "Sin Asignar";

                return (
                  <div key={item.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-slate-600 dark:text-slate-400 font-medium">
                      <Clock className="size-4 text-slate-400" />
                      {item.scheduled_time.slice(0, 5)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {getPatientName(item.patient_id)}
                      </p>
                      {/* Renderizamos la especialidad traducida */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {translatedSpecialty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-48 shrink-0">
                      <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {docInitials}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium">{doctorName}</span>
                    </div>

                    <div className="w-28 shrink-0 text-right sm:text-left">
                      {/* 2. USAMOS TU COMPONENTE GLOBAL AQUI */}
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}