# 📊 Plan Técnico Detallado - Recipe Calories App

## 🎯 Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         RECIPE CALORIES APP - Arquitectura General         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   Usuarios   │
                        └──────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼─────┐        ┌────▼────┐
              │  Frontend  │◄─────►│ Backend  │
              │  (React)   │        │ (Node)   │
              └────────────┘        └────┬────┘
                    ▲                    │
                    │                    │
              ┌─────────────────────────────────┐
              │      Supabase PostgreSQL        │
              │  ┌─────────────────────────┐   │
              │  │ users                   │   │
              │  │ recipes                 │   │
              │  │ ingredients             │   │
              │  │ + RLS Security          │   │
              │  └─────────────────────────┘   │
              └─────────────────────────────────┘
```

---

## 🔄 Flujo de Funcionalidades

### 1. REGISTRO (Sign Up Flow)

```
Usuario                    Frontend              Backend            Supabase
   │                          │                     │                  │
   │─ Completa formulario ──→ │                     │                  │
   │                          │─ POST /auth/register ─→                │
   │                          │                     │─ Hash password ──→
   │                          │                     │                  │
   │                          │                     │◄─ Usuario creado ─
   │                          │◄─ 201 + user data ──│                  │
   │◄─ Mostrar confirmación ──│                     │                  │
   │                          │                     │                  │
   │─ Ir a login/dashboard ───→ Navegar            │                  │
```

**Datos Guardados en Supabase:**
- UUID unique
- Email (único)
- Password hash (bcrypt)
- Name
- Daily calorie goal
- Timestamps

---

### 2. LOGIN (Sign In Flow)

```
Usuario                 Frontend              Backend            Supabase
   │                       │                     │                  │
   │─ Email + Pass ──→    │                     │                  │
   │                       │─ POST /auth/login ───→                │
   │                       │                     │─ Verificar BD ──→
   │                       │                     │◄─ User + hash ───
   │                       │                     │                  │
   │                       │  bcrypt.compare() ──────────────────→ ✓
   │                       │                     │                  │
   │◄─ Access + Refresh ───│◄─ JWT Tokens ─────│                  │
   │   Tokens + Redirect   │                     │                  │
   │                       │ Guardar en storage  │                  │
   │─ Acceder Dashboard ───→ localStorage/cookie │                  │
```

**Tokens Generados:**
- Access Token (15 min expiration)
- Refresh Token (7 días)
- Ambos vía JWT

---

### 3. PERFIL DE USUARIO (Profile Flow)

```
Usuario                Frontend              Backend            Supabase
   │                      │                     │                  │
   │─ Ir a Perfil ──→    │                     │                  │
   │                      │─ Verificar token   │                  │
   │                      │─ GET /users/profile ──→                │
   │                      │                     │─ RLS Check ──────→
   │                      │◄─ Datos del user ──│◄─ Solo su data ───
   │◄─ Mostrar datos ─    │                     │                  │
   │                      │                     │                  │
   │─ Editar campos ──→   │                     │                  │
   │  (name, goal, etc)   │─ PUT /users/profile ──→                │
   │                      │                     │─ Validar ────────→
   │                      │                     │─ Update ─────────→
   │                      │◄─ Datos actualizados ────────────────┤
   │◄─ Mostrar OK ────    │                     │                  │
```

**Datos Actualizables:**
- Name
- Daily calorie goal
- Avatar URL

---

### 4. CREAR RECETA (Recipe Creation Flow)

```
Usuario              Frontend            Backend            Supabase
   │                    │                   │                  │
   │─ Nueva receta ──→  │                   │                  │
   │                    │ Formulario        │                  │
   │─ Nombre            │  (title,          │                  │
   │  Descripción       │   description,    │                  │
   │  Porciones         │   servings,       │                  │
   │  Prep time         │   prep_time)      │                  │
   │                    │                   │                  │
   │─ Guardar ──────→   │─ POST /recipes ────→                │
   │                    │                   │─ Validar ──────→
   │                    │                   │─ Insert recipe ──→
   │                    │◄─ Recipe ID ──────│◄─ UUID ─────────
   │◄─ Ver receta ─     │ + redirect        │                  │
   │                    │                   │                  │
   │─ Agregar           │ Modal/Form        │                  │
   │  ingredientes      │ para ingredientes │                  │
```

**Datos de Receta:**
- Title (requerido)
- Description (opcional)
- Servings (default 1)
- Preparation time (opcional)
- Total calories (calculado)

---

### 5. AGREGAR INGREDIENTES (Ingredients Flow)

```
Usuario                 Frontend           Backend           Supabase
   │                        │                 │                  │
   │─ Nombre ingrediente   │                 │                  │
   │  Calorías por unidad  │                 │                  │
   │  Cantidad             │                 │                  │
   │  Unidad (g, ml, etc)  │ Form dinámico   │                  │
   │                        │                 │                  │
   │─ Agregar ──────────→  │                 │                  │
   │                        │─ POST /recipes/:id/ingredients ──→
   │                        │                 │─ Validar ──────→
   │                        │                 │─ RLS Check ────→
   │                        │                 │  (es su receta)│
   │                        │                 │─ Insert ────────→
   │                        │◄─ Ingrediente ──│◄─ UUID ────────
   │◄─ Mostrar en lista    │                 │                  │
   │                        │ Auto-actualiza  │                  │
   │                        │ total calorías  │                  │
   │                        │                 │                  │
   │─ Agregar más ───┐     │                 │                  │
   │  o Finalizar    │     │                 │                  │
   └─────────────────┘     │                 │                  │
```

**Cálculo de Calorías:**
```
Total = SUM(calories_per_unit × quantity)
Por porción = Total / servings
```

---

## 🏗️ Estructura Backend

```
backend/
├── src/
│   ├── index.ts                    # Entry point
│   ├── config.ts                   # Configuración
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # Verificar JWT
│   │   ├── errorHandler.ts         # Manejo de errores
│   │   ├── rateLimit.ts            # Rate limiting
│   │   └── validation.ts           # Validación de datos
│   │
│   ├── controllers/
│   │   ├── authController.ts       # Register, Login, Logout
│   │   ├── userController.ts       # Profile, Update
│   │   ├── recipeController.ts     # CRUD Recipes
│   │   └── ingredientController.ts # CRUD Ingredients
│   │
│   ├── services/
│   │   ├── authService.ts          # Lógica autenticación
│   │   ├── userService.ts          # Lógica usuarios
│   │   ├── recipeService.ts        # Lógica recetas
│   │   ├── ingredientService.ts    # Lógica ingredientes
│   │   └── supabaseService.ts      # Cliente Supabase
│   │
│   ├── routes/
│   │   ├── auth.ts                 # Rutas /auth
│   │   ├── users.ts                # Rutas /users
│   │   ├── recipes.ts              # Rutas /recipes
│   │   └── index.ts                # Consolidar rutas
│   │
│   ├── types/
│   │   ├── user.ts                 # Interfaces User
│   │   ├── recipe.ts               # Interfaces Recipe
│   │   └── common.ts               # Tipos comunes
│   │
│   └── utils/
│       ├── jwt.ts                  # JWT sign/verify
│       ├── password.ts             # bcrypt utils
│       ├── validators.ts           # Validaciones con Zod
│       └── logger.ts               # Logging
│
├── Dockerfile                       # Imagen Docker
├── package.json                     # Dependencias
├── tsconfig.json                    # Config TypeScript
└── .env.local                       # Variables (no subir)
```

---

## 🎨 Estructura Frontend

```
frontend/
├── src/
│   ├── App.tsx                     # Componente principal
│   ├── main.tsx                    # Entry point
│   │
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── RegisterForm.tsx    # Formulario registro
│   │   │   ├── LoginForm.tsx       # Formulario login
│   │   │   └── ProtectedRoute.tsx  # Guard de rutas
│   │   │
│   │   ├── Profile/
│   │   │   ├── ProfileCard.tsx     # Mostrar datos
│   │   │   ├── EditProfile.tsx     # Editar formulario
│   │   │   └── ChangePassword.tsx  # Cambiar password
│   │   │
│   │   ├── Recipes/
│   │   │   ├── RecipeList.tsx      # Listar recetas
│   │   │   ├── RecipeCard.tsx      # Tarjeta de receta
│   │   │   ├── RecipeForm.tsx      # Crear/editar
│   │   │   ├── RecipeDetail.tsx    # Ver detalles
│   │   │   └── RecipeDelete.tsx    # Confirmar borrado
│   │   │
│   │   ├── Ingredients/
│   │   │   ├── IngredientForm.tsx  # Agregar ingrediente
│   │   │   ├── IngredientList.tsx  # Listar ingredientes
│   │   │   ├── IngredientEdit.tsx  # Editar ingrediente
│   │   │   └── CalorieCounter.tsx  # Mostrar calorías
│   │   │
│   │   ├── Layout/
│   │   │   ├── Header.tsx          # Nav bar
│   │   │   ├── Sidebar.tsx         # Menu lateral
│   │   │   ├── Footer.tsx          # Footer
│   │   │   └── MainLayout.tsx      # Layout general
│   │   │
│   │   └── Common/
│   │       ├── Button.tsx          # Botón reutilizable
│   │       ├── Input.tsx           # Input reutilizable
│   │       ├── Loading.tsx         # Loading spinner
│   │       ├── Error.tsx           # Error message
│   │       └── Modal.tsx           # Modal genérico
│   │
│   ├── pages/
│   │   ├── Home.tsx                # Home/Dashboard
│   │   ├── Auth/
│   │   │   ├── RegisterPage.tsx    # Página registro
│   │   │   ├── LoginPage.tsx       # Página login
│   │   │   └── AuthCallback.tsx    # Callback
│   │   │
│   │   ├── Profile/
│   │   │   ├── ProfilePage.tsx     # Ver perfil
│   │   │   └── EditProfilePage.tsx # Editar perfil
│   │   │
│   │   ├── Recipes/
│   │   │   ├── RecipesPage.tsx     # Listar recetas
│   │   │   ├── CreateRecipePage.tsx# Crear receta
│   │   │   ├── RecipeDetailPage.tsx# Ver receta
│   │   │   └── EditRecipePage.tsx  # Editar receta
│   │   │
│   │   └── NotFound.tsx            # 404
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth context
│   │   ├── useRecipes.ts           # Recipes API
│   │   ├── useUser.ts              # User API
│   │   └── useForm.ts              # Form logic
│   │
│   ├── services/
│   │   ├── api.ts                  # Axios instance
│   │   ├── authService.ts          # Auth API calls
│   │   ├── userService.ts          # User API calls
│   │   ├── recipeService.ts        # Recipe API calls
│   │   └── ingredientService.ts    # Ingredient API calls
│   │
│   ├── context/
│   │   └── AuthContext.tsx         # Auth state global
│   │
│   ├── types/
│   │   ├── user.ts                 # User interfaces
│   │   ├── recipe.ts               # Recipe interfaces
│   │   └── common.ts               # Common types
│   │
│   ├── styles/
│   │   ├── index.css               # Tailwind imports
│   │   └── globals.css             # Estilos globales
│   │
│   └── utils/
│       ├── constants.ts            # Constantes
│       ├── formatters.ts           # Formateo de datos
│       └── validators.ts           # Validaciones frontend
│
├── Dockerfile                       # Imagen Docker
├── package.json                     # Dependencias
├── tsconfig.json                    # Config TypeScript
├── vite.config.ts                   # Configuración Vite
├── tailwind.config.js               # Configuración Tailwind
└── index.html                       # HTML base
```

---

## 🔐 Flujo de Seguridad

```
1. REGISTRO
   ┌──────────────────┐
   │ Usuario registra │
   │ Email + Password │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Validar datos        │
   │ - Email format       │
   │ - Password strength  │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Hash password        │
   │ bcrypt 12 rounds     │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Guardar en Supabase  │
   │ + RLS habilitado     │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Devolver 201 Created │
   │ + Redirect a login   │
   └──────────────────────┘

2. LOGIN
   ┌──────────────────┐
   │ Usuario login    │
   │ Email + Password │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Buscar usuario       │
   │ en Supabase          │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ bcrypt.compare()     │
   │ Password vs Hash     │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Generar JWT tokens   │
   │ - Access (15m)       │
   │ - Refresh (7d)       │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Devolver tokens      │
   │ Cliente guarda en    │
   │ localStorage/cookie  │
   └──────────────────────┘

3. REQUESTS AUTENTICADOS
   ┌──────────────────────────┐
   │ Frontend envia request   │
   │ Con JWT en header        │
   │ Authorization: Bearer .. │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Backend verifica token   │
   │ jwt.verify(token, secret)│
   └────────┬─────────────────┘
            │
      ┌─────┴─────┐
      │            │
      ▼            ▼
   VÁLIDO      INVÁLIDO
      │            │
      │            ▼
      │      ┌──────────────────┐
      │      │ Return 401       │
      │      │ Pedir re-login   │
      │      └──────────────────┘
      │
      ▼
   ┌──────────────────────────┐
   │ Procesar request         │
   │ RLS en Supabase          │
   │ Validar datos            │
   └──────────────────────────┘
```

---

## 📦 Stack Tecnológico (Resumen)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de Datos:** Supabase (PostgreSQL)
- **Cliente DB:** Supabase JS SDK
- **Autenticación:** JWT
- **Hashing:** bcryptjs
- **Validación:** Zod
- **CORS:** cors package
- **Rate Limiting:** express-rate-limit
- **Logging:** winston o pino

### Frontend
- **Framework:** React 18+
- **Lenguaje:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **UI Components:** ShadcN/UI (optional)
- **Form Validation:** React Hook Form + Zod

### DevOps
- **Containers:** Docker
- **Orchestration:** Docker Compose
- **Database:** Supabase (PostgreSQL)
- **SSL/TLS:** En producción

---

## 🚀 Deployment (Futuro)

```
Supabase (BD)
     │
     ▼
┌─────────────────┐
│  Backend:       │  → Vercel / Railway
│  Node.js API    │
└─────────────────┘
     ▲
     │
┌─────────────────┐
│  Frontend:      │  → Vercel / Netlify
│  React App      │
└─────────────────┘
     ▲
     │
  Usuario
```

---

## ✅ Checklist de Implementación

**Backend:**
- [ ] Proyecto Node.js + Express + TypeScript
- [ ] Configuración de .env
- [ ] Conexión a Supabase
- [ ] Endpoints de autenticación
- [ ] Endpoints de usuarios
- [ ] Endpoints de recetas
- [ ] Endpoints de ingredientes
- [ ] Middleware de autenticación
- [ ] Validación de datos
- [ ] Rate limiting
- [ ] Error handling
- [ ] Logging
- [ ] Dockerfile

**Frontend:**
- [ ] Proyecto React + Vite + TypeScript
- [ ] Configuración de Tailwind
- [ ] Pages de autenticación
- [ ] Pages de perfil
- [ ] Pages de recetas
- [ ] Componentes reutilizables
- [ ] Context de autenticación
- [ ] Services de API
- [ ] Manejo de errores
- [ ] Responsive design
- [ ] Dockerfile

**DevOps:**
- [ ] docker-compose.yml
- [ ] .env.example
- [ ] Variables de entorno
- [ ] Documentación

---

**Creado:** Abril 2024
**Última actualización:** Abril 2024
