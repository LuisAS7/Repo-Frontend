interface Doctor {
  id: string
  name: string
  specialty: string
}

interface Props {
  doctorsData: Doctor[]
  specialtiesList: string[]
  filterDoctor: string
  filterSpecialty: string
  onSpecialtyChange: (value: string) => void
  onDoctorChange: (value: string) => void
}

export function FilterBar({
  doctorsData,
  specialtiesList,
  filterDoctor,
  filterSpecialty,
  onSpecialtyChange,
  onDoctorChange
}: Props) {
  return (
    <div className="flex gap-3">
      <select
        value={filterSpecialty}
        onChange={e => onSpecialtyChange(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Todas las especialidades</option>
        {specialtiesList.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filterDoctor}
        onChange={e => onDoctorChange(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Todos los médicos</option>
        {doctorsData
          .filter(d => filterSpecialty === "" || d.specialty === filterSpecialty)
          .map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
      </select>
    </div>
  )
}