# 📄 Documentación del Workflow CI: Explicación Detallada de ci.yml
## Propósito General
Este archivo define el pipeline completo de Integración Continua (CI) para el backend, asegurando que todo el código y las imágenes Docker cumplan con estándares de calidad, seguridad y rendimiento antes de ser considerados aptos para la publicación (`main`) o el desarrollo (`develop`).

---

### ⚙️ Configuración General del Workflow
*   **Triggers:** El pipeline se activa en `push` o `pull_request` a las ramas `main` o `develop`, y también manualmente con `workflow_dispatch`. Esto asegura que cualquier cambio importante dispare validaciones completas.
*   **Jobs (Tareas):** Contiene dos jobs principales secuenciales: `validate` y `build-and-push`.

---

### 🟢 Job 1: `validate` (Validar Código)
Este job es el encargado de verificar la calidad del código y la seguridad en un entorno controlado. **Es una validación sin efectos secundarios** sobre los recursos externos, solo falla si el código no cumple las reglas.

#### Pasos Clave:
1.  **Checkout código:** Descarga el código fuente completo (`fetch-depth: 0`) para que herramientas como Gitleaks tengan visibilidad histórica completa de las ramas/commits.
2.  **Setup Node.js:** Configura el entorno con la versión de Node.js requerida (v20). El `cache` acelera los siguientes runs al reutilizar `node_modules`.
3.  **Instalar dependencias (`npm ci`):** Utiliza `ci` (clean install) en lugar de `install` porque es más determinístico, garantizando que se instale exactamente lo listado en `package-lock.json`.
4.  **Linting (ESLint):** Ejecuta ESLint para verificar el cumplimiento de las reglas de estilo y patrones de código seguro (ej: evitar `eval()`).
5.  **Testing (Jest):** Ejecuta la suite completa de pruebas unitarias. Si los tests fallan, el pipeline se detiene inmediatamente, bloqueando el merge de código roto.
6.  **Secret Detection (Gitleaks):** **[🛡️ SEGURIDAD]** Escanea todo el historial del repositorio en busca de secretos sensibles (`API keys`, `tokens`, etc.). Esto previene accidentalmente la inclusión de credenciales.

---

### 🟠 Job 2: `build-and-push` (Construir y Publicar Imagen)
Este job solo corre si el job `validate` fue exitoso (`needs: validate`). Su objetivo es crear una imagen Docker, escanearla y publicarla en un Registry (Docker Hub). **Este es el punto de no retorno**; las fallas aquí significan que la versión candidata es insegura o está mal construida.

#### 🔑 Control de Flujo Crítico:
*   `if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'`: Solo se permite el *push* final (y por lo tanto, la validación completa) cuando se trabaja en `main` o manualmente. Los PRs solo hasta aquí.
*   `permissions`: Se otorgan permisos específicos (`security-events: write`, `packages: write`) para permitir que las herramientas de seguridad y push funcionen correctamente.

#### 🏗️ Pasos Detallados:
1.  **Checkout código:** Descarga el código nuevamente, necesario para la construcción.
2.  **Login a Docker Hub:** Autentica al runner con credenciales almacenadas en secretos del entorno (`DOCKER_HUB_TOKEN`).
3.  **Setup Buildx:** Prepara `buildx` para optimizar y paralelizar la construcción de la imagen, lo cual es crucial para grandes proyectos.
4.  **Get version (SemVer):** Extrae automáticamente la versión actual del `package.json` (`vX.Y.Z`). Esto garantiza que cada artefacto tenga un tag único e inmutable, clave para la trazabilidad y rollbacks seguros.
5.  **Build Docker image:** Construye la imagen usando el `Dockerfile`. Se usa `push: false` inicialmente solo para obtener un identificador de capa (`/tmp/image.tar`) sin subirlo al Hub todavía.
6.  **Scan image with Trivy (⭐ CRÍTICO):** **[🛡️ SEGURIDAD]** Escanea la imagen construida en busca de Vulnerabilidades conocidas (CVEs).
    *   **Reporte:** El resultado se guarda como un archivo SARIF, que luego se sube a GitHub Code Scanning.
    *   **Fallo:** Se implementa una lógica de fallo explícita (`if grep -q ...`) para detener el pipeline si se detectan vulnerabilidades `CRITICAL`. **Este es nuestro principal gate de seguridad.**
7.  **Upload Trivy results:** Sube formalmente los resultados del escaneo a la herramienta nativa de GitHub Security, creando un registro de auditoría automatizado.
8.  **Check Trivy results:** Implementa el *gate* de detención para fallar si hay CVEs críticas.
9.  **Push Docker image:** Si todo lo anterior pasó, se realiza el push final de la imagen al Hub con dos tags:
    *   `nombre/repo:vX.Y.Z` (Tag SemVer inmutable).
    *   `nombre/repo:latest` (Tag que indica la versión más reciente y estable).

---

### 💡 Resumen DevSecOps
| Gate | Herramienta | Objetivo de Seguridad | Resultado en Fallo |
| :--- | :--- | :--- | :--- |
| **Calidad** | ESLint / Jest | Mantener código predecible y sin bugs. | Detiene el build (No pasa a `build-and-push`). |
| **Secreto** | Gitleaks | Prevenir fugas de credenciales al repositorio. | Detiene el job `validate`. |
| **Imagen Base/App** | Trivy | Proteger contra CVEs en librerías y SO. | **Detiene la publicación (El paso más importante).** |
| **Versionado** | SemVer Tagging | Trazabilidad e inmutabilidad del artefacto publicado. | Tags incorrectos o faltantes. |
