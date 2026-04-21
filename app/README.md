# 🍳 Recipe Calories App

Una aplicación fullstack para crear y gestionar recetas contando calorías, con autenticación segura y base de datos PostgreSQL.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local)
- Cuenta en [Supabase](https://supabase.com)

## 🚀 Configuración Inicial

### 1. Clonar/Descargar el Proyecto
```bash
cd /Users/erickpuga/Documents/Personal/devops/app
```

### 2. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ejecutar el SQL en `docs/database-schema.sql` en el editor SQL de Supabase
4. Copiar las credenciales a `.env`

### 3. Crear archivo `.env`
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=tu-secreto-super-seguro
```

### 4. Ejecutar con Docker Compose
```bash
docker-compose up -d
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **pgAdmin**: http://localhost:5050 (opcional)

## 📁 Estructura del Proyecto

```
app/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── types/
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docs/                 # Documentación
│   ├── database-schema.sql
│   ├── API.md
│   └── SECURITY.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Desarrollo Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Base de Datos

### Crear Tablas en Supabase
1. Ir a SQL Editor en Supabase Dashboard
2. Copiar contenido de `docs/database-schema.sql`
3. Ejecutar

### Tablas Creadas
- `users` - Información de usuarios
- `recipes` - Recetas de usuarios
- `ingredients` - Ingredientes de recetas

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- RLS (Row Level Security) en Supabase
- CORS configurado
- Rate limiting en API

Ver `docs/SECURITY.md` para más detalles.

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil

### Recetas
- `GET /api/recipes` - Listar recetas
- `POST /api/recipes` - Crear receta
- `GET /api/recipes/:id` - Obtener receta
- `PUT /api/recipes/:id` - Actualizar receta
- `DELETE /api/recipes/:id` - Eliminar receta

Ver `docs/API.md` para documentación completa.

## 🛑 Detener Contenedores
```bash
docker-compose down
```

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 🐛 Troubleshooting

### Puerto ya en uso
```bash
# Cambiar puertos en docker-compose.yml o:
docker-compose down
```

### Problemas con Supabase
- Verificar credenciales en `.env`
- Confirmar que RLS está habilitado
- Revisar logs de Supabase

## 📞 Soporte

Para más información, revisar:
- `docs/SECURITY.md` - Consideraciones de seguridad
- `docs/API.md` - Documentación de API
- `docs/database-schema.sql` - Schema de BD

---

**Desarrollado con ❤️ para aprender fullstack development**
