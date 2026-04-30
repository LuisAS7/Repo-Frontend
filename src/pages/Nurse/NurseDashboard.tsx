import { useState } from 'react'
import { Activity, Search, AlertTriangle } from "lucide-react";
import { Modal } from '../../components/ui/Modal'

const PATIENTS_KEY = 'valsync_triage_patients'

const seedPatients = [
  {
    id: 1,
    time: "09:15 AM",
    patient: { 
      firstName: "María", 
      lastName: "González",
      age: 45,
      documentNumber: "12345678-9"
    },
    medicalBackground: {
      bloodType: "O+",
      allergies: ["Penicilina", "Látex"],
      chronicDiseases: ["Asma leve"]
    }
  },
  {
    id: 2,
    time: "09:45 AM",
    patient: { 
      firstName: "José", 
      lastName: "Ramírez",
      age: 62,
      documentNumber: "98765432-1"
    },
    medicalBackground: {
      bloodType: "A-",
      allergies: [],
      chronicDiseases: ["Hipertensión", "Diabetes Tipo 2"]
    }
  }
]

function getInitialPatients() {
  try {
    const stored = localStorage.getItem(PATIENTS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(seedPatients))
    return seedPatients
  } catch {
    return seedPatients
  }
}

export function NurseDashboard() {
  const [patients, setPatients] = useState(getInitialPatients);
  const [selectedPatient, setSelectedPatient] = useState<typeof seedPatients[0] | null>(null);
  
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");

  const handleTakeVitals = (patient: typeof seedPatients[0]) => {
    setSelectedPatient(patient);
    setWeight("");
    setHeight("");
    setBloodPressure("");
    setTemperature("");
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
  };

  const calculateBMI = () => {
    if (weight && height) {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100;
      if (h > 0) {
        return (w / (h * h)).toFixed(1);
      }
    }
    return "--";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatient) {
      const updated = patients.filter(p => p.id !== selectedPatient.id);
      setPatients(updated);
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(updated));
      setSelectedPatient(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fila de Triage</h1>
          <p className="text-slate-500 mt-1">Pacientes en sala de espera listos para toma de signos vitales.</p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar paciente..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-full md:w-64 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {patients.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {patients.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex h-12 w-12 rounded-full bg-amber-100 text-amber-700 items-center justify-center font-bold text-lg">
                    {item.patient.firstName[0]}{item.patient.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        En Espera
                      </span>
                      <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.patient.firstName} {item.patient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      DNI: {item.patient.documentNumber}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleTakeVitals(item)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Tomar Signos Vitales
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium">No hay pacientes esperando triage en este momento.</p>
          </div>
        )}
      </div>

      <Modal
        open={!!selectedPatient}
        onOpenChange={(isOpen) => !isOpen && handleCloseModal()}
        title="Evaluación de Triage"
        description="Registre los signos vitales del paciente."
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                  </h4>
                  <p className="text-sm text-slate-600 font-medium">
                    Edad: {selectedPatient.patient.age} años | Tipo de sangre: <span className="text-red-600 font-bold">{selectedPatient.medicalBackground.bloodType}</span>
                  </p>
                </div>
              </div>

              {(selectedPatient.medicalBackground.allergies.length > 0 || selectedPatient.medicalBackground.chronicDiseases.length > 0) && (
                <div className="space-y-2">
                  {selectedPatient.medicalBackground.allergies.length > 0 && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-100">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-bold uppercase">Alergias: {selectedPatient.medicalBackground.allergies.join(", ")}</span>
                    </div>
                  )}
                  {selectedPatient.medicalBackground.chronicDiseases.length > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-bold">Enfermedades crónicas: {selectedPatient.medicalBackground.chronicDiseases.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="weight">Peso (kg)</label>
                  <input 
                    id="weight" 
                    type="number" 
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-lg text-center" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="height">Altura (cm)</label>
                  <input 
                    id="height" 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-lg text-center" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="bp">Presión Arterial</label>
                  <input 
                    id="bp" 
                    type="text" 
                    placeholder="120/80"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-lg text-center" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="temp">Temperatura (°C)</label>
                  <input 
                    id="temp" 
                    type="number" 
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-lg text-center" 
                    required 
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-slate-600">Índice de Masa Corporal (IMC)</span>
                <span className="text-xl font-bold text-slate-900 bg-white px-4 py-1 rounded-lg border border-slate-200">
                  {calculateBMI()}
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors focus:ring-2 focus:ring-slate-500"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                >
                  Guardar y Enviar al Médico
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}