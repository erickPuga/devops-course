# 🎨 Memoria de Progreso - Implementación del Frontend

**Proyecto:** Recipe Calories App  
**Fecha de actualización:** 30 de Octubre, 2026  
**Estado:** ✅ Frontend Base Implementado y Contenedorizado  

---

## 📌 1. Resumen Ejecutivo de los Cambios

Se realizó la lectura completa de la arquitectura del backend (API Express, autenticación JWT, esquemas Zod y base de datos PostgreSQL/Supabase) y se implementó de raíz el **Frontend** de la aplicación, el cual se encontraba pendiente en el roadmap original del proyecto.

El frontend fue desarrollado bajo una arquitectura modular y desacoplada, con tipado estricto en TypeScript, diseño responsivo optimizado para móviles y escritorio, y preparado tanto para desarrollo con recarga rápida (HMR) como para despliegue en producción con Nginx y Docker Compose.

---

## 🛠️ 2. Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Framework** | React 18 (`react`, `react-dom`) | Biblioteca para construcción de interfaz de usuario |
| **Lenguaje** | TypeScript 5.2 | Tipado estricto en modelos, props y servicios |
| **Empaquetador** | Vite 5 | Servidor de desarrollo ultrarrápido y bundler |
| **Enrutamiento** | React Router v6 | Enrutamiento del cliente con guardias de rutas |
| **Estilos** | Tailwind CSS 3.4 + PostCSS | Sistema de diseño atómico y responsivo |
| **Formularios** | React Hook Form + Zod | Gestión de formularios y validación de esquemas |
| **Cliente HTTP** | Axios | Cliente API con interceptores para tokens JWT |
| **Visualización** | Recharts | Gráficos circulares de seguimiento de calorías |
| **Feedback UI** | React Hot Toast | Notificaciones flotantes contextuales |
| **Iconografía** | Lucide React | Iconos vectoriales consistentes |

---

## 📂 3. Estructura de Archivos Creados

```
app/
├── docker-compose.yml                  # [MODIFICADO] Servicio 'frontend' activado
└── frontend/                           # [NUEVO DIRECTORIO]
    ├── .gitignore                      # Exclusiones de node_modules, dist, logs
    ├── index.html                      # Entry HTML con fuentes Inter
    ├── package.json                    # Scripts y dependencias
    ├── tsconfig.json                   # Reglas de TS y alias '@/*'
    ├── tsconfig.node.json              # Configuración TS para Vite
    ├── vite.config.ts                  # Servidor en puerto 3000 + Proxy API a 3001
    ├── tailwind.config.js              # Paleta temática nutrición/salud
    ├── postcss.config.js               # Pipeline de Tailwind y Autoprefixer
    ├── Dockerfile.dev                  # Docker para desarrollo con HMR
    ├── Dockerfile                      # Docker multi-stage para producción
    ├── nginx.conf                      # Servidor Web estático + SPA fallback + reverse proxy
    └── src/
        ├── main.tsx                    # Punto de entrada de la aplicación React
        ├── App.tsx                     # Definición de rutas y layout base
        ├── index.css                   # Capas base y clases utilitarias de Tailwind
        ├── types/
        │   └── index.ts                # Interfaces de User, Recipe, Ingredient, DTOs
        ├── services/
        │   ├── api.ts                  # Instancia Axios con interceptores de Bearer Token
        │   ├── auth.ts                 # Endpoints auth (/login, /register, /profile, /change-password)
        │   └── recipes.ts              # Endpoints CRUD (/recipes, /recipes/:id/ingredients)
        ├── context/
        │   └── AuthContext.tsx         # Estado global de sesión de usuario y persistencia
        ├── components/
        │   ├── auth/
        │   │   └── ProtectedRoute.tsx  # Guardias: ProtectedRoute y GuestRoute
        │   └── layout/
        │       ├── Navbar.tsx          # Barra de navegación adaptable (desktop/móvil)
        │       └── AppLayout.tsx       # Plantilla contenedora para vistas privadas
        └── pages/
            ├── LoginPage.tsx           # Formulario de inicio de sesión
            ├── RegisterPage.tsx        # Registro de cuenta y meta calórica
            ├── DashboardPage.tsx       # Resumen de calorías, gráfico radial y recetas
            ├── RecipesPage.tsx         # Lista con búsqueda con debounce y paginación
            ├── RecipeDetailPage.tsx    # Vista completa de receta y gestión de ingredientes
            ├── RecipeFormPage.tsx      # Crear / Editar datos de receta
            └── ProfilePage.tsx         # Datos personales y cambio de contraseña
```

---

## 🔍 4. Detalle de Módulos Implementados

### A. Autenticación y Seguridad
* **Interceptor Axios**: Adjunta automáticamente el `accessToken` en la cabecera `Authorization: Bearer <token>`.
* **Manejo de Expiración**: Manejo de respuestas `401` intentando renovar token con `/auth/refresh` y redirección a `/login` si caduca la sesión.
* **Control de Rutas**:
  * `GuestRoute`: Redirige automáticamente al `/dashboard` si el usuario ya está autenticado.
  * `ProtectedRoute`: Bloquea acceso a rutas privadas y redirige a `/login` si no hay sesión activa.

### B. Dashboard de Nutrición
* **Cálculo en Tiempo Real**: Sumatoria de calorías de las recetas versus la meta diaria del usuario (`dailyCalorieGoal`).
* **Gráfica Radial**: Indicador visual circular con porcentaje de avance y calorías restantes.
* **Métricas Clave**: Total de recetas, calorías registradas hoy, calorías restantes y porcentaje de meta alcanzada.

### C. Gestión de Recetas e Ingredientes
* **Búsqueda Dinámica**: Búsqueda por título o descripción con retardo (*debounce* de 400ms) para optimizar consultas.
* **Paginación Integrada**: Soporta navegación por páginas según respuesta del backend.
* **Ingredientes In-line**:
  * Agregar nuevos ingredientes sin salir de la página de la receta.
  * Edición rápida en fila (*inline*) y eliminación con recálculo dinámico de calorías totales y por porción.

### D. Perfil de Usuario
* Edición de información del perfil (nombre y meta diaria).
* Pestaña de seguridad para cambio seguro de contraseña validando la contraseña actual.

---

## 🐳 5. Configuración de Entornos y Docker

### Docker Compose (`app/docker-compose.yml`)
Se integró el contenedor del frontend en la red `recipe_network`:
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev
  container_name: recipe_frontend
  ports:
    - "3000:3000"
  env_file:
    - .env
  environment:
    - VITE_API_URL=http://localhost:3001/api
  volumes:
    - ./frontend/src:/app/src
    - /app/node_modules
  depends_on:
    - backend
  networks:
    - recipe_network
```

---

## 📋 6. Estado de Verificación y Próximos Pasos

### ✅ Completado
- [x] Arquitectura de carpetas y configuración inicial de Vite + TS.
- [x] Configuración de Tailwind CSS con estilos globales y componentes reutilizables.
- [x] Clientes API para autenticación, recetas e ingredientes.
- [x] Enrutamiento protegido y público con React Router.
- [x] Vistas de Login, Registro, Dashboard, Recetas, Detalle/Ingredientes, Formularios y Perfil.
- [x] Dockerfile de desarrollo y producción (Nginx).
- [x] Habilitación y orquestación en `docker-compose.yml`.

### 🚀 Próximas Tareas Sugeridas
1. **Ejecutar pruebas integradas**:
   ```bash
   cd app
   docker compose up --build
   ```
2. **Testing**:
   - Configurar Vitest + React Testing Library para pruebas unitarias de componentes y hooks en el frontend.
3. **CI/CD Pipeline**:
   - Incorporar el paso de linting y build del frontend dentro del workflow de GitHub Actions (`.github/workflows/ci-cd.yml`).

