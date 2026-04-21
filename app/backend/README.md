# Backend - Recipe Calories App

Backend minimalista para la aplicación de recetas con conteo de calorías, construido con Express + TypeScript + Supabase.

## 📋 Características Actuales

- ✅ Registro de usuarios
- ✅ Login
- ✅ Obtener perfil
- ✅ Actualizar perfil
- ✅ Cambiar contraseña
- ✅ Autenticación con JWT

## 🚀 Iniciar el Servidor

### Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Build

```bash
npm run build
npm start
```

## 📚 Endpoints API

### Autenticación

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "dailyCalorieGoal": 2000
}
```

**Response (201)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "dailyCalorieGoal": 2000,
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Usuarios

#### Obtener Perfil
```http
GET /api/users/profile
Authorization: Bearer <accessToken>
```

**Response (200)**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "dailyCalorieGoal": 2000,
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Actualizar Perfil
```http
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Jane Doe",
  "dailyCalorieGoal": 2500
}
```

#### Cambiar Contraseña
```http
POST /api/users/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

## 🔐 Autenticación

El API usa JWT (JSON Web Tokens) para autenticación:

- **Access Token**: Válido por 15 minutos (configurable)
- **Refresh Token**: Válido por 7 días (configurable)

Incluir el token en el header:
```
Authorization: Bearer <accessToken>
```

## 🛠️ Stack Tecnológico

- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos PostgreSQL
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Zod** - Validación de esquemas

## 📝 Variables de Entorno

Crear `.env` basado en `.env.example`:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend
NODE_ENV=development
BACKEND_PORT=3001
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Próximos Pasos

- [ ] Endpoints de recetas (CRUD)
- [ ] Endpoints de ingredientes (CRUD)
- [ ] Refresh token endpoint
- [ ] Rate limiting
- [ ] Logging estructurado
- [ ] Swagger/OpenAPI
- [ ] Tests unitarios
