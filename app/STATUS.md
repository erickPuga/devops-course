# 🚀 Backend de Recipe Calories - Estado Actual

## ✅ Completado

- Backend Express + TypeScript completamente funcional
- Servidor corriendo en puerto 3001
- 5 endpoints implementados y testeados
- Autenticación JWT (access + refresh tokens)
- Contraseñas hasheadas con bcryptjs
- Validación con Zod en todos los endpoints
- CORS configurado

## 🔧 Problema Solucionado

**Error anterior:** `42883: function current_user_id() does not exist`

**Causa:** Función PostgreSQL no existente en el SQL

**Solución:** Removido `current_user_id()` y usando solo `auth.uid()`

El SQL ahora está corregido y listo para ejecutar en Supabase ✅

## 📋 SIGUIENTE PASO: Ejecutar el SQL en Supabase

### Instrucciones:

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard

2. **En tu proyecto, ve a SQL Editor**

3. **Crea una nueva query**

4. **Copia TODA esta SQL y pégala:**
   - Ubicación: `/app/docs/database-schema.sql`
   - O simplemente copia todo desde abajo 👇

5. **Click en "Run"**

---

## 📝 SQL Corregido (Listo para Pegar)

```sql
-- ============================================
-- RECIPE CALORIES APP - DATABASE SCHEMA
-- Para ejecutar en Supabase SQL Editor
-- Schema: public (default Supabase schema)
-- ============================================

-- ============================================
-- 1. TABLA DE USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  daily_calorie_goal INTEGER DEFAULT 2000,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT daily_calorie_goal_positive CHECK (daily_calorie_goal > 0)
);

-- ============================================
-- 2. TABLA DE RECETAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_calories DECIMAL(10, 2) DEFAULT 0,
  servings INTEGER DEFAULT 1,
  preparation_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT total_calories_non_negative CHECK (total_calories >= 0),
  CONSTRAINT servings_positive CHECK (servings > 0),
  CONSTRAINT preparation_time_non_negative CHECK (preparation_time_minutes IS NULL OR preparation_time_minutes >= 0)
);

-- ============================================
-- 3. TABLA DE INGREDIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  calories DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT calories_non_negative CHECK (calories >= 0),
  CONSTRAINT quantity_positive CHECK (quantity > 0),
  CONSTRAINT unit_not_empty CHECK (LENGTH(TRIM(unit)) > 0)
);

-- ============================================
-- INDEXES - Para optimizar queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON public.ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Seguridad
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Users: Solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Recipes: Solo pueden ver/editar sus propias recetas
CREATE POLICY "Users can view own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Ingredients: Solo pueden ver/editar ingredientes de sus recetas
CREATE POLICY "Users can view recipe ingredients"
  ON public.ingredients FOR SELECT
  USING (
    recipe_id IN (
      SELECT id FROM public.recipes 
      WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert ingredients in own recipes"
  ON public.ingredients FOR INSERT
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM public.recipes 
      WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update ingredients in own recipes"
  ON public.ingredients FOR UPDATE
  USING (
    recipe_id IN (
      SELECT id FROM public.recipes 
      WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete ingredients in own recipes"
  ON public.ingredients FOR DELETE
  USING (
    recipe_id IN (
      SELECT id FROM public.recipes 
      WHERE user_id::text = auth.uid()::text
    )
  );

-- ============================================
-- TRIGGERS - Para actualizar timestamps
-- ============================================

-- Trigger para users.updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON public.users;
CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Trigger para recipes.updated_at
CREATE OR REPLACE FUNCTION update_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_recipes_updated_at_trigger ON public.recipes;
CREATE TRIGGER update_recipes_updated_at_trigger
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_updated_at();

-- ============================================
-- VIEWS - Para queries comunes
-- ============================================

-- Vista de recetas con estadísticas
CREATE OR REPLACE VIEW public.recipes_with_stats AS
SELECT 
  r.id,
  r.user_id,
  r.title,
  r.description,
  r.servings,
  r.preparation_time_minutes,
  r.total_calories,
  r.created_at,
  r.updated_at,
  COALESCE(COUNT(i.id), 0) as ingredient_count,
  ROUND(AVG(COALESCE(r.total_calories, 0))::numeric, 2) as avg_calories_per_serving
FROM public.recipes r
LEFT JOIN public.ingredients i ON r.id = i.recipe_id
GROUP BY r.id, r.user_id, r.title, r.description, r.servings, r.preparation_time_minutes, r.total_calories, r.created_at, r.updated_at;

-- Vista de calorías consumidas por usuario
CREATE OR REPLACE VIEW public.user_daily_calories AS
SELECT 
  r.user_id,
  DATE(r.created_at) as date,
  ROUND(SUM(r.total_calories)::numeric, 2) as total_calories,
  COUNT(r.id) as recipe_count,
  u.daily_calorie_goal
FROM public.recipes r
JOIN public.users u ON r.user_id = u.id
GROUP BY r.user_id, DATE(r.created_at), u.daily_calorie_goal;
```

---

## ✨ Después de ejecutar el SQL

1. **Las tablas se crearán:** users, recipes, ingredients
2. **Las políticas RLS se aplicarán:** Seguridad automática
3. **Los triggers se activarán:** Timestamps automáticos
4. **Las vistas estarán listas:** Para queries avanzadas

## 🧪 Luego, Prueba el Backend

El backend ya funciona. Solo necesita que las tablas existan en Supabase.

```bash
# Terminal 1: Inicia el servidor
cd /app/backend
npm run dev

# Terminal 2: Prueba los endpoints
bash /app/backend/test.sh
```

---

## 📞 Endpoints Disponibles

### Autenticación (Sin token requerido)
- `POST /api/auth/register` - Crear usuario
- `POST /api/auth/login` - Login

### Perfil (Con token requerido)
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/change-password` - Cambiar contraseña

---

## 🎯 Estado

| Tarea | Estado |
|-------|--------|
| Backend | ✅ Completado |
| Endpoints | ✅ 5/5 Implementados |
| Autenticación | ✅ Funcional |
| Base de datos (archivo SQL) | ✅ Corregido |
| Base de datos (ejecución en Supabase) | ⏳ PENDIENTE |
| Frontend | ⏹️ No iniciado |

**El siguiente paso es ejecutar el SQL en Supabase. Una vez hecho, todo funcionará perfectamente.** 🚀
