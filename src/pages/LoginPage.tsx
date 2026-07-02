import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../context/useAuthStore'
import { t } from '../utils/translations' 

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuthStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // El store actualiza el estado del usuario
      await login(email.trim(), password);
    } catch (err: any) {
      console.error("Error en login:", err);
      const backendDetail = err.response?.data?.detail;

      if (Array.isArray(backendDetail)) {
        setError('Error de validación: Revise que el correo tenga un formato válido.');
      } else {
        setError(t.error(backendDetail)); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2fa8 0%, #1e3db5 40%, #1648c8 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z" fill="#22d3ee" />
                <rect x="11" y="14" width="2" height="4" rx="1" fill="white" />
                <rect x="9" y="16" width="6" height="2" rx="1" fill="white" />
              </svg>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">ValSync</span>
          </div>

          <h1 className="text-white text-4xl xl:text-5xl font-extrabold leading-tight mb-6">
            Gestión clínica<br />moderna para tu<br />equipo
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Sistema integrado para coordinación médica, control de triaje y gestión eficiente de pacientes
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          {['Admin', 'Doctor', 'Enfermero/a', 'Recepcionista'].map((r) => (
            <span key={r} className="px-3 py-1 rounded-full text-xs text-blue-200 border border-blue-400/30 bg-white/5">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Portal del Personal</h2>
          <p className="text-sm text-gray-500 mb-8">Inicio de Sesión Seguro</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@valsync.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Necesita ayuda?{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Contacte al soporte técnico
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}