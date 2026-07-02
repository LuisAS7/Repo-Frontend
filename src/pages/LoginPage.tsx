import { useState, type FormEvent } from 'react'
import { authService } from '../services/authService'
import type { User } from '../types/auth'

interface Props {
  onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Llamamos al servicio de autenticación para obtener el token
      const response = await authService.login(email.toLowerCase(), password);

      // Si la respuesta es exitosa, guardamos el token en localStorage
      localStorage.setItem('valsync_token', response.access_token);

      const userData = await authService.getMe();

      // Mapeamos el usuario a un objeto User y llamamos a onLogin para actualizar el estado global
      const loggedUser: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role.toLowerCase(),
        name: `${userData.first_name} ${userData.last_name}`
      };

      onLogin(loggedUser);

    } catch (err: any) {
      console.error("Error en login:", err);

      const backendDetail = err.response?.data?.detail;

      if (typeof backendDetail === 'string') {
        setError(backendDetail);
      } else if (Array.isArray(backendDetail)) {
        setError(`Error de validación: ${backendDetail[0]?.msg || 'Datos incorrectos'}`);
      } else {
        setError('Correo o contraseña incorrectos. Por favor, verifique sus credenciales.');
      }
    } finally {
      setLoading(false)
    }
  }

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
            Sistema integrado para coordinación médica, control de triage y gestión eficiente de pacientes
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
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