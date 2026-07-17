import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"

export interface SearchableDropdownOption {
    value: string
    label: string
}

interface SearchableDropdownProps {
    label: string
    value: string
    options: SearchableDropdownOption[]
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
}

export function SearchableDropdown({
    label,
    value,
    options,
    onChange,
    placeholder = "Buscar...",
    disabled = false,
}: SearchableDropdownProps) {
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const selected = options.find((option) => option.value === value)

    const filteredOptions = query
        ? options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
        )
        : options

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
    }

    document.addEventListener("mousedown", handleClickOutside)
    
    return () => 
        document.removeEventListener("mousedown", handleClickOutside)
}, [])

return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="mt-2 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />

          <input
            type="text"
            readOnly={disabled}
            value={open ? query : selected?.label ?? ""}
            onFocus={() => !disabled && setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            placeholder={selected?.label ?? placeholder}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {open && (
          <div className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                Sin resultados
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    onChange(option.value)
                    setQuery("")
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}