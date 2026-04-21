# 🔒 Guía de Seguridad

## Estándares de Seguridad Implementados

### 1. 🔐 Contraseñas

#### Hashing
- **Algoritmo:** bcrypt con 10-12 salt rounds
- **Nunca** se almacena la contraseña en texto plano
- La contraseña debe tener mínimo 8 caracteres

#### Validación en Registro
```javascript
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial: !@#$%^&*
```

---

### 2. 🎫 Autenticación JWT

#### Access Token
- **Duración:** 15 minutos
- **Contenido:** user ID, email, rol
- **Ubicación:** Header `Authorization: Bearer <token>`

#### Refresh Token
- **Duración:** 7 días
- **Uso:** Obtener nuevo access token sin re-login
- **Seguridad:** Debe guardarse en httpOnly cookie (no localStorage)

#### Rotación de Tokens
- Access token expira cada 15 minutos
- Refresh token también expira (requiere re-login)
- Los tokens viejos son invalidados

---

### 3. 🛡️ CORS (Cross-Origin Resource Sharing)

#### Configuración
```javascript
Orígenes permitidos:
- http://localhost:3000 (desarrollo)
- https://tuapp.com (producción)

Métodos permitidos:
- GET, POST, PUT, DELETE

Headers permitidos:
- Content-Type
- Authorization

Credenciales: Permitidas
```

---

### 4. 🔒 Row Level Security (RLS) en Supabase

#### Política de Usuarios
```sql
- Solo ven su propio perfil
- Solo pueden actualizar su perfil
- No pueden ver email de otros usuarios
```

#### Política de Recetas
```sql
- Solo ven sus propias recetas
- Solo pueden crear recetas propias
- Solo pueden actualizar/eliminar recetas propias
```

#### Política de Ingredientes
```sql
- Solo ven ingredientes de sus recetas
- No pueden acceder a datos de otros usuarios
```

---

### 5. 🚫 Rate Limiting

#### Configuración
```javascript
Ventana de tiempo: 15 minutos
Máximo de requests: 100 por IP

Por endpoint sensible:
- /auth/login: 5 intentos / 15 minutos
- /auth/register: 3 intentos / hora
- /api/*: 100 requests / 15 minutos
```

#### Respuesta al exceder límite
```json
{
  "error": "Too many requests",
  "retryAfter": 900
}
```

---

### 6. 🔍 Validación y Sanitización

#### Input Validation
- Validar tipo de datos
- Validar longitud de strings
- Validar rangos de números
- Email format validation

#### Sanitización
- Remover tags HTML/JavaScript
- Escapar caracteres especiales
- Trim de espacios en blanco

#### Herramientas Usadas
- **Zod** o **Joi** para validación de schemas
- **DOMPurify** en frontend
- **helmet** para headers de seguridad

---

### 7. 🔐 Protección contra Ataques Comunes

#### SQL Injection
✅ **Protegido:** Uso de ORM (Prisma/Supabase)
- Nunca concatenar queries
- Siempre usar prepared statements
- Supabase valida automáticamente

#### XSS (Cross-Site Scripting)
✅ **Protegido en frontend:**
- React escapa por defecto
- No usar `dangerouslySetInnerHTML`
- Sanitizar inputs si necesario

#### CSRF (Cross-Site Request Forgery)
✅ **Protegido:**
- SameSite cookies
- Token CSRF en formularios
- Validar origen de requests

#### Brute Force
✅ **Protegido:**
- Rate limiting
- Bloqueo temporal tras fallos
- Logging de intentos

---

### 8. 🔐 Variables de Entorno

#### Secretos que NO deben exponerse
```env
✅ ALMACENAR EN .env (NUNCA en git):
- JWT_SECRET
- SUPABASE_SERVICE_ROLE_KEY
- Database passwords
- API keys

❌ NUNCA poner en .env:
- Son públicos si se suben a git
- Los usuarios no necesitan verlos
```

#### .gitignore Recomendado
```
.env
.env.local
.env.*.local
node_modules/
dist/
.DS_Store
```

---

### 9. 🔒 HTTPS/SSL

#### En Producción
- **OBLIGATORIO:** HTTPS en todas las conexiones
- **SSL Certificate:** Let's Encrypt (gratuito)
- **HSTS Header:** Forzar HTTPS

#### En Desarrollo
- HTTP permitido en localhost
- Usar HTTPS en staging

---

### 10. 📝 Logging y Auditoría

#### Qué Loguear
```javascript
✅ Intentos de login (exitosos y fallidos)
✅ Cambios de contraseña
✅ Actualizaciones de perfil
✅ Creación/eliminación de recetas
✅ Errores de autorización
✅ Rate limit exceeded
```

#### Qué NO Loguear
```javascript
❌ Contraseñas (nunca!)
❌ Tokens JWT
❌ Datos personales sensibles
❌ API keys
```

#### Nivel de Logs
```javascript
ERROR: Errores críticos
WARN: Situaciones sospechosas
INFO: Operaciones normales
DEBUG: Solo en desarrollo
```

---

### 11. 🔄 Actualización de Dependencias

#### Mantener Seguro
```bash
# Revisar vulnerabilidades
npm audit

# Actualizar si hay CVEs
npm update

# Usar versiones exactas en producción
npm ci (en lugar de npm install)
```

---

### 12. 🚀 Checklist Antes de Producción

- [ ] HTTPS habilitado
- [ ] JWT_SECRET es único y fuerte
- [ ] CORS solo permite dominios autorizados
- [ ] RLS habilitado en BD
- [ ] Rate limiting configurado
- [ ] Logs de auditoría activos
- [ ] .env en .gitignore
- [ ] npm audit sin vulnerabilidades críticas
- [ ] Contraseñas hasheadas en BD
- [ ] No hay credenciales en código
- [ ] CORS_ORIGIN apunta a producción
- [ ] Backup automático de BD
- [ ] Plan de recuperación ante incidentes

---

### 13. 📚 Recursos Adicionales

#### OWASP Top 10
- https://owasp.org/www-project-top-ten/

#### JWT Best Practices
- https://tools.ietf.org/html/rfc8949

#### Node.js Security
- https://nodejs.org/en/docs/guides/security/

#### Supabase Security
- https://supabase.com/docs/guides/security/overview

---

## 🚨 Respuesta ante Incidentes

### Sospecha de Contraseña Comprometida
1. Alertar al usuario inmediatamente
2. Forzar cambio de contraseña en próximo login
3. Invalidar todos los tokens activos
4. Revisar logs de acceso

### Token JWT Comprometido
1. Invalidar token inmediatamente
2. Revocar sesiones del usuario
3. Pedirle re-login
4. Revisar acceso reciente

### Base de Datos Comprometida
1. Cambiar contraseña DB
2. Alertar a todos los usuarios
3. Audit de acceso anómalo
4. Restore desde backup seguro

---

**Seguridad es un proceso continuo, no una solución única** 🔐

Última actualización: Abril 2024
