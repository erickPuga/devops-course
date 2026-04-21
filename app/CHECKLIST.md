# ✅ CHECKLIST - Recipe Calories App

## FASE 0: SETUP (AHORA MISMO)

### Leer Documentación (30 minutos)
- [ ] Leer `PLAN_RESUMEN.md`
- [ ] Leer `GETTING_STARTED.md`
- [ ] Leer `EJECUTIVO.md`
- [ ] Entender la arquitectura general

### Preparar Supabase (1-2 horas)
- [ ] Crear cuenta en supabase.com
- [ ] Crear nuevo proyecto
- [ ] Ir a SQL Editor
- [ ] Copiar contenido de `docs/database-schema.sql`
- [ ] Ejecutar SQL (Cmd+Enter)
- [ ] Verificar que no hay errores
- [ ] Ir a Table Editor
- [ ] Confirmar que existen: users, recipes, ingredients
- [ ] Ir a Settings → API
- [ ] Copiar VITE_SUPABASE_URL
- [ ] Copiar VITE_SUPABASE_ANON_KEY
- [ ] Copiar SUPABASE_SERVICE_ROLE_KEY

### Preparar Proyecto Local (30 minutos)
- [ ] Copiar `.env.example` → `.env`
- [ ] Editar `.env` con credenciales Supabase
- [ ] Editar `.env` y cambiar JWT_SECRET
- [ ] Generar JWT_SECRET fuerte (64 caracteres)
- [ ] Confirmar que `.env` NO está en git
- [ ] Crear carpeta `backend/`
- [ ] Crear carpeta `frontend/`

---

## FASE 1: BACKEND (Semana 1-2)

### Inicializar Proyecto
- [ ] `cd backend`
- [ ] `npm init -y`
- [ ] Crear `package.json` correcto
- [ ] `npm install express cors dotenv bcryptjs jsonwebtoken axios zod`
- [ ] `npm install -D typescript @types/node @types/express ts-node nodemon`
- [ ] Crear `tsconfig.json`
- [ ] Crear `Dockerfile`

### Estructura de Carpetas
- [ ] `mkdir -p src/{controllers,services,middleware,routes,types,utils}`
- [ ] `touch src/index.ts`

### Configuración Base
- [ ] `src/config.ts` - Cargar variables de entorno
- [ ] `src/index.ts` - Entry point
- [ ] `src/utils/jwt.ts` - Funciones JWT
- [ ] `src/utils/password.ts` - Funciones bcrypt
- [ ] `src/utils/validators.ts` - Zod schemas

### Middleware
- [ ] `src/middleware/auth.ts` - Verificar JWT
- [ ] `src/middleware/errorHandler.ts` - Manejo de errores
- [ ] `src/middleware/validation.ts` - Validar requests

### Rutas de Autenticación
- [ ] `src/routes/auth.ts` - Rutas /auth
- [ ] `src/controllers/authController.ts` - Lógica de auth
- [ ] `src/services/authService.ts` - Conectar Supabase
- [ ] **POST /auth/register** - Crear usuario
- [ ] **POST /auth/login** - Retornar JWT
- [ ] **POST /auth/logout** - Limpiar sesión
- [ ] **POST /auth/refresh** - Nuevo token

### Rutas de Usuarios
- [ ] `src/routes/users.ts` - Rutas /users
- [ ] `src/controllers/userController.ts` - Lógica usuarios
- [ ] `src/services/userService.ts` - BD usuarios
- [ ] **GET /users/profile** - Obtener perfil
- [ ] **PUT /users/profile** - Actualizar perfil
- [ ] **POST /users/change-password** - Cambiar password

### Rutas de Recetas
- [ ] `src/routes/recipes.ts` - Rutas /recipes
- [ ] `src/controllers/recipeController.ts` - Lógica recetas
- [ ] `src/services/recipeService.ts` - BD recetas
- [ ] **GET /recipes** - Listar recetas
- [ ] **POST /recipes** - Crear receta
- [ ] **GET /recipes/:id** - Ver receta
- [ ] **PUT /recipes/:id** - Editar receta
- [ ] **DELETE /recipes/:id** - Eliminar receta

### Rutas de Ingredientes
- [ ] `src/routes/ingredients.ts` - Rutas /ingredients
- [ ] `src/controllers/ingredientController.ts` - Lógica ingredientes
- [ ] `src/services/ingredientService.ts` - BD ingredientes
- [ ] **POST /recipes/:id/ingredients** - Agregar ingrediente
- [ ] **PUT /recipes/:id/ingredients/:ingId** - Editar ingrediente
- [ ] **DELETE /recipes/:id/ingredients/:ingId** - Eliminar

### Testing Backend
- [ ] Ejecutar `npm run dev`
- [ ] Testear registro con cURL/Postman
- [ ] Testear login con cURL/Postman
- [ ] Verificar que JWT se retorna
- [ ] Testear endpoint protegido
- [ ] Verificar que RLS funciona

### Seguridad Backend
- [ ] [ ] Rate limiting implementado
- [ ] [ ] CORS configurado correctamente
- [ ] [ ] Validación de inputs con Zod
- [ ] [ ] Hashing de contraseñas correcto
- [ ] [ ] JWT expiration configurado
- [ ] [ ] Error messages no revelan información

### Documentación Backend
- [ ] Comentarios en código
- [ ] README en backend/
- [ ] Ejemplos de requests

---

## FASE 2: FRONTEND (Semana 2-3)

### Inicializar Proyecto
- [ ] `cd ../frontend`
- [ ] `npm create vite@latest . -- --template react-ts`
- [ ] `npm install`
- [ ] Crear `Dockerfile`

### Instalar Dependencias
- [ ] `npm install axios zustand react-router-dom`
- [ ] `npm install -D tailwindcss postcss autoprefixer`
- [ ] `npx tailwindcss init -p`

### Estructura de Carpetas
- [ ] `mkdir -p src/{components,pages,hooks,services,types,context,utils}`

### Componentes Comunes
- [ ] `src/components/Layout/Header.tsx`
- [ ] `src/components/Layout/Sidebar.tsx`
- [ ] `src/components/Layout/MainLayout.tsx`
- [ ] `src/components/Common/Button.tsx`
- [ ] `src/components/Common/Input.tsx`
- [ ] `src/components/Common/Loading.tsx`
- [ ] `src/components/Common/Error.tsx`

### Autenticación Frontend
- [ ] `src/context/AuthContext.tsx` - Auth state global
- [ ] `src/components/Auth/ProtectedRoute.tsx` - Guard de rutas
- [ ] `src/components/Auth/RegisterForm.tsx` - Formulario registro
- [ ] `src/components/Auth/LoginForm.tsx` - Formulario login
- [ ] `src/pages/Auth/RegisterPage.tsx` - Página registro
- [ ] `src/pages/Auth/LoginPage.tsx` - Página login

### Perfil de Usuario
- [ ] `src/components/Profile/ProfileCard.tsx`
- [ ] `src/components/Profile/EditProfile.tsx`
- [ ] `src/components/Profile/ChangePassword.tsx`
- [ ] `src/pages/Profile/ProfilePage.tsx`
- [ ] `src/pages/Profile/EditProfilePage.tsx`

### Recetas
- [ ] `src/components/Recipes/RecipeList.tsx`
- [ ] `src/components/Recipes/RecipeCard.tsx`
- [ ] `src/components/Recipes/RecipeForm.tsx`
- [ ] `src/components/Recipes/RecipeDetail.tsx`
- [ ] `src/pages/Recipes/RecipesPage.tsx`
- [ ] `src/pages/Recipes/CreateRecipePage.tsx`
- [ ] `src/pages/Recipes/RecipeDetailPage.tsx`
- [ ] `src/pages/Recipes/EditRecipePage.tsx`

### Ingredientes
- [ ] `src/components/Ingredients/IngredientForm.tsx`
- [ ] `src/components/Ingredients/IngredientList.tsx`
- [ ] `src/components/Ingredients/CalorieCounter.tsx`

### Services API
- [ ] `src/services/api.ts` - Axios instance
- [ ] `src/services/authService.ts` - Auth API calls
- [ ] `src/services/userService.ts` - User API calls
- [ ] `src/services/recipeService.ts` - Recipe API calls
- [ ] `src/services/ingredientService.ts` - Ingredient API calls

### Hooks
- [ ] `src/hooks/useAuth.ts` - Auth management
- [ ] `src/hooks/useRecipes.ts` - Recipes management
- [ ] `src/hooks/useUser.ts` - User management

### Routing
- [ ] `src/App.tsx` - Rutas principales
- [ ] Ruta home `/`
- [ ] Ruta login `/login`
- [ ] Ruta register `/register`
- [ ] Ruta perfil `/profile`
- [ ] Ruta recetas `/recipes`
- [ ] Ruta nueva receta `/recipes/new`
- [ ] Ruta detalle `/recipes/:id`

### Estilos
- [ ] `src/styles/index.css` - Tailwind imports
- [ ] `src/styles/globals.css` - Estilos globales
- [ ] Tailwind config completo
- [ ] Responsive design
- [ ] Dark mode (opcional)

### Testing Frontend
- [ ] `npm run dev`
- [ ] Acceder a http://localhost:3000
- [ ] Probar formulario de registro
- [ ] Probar formulario de login
- [ ] Verificar que JWT se guarda
- [ ] Probar que se redirige a dashboard
- [ ] Probar que rutas están protegidas

### Integración Frontend-Backend
- [ ] Verificar que backend está corriendo
- [ ] Verificar que frontend puede conectar
- [ ] Probar registro end-to-end
- [ ] Probar login end-to-end
- [ ] Probar crear receta
- [ ] Probar listar recetas
- [ ] Probar agregar ingredientes

---

## FASE 3: DOCKER & TESTING (Semana 3-4)

### Docker
- [ ] `backend/Dockerfile` creado
- [ ] `frontend/Dockerfile` creado
- [ ] `docker-compose.yml` configurado
- [ ] `docker-compose up -d`
- [ ] Verificar que todo levanta
- [ ] Frontend en http://localhost:3000
- [ ] Backend en http://localhost:3001
- [ ] pgAdmin en http://localhost:5050 (opcional)

### Testing Local
- [ ] Crear usuario de test
- [ ] Hacer login
- [ ] Ver perfil
- [ ] Crear receta
- [ ] Agregar ingredientes
- [ ] Ver calorías totales
- [ ] Editar receta
- [ ] Eliminar ingrediente
- [ ] Eliminar receta
- [ ] Logout

### Validación
- [ ] Probar que no puedo registrar email duplicado
- [ ] Probar que password débil es rechazado
- [ ] Probar que solo veo mis recetas
- [ ] Probar que no puedo editar receta ajena
- [ ] Probar que calorías se calculan correctamente
- [ ] Probar que logout funciona
- [ ] Probar que re-login funciona

### Seguridad Testing
- [ ] Verificar que JWT expira
- [ ] Verificar que refresh token funciona
- [ ] Probar rate limiting
- [ ] Verificar que contraseña está hasheada
- [ ] Probar que no se ve info sensible en errores

---

## FASE 4: SEGURIDAD & PRODUCCIÓN (Semana 4)

### Implementar Seguridad
- [ ] Rate limiting en /auth/login (5 intentos/15min)
- [ ] Rate limiting general (100 requests/15min)
- [ ] CORS restrictivo a solo dominio
- [ ] Headers de seguridad (helmet)
- [ ] Validación mejorada con Zod
- [ ] Sanitización de inputs
- [ ] Logging de eventos importantes
- [ ] Error handling sin exponer detalles

### Pre-Producción Checklist
- [ ] `docs/SECURITY.md` - Leer todo
- [ ] [ ] JWT_SECRET es único y fuerte
- [ ] [ ] CORS solo permite dominio correcto
- [ ] [ ] Contraseñas hasheadas (bcrypt)
- [ ] [ ] RLS habilitado en Supabase
- [ ] [ ] Rate limiting activo
- [ ] [ ] .env en .gitignore
- [ ] [ ] npm audit sin vulnerabilidades críticas
- [ ] [ ] No hay credenciales en código
- [ ] [ ] HTTPS habilitado
- [ ] [ ] Backups configurados
- [ ] [ ] Logs de auditoría

### Testing de Seguridad
- [ ] [ ] Intentar inyección SQL
- [ ] [ ] Intentar XSS
- [ ] [ ] Intentar CSRF
- [ ] [ ] Intentar acceso a datos ajenos
- [ ] [ ] Intentar brute force
- [ ] [ ] Verificar tokens expiran
- [ ] [ ] Verificar que no hay info sensible en logs

### Documentación
- [ ] README.md actualizado
- [ ] CONTRIBUTING.md creado
- [ ] API.md actualizado
- [ ] DEPLOYMENT.md creado

---

## FASE 5: DEPLOYMENT (Semana 4)

### Preparar Producción
- [ ] Cambiar VITE_API_URL a dominio producción
- [ ] Cambiar CORS_ORIGIN a dominio producción
- [ ] Generar nuevo JWT_SECRET fuerte
- [ ] Cambiar NODE_ENV=production
- [ ] Configurar HTTPS/SSL

### Deploy Backend
- [ ] [ ] Seleccionar proveedor (Vercel/Railway/Render)
- [ ] [ ] Conectar repositorio
- [ ] [ ] Configurar variables de entorno
- [ ] [ ] Deploy rama main
- [ ] [ ] Verificar que funciona

### Deploy Frontend
- [ ] [ ] Seleccionar proveedor (Vercel/Netlify)
- [ ] [ ] Conectar repositorio
- [ ] [ ] Configurar variables de entorno
- [ ] [ ] Deploy rama main
- [ ] [ ] Verificar que funciona

### Post-Deploy Testing
- [ ] [ ] Testear registro en producción
- [ ] [ ] Testear login en producción
- [ ] [ ] Testear CRUD recetas en producción
- [ ] [ ] Verificar que no hay errores en console
- [ ] [ ] Verificar que logs se guardan
- [ ] [ ] Monitoreo activo

### Monitoreo
- [ ] [ ] Setup alertas de errores
- [ ] [ ] Setup monitoreo de performance
- [ ] [ ] Setup backup automático de BD
- [ ] [ ] Plan de recuperación ante desastres

---

## BONUS: FUTURO ENHANCEMENTS

### Features Adicionales
- [ ] Sistema de favoritos
- [ ] Compartir recetas
- [ ] Importar recetas
- [ ] Historial de consumo
- [ ] Notificaciones
- [ ] App móvil
- [ ] Modo oscuro
- [ ] Multi-idioma

### Optimizaciones
- [ ] Caché con Redis
- [ ] Compresión de imágenes
- [ ] Lazy loading
- [ ] Service Workers
- [ ] PWA

### Testing Avanzado
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests con Cypress
- [ ] Performance testing
- [ ] Load testing

---

## 📊 PROGRESO TRACKER

```
SETUP:           ████░░░░░░░░░░░░░░░  20%
BACKEND:         ░░░░░░░░░░░░░░░░░░░░   0%
FRONTEND:        ░░░░░░░░░░░░░░░░░░░░   0%
DOCKER:          ░░░░░░░░░░░░░░░░░░░░   0%
SEGURIDAD:       ░░░░░░░░░░░░░░░░░░░░   0%
DEPLOYMENT:      ░░░░░░░░░░░░░░░░░░░░   0%
─────────────────────────────────────
TOTAL:           ████░░░░░░░░░░░░░░░  20%
```

---

## 🚀 EMPEZAR AHORA

1. [ ] Leer documentación (este checklist)
2. [ ] Setup Supabase
3. [ ] Copiar credenciales a .env
4. [ ] Empezar con Backend
5. [ ] Luego Frontend
6. [ ] Docker + Testing
7. [ ] Seguridad
8. [ ] Deploy

---

## 📞 PROBLEMAS?

- Backend no conecta BD → Revisar .env y RLS
- Frontend no conecta API → Revisar CORS y URL
- Tests fallan → Revisar que Supabase esté up
- Docker no levanta → Revisar puertos disponibles

---

## ✨ CUANDO TERMINES

- [ ] App funcionando localmente
- [ ] App en producción
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Monitoreo activo
- [ ] Celebrar 🎉

---

**Última actualización:** Abril 2024
**Mantente actualizado este checklist** ✅
