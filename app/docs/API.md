# 📚 API Documentation - Recipe Calories App

## Base URL
```
http://localhost:3001/api
```

## 🔐 Autenticación

### Obtener Token
Todos los endpoints requieren autenticación excepto los de registro y login.

Header requerido:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👤 Endpoints de Autenticación

### 1. Registro
**POST** `/auth/register`

Crear nueva cuenta de usuario.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "securePassword123",
  "name": "Juan Pérez"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "daily_calorie_goal": 2000,
  "created_at": "2024-04-16T10:30:00Z"
}
```

**Errores:**
- `400` - Email inválido o contraseña débil
- `409` - Email ya registrado

---

### 2. Login
**POST** `/auth/login`

Iniciar sesión y obtener tokens.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  }
}
```

**Errores:**
- `401` - Credenciales inválidas
- `404` - Usuario no existe

---

### 3. Logout
**POST** `/auth/logout`

Cerrar sesión y invalidar tokens.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Refresh Token
**POST** `/auth/refresh`

Obtener nuevo access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

**Errores:**
- `401` - Token inválido o expirado

---

## 👨‍💼 Endpoints de Usuario

Todos requieren autenticación.

### 1. Obtener Perfil
**GET** `/users/profile`

Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "daily_calorie_goal": 2000,
  "avatar_url": "https://...",
  "created_at": "2024-04-16T10:30:00Z",
  "updated_at": "2024-04-16T10:30:00Z"
}
```

---

### 2. Actualizar Perfil
**PUT** `/users/profile`

Actualizar información del usuario.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:** (todos los campos son opcionales)
```json
{
  "name": "Juan Carlos Pérez",
  "daily_calorie_goal": 2500,
  "avatar_url": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Juan Carlos Pérez",
  "daily_calorie_goal": 2500,
  "avatar_url": "https://...",
  "updated_at": "2024-04-16T12:00:00Z"
}
```

**Errores:**
- `400` - Datos inválidos
- `404` - Usuario no encontrado

---

### 3. Cambiar Contraseña
**POST** `/users/change-password`

Cambiar la contraseña del usuario.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Errores:**
- `400` - Contraseña actual incorrecta
- `400` - Nueva contraseña inválida

---

## 🍳 Endpoints de Recetas

Todos requieren autenticación.

### 1. Listar Recetas
**GET** `/recipes`

Obtener todas las recetas del usuario.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (número, default: 1)
- `limit` (número, default: 10)
- `search` (string, opcional)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Ensalada César",
      "description": "Clásica ensalada con pollo",
      "total_calories": 350.50,
      "calories_per_serving": 175.25,
      "servings": 2,
      "preparation_time_minutes": 15,
      "ingredient_count": 5,
      "created_at": "2024-04-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

---

### 2. Crear Receta
**POST** `/recipes`

Crear nueva receta.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "title": "Ensalada César",
  "description": "Clásica ensalada con pollo",
  "servings": 2,
  "preparation_time_minutes": 15
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Ensalada César",
  "description": "Clásica ensalada con pollo",
  "total_calories": 0,
  "servings": 2,
  "preparation_time_minutes": 15,
  "created_at": "2024-04-16T10:30:00Z"
}
```

**Errores:**
- `400` - Campos requeridos faltantes

---

### 3. Obtener Receta
**GET** `/recipes/:id`

Obtener detalles completos de una receta con ingredientes.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Ensalada César",
  "description": "Clásica ensalada con pollo",
  "total_calories": 350.50,
  "calories_per_serving": 175.25,
  "servings": 2,
  "preparation_time_minutes": 15,
  "ingredients": [
    {
      "id": "uuid",
      "name": "Lechuga",
      "calories": 15,
      "quantity": 200,
      "unit": "g"
    },
    {
      "id": "uuid",
      "name": "Pollo cocido",
      "calories": 165,
      "quantity": 100,
      "unit": "g"
    }
  ],
  "created_at": "2024-04-16T10:30:00Z",
  "updated_at": "2024-04-16T10:30:00Z"
}
```

**Errores:**
- `404` - Receta no encontrada

---

### 4. Actualizar Receta
**PUT** `/recipes/:id`

Actualizar información de una receta.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:** (todos los campos son opcionales)
```json
{
  "title": "Ensalada César Especial",
  "description": "Versión mejorada con queso parmesano",
  "servings": 3,
  "preparation_time_minutes": 20
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Ensalada César Especial",
  "updated_at": "2024-04-16T12:00:00Z"
}
```

**Errores:**
- `404` - Receta no encontrada
- `403` - No autorizado (receta de otro usuario)

---

### 5. Eliminar Receta
**DELETE** `/recipes/:id`

Eliminar una receta y todos sus ingredientes.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** `200 OK`
```json
{
  "message": "Recipe deleted successfully"
}
```

**Errores:**
- `404` - Receta no encontrada
- `403` - No autorizado

---

## 🥕 Endpoints de Ingredientes

Todos requieren autenticación.

### 1. Crear Ingrediente
**POST** `/recipes/:recipeId/ingredients`

Agregar ingrediente a una receta.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "name": "Pollo cocido",
  "calories": 165,
  "quantity": 100,
  "unit": "g"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "recipe_id": "uuid",
  "name": "Pollo cocido",
  "calories": 165,
  "quantity": 100,
  "unit": "g",
  "created_at": "2024-04-16T10:30:00Z"
}
```

---

### 2. Actualizar Ingrediente
**PUT** `/recipes/:recipeId/ingredients/:ingredientId`

Actualizar un ingrediente.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:** (opcional)
```json
{
  "quantity": 150,
  "calories": 247.5
}
```

**Response:** `200 OK`

---

### 3. Eliminar Ingrediente
**DELETE** `/recipes/:recipeId/ingredients/:ingredientId`

Eliminar un ingrediente de una receta.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** `200 OK`
```json
{
  "message": "Ingredient deleted successfully"
}
```

---

## 📊 Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Operación exitosa sin contenido |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Recurso ya existe (ej: email duplicado) |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

---

## 🔍 Ejemplos con cURL

### Registro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "securePassword123",
    "name": "Juan Pérez"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "securePassword123"
  }'
```

### Obtener Perfil
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Crear Receta
```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Ensalada César",
    "description": "Clásica ensalada",
    "servings": 2
  }'
```

---

**Documentación actualizada:** Abril 2024
