# Setup de la Base de Datos en Supabase

## Paso 1: Ir a Supabase Dashboard

1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto (si tienes múltiples)
3. En el menú izquierdo, selecciona **SQL Editor**

## Paso 2: Ejecutar el Schema

1. Copia TODO el contenido del archivo `/docs/database-schema.sql`
2. En el SQL Editor de Supabase, pega el contenido completo
3. Haz click en **"Run"** para ejecutar todo el script

## Paso 3: Verificar que se crearon las tablas

En el menú izquierdo de Supabase, ve a **Table Editor** y deberías ver:
- `users` ✅
- `recipes` ✅
- `ingredients` ✅

## Paso 4: Verificar las políticas RLS

Ve a la sección **Authentication** → **Policies** y verifica que se crearon:
- Políticas de `users`
- Políticas de `recipes`
- Políticas de `ingredients`

## Paso 5: El Backend ya está funcionando

El backend en `/backend` ya está configurado para conectarse a estas tablas.

**Para iniciar el servidor:**

```bash
cd /Users/erickpuga/Documents/Personal/devops/app/backend
npm run dev
```

**Para compilar:**

```bash
npm run build
```

## Troubleshooting

### Error: "function current_user_id() does not exist"
- Esto ya está corregido en la versión actual del schema

### Error: "table users already exists"
- Las tablas ya fueron creadas, puedes ignorar este error

### Error: "role does not exist"
- Asegúrate de que estés en el proyecto correcto de Supabase

### El backend no conecta
- Verifica que el archivo `.env` en `backend/` tenga las credenciales correctas:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`

## Próximos pasos

Una vez que las tablas estén creadas en Supabase:

1. Prueba los endpoints del backend (ver `HOW_TO_TEST.md`)
2. Considera implementar el frontend en React
3. Agrega endpoints para recetas e ingredientes
