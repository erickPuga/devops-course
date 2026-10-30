import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame, BookOpen, Target, TrendingUp, Plus, Clock, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { recipeService } from '../services/recipes'
import type { Recipe } from '../types'
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
} from 'recharts'

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recipeService.list(1, 5).then((r) => {
      setRecipes(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const todayCalories = recipes.reduce((sum, r) => sum + (r.totalCalories || 0), 0)
  const goal = user?.dailyCalorieGoal || 2000
  const progress = Math.min((todayCalories / goal) * 100, 100)
  const remaining = Math.max(goal - todayCalories, 0)

  const radialData = [{ name: 'Calorías', value: progress, fill: '#f4a626' }]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Aquí tienes un resumen de tus recetas y calorías.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Recetas totales"
          value={recipes.length}
          sub="en tu colección"
          icon={BookOpen}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Calorías hoy"
          value={Math.round(todayCalories)}
          sub={`meta: ${goal} kcal`}
          icon={Flame}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Restantes"
          value={Math.round(remaining)}
          sub="kcal disponibles"
          icon={Target}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="% cumplido"
          value={`${Math.round(progress)}%`}
          sub="de tu meta diaria"
          icon={TrendingUp}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie radial chart */}
        <div className="card flex flex-col items-center">
          <h2 className="text-base font-semibold text-gray-800 mb-4 self-start">Meta de Calorías</h2>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                data={[{ name: 'bg', value: 100, fill: '#f3f4f6' }, ...radialData]}
              >
                <RadialBar dataKey="value" cornerRadius={8} background={false} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(0)}%`, 'Progreso']} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{Math.round(progress)}%</span>
              <span className="text-xs text-gray-400">{Math.round(todayCalories)} kcal</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {remaining > 0
              ? `Te quedan ${Math.round(remaining)} kcal`
              : '¡Meta alcanzada! 🎉'}
          </p>
        </div>

        {/* Recent recipes */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Recetas recientes</h2>
            <Link to="/recipes" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aún no tienes recetas</p>
              <Link to="/recipes/new" className="btn-primary mt-4 text-sm">
                <Plus className="h-4 w-4" /> Crear primera receta
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recipes.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/recipes/${r.id}`}
                    className="flex items-center gap-4 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 font-bold text-lg">
                      {r.title[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{r.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {Math.round(r.totalCalories)} kcal
                        </span>
                        {r.preparationTimeMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {r.preparationTimeMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick action */}
      <Link
        to="/recipes/new"
        className="flex items-center gap-3 card border-2 border-dashed border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition text-primary-500 justify-center py-6 cursor-pointer"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Añadir nueva receta</span>
      </Link>
    </div>
  )
}

