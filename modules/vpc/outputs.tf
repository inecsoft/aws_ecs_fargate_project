output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.this.id
}

output "vpc_cidr_block" {
  description = "IPv4 CIDR block assigned to the VPC."
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets."
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "IDs of isolated database subnets with no internet route."
  value       = aws_subnet.database[*].id
}

output "vpc_endpoint_security_group_id" {
  description = "Security group attached to interface VPC endpoints."
  value       = aws_security_group.vpc_endpoints.id
}

output "s3_vpc_endpoint_prefix_list_id" {
  description = "AWS-managed prefix list used to reach S3 through the gateway endpoint."
  value       = aws_vpc_endpoint.s3.prefix_list_id
}
