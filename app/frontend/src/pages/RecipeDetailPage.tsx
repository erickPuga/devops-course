import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Flame, Clock, Users, ChevronLeft, Plus, Trash2, Edit, Check, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { recipeService, ingredientService } from '../services/recipes'
import type { RecipeDetail, Ingredient, IngredientForm } from '../types'

const ingredientSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  calories: z.coerce.number().nonnegative('≥ 0'),
  quantity: z.coerce.number().positive('> 0'),
  unit: z.string().min(1, 'Requerido'),
})

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingIngredient, setAddingIngredient] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IngredientForm>({ resolver: zodResolver(ingredientSchema) })

  const fetchRecipe = async () => {
    if (!id) return
    try {
      const r = await recipeService.get(id)
      setRecipe(r)
    } catch {
      toast.error('Receta no encontrada')
      navigate('/recipes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecipe() }, [id])

  const addIngredient = async (data: IngredientForm) => {
    if (!id) return
    try {
      await ingredientService.add(id, data)
      toast.success('Ingrediente añadido')
      reset()
      setAddingIngredient(false)
      fetchRecipe()
    } catch {
      toast.error('Error al añadir ingrediente')
    }
  }

  const deleteIngredient = async (ingredientId: string) => {
    if (!id) return
    try {
      await ingredientService.delete(id, ingredientId)
      toast.success('Ingrediente eliminado')
      fetchRecipe()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const deleteRecipe = async () => {
    if (!recipe || !confirm(`¿Eliminar "${recipe.title}"?`)) return
    try {
      await recipeService.delete(recipe.id)
      toast.success('Receta eliminada')
      navigate('/recipes')
    } catch {
      toast.error('Error al eliminar receta')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    )
  }

  if (!recipe) return null

  const totalIngCals = recipe.ingredients.reduce((sum, i) => sum + i.calories, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/recipes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" /> Mis recetas
      </Link>

      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-gray-500 mt-1">{recipe.description}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to={`/recipes/${recipe.id}/edit`} className="btn-secondary text-sm">
              <Edit className="h-4 w-4" /> Editar
            </Link>
            <button onClick={deleteRecipe} className="btn-danger text-sm">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-100">
          <StatBadge icon={Flame} label="Total" value={`${Math.round(recipe.totalCalories)} kcal`} color="text-orange-500" />
          <StatBadge icon={Flame} label="Por porción" value={`${Math.round(recipe.caloriesPerServing)} kcal`} color="text-orange-400" />
          <StatBadge icon={Users} label="Porciones" value={recipe.servings} color="text-blue-500" />
          {recipe.preparationTimeMinutes && (
            <StatBadge icon={Clock} label="Tiempo" value={`${recipe.preparationTimeMinutes} min`} color="text-green-500" />
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Ingredientes
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({recipe.ingredients.length})
            </span>
          </h2>
          <button
            onClick={() => { setAddingIngredient(true); setEditingId(null) }}
            className="btn-primary text-sm"
          >
            <Plus className="h-4 w-4" /> Añadir
          </button>
        </div>

        {/* Add ingredient form */}
        {addingIngredient && (
          <form onSubmit={handleSubmit(addIngredient)} className="bg-primary-50 rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <input {...register('name')} placeholder="Nombre" className="input text-sm" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <input {...register('calories')} type="number" step="0.1" placeholder="Calorías" className="input text-sm" />
              {errors.calories && <p className="text-xs text-red-500 mt-1">{errors.calories.message}</p>}
            </div>
            <div>
              <input {...register('quantity')} type="number" step="0.1" placeholder="Cantidad" className="input text-sm" />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <input {...register('unit')} placeholder="Unidad (g, ml…)" className="input text-sm" />
              {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit.message}</p>}
            </div>
            <div className="col-span-2 sm:col-span-4 flex gap-2 justify-end">
              <button type="button" onClick={() => { setAddingIngredient(false); reset() }} className="btn-ghost text-sm">
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
                <Check className="h-4 w-4" /> Guardar
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {recipe.ingredients.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aún sin ingredientes. ¡Añade el primero!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4">Ingrediente</th>
                  <th className="pb-2 pr-4 text-right">Cantidad</th>
                  <th className="pb-2 pr-4 text-right">Calorías</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recipe.ingredients.map((ing) => (
                  <IngredientRow
                    key={ing.id}
                    ingredient={ing}
                    recipeId={recipe.id}
                    onDelete={() => deleteIngredient(ing.id)}
                    onUpdated={fetchRecipe}
                    editing={editingId === ing.id}
                    onEdit={() => setEditingId(ing.id)}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold text-gray-700">
                  <td colSpan={2} className="pt-3">Total ingredientes</td>
                  <td className="pt-3 text-right text-orange-600">{Math.round(totalIngCals)} kcal</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBadge({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function IngredientRow({
  ingredient, recipeId, onDelete, onUpdated, editing, onEdit, onCancelEdit,
}: {
  ingredient: Ingredient
  recipeId: string
  onDelete: () => void
  onUpdated: () => void
  editing: boolean
  onEdit: () => void
  onCancelEdit: () => void
}) {
  const { register, handleSubmit, reset } = useForm<IngredientForm>({
    defaultValues: {
      name: ingredient.name,
      calories: ingredient.calories,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    },
  })

  const save = async (data: IngredientForm) => {
    try {
      await ingredientService.update(recipeId, ingredient.id, data)
      toast.success('Actualizado')
      onUpdated()
      onCancelEdit()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  if (editing) {
    return (
      <tr className="bg-primary-50">
        <td className="py-2 pr-4"><input {...register('name')} className="input text-sm" /></td>
        <td className="py-2 pr-4">
          <div className="flex gap-1">
            <input {...register('quantity')} type="number" step="0.1" className="input text-sm w-20" />
            <input {...register('unit')} className="input text-sm w-20" />
          </div>
        </td>
        <td className="py-2 pr-4"><input {...register('calories')} type="number" step="0.1" className="input text-sm w-24 ml-auto block" /></td>
        <td className="py-2 text-right">
          <div className="flex gap-1 justify-end">
            <button onClick={() => { reset(); onCancelEdit() }} className="btn-ghost p-1"><X className="h-4 w-4" /></button>
            <button onClick={handleSubmit(save)} className="btn-primary p-1"><Check className="h-4 w-4" /></button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="py-3 pr-4 font-medium text-gray-800">{ingredient.name}</td>
      <td className="py-3 pr-4 text-right text-gray-500">{ingredient.quantity} {ingredient.unit}</td>
      <td className="py-3 pr-4 text-right font-medium text-orange-600">{ingredient.calories} kcal</td>
      <td className="py-3 text-right">
        <div className="flex gap-1 justify-end">
          <button onClick={onEdit} className="btn-ghost p-1 text-gray-400 hover:text-blue-500">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="btn-ghost p-1 text-gray-400 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

