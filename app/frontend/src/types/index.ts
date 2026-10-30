// ─── Types mirroring backend ───────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  dailyCalorieGoal: number
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  totalCalories: number
  caloriesPerServing: number
  servings: number
  preparationTimeMinutes: number | null
  ingredientCount: number
  createdAt: string
  updatedAt?: string
}

export interface Ingredient {
  id: string
  recipeId: string
  name: string
  calories: number
  quantity: number
  unit: string
  createdAt: string
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[]
}

export interface PaginatedRecipes {
  data: Recipe[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

// ─── Form types ────────────────────────────────────────────────────────────
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  name: string
  dailyCalorieGoal?: number
}

export interface RecipeForm {
  title: string
  description?: string
  servings: number
  preparationTimeMinutes?: number
}

export interface IngredientForm {
  name: string
  calories: number
  quantity: number
  unit: string
}

export interface UpdateProfileForm {
  name?: string
  dailyCalorieGoal?: number
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
}

// ─── API error ─────────────────────────────────────────────────────────────
export interface ApiError {
  message: string
  code?: string
  status?: number
}

