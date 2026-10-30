import api from './api'
import type {
  PaginatedRecipes,
  Recipe,
  RecipeDetail,
  RecipeForm,
  Ingredient,
  IngredientForm,
} from '../types'

export const recipeService = {
  async list(page = 1, limit = 10, search?: string): Promise<PaginatedRecipes> {
    const params: Record<string, string | number> = { page, limit }
    if (search) params.search = search
    const res = await api.get<PaginatedRecipes>('/recipes', { params })
    return res.data
  },

  async get(id: string): Promise<RecipeDetail> {
    const res = await api.get<RecipeDetail>(`/recipes/${id}`)
    return res.data
  },

  async create(data: RecipeForm): Promise<Recipe> {
    const res = await api.post<Recipe>('/recipes', data)
    return res.data
  },

  async update(id: string, data: Partial<RecipeForm>): Promise<Recipe> {
    const res = await api.put<Recipe>(`/recipes/${id}`, data)
    return res.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recipes/${id}`)
  },
}

export const ingredientService = {
  async add(recipeId: string, data: IngredientForm): Promise<Ingredient> {
    const res = await api.post<Ingredient>(`/recipes/${recipeId}/ingredients`, data)
    return res.data
  },

  async update(
    recipeId: string,
    ingredientId: string,
    data: Partial<IngredientForm>
  ): Promise<Ingredient> {
    const res = await api.put<Ingredient>(
      `/recipes/${recipeId}/ingredients/${ingredientId}`,
      data
    )
    return res.data
  },

  async delete(recipeId: string, ingredientId: string): Promise<void> {
    await api.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`)
  },
}

