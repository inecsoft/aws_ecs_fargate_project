terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket       = "terraform-state-serviceconnect"
    key          = "dev/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
      Project     = "service-connect-demo"
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  environment        = "dev"
  availability_zones = slice(data.aws_availability_zones.available.names, 0, var.availability_zone_count)
  common_tags = {
    Environment = local.environment
    Project     = "service-connect-demo"
    ManagedBy   = "terraform"
  }
}

module "vpc" {
  source = "../../modules/vpc"

  environment              = local.environment
  vpc_cidr                 = var.vpc_cidr
  availability_zones       = local.availability_zones
  single_nat_gateway       = var.single_nat_gateway
  flow_logs_retention_days = var.log_retention_days
  tags                     = local.common_tags
}

resource "aws_security_group" "ecs_tasks" {
  name_prefix = "dev-ecs-"
  description = "Private dev ECS tasks and Service Connect traffic"
  vpc_id      = module.vpc.vpc_id
  ingress     = []
  egress      = []

  tags = merge(local.common_tags, {
    Name = "dev-ecs-sg"
  })
}

module "ecs" {
  source = "../../modules/ecs"

  environment                     = local.environment
  aws_region                      = var.aws_region
  vpc_id                          = module.vpc.vpc_id
  public_subnet_ids               = module.vpc.public_subnet_ids
  private_subnet_ids              = module.vpc.private_subnet_ids
  task_security_group_id          = aws_security_group.ecs_tasks.id
  vpc_endpoint_security_group_id  = module.vpc.vpc_endpoint_security_group_id
  s3_vpc_endpoint_prefix_list_id  = module.vpc.s3_vpc_endpoint_prefix_list_id
  database_integration_secret_arn = module.rds.integration_secret_arn
  database_credentials_secret_arn = module.rds.application_credentials_secret_arn
  database_secrets_kms_key_arn    = module.rds.database_secrets_kms_key_arn
  cpu                             = var.task_cpu
  memory                          = var.task_memory
  desired_count                   = var.desired_count
  image_tag                       = var.image_tag
  image_tag_mutability            = var.image_tag_mutability
  log_retention_days              = var.log_retention_days
  log_level                       = var.log_level
  tags                            = local.common_tags
}

module "rds" {
  source = "../../modules/rds"

  environment                = local.environment
  vpc_id                     = module.vpc.vpc_id
  database_subnet_ids        = module.vpc.database_subnet_ids
  proxy_subnet_ids           = module.vpc.private_subnet_ids
  ecs_task_security_group_id = aws_security_group.ecs_tasks.id
  application_username       = "service_connect_app"
  instance_count             = var.database_instance_count
  min_capacity               = var.database_min_capacity
  max_capacity               = var.database_max_capacity
  backup_retention_period    = var.database_backup_retention_days
  deletion_protection        = var.database_deletion_protection
  skip_final_snapshot        = var.database_skip_final_snapshot
  tags                       = local.common_tags
}
