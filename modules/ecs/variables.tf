variable "environment" {
  description = "Environment name used to identify ECS resources."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for CloudWatch log configuration."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID used by the ECS security groups and load balancer."
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnets for the application load balancer."
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnets for ECS tasks."
  type        = list(string)
}

variable "task_security_group_id" {
  description = "Security group attached to ECS tasks and shared with network integration modules."
  type        = string
}

variable "vpc_endpoint_security_group_id" {
  description = "Security group attached to interface VPC endpoints."
  type        = string
}

variable "database_integration_secret_arn" {
  description = "Secrets Manager secret ARN containing private database connection settings."
  type        = string
}

variable "database_credentials_secret_arn" {
  description = "Secrets Manager secret ARN containing restricted application database credentials."
  type        = string
}

variable "database_secrets_kms_key_arn" {
  description = "Customer-managed KMS key used to encrypt the database integration secrets."
  type        = string
}

variable "s3_vpc_endpoint_prefix_list_id" {
  description = "AWS-managed prefix list for the S3 gateway endpoint."
  type        = string
}

variable "container_port" {
  description = "Port exposed by the application containers."
  type        = number
  default     = 3000
}

variable "health_check_path" {
  description = "HTTP health-check path on service B."
  type        = string
  default     = "/health"
}

variable "cpu" {
  description = "Fargate task CPU units."
  type        = number

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.cpu)
    error_message = "cpu must be a supported Fargate CPU value."
  }
}

variable "memory" {
  description = "Fargate task memory in MiB."
  type        = number
}

variable "desired_count" {
  description = "Number of tasks to run for each ECS service."
  type        = number

  validation {
    condition     = var.desired_count >= 1
    error_message = "desired_count must be at least 1."
  }
}

variable "image_tag" {
  description = "Tag used when ECS pulls service images from the environment ECR repositories."
  type        = string

  validation {
    condition     = length(trimspace(var.image_tag)) > 0
    error_message = "image_tag must not be empty."
  }
}

variable "image_tag_mutability" {
  description = "ECR tag mutability mode for service images."
  type        = string
  default     = "IMMUTABLE"

  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.image_tag_mutability)
    error_message = "image_tag_mutability must be MUTABLE or IMMUTABLE."
  }
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
}

variable "log_level" {
  description = "RUST_LOG level passed to each application container."
  type        = string
}

variable "tags" {
  description = "Tags applied to ECS, ECR, load balancer, and logging resources."
  type        = map(string)
  default     = {}
}
