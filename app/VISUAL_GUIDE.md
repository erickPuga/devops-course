# Visual Guide: Ejecutar SQL en Supabase

## Paso 1: Ve a https://supabase.com/dashboard

![Dashboard](https://imgur.com/placeholder)

Deberías ver tu proyecto listado.

## Paso 2: Selecciona tu proyecto

Haz click en el nombre del proyecto que creaste para Recipe Calories.

## Paso 3: Ve a SQL Editor

En el menú izquierdo, busca **SQL Editor** y haz click.

## Paso 4: Nueva Query

Haz click en el botón **"New Query"** o **"+"**.

## Paso 5: Copiar y Pegar

### Opción A: Copiar del archivo

1. Abre el archivo: `/Users/erickpuga/Documents/Personal/devops/app/docs/database-schema.sql`
2. Selecciona TODO (Cmd+A)
3. Copia (Cmd+C)
4. Ve a Supabase SQL Editor
5. Pega en el editor (Cmd+V)

### Opción B: Copiar el SQL tal cual

El SQL que necesitas ejecutar está en: `/app/docs/database-schema.sql`

Contiene:
- ✅ 3 Tablas (users, recipes, ingredients)
- ✅ Índices para performance
- ✅ Políticas RLS para seguridad
- ✅ Triggers para timestamps
- ✅ Vistas para queries comunes

## Paso 6: Ejecutar

En la parte superior derecha del editor SQL, verás un botón **"Run"** (o ▶️).

Haz click para ejecutar TODO el script.

## Paso 7: Verificar

Después de ejecutar, deberías ver en el menú izquierdo:

**Table Editor** → Busca:
- ✅ `users`
- ✅ `recipes`
- ✅ `ingredients`

Si ves estas 3 tablas, **¡todo funcionó!** 🎉

## Paso 8: Prueba el Backend

En terminal, desde `/app/backend`:

```bash
npm run dev
```

El servidor debería decir:

```
🚀 Servidor corriendo en puerto 3001
```

## Paso 9: Prueba un Endpoint

En otra terminal:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prueba@example.com",
    "password": "Test123!",
    "name": "Test User",
    "dailyCalorieGoal": 2000
  }' | jq .
```

Deberías recibir:

```json
{
  "user": {
    "id": "...",
    "email": "prueba@example.com",
    "name": "Test User",
    "dailyCalorieGoal": 2000,
    "createdAt": "2024-04-18T00:00:00.000Z",
    "updatedAt": "2024-04-18T00:00:00.000Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

## Troubleshooting

### Error: "Table 'users' already exists"
→ Significa que ya se ejecutó antes, está bien, solo ignora el error

### Error: "Invalid schema"
→ Ya está corregido en la versión actual

### Error: "Function ... does not exist"
→ Ya está corregido en la versión actual

### El backend no conecta
→ Verifica que `.env` en `backend/` tenga las credenciales correctas

---

**¡Eso es todo! Una vez hayas ejecutado el SQL, tu backend funcionará completo.** 🚀
