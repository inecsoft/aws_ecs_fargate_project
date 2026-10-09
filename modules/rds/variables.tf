variable "environment" {
  description = "Environment name used to identify database resources."
  type        = string
}

variable "vpc_id" {
  description = "VPC containing the private database subnets."
  type        = string
}

variable "database_subnet_ids" {
  description = "Isolated database subnets spanning at least two availability zones."
  type        = list(string)

  validation {
    condition     = length(var.database_subnet_ids) >= 2
    error_message = "Aurora requires database subnets in at least two availability zones."
  }
}

variable "proxy_subnet_ids" {
  description = "Private application subnets for RDS Proxy network interfaces."
  type        = list(string)

  validation {
    condition     = length(var.proxy_subnet_ids) >= 2
    error_message = "RDS Proxy requires private subnets in at least two availability zones."
  }
}

variable "ecs_task_security_group_id" {
  description = "ECS task security group authorized to connect to the database."
  type        = string
}

variable "application_username" {
  description = "Restricted database username used by the ECS application and RDS Proxy."
  type        = string
  default     = "service_connect_app"

  validation {
    condition     = can(regex("^[A-Za-z][A-Za-z0-9_]{0,62}$", var.application_username))
    error_message = "application_username must be a valid PostgreSQL role name of at most 63 characters."
  }
}

variable "database_name" {
  description = "Initial database created in the Aurora cluster."
  type        = string
  default     = "serviceconnect"
}

variable "master_username" {
  description = "Master database username; its password is managed by RDS in Secrets Manager."
  type        = string
  default     = "cluster_admin"
}

variable "instance_count" {
  description = "Number of Aurora Serverless v2 instances in the cluster."
  type        = number

  validation {
    condition     = var.instance_count >= 1
    error_message = "instance_count must be at least one."
  }
}

variable "min_capacity" {
  description = "Minimum Aurora Serverless v2 capacity in ACUs."
  type        = number
  default     = 0.5

  validation {
    condition     = var.min_capacity >= 0.5
    error_message = "min_capacity must be at least 0.5 ACUs."
  }
}

variable "max_capacity" {
  description = "Maximum Aurora Serverless v2 capacity in ACUs."
  type        = number

  validation {
    condition     = var.max_capacity >= var.min_capacity
    error_message = "max_capacity must be greater than or equal to min_capacity."
  }
}

variable "backup_retention_period" {
  description = "Automated backup retention period in days."
  type        = number

  validation {
    condition     = var.backup_retention_period >= 1 && var.backup_retention_period <= 35
    error_message = "backup_retention_period must be between 1 and 35 days."
  }
}

variable "deletion_protection" {
  description = "Whether to prevent accidental deletion of the Aurora cluster."
  type        = bool
}

variable "skip_final_snapshot" {
  description = "Whether cluster deletion may skip its final snapshot."
  type        = bool
}

variable "tags" {
  description = "Tags applied to database resources."
  type        = map(string)
  default     = {}
}
