import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UtensilsCrossed, LayoutDashboard, BookOpen, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Recetas', icon: BookOpen, to: '/recipes' },
  { label: 'Perfil', icon: User, to: '/profile' },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary-500 text-lg">
            <UtensilsCrossed className="h-6 w-6" />
            <span>RecipeCalories</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, icon: Icon, to }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
                  pathname.startsWith(to)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* User + logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Hola, <strong className="text-gray-700">{user?.name?.split(' ')[0]}</strong>
            </span>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                pathname.startsWith(to)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <hr className="my-2" />
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}

