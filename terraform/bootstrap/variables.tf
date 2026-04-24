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
