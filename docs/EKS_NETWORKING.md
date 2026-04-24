# 🌐 EKS Networking: Diseño de VPC y Subnet Tagging para Load Balancer

## Objetivo del Documento

Este documento explica el diseño de infraestructura de red para Amazon EKS, enfocándose en:
1. Arquitectura de VPC con subredes públicas y privadas
2. Etiquetado específico requerido por Kubernetes para el funcionamiento del AWS Load Balancer Controller
3. Diseño del código Terraform para implementar esta infraestructura

---

## 📋 Arquitectura de Red para EKS

### Topología de VPC

Para un clúster EKS production-ready, necesitamos una VPC con la siguiente estructura:

```
VPC (CIDR: 10.0.0.0/16)
├── Subredes Públicas (3 para alta disponibilidad)
│   ├── Public Subnet A (10.0.1.0/24) - Zona de Disponibilidad A
│   ├── Public Subnet B (10.0.2.0/24) - Zona de Disponibilidad B
│   └── Public Subnet C (10.0.3.0/24) - Zona de Disponibilidad C
│
└── Subredes Privadas (3 para alta disponibilidad)
    ├── Private Subnet A (10.0.10.0/24) - Zona de Disponibilidad A
    ├── Private Subnet B (10.0.20.0/24) - Zona de Disponibilidad B
    └── Private Subnet C (10.0.30.0/24) - Zona de Disponibilidad C
```

### ¿Por qué 3 subredes de cada tipo?

- **Alta Disponibilidad**: Distribuir los nodos del clúster en múltiples Zonas de Disponibilidad (AZ) protege contra fallas de un solo centro de datos.
- **Balanceo de Carga**: El AWS Load Balancer puede distribuir tráfico entre instancias en diferentes AZs.
- **Mejores Prácticas de AWS**: AWS recomienda al menos 2 AZs para producción, usamos 3 para máxima resiliencia.

---

## 🏷️ Etiquetado de Subredes: El Corazón del Load Balancer

### ¿Por qué Kubernetes necesita etiquetas específicas?

El **AWS Load Balancer Controller** (anteriormente ALB Ingress Controller) es un componente crítico que permite a Kubernetes crear y gestionar AWS Load Balancers automáticamente. Este controller **descubre subredes mediante etiquetas** para determinar dónde puede desplegar los load balancers.

### Etiquetas Requeridas

#### 1. Para Subredes Públicas (Internet-facing Load Balancer)

```hcl
tags = {
  "kubernetes.io/role/elb" = "1"
  "kubernetes.io/cluster/${cluster_name}" = "shared"
}
```

**Explicación:**
- `kubernetes.io/role/elb = "1"`: Indica que esta subred puede usarse para crear Load Balancers de tipo **Internet-facing** (accesibles desde internet).
- `kubernetes.io/cluster/${cluster_name} = "shared"`: Vincula la subred al clúster EKS específico. El valor "shared" significa que la subred puede ser usada por múltiples clústers.

#### 2. Para Subredes Privadas (Internal Load Balancer)

```hcl
tags = {
  "kubernetes.io/role/internal-elb" = "1"
  "kubernetes.io/cluster/${cluster_name}" = "shared"
}
```

**Explicación:**
- `kubernetes.io/role/internal-elb = "1"`: Indica que esta subred puede usarse para crear Load Balancers **internos** (solo accesibles dentro de la VPC).
- `kubernetes.io/cluster/${cluster_name} = "shared"`: Misma funcionalidad que en subredes públicas.

### ¿Cómo funciona el descubrimiento?

Cuando creas un Kubernetes `Service` de tipo `LoadBalancer` o un `Ingress`:

1. El AWS Load Balancer Controller consulta el API de AWS para encontrar subredes con las etiquetas apropiadas
2. Si el Service/Ingress es público → busca subredes con `kubernetes.io/role/elb`
3. Si el Service/Ingress es interno → busca subredes con `kubernetes.io/role/internal-elb`
4. El controller selecciona automáticamente las subredes disponibles y crea el Load Balancer en ellas

**Sin estas etiquetas, el controller no puede encontrar subredes y fallará la creación del Load Balancer.**

---

## 💻 Diseño del Código Terraform

### Estructura de Archivos Propuesta

```
terraform/
├── modules/
│   └── vpc/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   └── dev/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
└── backend.tf (configuración de estado remoto)
```

### Código Terraform para la VPC

#### `terraform/modules/vpc/main.tf`

```hcl
# VPC Principal
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name                                           = "${var.cluster_name}-vpc"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.cluster_name}-igw"
  }
}

# Subredes Públicas
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                           = "${var.cluster_name}-public-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
    "kubernetes.io/role/elb"                       = "1"
  }
}

# Subredes Privadas
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name                                           = "${var.cluster_name}-private-subnet-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
    "kubernetes.io/role/internal-elb"              = "1"
  }
}

# Elastic IP para NAT Gateways
resource "aws_eip" "nat" {
  count = length(var.public_subnet_cidrs)
  domain = "vpc"

  tags = {
    Name = "${var.cluster_name}-nat-${count.index + 1}"
  }
}

# NAT Gateways (uno por subred pública para alta disponibilidad)
resource "aws_nat_gateway" "main" {
  count = length(var.public_subnet_cidrs)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.cluster_name}-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Rutas para Subredes Públicas
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.cluster_name}-public-rt"
  }
}

# Rutas para Subredes Privadas (una por NAT Gateway)
resource "aws_route_table" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "${var.cluster_name}-private-rt-${count.index + 1}"
  }
}

# Asociaciones de Route Tables
resource "aws_route_table_association" "public" {
  count = length(var.public_subnet_cidrs)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(var.private_subnet_cidrs)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Data source para zonas de disponibilidad
data "aws_availability_zones" "available" {
  state = "available"
}
```

#### `terraform/modules/vpc/variables.tf`

```hcl
variable "cluster_name" {
  description = "Nombre del clúster EKS"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block para la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Lista de CIDR blocks para subredes públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Lista de CIDR blocks para subredes privadas"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
}
```

#### `terraform/modules/vpc/outputs.tf`

```hcl
output "vpc_id" {
  description = "ID de la VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Lista de IDs de subredes públicas"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Lista de IDs de subredes privadas"
  value       = aws_subnet.private[*].id
}

output "vpc_cidr" {
  description = "CIDR block de la VPC"
  value       = aws_vpc.main.cidr_block
}
```

---

## 🔒 Consideraciones de Seguridad

### 1. Principio de Menor Privilegio
- Las subredes privadas **NO** tienen IP pública (`map_public_ip_on_launch = false`)
- El tráfico saliente de subredes privadas pasa por NAT Gateways (controlado)
- Los nodos EKS se desplegarán en subredes privadas por defecto

### 2. Aislamiento de Red
- Los Load Balancers públicos se crean en subredes públicas
- Los servicios internos se comunican a través de Load Balancers internos en subredes privadas
- El tráfico entre subredes está controlado por Security Groups y NACLs

### 3. Estado Remoto y Locking
- Usaremos S3 + DynamoDB para estado remoto (como especifica .clinerules)
- Esto previene condiciones de carrera y pérdida de estado

---

## 💰 Estimación de Costos (Antes de `terraform apply`)

### Costos Fijos de la VPC:
1. **NAT Gateways**: ~$32.85/mes c/u (3 NATs = ~$98.55/mes)
2. **Elastic IPs**: ~$3.60/mes c/u si no están asociadas (pero estarán asociadas a NATs)
3. **Transferencia de Datos**: Variable según tráfico

### Costos Adicionales de EKS (futuros):
1. **Control Plane EKS**: $0.10/hora = ~$73/mes (fijo)
2. **Nodos/Fargate**: Variable según uso

**Total estimado inicial (VPC + EKS control plane): ~$171.55/mes**

⚠️ **Importante**: Este costo es solo de infraestructura base. Los nodos worker/Fargate agregarán costos adicionales.

---

## 🧹 Estrategia de Destrucción

Como especifica .clinerules, cada recurso debe ser destruible:

```bash
# Comando para destruir toda la infraestructura
cd terraform/environments/dev
terraform destroy -auto-approve

# Verificación post-destrucción
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*eks*"
aws ec2 describe-subnets --filters "Name=tag:Name,Values=*eks*"
```

**Verificación**: Después de `terraform destroy`, no deben quedar:
- VPCs con tags del clúster
- NAT Gateways
- Elastic IPs
- Internet Gateways

---

## 📚 Referencias y Mejores Prácticas

### Documentación Oficial:
- [AWS Load Balancer Controller - Subnet Discovery](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/service/nlb/)
- [Amazon EKS Best Practices - Networking](https://aws.github.io/aws-eks-best-practices/networking/)
- [Terraform AWS EKS Blueprint](https://aws-ia.github.io/terraform-aws-eks-blueprints/)

### Etiquetas Adicionales Recomendadas:
```hcl
tags = {
  Environment   = "dev"
  Project       = "recipe-app"
  ManagedBy     = "terraform"
  CostCenter    = "devops"
}
```

---

## 🎯 Próximos Pasos (Después de Aprobación)

1. **Crear estructura de directorios Terraform**
2. **Implementar módulo VPC**
3. **Configurar backend remoto (S3 + DynamoDB)**
4. **Validar con `terraform plan`**
5. **Aplicar con `terraform apply`**
6. **Verificar creación de recursos**
7. **Preparar para siguiente fase: EKS Cluster**

---

## 📝 Checklist de Revisión

- [x] Diseño de VPC con 3 AZs para alta disponibilidad
- [x] Explicación detallada de etiquetas `kubernetes.io/role/elb`
- [x] Código Terraform modular y reutilizable
- [x] Estimación de costos preliminar
- [x] Estrategia de destrucción clara
- [ ] Aprobación del usuario para implementación
- [ ] Implementación en AWS
- [ ] Verificación de recursos

---

**Nota Final**: Este diseño sigue las mejores prácticas de AWS y Kubernetes, asegurando que el Load Balancer Controller funcione correctamente desde el primer despliegue de la aplicación.
