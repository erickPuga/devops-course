import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Target, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/auth'
import type { UpdateProfileForm, ChangePasswordForm } from '../types'

const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').optional().or(z.literal('')),
  dailyCalorieGoal: z.coerce.number().int().positive().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerido'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState<'profile' | 'security'>('profile')

  const profileForm = useForm<UpdateProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', dailyCalorieGoal: user?.dailyCalorieGoal ?? 2000 },
  })

  const passwordForm = useForm<ChangePasswordForm & { confirmPassword: string }>({
    resolver: zodResolver(passwordSchema),
  })

  const saveProfile = async (data: UpdateProfileForm) => {
    try {
      await userService.updateProfile({ name: data.name || undefined, dailyCalorieGoal: data.dailyCalorieGoal })
      await refreshUser()
      toast.success('Perfil actualizado')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al actualizar')
    }
  }

  const changePassword = async (data: ChangePasswordForm & { confirmPassword: string }) => {
    try {
      await userService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Contraseña cambiada')
      passwordForm.reset()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al cambiar contraseña')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

      {/* User avatar card */}
      <div className="card flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Meta: <span className="font-medium text-gray-600">{user?.dailyCalorieGoal} kcal / día</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['profile', 'security'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'profile' ? '👤 Perfil' : '🔒 Seguridad'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Información personal</h2>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...profileForm.register('name')}
                  placeholder="Tu nombre"
                  className="input pl-10"
                />
              </div>
              {profileForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="label">Meta diaria de calorías</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...profileForm.register('dailyCalorieGoal')}
                  type="number"
                  placeholder="2000"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="label text-gray-400">Email (no editable)</label>
              <input value={user?.email ?? ''} disabled className="input" />
            </div>

            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="btn-primary"
            >
              {profileForm.formState.isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <><Save className="h-4 w-4" /> Guardar cambios</>
              )}
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Cambiar contraseña</h2>
          <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
            {([
              { name: 'currentPassword', label: 'Contraseña actual', placeholder: '••••••••' },
              { name: 'newPassword', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres' },
              { name: 'confirmPassword', label: 'Confirmar contraseña', placeholder: '••••••••' },
            ] as const).map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...passwordForm.register(name)}
                    type="password"
                    placeholder={placeholder}
                    className="input pl-10"
                  />
                </div>
                {passwordForm.formState.errors[name] && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordForm.formState.errors[name]?.message}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="btn-primary"
            >
              {passwordForm.formState.isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <><Lock className="h-4 w-4" /> Cambiar contraseña</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

