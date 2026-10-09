variable "environment" {
  description = "Environment name used to identify VPC resources."
  type        = string
}

variable "vpc_cidr" {
  description = "IPv4 CIDR block assigned to the VPC."
  type        = string

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be a valid IPv4 CIDR block."
  }
}

variable "availability_zones" {
  description = "Availability zones in which to create public and private subnets."
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least two availability zones are required."
  }
}

variable "single_nat_gateway" {
  description = "Use one shared NAT gateway instead of one per availability zone."
  type        = bool
  default     = true
}

variable "flow_logs_retention_days" {
  description = "CloudWatch retention period for VPC flow logs."
  type        = number
  default     = 14
}

variable "tags" {
  description = "Tags applied to VPC resources."
  type        = map(string)
  default     = {}
}
