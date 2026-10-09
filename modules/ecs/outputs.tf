output "cluster_id" {
  description = "ID of the ECS cluster."
  value       = aws_ecs_cluster.this.id
}

output "cluster_name" {
  description = "Name of the ECS cluster."
  value       = aws_ecs_cluster.this.name
}

output "namespace_name" {
  description = "Private DNS namespace used by ECS Service Connect."
  value       = aws_service_discovery_private_dns_namespace.this.name
}

output "load_balancer_dns_name" {
  description = "Public DNS name of the application load balancer."
  value       = aws_lb.this.dns_name
}

output "load_balancer_url" {
  description = "Public HTTP URL for service B."
  value       = "http://${aws_lb.this.dns_name}"
}

output "ecr_repository_urls" {
  description = "Environment-specific ECR repository URLs keyed by service."
  value       = { for name, repository in aws_ecr_repository.services : name => repository.repository_url }
}

output "service_connect_endpoints" {
  description = "Service Connect DNS endpoint URLs keyed by service."
  value = {
    for name, service in local.services :
    name => "http://${name}.${aws_service_discovery_private_dns_namespace.this.name}:${service.discovery_port}"
  }
}

output "task_security_group_id" {
  description = "Security group shared by ECS tasks and used to authorize database access."
  value       = var.task_security_group_id
}
