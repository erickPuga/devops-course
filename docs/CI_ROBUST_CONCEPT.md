# CI Robusta: Concepto y Arquitectura
## Fase 2 - DevSecOps Pipeline en GitHub Actions

---

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Por Qué Necesitamos CI Robusta](#por-qué-necesitamos-ci-robusta)
3. [Escaneo de Vulnerabilidades: El Por Qué Profundo](#escaneo-de-vulnerabilidades-el-por-qué-profundo)
4. [Arquitectura del Pipeline](#arquitectura-del-pipeline)
5. [Shift-Left Security](#shift-left-security)
6. [Gates de Seguridad](#gates-de-seguridad)
7. [Flujo Completo Conceptual](#flujo-completo-conceptual)

---

## Visión General

**CI Robusta** es un pipeline de integración continua que **no solo construye y publica**, sino que **valida, verifica y asegura** que el código y las imágenes Docker sean seguros antes de llegar a producción.

En lugar del flujo tradicional:
```
Code Commit → Build → Push → Deploy
```

Implementamos:
```
Code Commit → Lint/Test → Build → Scan → Publish → Deploy
```

El énfasis está en **detectar problemas lo más temprano posible**, antes de que lleguen a una rama principal o a producción.

---

## Por Qué Necesitamos CI Robusta

### 1. **El Costo de las Vulnerabilidades en Producción**

Una vulnerabilidad detectada en diferentes etapas tiene costos exponenciales:

| Etapa | Costo | Impacto |
|-------|-------|--------|
| **En Desarrollo (Local)** | Bajo | Corrección inmediata |
| **En CI (Antes de Merge)** | Bajo-Medio | Bloquea merge, pero sigue en línea |
| **En Staging** | Medio | Deploy rechazado, investigación necesaria |
| **En Producción** | **ALTO** | Breach, downtime, reputación dañada |

**Ejemplo Real:**
- Una dependencia npm con RCE (Remote Code Execution) publicada en el Hub sin escaneo = tu contenedor es comprometible desde el día 1.
- Con trivy en CI = rechazas la imagen antes de que exista públicamente.

### 2. **La Cadena de Suministro es un Objetivo**

Tu aplicación depende de:
- **Dependencies npm** → vulnerabilidades en librerías
- **Imagen base Docker** (node:18) → patchs de seguridad del OS
- **Binarios en el contenedor** → exploits conocidos

Sin CI Robusta, **asumes que todo es seguro** simplemente porque "parece que funciona".

---

## Escaneo de Vulnerabilidades: El Por Qué Profundo

### ¿Qué es Trivy?

**Trivy** es un escáner de vulnerabilidades de código abierto creado por Aqua Security que:
1. **Indexa** todas las vulnerabilidades conocidas (CVE database)
2. **Analiza** tu imagen Docker capa por capa
3. **Detecta** dependencias vulnerables en:
   - Lenguajes: Python, Node.js, Java, Go, Rust, etc.
   - SO: Paquetes del OS (apt, yum, apk)
   - Contenedores: Metadatos de imágenes
4. **Reporta** severidad (CRITICAL, HIGH, MEDIUM, LOW)

### ¿Por Qué ANTES de Subir al Hub?

#### **Razón 1: Una Imagen Vulnerada es Pública Eternamente**

```
❌ SIN ESCANEO:
docker build → docker push → AHORA EXISTE PÚBLICAMENTE EN HUB
               ↓
        Alguien descarga tu imagen vulnerable
        ↓
    Compromise en sus ambientes

✅ CON ESCANEO EN CI:
docker build → trivy scan → ¿VULNERABLE? → RECHAZO EN CI
               ↓                            ↑ (No llega al Hub)
            ✓ SEGURA? → docker push
```

#### **Razón 2: Imposibilidad de "Unpublish" Completamente**

- Aunque borres la imagen del Hub, alguien puede haberla hecho pull
- Registries espejo (Docker Hub mirrors, Artifactory, etc.) pueden tener copias
- Los contenedores en producción pueden estar corriendo esa imagen
- **Una vulnerabilidad "en la wild" es irreversible**

#### **Razón 3: Responsabilidad Legal y de Compliance**

Si tu imagen contiene una CVE crítica y alguien la usa para un ataque:
- **Responsabilidad civil:** Tu falta de due diligence
- **Compliance:** SOC 2, ISO 27001 exigen escaneo pre-publish
- **Auditorías:** "¿Cómo permite que imágenes vulnerables lleguen a producción?"

#### **Razón 4: Costo de Remediación Post-Publish**

```
ESCENARIO 1: Vulnerabilidad detectada en CI
- Tiempo: 5 minutos para revisar y corregir
- Costo: Una línea de Docker o actualizar package.json
- Impacto: Solo tú lo ves

ESCENARIO 2: Vulnerabilidad detectada DESPUÉS de publicar
- Tiempo: Investigación, corrección, rebuild, re-push, comunicación
- Costo: Horas de trabajo + revisar qué usuarios descargaron qué
- Impacto: Reputación comprometida, usuarios notificados
```

---

## Arquitectura del Pipeline

```yaml
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                       │
└─────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  1. Trigger: Push a main/develop       │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  2. LINT: ESLint (Code Quality)        │
        │     ❌ Si falla → Stop aquí             │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  3. TEST: Jest/Vitest (Unit Tests)     │
        │     ❌ Si falla → Stop aquí             │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  4. SECRETS: Gitleaks (Secret Scan)    │
        │     ❌ Si detecta → Stop aquí           │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  5. BUILD: Docker Build                │
        │     - Multi-stage Dockerfile           │
        │     - No root user                      │
        │     - Optimizado por capas              │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  6. SCAN: Trivy (Vulnerabilities)      │
        │     ❌ Si CRITICAL/HIGH → Stop aquí    │
        │     ⚠️  Si MEDIUM → Log y continúa     │
        │     ✅ Si NONE/LOW → Procede           │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  7. PUBLISH: Docker Push to Hub        │
        │     Con tags semánticos (v1.2.3)       │
        └────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────────┐
        │  8. NOTIFY: Slack/Email                │
        │     ✅ Éxito o ❌ Fallo                │
        └────────────────────────────────────────┘
```

---

## Shift-Left Security

> [!IMPORTANT] **Shift-Left Security: Concepto Clave**
>
> "Shift-Left" significa **mover las verificaciones de seguridad lo más a la izquierda posible en el timeline del desarrollo**, no hasta el final (testing en producción).
>
> ```
> Tradicional:  Dev → QA → Staging → Production ← Detección de seguridad
> Shift-Left:  Dev → Scan → QA → Staging → Production ← Prevención
> ```
>
> **Beneficio:** Cada línea de código pasa por 4-5 gates de seguridad ANTES de llegar a producción.

### Gates de Seguridad Que Implementaremos

| Gate | Herramienta | Por Qué | Falla Si |
|------|-------------|--------|----------|
| **Linting** | ESLint | Detecta patrones de código inseguro (hardcoded secrets, eval(), etc.) | ESLint warnings/errors |
| **Testing** | Jest/Vitest | Las pruebas validan que la lógica de seguridad funciona | Tests fallan |
| **Secret Detection** | Gitleaks | Evita que credentials lleguen al repo | Detecta API keys, tokens, passwords |
| **Container Scan** | Trivy | Detecta CVEs en dependencias y OS | CRITICAL/HIGH vulnerabilities |
| **Image Signing** | (Fase 3) | Verifica que la imagen fue construida por ti | Firma inválida |

---

## Gates de Seguridad

### Gate 1: ESLint (Linting)

**¿Qué valida?**
- Código limpio según estándares
- No usa `eval()`, `Function()` (eval injection)
- Manejo correcto de errores
- No tiene console.log() en producción (info leakage)

**¿Cómo falla?**
```bash
# ❌ Esto fallaría en ESLint
const data = eval(userInput); // eval injection

// ✅ Esto pasa
const data = JSON.parse(userInput); // Safe
```

### Gate 2: Tests (Unit Tests)

**¿Qué valida?**
- La autenticación funciona
- Las validaciones de entrada funcionan
- Los errores se manejan correctamente

**¿Por qué es "seguridad"?**
```typescript
// ❌ Bug: No valida que email sea válido
function createUser(email: string) {
  // Si email es un ataque XSS, entra sin validación
  db.save(email);
}

// ✅ Con test:
test('createUser rejects invalid email', () => {
  expect(() => createUser('not-an-email')).toThrow();
});
```

### Gate 3: Gitleaks (Secret Detection)

**¿Qué valida?**
- No hay API keys en el código
- No hay contraseñas en el repo
- No hay tokens de autenticación visibles

**¿Cómo falla?**
```bash
# ❌ Esto fallaría en Gitleaks
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

# ✅ Esto pasa (usa variable de entorno)
const supabaseKey = process.env.SUPABASE_KEY;
```

### Gate 4: Trivy (Container Vulnerability Scan)

**¿Qué valida?**
- La imagen base (node:18) no tiene vulnerabilidades críticas
- Las dependencias npm/python no tienen CVEs
- Los binarios del SO están patcheados

**¿Cómo falla? (La razón principal de este documento)**
```bash
# Trivy escanea la imagen construida
trivy image my-app:latest

# Reporte:
# - 3 CRITICAL vulnerabilities
# - 12 HIGH vulnerabilities
# - 45 MEDIUM vulnerabilities
# → CI FALLA: No sube la imagen
```

---

## Flujo Completo Conceptual

### Escenario 1: PR sin cambios de dependencias

```
Developer pushes code → ESLint ✅ → Tests ✅ → Gitleaks ✅ 
→ Docker Build ✅ → Trivy ✅ (Sin cambios = sin nuevos CVEs)
→ Push to Hub ✅ → Deployed ✅
```

**Tiempo total:** ~2-3 minutos

### Escenario 2: PR actualiza dependencias

```
Developer updates package.json → ESLint ✅ → Tests ✅ 
→ Gitleaks ✅ → Docker Build ✅ 
→ Trivy ❌ (Nueva dependencia tiene CVE CRITICAL)
→ CI FALLA: PR bloqueado, developer recibe notificación
```

**Developer action:**
1. Revisa el reporte de Trivy
2. Actualiza la dependencia a una versión parcheada
3. Pushes nuevo commit
4. CI corre de nuevo → Trivy ✅ → Merged ✅

**Tiempo total:** ~5-10 minutos (incluye investigación)

### Escenario 3: Imagen base vulnerable

```
maintainer releases node:18.5.0 con CVE crítica
↓
Nuestro Dockerfile usa: FROM node:18
↓
Alguien hace push → CI corre → Docker Build (tira node:18.5.0) 
→ Trivy ❌ (Detecta CVE en node)
→ CI FALLA, desarrollador actualiza: FROM node:18.17.0 (fixed)
→ CI pasa
```

**Aprendizaje:** El CI obliga a mantenerse actualizado automáticamente.

---

## Resumen: Por Qué Trivy ANTES de Push

| Aspecto | Trivy en CI | Sin Trivy |
|---------|------------|----------|
| **Seguridad** | Imágenes públicas siempre seguras | Imágenes vulnerables públicas |
| **Costo** | 5 min para corregir | Horas para investigar y remediar |
| **Reputación** | Confianza: "Este equipo escanea" | Riesgo: "Publicaron algo vulnerable" |
| **Compliance** | Auditabilidad de gates | Sin prueba de validación |
| **Velocidad real** | 2-3 min extra en CI | 0 min + horas después en crisis |

---

## Próximos Pasos

En la siguiente sesión, implementaremos este pipeline en GitHub Actions:

1. **Workflow YAML:** Crear `.github/workflows/ci.yml`
2. **Gates de Linting:** Integrar ESLint
3. **Gates de Testing:** Integrar Jest
4. **Secret Scan:** Configurar Gitleaks
5. **Trivy Integration:** Container scanning con reportes
6. **Versioning:** SemVer tagging automático

---

## Referencias

- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [OWASP: Shift Left Testing](https://owasp.org/www-project-devsecops-guideline/latest/02b-shift-left-testing)
- [CVE Database](https://cve.mitre.org/)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
