# 🗄️ Configuración de Backend Remoto para Terraform (S3 + DynamoDB)

## Objetivo

Configurar un backend remoto seguro para Terraform usando Amazon S3 para almacenar el estado y DynamoDB para locking, junto con un rol IAM especializado para ejecutar Terraform.

---

## 📋 ¿Por qué Backend Remoto?

### Problemas del Estado Local:
1. **Pérdida de datos**: Si tu laptop falla, pierdes el estado
2. **Colaboración**: Múltiples personas no pueden trabajar simultáneamente
3. **Seguridad**: El estado contiene información sensible (IDs, IPs, etc.)
4. **Consistencia**: Sin locking, dos personas pueden aplicar cambios simultáneamente

### Solución AWS:
- **S3**: Almacenamiento durable y versionado del estado
- **DynamoDB**: Locking distribuido para prevenir condiciones de carrera
- **IAM Roles**: Control de acceso granular

---

## 🏗️ Arquitectura de Seguridad

### Rol IAM para Terraform

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::terraform-state-recipe-app",
        "arn:aws:s3:::terraform-state-recipe-app/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/terraform-locks"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "eks:*",
        "elasticloadbalancing:*",
        "iam:CreateServiceLinkedRole",
        "iam:GetRole",
        "iam:ListRoles",
        "logs:CreateLogGroup",
        "logs:PutRetentionPolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

**Explicación de permisos**:
- **S3**: Solo acceso al bucket específico de estado (principio de menor privilegio)
- **DynamoDB**: Solo operaciones de locking en la tabla específica
- **Servicios AWS**: Permisos para crear infraestructura (EC2, EKS, ELB, etc.)

---

## 🛠️ Paso a Paso: Configuración Manual

### 1. Crear Bucket S3 para Estado

```bash
# Variables
BUCKET_NAME="terraform-state-recipe-app"
REGION="us-east-1"

# Crear bucket (solo si no existe)
aws s3api head-bucket --bucket $BUCKET_NAME 2>/dev/null || \
  aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION

# Habilitar versionado (CRÍTICO para recuperación)
aws s3api put-bucket-versioning --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Habilitar encriptación (seguridad por defecto)
aws s3api put-bucket-encryption --bucket $BUCKET_NAME \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

# Bloquear acceso público (seguridad)
aws s3api put-public-access-block --bucket $BUCKET_NAME \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

# Habilitar lifecycle para versiones antiguas (ahorro de costos)
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET_NAME \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "cleanup-old-versions",
        "Status": "Enabled",
        "Filter": { "Prefix": "" },
        "NoncurrentVersionExpiration": { "NoncurrentDays": 30 }
      }
    ]
  }'
```

### 2. Crear Tabla DynamoDB para Locking

```bash
# Variables
TABLE_NAME="terraform-locks"

# Crear tabla (solo si no existe)
aws dynamodb describe-table --table-name $TABLE_NAME 2>/dev/null || \
  aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION

# Esperar a que esté activa
aws dynamodb wait table-exists --table-name $TABLE_NAME
```

### 3. Crear Rol IAM para Terraform

```bash
# Variables
ROLE_NAME="TerraformExecutionRole"
TRUST_POLICY_FILE="trust-policy.json"

# Crear política de confianza (asume rol desde usuario/rol específico)
cat > $TRUST_POLICY_FILE << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Crear rol
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document file://$TRUST_POLICY_FILE

# Crear política personalizada
POLICY_NAME="TerraformInfrastructurePolicy"
POLICY_ARN=$(aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document file://terraform-policy.json \
  --query 'Policy.Arn' --output text)

# Adjuntar política al rol
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn $POLICY_ARN

# Limpieza
rm $TRUST_POLICY_FILE
```

---

## 🎯 Configuración Automática con Terraform (Recomendado)

### Estructura de Archivos

```
terraform/
├── bootstrap/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── modules/
│   └── vpc/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    └── dev/
        ├── main.tf
        ├── variables.tf
        ├── backend.tf
        └── terraform.tfvars
```

### `terraform/bootstrap/main.tf` (Configura S3 y DynamoDB)

```hcl
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Bucket S3 para estado de Terraform
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.state_bucket_name

  tags = {
    Name        = "terraform-state-bucket"
    Environment = "bootstrap"
    ManagedBy   = "terraform"
  }
}

# Versionado del bucket (CRÍTICO)
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Encriptación del bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bloqueo de acceso público
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle para versiones antiguas (ahorro)
resource "aws_s3_bucket_lifecycle_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Tabla DynamoDB para locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "terraform-locks-table"
    Environment = "bootstrap"
    ManagedBy   = "terraform"
  }
}

# Rol IAM para Terraform
resource "aws_iam_role" "terraform_execution" {
  name = var.terraform_role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = data.aws_caller_identity.current.arn
        }
      }
    ]
  })

  tags = {
    Name        = "terraform-execution-role"
    Environment = "bootstrap"
    ManagedBy   = "terraform"
  }
}

# Política IAM para Terraform
resource "aws_iam_role_policy" "terraform_policy" {
  name = "TerraformInfrastructurePolicy"
  role = aws_iam_role.terraform_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.terraform_state.arn,
          "${aws_s3_bucket.terraform_state.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable"
        ]
        Resource = aws_dynamodb_table.terraform_locks.arn
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:*",
          "eks:*",
          "elasticloadbalancing:*",
          "iam:CreateServiceLinkedRole",
          "iam:GetRole",
          "iam:ListRoles",
          "logs:CreateLogGroup",
          "logs:PutRetentionPolicy"
        ]
        Resource = "*"
      }
    ]
  })
}

# Data source para obtener información del caller
data "aws_caller_identity" "current" {}
```

### `terraform/bootstrap/variables.tf`

```hcl
variable "region" {
  description = "AWS region para los recursos"
  type        = string
  default     = "us-east-1"
}

variable "state_bucket_name" {
  description = "Nombre del bucket S3 para estado de Terraform"
  type        = string
  default     = "terraform-state-recipe-app"
}

variable "lock_table_name" {
  description = "Nombre de la tabla DynamoDB para locking"
  type        = string
  default     = "terraform-locks"
}

variable "terraform_role_name" {
  description = "Nombre del rol IAM para ejecución de Terraform"
  type        = string
  default     = "TerraformExecutionRole"
}
```

### `terraform/bootstrap/outputs.tf`

```hcl
output "state_bucket_name" {
  description = "Nombre del bucket S3 para estado"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "lock_table_name" {
  description = "Nombre de la tabla DynamoDB para locking"
  value       = aws_dynamodb_table.terraform_locks.name
}

output "terraform_role_arn" {
  description = "ARN del rol IAM para Terraform"
  value       = aws_iam_role.terraform_execution.arn
}

output "backend_config" {
  description = "Configuración lista para usar en backend.tf"
  value       = <<EOF
bucket = "${aws_s3_bucket.terraform_state.bucket}"
key    = "environments/dev/terraform.tfstate"
region = "${var.region}"
dynamodb_table = "${aws_dynamodb_table.terraform_locks.name}"
encrypt = true
EOF
}
```

---

## 🚀 Flujo de Trabajo Recomendado

### Paso 1: Bootstrap (Estado Local)

```bash
# 1. Navegar a bootstrap
cd terraform/bootstrap

# 2. Inicializar (estado local temporal)
terraform init

# 3. Planificar
terraform plan

# 4. Aplicar (crea S3, DynamoDB, IAM)
terraform apply

# 5. Guardar outputs para siguiente paso
terraform output -json > ../environments/dev/bootstrap_outputs.json
```

### Paso 2: Configurar Backend Remoto

Crear `terraform/environments/dev/backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-recipe-app"  # Del bootstrap
    key            = "environments/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    
    # Perfil IAM para asumir el rol
    # role_arn = "arn:aws:iam::123456789012:role/TerraformExecutionRole"
  }
}
```

### Paso 3: Migrar Estado a Remoto

```bash
# 1. Navegar a environment
cd terraform/environments/dev

# 2. Inicializar con migración
terraform init -migrate-state

# Terraform preguntará si quieres migrar el estado
# Responder "yes" para mover estado local a S3

# 3. Verificar migración
terraform state list
```

---

## 🔒 Mejores Prácticas de Seguridad

### 1. Usar Rol IAM (No Credenciales Hardcodeadas)

```bash
# Asumir rol temporalmente
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/TerraformExecutionRole \
  --role-session-name terraform-session

# Exportar credenciales temporales
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...

# Ejecutar Terraform
terraform apply
```

### 2. Estado Sensible

El estado de Terraform contiene información sensible. Por eso:
- ✅ Encriptación en reposo (S3 SSE)
- ✅ Acceso restringido (IAM policies)
- ✅ Versionado para recuperación
- ❌ Nunca commitear `terraform.tfstate` a Git

### 3. Locking con DynamoDB

```bash
# Cuando Terraform aplica, crea un lock
# Lock ID: environments/dev/terraform.tfstate-lock

# Si otro usuario intenta aplicar simultáneamente:
# Error: Failed to acquire lock on "environments/dev/terraform.tfstate"

# Forzar liberación (SOLO si estás seguro):
terraform force-unlock <LOCK_ID>
```

---

## 💰 Estimación de Costos del Backend

### S3 Bucket:
- **Almacenamiento**: $0.023/GB-mes (estado típico: <1MB = ~$0.000023/mes)
- **Requests**: $0.005/1000 PUT, $0.0004/1000 GET
- **Total estimado**: <$0.01/mes

### DynamoDB Table:
- **On-demand**: $1.25/millón writes, $0.25/millón reads
- **Locking operations**: ~100 ops/día = ~3000 ops/mes
- **Total estimado**: <$0.01/mes

### IAM Role:
- **Gratis** (solo se cobra por uso de servicios)

**Total backend remoto: ~$0.02/mes** (prácticamente gratis)

---

## 🧹 Estrategia de Limpieza

### Para el Bootstrap:

```bash
# 1. Navegar a bootstrap
cd terraform/bootstrap

# 2. Destruir recursos de bootstrap
terraform destroy

# IMPORTANTE: Esto NO destruye el estado de otros environments
# Solo destruye S3, DynamoDB, y el rol IAM del bootstrap
```

### Verificación Post-Destrucción:

```bash
# Verificar que no queden recursos
aws s3 ls | grep terraform-state-recipe-app
aws dynamodb list-tables --query "TableNames[?contains(@, 'terraform-locks')]"
aws iam list-roles --query "Roles[?contains(RoleName, 'Terraform')]"

# Si existen, eliminar manualmente:
aws s3 rb s3://terraform-state-recipe-app --force
aws dynamodb delete-table --table-name terraform-locks
aws iam detach-role-policy --role-name TerraformExecutionRole --policy-arn <POLICY_ARN>
aws iam delete-role --role-name TerraformExecutionRole
```

---

## 📚 Referencias

- [Terraform Backend S3](https://www.terraform.io/language/settings/backends/s3)
- [AWS S3 Bucket Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
- [DynamoDB Locking](https://www.terraform.io/language/settings/backends/s3#dynamodb-lock-table)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## 🎯 Próximos Pasos

1. **Ejecutar bootstrap** para crear S3, DynamoDB, IAM
2. **Configurar backend.tf** en environment dev
3. **Migrar estado** a remoto
4. **Probar locking** con `terraform apply` concurrente
5. **Continuar con VPC** usando backend remoto

---

## ⚠️ Advertencias Importantes

1. **Nunca eliminar bucket S3 manualmente** sin antes hacer `terraform destroy`
2. **Siempre usar versionado** para poder recuperar estados anteriores
3. **Probar `terraform destroy`** en ambiente de desarrollo antes de producción
4. **Monitorear costos** de DynamoDB on-demand (aunque son mínimos)
5. **Rotar credenciales** si se comprometen (usar IAM roles en su lugar)

---

**Nota**: Este diseño sigue el principio de "Infrastructure as Code" incluso para la infraestructura de Terraform, asegurando que todo sea reproducible, versionado y destruible.
