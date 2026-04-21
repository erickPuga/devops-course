# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas de Docker
COPY package*.json ./
RUN npm install

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Establecer NODE_ENV a production
ENV NODE_ENV=production

# Copiar solo las dependencias de producción y el código compilado
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Seguridad: Ejecutar como usuario no privilegiado
# Alpine ya incluye un usuario 'node'
USER node

# Metadata
EXPOSE 3001

# Iniciar la aplicación
CMD ["node", "dist/index.js"]
