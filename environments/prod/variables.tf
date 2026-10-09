variable "aws_region" {
  description = "AWS region for the production environment."
  type        = string
  default     = "eu-west-1"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR block for the production VPC."
  type        = string
}

variable "availability_zone_count" {
  description = "Number of availability zones used by production."
  type        = number
  default     = 3

  validation {
    condition     = var.availability_zone_count >= 2
    error_message = "availability_zone_count must be at least 2."
  }
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway per availability zone for production."
  type        = bool
  default     = false
}

variable "task_cpu" {
  description = "CPU units for each production Fargate task."
  type        = number
  default     = 1024
}

variable "task_memory" {
  description = "Memory in MiB for each production Fargate task."
  type        = number
  default     = 2048
}

variable "desired_count" {
  description = "Number of tasks per production ECS service."
  type        = number
  default     = 3
}

variable "image_tag" {
  description = "Image tag deployed to production when running Terraform directly."
  type        = string
  default     = "v1.2.3"
}

variable "image_tag_mutability" {
  description = "ECR image tag mutability for production."
  type        = string
  default     = "IMMUTABLE"
}

variable "log_retention_days" {
  description = "CloudWatch log retention for production."
  type        = number
  default     = 90
}

variable "log_level" {
  description = "RUST_LOG level for production service containers."
  type        = string
  default     = "info"
}

variable "database_instance_count" {
  description = "Number of Aurora Serverless v2 instances in production."
  type        = number
}

variable "database_min_capacity" {
  description = "Minimum Aurora Serverless v2 capacity in production ACUs."
  type        = number
}

variable "database_max_capacity" {
  description = "Maximum Aurora Serverless v2 capacity in production ACUs."
  type        = number
}

variable "database_backup_retention_days" {
  description = "Aurora automated backup retention in production."
  type        = number
}

variable "database_deletion_protection" {
  description = "Whether Aurora deletion protection is enabled in production."
  type        = bool
}

variable "database_skip_final_snapshot" {
  description = "Whether production Aurora deletion skips the final snapshot."
  type        = bool
}
