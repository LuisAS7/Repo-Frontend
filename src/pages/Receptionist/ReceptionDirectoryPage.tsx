import { useEffect, useState } from "react";
import { Search, CalendarDays, User, Phone, Check } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { storageService } from "../../services/storageService";
import type { Patient } from "../../services/storageService";

const doctorsData = [
  { id: "1", name: "Dr. Torres", specialty: "Medicina General" },
  { id: "2", name: "Dra. Ruiz", specialty: "Pediatría" },
  { id: "3", name: "Dr. Burke", specialty: "Cardiología" },
  { id: "4", name: "Dra. Fernández", specialty: "Dermatología" },
  { id: "5", name: "Dr. Shepard", specialty: "Neurología" },
]

const specialtiesList = Array.from(new Set(doctorsData.map(d => d.specialty)));

export function ReceptionDirectoryPage() {
  const [directory, setDirectory] = useState<Patient[]>(() => storageService.getPatientsDirectory())
  const [search, setSearch] = useState(() => {
    return localStorage.getItem('reception_search') ?? ""
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [bookingSpecialty, setBookingSpecialty] = useState("");
  const [bookingDoctor, setBookingDoctor] = useState("");

  const filteredDirectory = directory.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const docNumber = p.documentNumber?.toLowerCase() || "";
    return fullName.includes(search.toLowerCase()) || docNumber.includes(search.toLowerCase());
  }); 

  useEffect(() => {
    localStorage.setItem('reception_search', search)
  }, [search])

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) return;

    const dateInput = (document.getElementById('date') as HTMLInputElement).value;
    const timeInput = (document.getElementById('time') as HTMLSelectElement).value;
    const reasonInput = (document.getElementById('reason') as HTMLTextAreaElement).value;
    const doctorName = doctorsData.find(d => d.id === bookingDoctor)?.name ?? 'Por asignar';

    // Use storageService for add appointment
    storageService.addAppointment({
      id: Date.now(),
      date: dateInput,
      time: timeInput,
      patient: selectedPatient,
      reason: reasonInput,
      doctor: doctorName,
      status: 'SCHEDULED'
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedPatient(null);
      setBookingSpecialty("");
      setBookingDoctor("");
    }, 2000);
}

  const availableDoctors = doctorsData.filter(d => d.specialty === bookingSpecialty);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Directorio de Pacientes</h1>
          <p className="text-slate-500 mt-1">Busque pacientes existentes para programar nuevas citas médicas.</p>
        </div>

        {/* Large Search Bar */}
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-blue-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o DNI/Documento..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredDirectory.length > 0 ? (
            filteredDirectory.map((patient, index) => (
              <div key={index} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-none">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> DNI: {patient.documentNumber || "No disponible"}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {patient.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 shrink-0"
                >
                  <CalendarDays className="w-4 h-4" />
                  Programar Cita
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No se encontraron pacientes con ese criterio.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        open={!!selectedPatient}
        onOpenChange={(isOpen) => !isOpen && setSelectedPatient(null)}
        title="Agendar Nueva Cita"
        description="Seleccione médico y horario para programar la atención."
      >
        {selectedPatient && (
          isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">¡Cita Programada!</h3>
              <p className="text-slate-500">La cita para {selectedPatient.firstName} ha sido registrada con éxito.</p>
            </div>
          ) : (
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-2">
                <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Paciente Seleccionado</label>
                <div className="font-bold text-slate-900 text-lg mt-0.5">{selectedPatient.firstName} {selectedPatient.lastName}</div>
              </div>

              <div className="space-y-4">
                {/* Step 1: Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="specialty">1. Seleccione Especialidad</label>
                  <select
                    id="specialty"
                    value={bookingSpecialty}
                    onChange={(e) => {
                      setBookingSpecialty(e.target.value);
                      setBookingDoctor(""); // Reset doctor when specialty changes
                    }}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                    required
                  >
                    <option value="">Seleccione una especialidad...</option>
                    {specialtiesList.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Doctor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="doctor">2. Seleccione Médico</label>
                  <select
                    id="doctor"
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                    required
                    disabled={!bookingSpecialty}
                  >
                    <option value="">Seleccione un médico...</option>
                    {availableDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Date and Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block mb-1">3. Seleccione Fecha y Hora</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      id="date"
                      type="date"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                      required
                      disabled={!bookingDoctor}
                    />
                    <select
                      id="time"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                      required
                      disabled={!bookingDoctor}
                    >
                      <option value="">Seleccione hora...</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="08:30">08:30 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="09:30">09:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="reason">Motivo de Consulta</label>
                  <textarea
                    id="reason"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm resize-none disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="Breve descripción del motivo de la cita..."
                    required
                    disabled={!bookingDoctor}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors focus:ring-2 focus:ring-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          )
        )}
      </Modal>
    </div>
  );
}