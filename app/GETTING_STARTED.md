# 🚀 Getting Started - Recipe Calories App

## Resumen Rápido

Acabamos de crear toda la estructura para tu app de recetas con Supabase.

### ¿Qué tienes listo?

✅ **Documentación completa** en `/docs/`
✅ **Schema de base de datos** listo para Supabase
✅ **Docker Compose** configurado
✅ **Variables de entorno** template
✅ **Archivos de seguridad** y autenticación

---

## 📋 Pasos Siguientes (In Order)

### 1️⃣ **Setup de Supabase (5-10 minutos)**

Sigue `docs/SETUP_SUPABASE.md` para:
- Crear cuenta en Supabase
- Crear proyecto
- Ejecutar schema SQL
- Obtener credenciales

**GUARDAR BIEN LAS CREDENCIALES**

---

### 2️⃣ **Configurar .env (2 minutos)**

```bash
cd /Users/erickpuga/Documents/Personal/devops/app
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://your-project-hash.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
JWT_SECRET=cambiar-esto-en-produccion
```

---

### 3️⃣ **Crear Backend (15-20 minutos)**

```bash
cd backend
npm init -y
```

**Instalar dependencias:**
```bash
npm install express cors dotenv bcryptjs jsonwebtoken zod axios
npm install -D typescript @types/node @types/express ts-node nodemon
```

**Crear estructura:**
```bash
mkdir -p src/{controllers,services,middleware,routes,types,utils}
touch src/index.ts
```

**Crearé los archivos en el próximo paso...**

---

### 4️⃣ **Crear Frontend (15-20 minutos)**

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
```

**Instalar dependencias:**
```bash
npm install @supabase/supabase-js axios zustand react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### 5️⃣ **Crear Dockerfile para Backend**

En `backend/Dockerfile`

---

### 6️⃣ **Crear Dockerfile para Frontend**

En `frontend/Dockerfile`

---

### 7️⃣ **Levantar con Docker Compose**

```bash
docker-compose up -d
```

Verificar en:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- pgAdmin: http://localhost:5050

---

## 📂 Estructura Actual

```
app/
├── backend/                    # 📝 TODO
├── frontend/                   # 📝 TODO
├── docs/
│   ├── SETUP_SUPABASE.md      ✅ Pronto
│   ├── database-schema.sql    ✅ Listo
│   ├── API.md                 ✅ Listo
│   ├── SECURITY.md            ✅ Listo
├── docker-compose.yml          ✅ Listo
├── .env.example               ✅ Listo
└── README.md                  ✅ Listo
```

---

## 📚 Documentación Disponible

| Documento | Propósito |
|-----------|-----------|
| `README.md` | Visión general del proyecto |
| `docs/SETUP_SUPABASE.md` | Setup paso a paso de Supabase |
| `docs/database-schema.sql` | Script SQL para crear tablas |
| `docs/API.md` | Especificación completa de endpoints |
| `docs/SECURITY.md` | Guía de seguridad y best practices |
| `.env.example` | Variables de entorno necesarias |
| `docker-compose.yml` | Configuración de contenedores |

---

## 🔑 Credenciales que Necesitarás

Después de crear proyecto en Supabase, obtendrás:

```
VITE_SUPABASE_URL=              ← URL de tu proyecto
VITE_SUPABASE_ANON_KEY=         ← Clave pública
SUPABASE_SERVICE_ROLE_KEY=      ← Clave privada (GUARDAR!)
JWT_SECRET=                     ← Generar uno fuerte
```

---

## 💡 Tips

- **Documentación es tu amiga** - Lee `docs/SETUP_SUPABASE.md` primero
- **No subes .env a git** - Está en `.gitignore`
- **Supabase free tier es suficiente** para desarrollo y demo
- **Lee `docs/SECURITY.md`** antes de tocar autenticación

---

## 🎯 Objetivo Final

Una app fullstack con:
- ✅ Autenticación (registro/login)
- ✅ Perfil de usuario
- ✅ CRUD de recetas
- ✅ Cálculo de calorías
- ✅ Seguridad integrada
- ✅ Todo en Docker

---

## 📞 Próximo Paso

**Empezar con el Backend** - Te guiaré para crear todos los archivos necesarios.

¿Listo? 🚀

---

**Última actualización:** Abril 2024
