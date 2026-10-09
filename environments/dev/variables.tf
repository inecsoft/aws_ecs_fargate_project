variable "aws_region" {
  description = "AWS region for the dev environment."
  type        = string
  default     = "eu-west-1"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR block for the dev VPC."
  type        = string
}

variable "availability_zone_count" {
  description = "Number of availability zones used by dev."
  type        = number
  default     = 2

  validation {
    condition     = var.availability_zone_count >= 2
    error_message = "availability_zone_count must be at least 2."
  }
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway for dev to reduce networking costs."
  type        = bool
  default     = true
}

variable "task_cpu" {
  description = "CPU units for each dev Fargate task."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory in MiB for each dev Fargate task."
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of tasks per dev ECS service."
  type        = number
  default     = 1
}

variable "image_tag" {
  description = "Image tag deployed to dev when running Terraform directly."
  type        = string
  default     = "dev-latest"
}

variable "image_tag_mutability" {
  description = "ECR image tag mutability for dev."
  type        = string
  default     = "IMMUTABLE"
}

variable "log_retention_days" {
  description = "CloudWatch log retention for dev."
  type        = number
  default     = 14
}

variable "log_level" {
  description = "RUST_LOG level for dev service containers."
  type        = string
  default     = "debug"
}

variable "database_instance_count" {
  description = "Number of Aurora Serverless v2 instances in dev."
  type        = number
}

variable "database_min_capacity" {
  description = "Minimum Aurora Serverless v2 capacity in dev ACUs."
  type        = number
}

variable "database_max_capacity" {
  description = "Maximum Aurora Serverless v2 capacity in dev ACUs."
  type        = number
}

variable "database_backup_retention_days" {
  description = "Aurora automated backup retention in dev."
  type        = number
}

variable "database_deletion_protection" {
  description = "Whether Aurora deletion protection is enabled in dev."
  type        = bool
}

variable "database_skip_final_snapshot" {
  description = "Whether dev Aurora deletion skips the final snapshot."
  type        = bool
}
