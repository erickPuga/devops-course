# 🧪 Cómo Testear el Backend

## Opción 1: Script Automático ✨ (Recomendado)

El script `test.sh` realiza todos los tests automáticamente:

```bash
# Permisos
chmod +x backend/test.sh

# Ejecutar
./backend/test.sh
```

**Qué hace:**
1. ✅ Health check
2. ✅ Registrar usuario
3. ✅ Obtener perfil
4. ✅ Actualizar perfil
5. ✅ Cambiar contraseña
6. ✅ Login con nueva contraseña

---

## Opción 2: Pruebas Manuales con curl

### Paso 1: Iniciar el servidor

```bash
cd backend
npm run dev
```

Esperarás ver:
```
🚀 Servidor corriendo en puerto 3001
📝 Env: development
🔗 CORS enabled para: http://localhost:3000
```

### Paso 2: Registrar un usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "John Doe",
    "dailyCalorieGoal": 2000
  }'
```

**Respuesta esperada:**
```json
{
  "user": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "test@example.com",
    "name": "John Doe",
    "dailyCalorieGoal": 2000,
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Guarda el `accessToken` para los siguientes pasos** ⭐

### Paso 3: Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Respuesta:** Similar al registro (con nuevo token)

### Paso 4: Obtener Perfil (con token)

Reemplaza `YOUR_TOKEN` con el `accessToken` recibido:

```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "email": "test@example.com",
  "name": "John Doe",
  "dailyCalorieGoal": 2000,
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Paso 5: Actualizar Perfil

```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "dailyCalorieGoal": 2500
  }'
```

**Respuesta:** User actualizado con los nuevos datos

### Paso 6: Cambiar Contraseña

```bash
curl -X POST http://localhost:3001/api/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

**Respuesta:**
```json
{
  "message": "Contraseña cambiada exitosamente"
}
```

### Paso 7: Login con Nueva Contraseña

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword456"
  }'
```

**Respuesta:** Nuevo token con la nueva contraseña validada

---

## Opción 3: Con Postman/Insomnia

1. **Crear nueva colección** "Recipe Calories API"

2. **POST Register**
   - URL: `http://localhost:3001/api/auth/register`
   - Body (JSON):
     ```json
     {
       "email": "user@test.com",
       "password": "password123",
       "name": "Test User"
     }
     ```

3. **POST Login**
   - URL: `http://localhost:3001/api/auth/login`
   - Body: email + password

4. **GET Profile**
   - URL: `http://localhost:3001/api/users/profile`
   - Header: `Authorization: Bearer <token>`

5. **PUT Profile**
   - URL: `http://localhost:3001/api/users/profile`
   - Header: `Authorization: Bearer <token>`
   - Body: cambios a hacer

6. **POST Change Password**
   - URL: `http://localhost:3001/api/users/change-password`
   - Header: `Authorization: Bearer <token>`
   - Body: contraseñas actual y nueva

---

## Errores Comunes y Soluciones

### ❌ "ECONNREFUSED" - Conexión rechazada
**Solución:** El servidor no está corriendo. Ejecuta `npm run dev` en la carpeta `backend/`

### ❌ "Email ya está registrado"
**Solución:** Usa un email diferente o borra el usuario en Supabase

### ❌ "Token inválido o expirado"
**Solución:** El token expiró (15 minutos). Haz login de nuevo

### ❌ "Missing Authorization header"
**Solución:** Incluye el header: `Authorization: Bearer YOUR_TOKEN`

### ❌ "Email o contraseña incorrectos"
**Solución:** Verifica que el email y contraseña sean correctos

### ❌ CORS error en navegador
**Solución:** Verifica que `CORS_ORIGIN` en `.env` sea `http://localhost:3000`

---

## 📊 Checklist de Testing

- [ ] Health check (`GET /health`)
- [ ] Registro exitoso
- [ ] Respuesta contiene tokens
- [ ] Login exitoso
- [ ] Obtener perfil (autenticado)
- [ ] Actualizar perfil
- [ ] Cambiar contraseña
- [ ] Login con nueva contraseña
- [ ] Error sin token
- [ ] Error con token inválido

---

## 🔍 Verificar en Base de Datos

También puedes ver los usuarios creados en Supabase:

1. Ir a https://supabase.co
2. Proyecto → Editor SQL
3. Ejecutar:
   ```sql
   SELECT id, email, name, daily_calorie_goal, created_at 
   FROM countmycalories.users
   ORDER BY created_at DESC;
   ```

---

## 💾 Variables de Entorno (.env)

Asegúrate de tener un archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://uhwnhuuwemjfbpfwtwpn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NODE_ENV=development
BACKEND_PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

---

## ✨ Tips

- Usa `jq` para formatear JSON en terminal:
  ```bash
  curl ... | jq .
  ```

- Guarda variables en bash:
  ```bash
  TOKEN=$(curl ... | jq -r '.accessToken')
  curl ... -H "Authorization: Bearer $TOKEN"
  ```

- Usa `-v` en curl para ver headers:
  ```bash
  curl -v ...
  ```

---

**¿Todo funciona? ✅ ¡Felicidades! El backend está listo!**
