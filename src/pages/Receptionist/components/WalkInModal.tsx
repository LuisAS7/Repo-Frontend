import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Modal } from "../../../components/ui/Modal"

interface WalkInData {
  dni: string
  firstName: string
  lastName: string
  birthDate: string
  phone: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: WalkInData) => void
}

export function WalkInModal({ open, onOpenChange, onSubmit }: Props) {
  const [dni, setDni]             = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [phone, setPhone]         = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ dni, firstName, lastName, birthDate, phone })
    setDni(""); setFirstName(""); setLastName(""); setBirthDate(""); setPhone("")
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ingreso Rápido de Paciente"
      description="Añada un paciente que llegó sin cita previa a la sala de espera."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="walkInDNI">
            DNI / Documento
          </label>
          <input
            id="walkInDNI" type="text" value={dni}
            onChange={e => setDni(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="walkInFirstName">
              Nombre
            </label>
            <input
              id="walkInFirstName" type="text" value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="walkInLastName">
              Apellido
            </label>
            <input
              id="walkInLastName" type="text" value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="walkInBirth">
            Fecha de Nacimiento
          </label>
          <input
            id="walkInBirth" type="date" value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="walkInPhone">
            Teléfono de Contacto
          </label>
          <input
            id="walkInPhone" type="tel" value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Añadir a Espera
          </button>
        </div>
      </form>
    </Modal>
  )
}