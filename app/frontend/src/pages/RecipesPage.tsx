import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, BookOpen, Flame, Clock, Users, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import { recipeService } from '../services/recipes'
import type { Recipe } from '../types'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 9

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await recipeService.list(page, LIMIT, debouncedSearch || undefined)
      setRecipes(res.data)
      setTotal(res.pagination.total)
    } catch {
      toast.error('Error al cargar recetas')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar la receta "${title}"?`)) return
    try {
      await recipeService.delete(id)
      toast.success('Receta eliminada')
      fetchRecipes()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Recetas</h1>
          <p className="text-sm text-gray-500 mt-1">{total} receta{total !== 1 ? 's' : ''} en tu colección</p>
        </div>
        <Link to="/recipes/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Nueva receta
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar recetas..."
          className="input pl-10"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-gray-100 border-0" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500">
            {debouncedSearch ? 'Sin resultados' : 'Aún no tienes recetas'}
          </p>
          <p className="text-sm mt-1">
            {debouncedSearch ? 'Prueba con otro término.' : 'Crea tu primera receta.'}
          </p>
          {!debouncedSearch && (
            <Link to="/recipes/new" className="btn-primary mt-6">
              <Plus className="h-4 w-4" /> Crear receta
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={() => handleDelete(recipe.id, recipe.title)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Pág {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: () => void }) {
  return (
    <div className="card hover:shadow-md transition-shadow group relative flex flex-col">
      {/* Avatar letter */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 font-bold text-xl">
          {recipe.title[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
          {recipe.description && (
            <p className="text-xs text-gray-400 truncate">{recipe.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          {Math.round(recipe.totalCalories)} kcal
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          {recipe.servings} porciones
        </span>
        {recipe.preparationTimeMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-green-500" />
            {recipe.preparationTimeMinutes} min
          </span>
        )}
      </div>

      {/* Calorie badge */}
      {recipe.caloriesPerServing > 0 && (
        <div className="mb-4">
          <span className="badge bg-orange-50 text-orange-600">
            <Flame className="h-3 w-3" />
            {Math.round(recipe.caloriesPerServing)} kcal / porción
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link to={`/recipes/${recipe.id}`} className="btn-primary flex-1 text-xs py-2">
          Ver detalles
        </Link>
        <Link to={`/recipes/${recipe.id}/edit`} className="btn-secondary px-3 py-2">
          <Edit className="h-3.5 w-3.5" />
        </Link>
        <button onClick={onDelete} className="btn-danger px-3 py-2">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

