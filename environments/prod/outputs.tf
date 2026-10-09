output "vpc_id" {
  description = "ID of the production VPC."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the production public subnets."
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the production private subnets."
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  description = "IDs of isolated production database subnets."
  value       = module.vpc.database_subnet_ids
}

output "cluster_name" {
  description = "Name of the production ECS cluster."
  value       = module.ecs.cluster_name
}

output "namespace" {
  description = "Service Connect namespace for production."
  value       = module.ecs.namespace_name
}

output "load_balancer_url" {
  description = "Public URL routed to service B in production."
  value       = module.ecs.load_balancer_url
}

output "ecr_repository_urls" {
  description = "Production ECR repositories keyed by service."
  value       = module.ecs.ecr_repository_urls
}

output "service_connect_endpoints" {
  description = "Private Service Connect endpoints keyed by service."
  value       = module.ecs.service_connect_endpoints
}

output "database_endpoint" {
  description = "Private RDS Proxy endpoint for application connections."
  value       = module.rds.proxy_endpoint
}

output "database_reader_endpoint" {
  description = "Private Aurora PostgreSQL reader endpoint."
  value       = module.rds.reader_endpoint
}

output "database_cluster_endpoint" {
  description = "Private Aurora PostgreSQL writer endpoint, bypassing the proxy."
  value       = module.rds.cluster_endpoint
}

output "database_name" {
  description = "Initial database name in Aurora PostgreSQL."
  value       = module.rds.database_name
}

output "database_master_secret_arn" {
  description = "Secrets Manager ARN for the RDS-managed database master credentials."
  value       = module.rds.master_user_secret_arn
}

output "database_integration_secret_arn" {
  description = "Secrets Manager ARN containing proxy connection settings."
  value       = module.rds.integration_secret_arn
}

output "database_credentials_secret_arn" {
  description = "Secrets Manager ARN containing application database credentials."
  value       = module.rds.application_credentials_secret_arn
}

output "ecs_task_security_group_id" {
  description = "Security group used by ECS tasks and authorized for database access."
  value       = module.ecs.task_security_group_id
}
