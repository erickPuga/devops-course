# 🎯 Backend Setup Completado

## ✅ Lo que hemos creado

Un backend minimalista y funcional **solo para usuarios** con:

### 📦 Estructura
```
backend/
├── src/
│   ├── index.ts              ← Servidor Express principal
│   ├── config.ts             ← Variables de entorno
│   ├── db.ts                 ← Cliente Supabase
│   ├── types.ts              ← Tipos y validaciones Zod
│   ├── utils.ts              ← JWT y bcrypt
│   ├── middleware/auth.ts    ← Protector de rutas
│   ├── services/             ← Lógica de negocio
│   └── routes/auth.ts        ← Endpoints
├── dist/                     ← Output compilado
├── Dockerfile                ← Para producción
├── Dockerfile.dev           ← Para desarrollo
└── package.json             ← Dependencias
```

## 🚀 5 Endpoints Funcionales

### Sin autenticación
1. **POST /api/auth/register** - Crear usuario
   ```json
   {
     "email": "user@example.com",
     "password": "password123",
     "name": "John Doe",
     "dailyCalorieGoal": 2000
   }
   ```

2. **POST /api/auth/login** - Obtener tokens
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

### Con autenticación (Bearer Token)
3. **GET /api/users/profile** - Ver perfil

4. **PUT /api/users/profile** - Actualizar datos
   ```json
   {
     "name": "Jane Doe",
     "dailyCalorieGoal": 2500
   }
   ```

5. **POST /api/users/change-password** - Cambiar contraseña
   ```json
   {
     "currentPassword": "password123",
     "newPassword": "newpassword456"
   }
   ```

## 🔐 Seguridad Implementada

✅ **Contraseñas**: Hasheadas con bcrypt (salt: 10)
✅ **Tokens JWT**: Access (15min) + Refresh (7 días)
✅ **Validación**: Zod en todos los inputs
✅ **CORS**: Configurado para localhost:3000
✅ **Middleware**: Protección de rutas

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Express.js |
| Lenguaje | TypeScript |
| BD | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| Validación | Zod |
| Runtime | Node.js 20 |

## 💻 Cómo Correr

### Desarrollo
```bash
cd backend
npm install
npm run dev
```
→ Servidor en `http://localhost:3001`

### Build
```bash
npm run build
npm start
```

### Con Docker
```bash
# Desarrollo
docker build -f Dockerfile.dev -t backend-dev .
docker run -p 3001:3001 --env-file .env backend-dev

# Producción
docker build -f Dockerfile -t backend .
docker run -p 3001:3001 --env-file .env backend
```

## 🧪 Testing

### Opción 1: curl manual
```bash
# Registrar
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Opción 2: Script automático
```bash
chmod +x backend/test.sh
./backend/test.sh
```

## 📊 Flujo de Datos

```
Usuario → Register → Hash password → BD
                   ↓
             JWT tokens generados

Usuario → Login → Validar credenciales → JWT tokens
           ↓
        Bearer token en headers

Usuario → Request protegida → Middleware valida → Acceso
```

## 🎯 Próximos Pasos

**Fase 2 (Recetas):**
- [ ] Endpoints CRUD de recetas
- [ ] Endpoints CRUD de ingredientes
- [ ] Cálculo automático de calorías

**Fase 3 (Polish):**
- [ ] Refresh token endpoint
- [ ] Rate limiting
- [ ] Swagger/OpenAPI
- [ ] Tests unitarios

## ✨ Características

✅ Registro con validación de email
✅ Hashing seguro de contraseñas
✅ JWT con expiración configurable
✅ Actualización de perfil
✅ Cambio de contraseña
✅ Middleware de autenticación
✅ Validación automática con Zod
✅ CORS configurado
✅ Docker ready
✅ TypeScript con tipos estrictos

## 📝 Variables de Entorno

Crear `.env` (copiar de `.env.example`):
```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
BACKEND_PORT=3001
JWT_SECRET=change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

---

**✅ Backend Status**: Funcional y probado
**Próximo**: Frontend o recetas
