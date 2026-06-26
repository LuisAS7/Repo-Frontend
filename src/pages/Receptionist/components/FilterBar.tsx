import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

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
  const [inputValue, setInputValue] = useState(filterSpecialty)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(filterSpecialty)
  }, [filterSpecialty])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setInputValue(filterSpecialty)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [filterSpecialty])

  const filteredSpecialties = specialtiesList.filter(s =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleSelect = (s: string) => {
    setInputValue(s)
    onSpecialtyChange(s)
    onDoctorChange("")
    setIsOpen(false)
  }

  const handleClear = () => {
    setInputValue("")
    onSpecialtyChange("")
    onDoctorChange("")
    setIsOpen(false)
  }

  return (
    <div className="flex gap-3">
      {/* Specialty searchable combobox */}
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onFocus={() => setIsOpen(true)}
            onChange={e => {
              setInputValue(e.target.value)
              setIsOpen(true)
              if (!e.target.value) {
                onSpecialtyChange("")
                onDoctorChange("")
              }
            }}
            placeholder="Buscar especialidad..."
            className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-52"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <button
              className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 border-b border-slate-100"
              onMouseDown={e => { e.preventDefault(); handleClear() }}
            >
              Todas las especialidades
            </button>
            {filteredSpecialties.length > 0 ? (
              filteredSpecialties.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  onMouseDown={e => { e.preventDefault(); handleSelect(s) }}
                >
                  {s}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
            )}
          </div>
        )}
      </div>

      {/* Doctor select */}
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
