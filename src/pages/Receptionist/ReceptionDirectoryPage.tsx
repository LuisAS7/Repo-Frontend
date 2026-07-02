import { useEffect, useRef, useState } from "react"
import { Search, CalendarDays, User, Phone, Check, X } from "lucide-react"
import { Modal } from "../../components/ui/Modal"
import { patientService } from "../../services/patientService"
import { appointmentService } from "../../services/appointmentService"
import { apiClient } from "../../services/apiClient"
import type { PatientResponse, StaffResponse } from "../../types/reception"

export function ReceptionDirectoryPage() {
  const [directory, setDirectory]             = useState<PatientResponse[]>([])
  const [doctors, setDoctors]                 = useState<StaffResponse[]>([])
  const [loading, setLoading]                 = useState(true)
  const [search, setSearch]                   = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [isSuccess, setIsSuccess]             = useState(false)
  const [submitting, setSubmitting]           = useState(false)

  const [bookingSpecialty, setBookingSpecialty] = useState("")
  const [bookingDoctor, setBookingDoctor]       = useState("")
  const [bookingDate, setBookingDate]           = useState("")
  const [bookingTime, setBookingTime]           = useState("")
  const [bookingReason, setBookingReason]       = useState("")

  const [specialtyInput, setSpecialtyInput]     = useState("")
  const [isSpecialtyOpen, setIsSpecialtyOpen]   = useState(false)
  const specialtyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [pats, staff] = await Promise.all([
          patientService.getAll(),
          apiClient.get<StaffResponse[]>("/staff/"),
        ])
        setDirectory(pats)
        setDoctors(staff.filter(s => s.role === "DOCTOR" && s.is_active))
      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (specialtyRef.current && !specialtyRef.current.contains(e.target as Node)) {
        setIsSpecialtyOpen(false)
        setSpecialtyInput(bookingSpecialty)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [bookingSpecialty])

  const doctorsData = doctors.map(d => ({
    id: d.id,
    name: `${d.first_name} ${d.last_name}`,
    specialty: d.doctor_profile?.specialty.name ?? "",
  }))

  const specialtiesList = Array.from(
    new Set(doctorsData.map(d => d.specialty).filter(Boolean))
  )

  const availableDoctors = doctorsData.filter(d => d.specialty === bookingSpecialty)

  const filteredDirectory = directory.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
    return fullName.includes(search.toLowerCase()) ||
      p.document_number.toLowerCase().includes(search.toLowerCase())
  })

  const resetForm = () => {
    setBookingSpecialty(""); setBookingDoctor(""); setBookingDate("")
    setBookingTime(""); setBookingReason(""); setSpecialtyInput("")
  }

  const handleCloseModal = () => { setSelectedPatient(null); resetForm() }

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return
    setSubmitting(true)
    try {
      await appointmentService.create({
        patient_id: selectedPatient.id,
        doctor_id: bookingDoctor,
        scheduled_date: bookingDate,
        scheduled_time: `${bookingTime}:00`,
        reason: bookingReason,
        origin: "VALSYNC",
      })
      setIsSuccess(true)
      setTimeout(() => { setIsSuccess(false); handleCloseModal() }, 2000)
    } catch (err: any) {
      alert(err.message ?? "Error al agendar la cita")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Directorio de Pacientes</h1>
          <p className="text-slate-500 mt-1">Busque pacientes existentes para programar nuevas citas médicas.</p>
        </div>
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-blue-500" />
          </div>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o DNI/Documento..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Cargando pacientes...</div>
          ) : filteredDirectory.length > 0 ? (
            filteredDirectory.map(patient => (
              <div key={patient.id}
                className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-none">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> DNI: {patient.document_number}
                      </span>
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {patient.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(patient)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-2 shrink-0">
                  <CalendarDays className="w-4 h-4" />
                  Programar Cita
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No se encontraron pacientes.</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!selectedPatient} onOpenChange={open => !open && handleCloseModal()}
        title="Agendar Nueva Cita" description="Seleccione médico y horario para programar la atención.">
        {selectedPatient && (
          isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">¡Cita Programada!</h3>
              <p className="text-slate-500">La cita para {selectedPatient.first_name} ha sido registrada con éxito.</p>
            </div>
          ) : (
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Paciente Seleccionado</label>
                <div className="font-bold text-slate-900 text-lg mt-0.5">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </div>
              </div>

              {/* Especialidad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">1. Seleccione Especialidad</label>
                <div className="relative" ref={specialtyRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type="text" value={specialtyInput} required
                      onFocus={() => setIsSpecialtyOpen(true)}
                      onChange={e => {
                        setSpecialtyInput(e.target.value)
                        setIsSpecialtyOpen(true)
                        if (!e.target.value) { setBookingSpecialty(""); setBookingDoctor("") }
                      }}
                      placeholder="Buscar especialidad..."
                      className="w-full pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                    {specialtyInput && (
                      <button type="button"
                        onClick={() => { setSpecialtyInput(""); setBookingSpecialty(""); setBookingDoctor("") }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {isSpecialtyOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {specialtiesList
                        .filter(s => s.toLowerCase().includes(specialtyInput.toLowerCase()))
                        .map(s => (
                          <button key={s} type="button"
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            onMouseDown={e => {
                              e.preventDefault()
                              setSpecialtyInput(s); setBookingSpecialty(s)
                              setBookingDoctor(""); setIsSpecialtyOpen(false)
                            }}>
                            {s}
                          </button>
                        ))}
                      {specialtiesList.filter(s => s.toLowerCase().includes(specialtyInput.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Médico */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">2. Seleccione Médico</label>
                <select value={bookingDoctor} onChange={e => setBookingDoctor(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  required disabled={!bookingSpecialty}>
                  <option value="">Seleccione un médico...</option>
                  {availableDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              {/* Fecha y hora */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">3. Seleccione Fecha y Hora</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50"
                    required disabled={!bookingDoctor} />
                  <select value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50"
                    required disabled={!bookingDoctor}>
                    <option value="">Seleccione hora...</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="08:30">08:30 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                  </select>
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Motivo de Consulta</label>
                <textarea rows={2} value={bookingReason} onChange={e => setBookingReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white resize-none disabled:bg-slate-50"
                  placeholder="Breve descripción del motivo de la cita..." required disabled={!bookingDoctor} />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal}
                  className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60">
                  {submitting ? "Guardando..." : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          )
        )}
      </Modal>
    </div>
  )
}