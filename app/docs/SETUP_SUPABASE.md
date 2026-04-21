# 🔧 Guía de Setup con Supabase

## Paso 1: Crear Cuenta en Supabase

1. Ir a https://supabase.com
2. Click en "Sign Up"
3. Crear cuenta con GitHub o email
4. Verificar email

## Paso 2: Crear Nuevo Proyecto

1. Click en "New Project"
2. Ingresar nombre del proyecto: `recipe-calories`
3. Seleccionar contraseña de BD (guardar bien)
4. Seleccionar región más cercana
5. Click en "Create new project"

⏳ **Esperar 2-3 minutos a que se cree el proyecto**

## Paso 3: Obtener Credenciales

Una vez creado el proyecto:

1. Ir a **Settings → API** en el menú lateral
2. Copiar:
   - **URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Paso 4: Ejecutar Schema SQL

1. Ir a **SQL Editor** en el menú lateral
2. Click en "New Query"
3. Copiar TODO el contenido de `docs/database-schema.sql`
4. Pegar en el editor
5. Click en "Run" o presionar `Cmd+Enter`

✅ Si vés las 12 secciones ejecutándose sin errores, ¡todo bien!

## Paso 5: Verificar Tablas

1. Ir a **Table Editor** en el menú lateral
2. Deberías ver:
   - `users`
   - `recipes`
   - `ingredients`

## Paso 6: Configurar Autenticación (Opcional para Demo)

Para usar Supabase Auth directamente (sin tu backend):

1. Ir a **Authentication** en el menú lateral
2. Click en "Providers"
3. Configurar según necesites (Email/Password está habilitado por defecto)
4. En **Settings → General**, setear:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Paso 7: Configurar .env

1. Copiar `.env.example` a `.env`
2. Llenar con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://your-project-hash.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://localhost:3000
```

## Paso 8: Verificar Conexión

1. Levantar los contenedores:
```bash
docker-compose up -d
```

2. Revisar logs del backend:
```bash
docker-compose logs backend -f
```

3. Si ves mensajes de conexión exitosa, ¡funciona! 🎉

## Tier Free de Supabase Incluye

✅ PostgreSQL hasta 500MB  
✅ Autenticación  
✅ Storage hasta 1GB  
✅ Real-time  
✅ Edge Functions (con límites)  
✅ API REST automática  

## Límites a Tener en Cuenta

- 500MB almacenamiento de BD
- 1GB storage de archivos
- Rate limit: 2,000 requests/hora en API REST
- Máximo 10 conexiones simultáneas

**Para demo/desarrollo está más que bien** ✨

## Troubleshooting

### Error de conexión
- Verificar que las credenciales sean correctas
- Confirmar que la URL tenga formato `https://`
- No olvidar el `.supabase.co`

### RLS denying access
- Verificar que `auth.uid()` coincida con el user_id
- Revisar policies en supabase.com/dashboard → policies

### Schema no se ejecutó
- Ir a SQL Editor → recientes
- Clickear en la query para ver el error
- Ajustar y reintentar

---

**¡Listo! Ya tienes BD configurada y lista para usar** 🚀
