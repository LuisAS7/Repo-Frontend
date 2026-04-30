import { useEffect, useState } from "react"
import { UserPlus, UserCheck } from "lucide-react"
import { StatusBadge } from "./components/StatusBadge"
import { FilterBar } from "./components/FilterBar"
import { WalkInModal } from "./components/WalkInModal"
import { storageService } from "../../services/storageService"
import { format } from "date-fns"

const doctorsData = [
  { id: "1", name: "Dr. Torres", specialty: "Medicina General" },
  { id: "2", name: "Dra. Ruiz", specialty: "Pediatría" },
  { id: "3", name: "Dr. Burke", specialty: "Cardiología" },
  { id: "4", name: "Dra. Fernández", specialty: "Dermatología" },
  { id: "5", name: "Dr. Shepard", specialty: "Neurología" },
]

const specialtiesList = Array.from(new Set(doctorsData.map(d => d.specialty)))

export function ReceptionPage() {
  const [queue, setQueue] = useState(() => storageService.getAppointments())
  
  // Update localStorage whenever queue changes
  useEffect(() => {
    setQueue(storageService.getAppointments());
  }, []);

  const [filterDoctor, setFilterDoctor] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("")
  const [isWalkInOpen, setIsWalkInOpen] = useState(false)

  const filteredQueue = queue.filter(item => {
    const matchDoctor = filterDoctor === "" || item.doctor === filterDoctor
    const matchSpecialty = filterSpecialty === "" || doctorsData.find(d => d.name === item.doctor)?.specialty === filterSpecialty
    return matchDoctor && matchSpecialty
  })

  const handleMarkArrived = (id: number) => {
    storageService.updateAppointmentStatus(id, 'WAITING'); // Update in storage
    setQueue(storageService.getAppointments()); // Refresh local state from storage
  }

  const handleCancel = (id: number) => {
    storageService.updateAppointmentStatus(id, 'CANCELED');
    setQueue(storageService.getAppointments());
  }

  const handleWalkIn = ({ dni, firstName, lastName, phone }: { dni: string; firstName: string; lastName: string; phone: string }) => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");

    // Agregar a la agenda
    storageService.addAppointment({
      id: Date.now(),
      date: formattedDate,
      time: "Ahora (Walk-in)",
      patient: {
        firstName,
        lastName,
        documentNumber: dni,
        phone,
        lastVisit: formattedDate
      },
      reason: "Atención de urgencia / Ingreso rápido",
      doctor: "Asignación rápida",
      status: "WAITING" // Un walk-in pasa directo a esperar Triage
    });

    // Refresh local state
    setQueue(storageService.getAppointments());
    setIsWalkInOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Diaria (Recepción)</h1>
          <p className="text-slate-500 mt-1">Gestión de pacientes programados y atenciones de urgencia.</p>
        </div>
        <button
          onClick={() => setIsWalkInOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
        >
          <UserPlus className="size-5" />
          Ingreso Rápido (Walk-in)
        </button>
      </div>

      {/* Filtros */}
      <FilterBar
        doctorsData={doctorsData}
        specialtiesList={specialtiesList}
        filterDoctor={filterDoctor}
        filterSpecialty={filterSpecialty}
        onSpecialtyChange={v => { setFilterSpecialty(v); setFilterDoctor("") }}
        onDoctorChange={setFilterDoctor}
      />

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Hora</th>
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Médico Asignado</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-center">
              {filteredQueue.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{item.time}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.patient.firstName} {item.patient.lastName}</td>
                  <td className="px-6 py-4 text-slate-600">{item.doctor}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4">
                    {item.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleMarkArrived(item.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition-colors border border-green-200"
                      >
                        <UserCheck className="w-4 h-4" /> Marcar Llegada
                      </button>
                    )}
                    {item.status === "WAITING" && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200"
                      >
                        Cancelar
                      </button>
                    )}
                    {item.status === "CANCELED" && (
                      <span className="text-slate-400 italic text-xs">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Walk-in */}
      <WalkInModal
        open={isWalkInOpen}
        onOpenChange={setIsWalkInOpen}
        onSubmit={handleWalkIn}
      />
    </div>
  )
}