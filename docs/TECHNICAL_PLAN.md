# 🚀 Fase 3: Migración a Kubernetes (Kind)
## Objetivo
Establecer el backend de la aplicación en un clúster local de Kubernetes utilizando Kind, aprendiendo los manifiestos YAML nativos antes de usar herramientas de abstracción como Helm. Esto garantiza una comprensión profunda de los primitivos de infraestructura.

---

### 🏗️ Arquitectura y Primitivas (Concepto)
La transición implica reemplazar la capa de orquestación de Docker Compose con componentes nativos de K8s:

1.  **`Service`**: Reemplaza el `ports:` mapeado en `docker-compose.yml`. Define cómo acceder al servicio *dentro* del clúster (ClusterIP).
2.  **`Deployment`**: Gestiona el ciclo de vida de las réplicas de la aplicación, reemplazando el contenedor definido por `build:` y `command:` en `docker-compose.yml`. Se encarga de mantener un número deseado de pods saludables.
3.  **Immutabilidad:** Los contenedores deben seguir siendo construidos con los mismos principios del CI/CD (Multi-stage, no root) para asegurar que el artefacto que se despliega es idéntico al que fue escaneado y aprobado en `main`.

### 🌐 Conexión a Servicios Externos
Para conectar servicios como Supabase (que reside fuera del clúster K8s), usaremos:
*   **`ExternalName` Service:** Para exponer nombres DNS externos sin necesidad de Ingress complejo inicialmente.
*   **ConfigMaps / Secrets:** Para inyectar URLs y credenciales sensibles desde el entorno del clúster, en lugar de depender de variables de ambiente locales (`.env`).

### 📝 Manifestos YAML a Implementar (Próximas Etapas)
1.  **`backend-deployment.yaml`**: Definirá un `Deployment` para el backend, apuntando a la imagen Docker construida y taggeada en CI (`${{ secrets.DOCKER_HUB_USERNAME }}/recipe-backend:latest`).
2.  **`backend-service.yaml`**: Definirá el `Service`, exponiendo el Deployment internamente al clúster.

---
*Este documento será actualizado a medida que se construyen los manifiestos y la comprensión de cada componente Kubernetes.*
