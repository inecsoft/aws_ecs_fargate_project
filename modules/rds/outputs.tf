output "cluster_identifier" {
  description = "Identifier of the Aurora cluster."
  value       = aws_rds_cluster.this.cluster_identifier
}

output "cluster_endpoint" {
  description = "Writer endpoint for the private Aurora cluster."
  value       = aws_rds_cluster.this.endpoint
}

output "reader_endpoint" {
  description = "Reader endpoint for the private Aurora cluster."
  value       = aws_rds_cluster.this.reader_endpoint
}

output "proxy_endpoint" {
  description = "Private RDS Proxy endpoint for application connections."
  value       = aws_db_proxy.this.endpoint
}

output "integration_secret_arn" {
  description = "Secrets Manager ARN containing the ECS database connection settings."
  value       = aws_secretsmanager_secret.integration.arn

  depends_on = [aws_secretsmanager_secret_version.integration]
}

output "application_credentials_secret_arn" {
  description = "Secrets Manager ARN containing the restricted application database credentials."
  value       = aws_secretsmanager_secret.application_credentials.arn

  depends_on = [aws_secretsmanager_secret_version.application_credentials]
}

output "database_secrets_kms_key_arn" {
  description = "Customer-managed KMS key used for the database and integration secrets."
  value       = aws_kms_key.database.arn
}

output "port" {
  description = "Port used by the Aurora PostgreSQL cluster."
  value       = aws_rds_cluster.this.port
}

output "database_name" {
  description = "Name of the initial database in the Aurora cluster."
  value       = aws_rds_cluster.this.database_name
}

output "master_user_secret_arn" {
  description = "Secrets Manager ARN for the RDS-managed master user credentials."
  value       = aws_rds_cluster.this.master_user_secret[0].secret_arn
}
