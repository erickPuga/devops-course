import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { recipeService } from '../services/recipes'
import type { RecipeForm } from '../types'

const schema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  servings: z.coerce.number().int().positive('Debe ser mayor a 0').default(1),
  preparationTimeMinutes: z.coerce.number().int().nonnegative().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function RecipeFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (isEdit && id) {
      recipeService.get(id).then((r) => {
        reset({
          title: r.title,
          description: r.description ?? '',
          servings: r.servings,
          preparationTimeMinutes: r.preparationTimeMinutes ?? undefined,
        })
      }).catch(() => toast.error('Error al cargar receta'))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormData) => {
    const payload: RecipeForm = {
      title: data.title,
      description: data.description || undefined,
      servings: data.servings,
      preparationTimeMinutes: data.preparationTimeMinutes
        ? Number(data.preparationTimeMinutes)
        : undefined,
    }

    try {
      if (isEdit && id) {
        await recipeService.update(id, payload)
        toast.success('Receta actualizada')
        navigate(`/recipes/${id}`)
      } else {
        const created = await recipeService.create(payload)
        toast.success('Receta creada')
        navigate(`/recipes/${created.id}`)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al guardar')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        to={isEdit && id ? `/recipes/${id}` : '/recipes'}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        {isEdit ? 'Volver a la receta' : 'Mis recetas'}
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Editar receta' : 'Nueva receta'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Título *</label>
            <input {...register('title')} placeholder="Ej. Ensalada César" className="input" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              {...register('description')}
              placeholder="Descripción breve de la receta..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Porciones *</label>
              <input {...register('servings')} type="number" min={1} placeholder="2" className="input" />
              {errors.servings && <p className="mt-1 text-xs text-red-500">{errors.servings.message}</p>}
            </div>

            <div>
              <label className="label">Tiempo de preparación (min)</label>
              <input
                {...register('preparationTimeMinutes')}
                type="number"
                min={0}
                placeholder="30"
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              to={isEdit && id ? `/recipes/${id}` : '/recipes'}
              className="btn-secondary flex-1 text-center"
            >
              Cancelar
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Guardar cambios' : 'Crear receta'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

