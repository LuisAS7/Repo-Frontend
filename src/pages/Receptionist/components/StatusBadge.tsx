import { Clock } from "lucide-react"

interface Props {
  status: string
}

export function StatusBadge({ status }: Props) {
  switch (status) {
    case "SCHEDULED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="w-3.5 h-3.5" /> Programada
        </span>
      )
    case "WAITING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> En Sala de Espera
        </span>
      )
    case "CANCELED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Cancelada
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {status}
        </span>
      )
  }
}