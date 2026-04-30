import { useEffect, useState } from "react";
import { UserPlus, Clock, UserCheck } from "lucide-react";
import { Modal } from "../../components/ui/Modal";

const initialQueue = [
  {
    id: 1,
    time: "08:30 AM",
    patient: "Carlos Mendoza",
    doctor: "Dr. Torres",
    status: "SCHEDULED" // SCHEDULED, WAITING, CANCELED
  },
  {
    id: 2,
    time: "09:15 AM",
    patient: "María González",
    doctor: "Dra. Ruiz",
    status: "WAITING"
  },
  {
    id: 3,
    time: "10:00 AM",
    patient: "Juan Pérez",
    doctor: "Dr. Torres",
    status: "CANCELED"
  }
];

export function ReceptionPage() {

  const [queue, setQueue] = useState<typeof initialQueue>(() => {
    const saved = localStorage.getItem('reception_queue')
    return saved ? JSON.parse(saved) : initialQueue
  });

  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  const [walkInDNI, setWalkInDNI] = useState("");
  const [walkInFirstName, setWalkInFirstName] = useState("");
  const [walkInLastName, setWalkInLastName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");

  useEffect(() => {
    localStorage.setItem('reception_queue', JSON.stringify(queue))
  }, [queue])

  const handleMarkArrived = (id: number) => {
    setQueue(queue.map(q => q.id === id ? { ...q, status: "WAITING" } : q));
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient = {
      id: Date.now(),
      time: "Ahora (Walk-in)",
      patient: `${walkInFirstName} ${walkInLastName}`,
      doctor: "Asignación rápida",
      status: "WAITING"
    };
    setQueue([...queue, newPatient]);
    setIsWalkInModalOpen(false);
    // Reset form
    setWalkInDNI("");
    setWalkInFirstName("");
    setWalkInLastName("");
    setWalkInPhone("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="w-3.5 h-3.5" /> Programada
        </span>;
      case "WAITING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> En Sala de Espera
        </span>;
      case "CANCELED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Cancelada
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {status}
        </span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Diaria (Recepción)</h1>
          <p className="text-slate-500 mt-1">Gestión de pacientes programados y atenciones de urgencia.</p>
        </div>

        <button
          onClick={() => setIsWalkInModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
        >
          <UserPlus className="size-5" />
          Ingreso Rápido (Walk-in)
        </button>
      </div>

      {/* Main Content (Today's Queue) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Hora</th>
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Médico Asignado</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{item.time}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.patient}</td>
                  <td className="px-6 py-4 text-slate-600">{item.doctor}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {item.status === "SCHEDULED" ? (
                      <button
                        onClick={() => handleMarkArrived(item.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 font-medium rounded-lg transition-colors border border-green-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                      >
                        <UserCheck className="w-4 h-4" /> Marcar Llegada
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Walk-in Modal */}
      <Modal
        open={isWalkInModalOpen}
        onOpenChange={setIsWalkInModalOpen}
        title="Ingreso Rápido de Paciente"
        description="Añada un paciente que llegó sin cita previa a la sala de espera."
      >
        <form onSubmit={handleWalkInSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="walkInDNI">DNI / Documento</label>
            <input
              id="walkInDNI"
              type="text"
              value={walkInDNI}
              onChange={(e) => setWalkInDNI(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="walkInFirstName">Nombre</label>
              <input
                id="walkInFirstName"
                type="text"
                value={walkInFirstName}
                onChange={(e) => setWalkInFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="walkInLastName">Apellido</label>
              <input
                id="walkInLastName"
                type="text"
                value={walkInLastName}
                onChange={(e) => setWalkInLastName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="walkInPhone">Teléfono de Contacto</label>
            <input
              id="walkInPhone"
              type="tel"
              value={walkInPhone}
              onChange={(e) => setWalkInPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors focus:ring-2 focus:ring-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Añadir a Espera
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}