import CodeBlock from './CodeBlock';
import TerraformDiagram from './TerraformDiagram';

export default function TerraformSection() {
  return (
    <section id="terraform-deployment" className="mb-16">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-mono">5</span>
        Deploying with Terraform
      </h2>
      <p className="text-gray-300 leading-relaxed mb-6">
        While CDK is powerful, many teams prefer Terraform for infrastructure-as-code due to its multi-cloud support, mature ecosystem, and declarative HCL syntax. Let's rebuild the same ServiceConnect architecture using Terraform with a <strong className="text-purple-400">modular approach</strong> — building a local VPC module and configuring two environments: <strong className="text-cyan-400">dev</strong> and <strong className="text-orange-400">prod</strong>.
      </p>

      {/* Project Structure */}
      <div id="terraform-structure" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">Project Structure</h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          We organize the Terraform code into reusable modules and environment-specific configurations. This pattern lets us share infrastructure definitions while varying parameters per environment.
        </p>

        <div className="my-8 p-6 rounded-xl bg-gray-900/80 border border-gray-800">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Terraform Project Layout
          </h4>
          <div className="font-mono text-sm space-y-0.5">
            <div className="text-purple-400">terraform/</div>
            <div className="pl-4 text-gray-500">├── modules/</div>
            <div className="pl-8 text-cyan-400">│   ├── vpc/</div>
            <div className="pl-12 text-gray-400">│   │   ├── main.tf</div>
            <div className="pl-12 text-gray-400">│   │   ├── variables.tf</div>
            <div className="pl-12 text-gray-400">│   │   └── outputs.tf</div>
            <div className="pl-8 text-orange-400">│   ├── ecs-cluster/</div>
            <div className="pl-12 text-gray-400">│   │   ├── main.tf</div>
            <div className="pl-12 text-gray-400">│   │   ├── variables.tf</div>
            <div className="pl-12 text-gray-400">│   │   └── outputs.tf</div>
            <div className="pl-8 text-emerald-400">│   └── ecs-service/</div>
            <div className="pl-12 text-gray-400">│       ├── main.tf</div>
            <div className="pl-12 text-gray-400">│       ├── variables.tf</div>
            <div className="pl-12 text-gray-400">│       └── outputs.tf</div>
            <div className="pl-4 text-gray-500">├── environments/</div>
            <div className="pl-8 text-cyan-400">│   ├── dev/</div>
            <div className="pl-12 text-gray-400">│   │   ├── main.tf</div>
            <div className="pl-12 text-gray-400">│   │   ├── variables.tf</div>
            <div className="pl-12 text-gray-400">│   │   ├── outputs.tf</div>
            <div className="pl-12 text-gray-400">│   │   └── terraform.tfvars</div>
            <div className="pl-8 text-orange-400">│   └── prod/</div>
            <div className="pl-12 text-gray-400">│       ├── main.tf</div>
            <div className="pl-12 text-gray-400">│       ├── variables.tf</div>
            <div className="pl-12 text-gray-400">│       ├── outputs.tf</div>
            <div className="pl-12 text-gray-400">│       └── terraform.tfvars</div>
            <div className="pl-4 text-gray-500">└── versions.tf</div>
          </div>
        </div>
      </div>

      {/* Architecture Diagram */}
      <TerraformDiagram />

      {/* VPC Module */}
      <div id="vpc-module" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">📦</span>
            Local VPC Module
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          The VPC module is the foundation. It creates a VPC with public and private subnets across multiple AZs, NAT Gateways for outbound traffic from private subnets, and an Internet Gateway for public access.
        </p>

        <CodeBlock
          title="modules/vpc/main.tf"
          language="hcl"
          code={`# modules/vpc/main.tf

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "\${var.environment}-vpc"
  })
}

# Public Subnets (for ALB / NAT Gateway)
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "\${var.environment}-public-\${var.availability_zones[count.index]}"
    Tier = "public"
  })
}

# Private Subnets (for ECS Tasks)
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, {
    Name = "\${var.environment}-private-\${var.availability_zones[count.index]}"
    Tier = "private"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = merge(var.tags, {
    Name = "\${var.environment}-igw"
  })
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  domain = "vpc"

  tags = merge(var.tags, {
    Name = "\${var.environment}-nat-eip-\${count.index}"
  })
}

# NAT Gateway(s)
resource "aws_nat_gateway" "this" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.tags, {
    Name = "\${var.environment}-nat-\${count.index}"
  })

  depends_on = [aws_internet_gateway.this]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = merge(var.tags, {
    Name = "\${var.environment}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables
resource "aws_route_table" "private" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[count.index].id
  }

  tags = merge(var.tags, {
    Name = "\${var.environment}-private-rt-\${count.index}"
  })
}

resource "aws_route_table_association" "private" {
  count = length(var.availability_zones)

  subnet_id = aws_subnet.private[count.index].id
  route_table_id = var.single_nat_gateway ? (
    aws_route_table.private[0].id
  ) : (
    aws_route_table.private[count.index].id
  )
}`}
        />

        <CodeBlock
          title="modules/vpc/variables.tf"
          language="hcl"
          code={`# modules/vpc/variables.tf

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway (cost savings for dev)"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}`}
        />

        <CodeBlock
          title="modules/vpc/outputs.tf"
          language="hcl"
          code={`# modules/vpc/outputs.tf

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.this.cidr_block
}`}
        />
      </div>

      {/* ECS Cluster Module */}
      <div id="ecs-cluster-module" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs">📦</span>
            ECS Cluster Module
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          The ECS Cluster module creates the cluster, the Cloud Map namespace for ServiceConnect discovery, and the security groups.
        </p>

        <CodeBlock
          title="modules/ecs-cluster/main.tf"
          language="hcl"
          code={`# modules/ecs-cluster/main.tf

resource "aws_ecs_cluster" "this" {
  name = "\${var.environment}-\${var.cluster_name}"

  setting {
    name  = "containerInsights"
    value = var.container_insights ? "enabled" : "disabled"
  }

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"

      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "ecs_exec" {
  name              = "/ecs/\${var.environment}/exec"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# Cloud Map Namespace for ServiceConnect
resource "aws_service_discovery_private_dns_namespace" "this" {
  name        = "\${var.environment}.highlands.local"
  description = "ServiceConnect namespace for \${var.environment}"
  vpc         = var.vpc_id

  tags = var.tags
}

# Security Group for ECS Services
resource "aws_security_group" "ecs_services" {
  name_prefix = "\${var.environment}-ecs-svc-"
  description = "Security group for ECS services with ServiceConnect"
  vpc_id      = var.vpc_id

  # Allow all traffic between services in the same SG
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "\${var.environment}-ecs-services-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Allow ALB to reach Service-B
resource "aws_security_group_rule" "alb_to_service_b" {
  count = var.create_alb_sg_rule ? 1 : 0

  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = var.alb_security_group_id
  security_group_id        = aws_security_group.ecs_services.id
}`}
        />

        <CodeBlock
          title="modules/ecs-cluster/variables.tf"
          language="hcl"
          code={`# modules/ecs-cluster/variables.tf

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "service-connect"
}

variable "vpc_id" {
  description = "VPC ID where the cluster will run"
  type        = string
}

variable "container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "create_alb_sg_rule" {
  description = "Create SG rule allowing ALB to reach services"
  type        = bool
  default     = false
}

variable "alb_security_group_id" {
  description = "ALB security group ID"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}`}
        />

        <CodeBlock
          title="modules/ecs-cluster/outputs.tf"
          language="hcl"
          code={`# modules/ecs-cluster/outputs.tf

output "cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.this.id
}

output "cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.this.name
}

output "namespace_id" {
  description = "Cloud Map Namespace ID"
  value       = aws_service_discovery_private_dns_namespace.this.id
}

output "namespace_arn" {
  description = "Cloud Map Namespace ARN"
  value       = aws_service_discovery_private_dns_namespace.this.arn
}

output "namespace_name" {
  description = "Cloud Map Namespace Name"
  value       = aws_service_discovery_private_dns_namespace.this.name
}

output "security_group_id" {
  description = "Security group ID for ECS services"
  value       = aws_security_group.ecs_services.id
}`}
        />
      </div>

      {/* ECS Service Module */}
      <div id="ecs-service-module" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">📦</span>
            ECS Service Module (with ServiceConnect)
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          This is where the magic happens. The ECS Service module encapsulates the Task Definition, Fargate Service, and ServiceConnect configuration. It's designed to be called for each service (A, B, C) with different parameters.
        </p>

        <CodeBlock
          title="modules/ecs-service/main.tf"
          language="hcl"
          code={`# modules/ecs-service/main.tf

# IAM: Task Execution Role
data "aws_iam_policy_document" "ecs_task_execution" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name_prefix        = "\${var.service_name}-exec-"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/\${var.environment}/\${var.service_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# Task Definition
resource "aws_ecs_task_definition" "this" {
  family                   = "\${var.environment}-\${var.service_name}-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = var.image_uri
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
          appProtocol   = "http"
          name          = var.port_mapping_name
        }
      ]
      environment = concat(
        [
          { name = "BIND_ADDRESS", value = "0.0.0.0:\${var.container_port}" },
          { name = "RUST_LOG", value = var.rust_log },
        ],
        var.extra_environment_variables
      )
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = var.service_name
        }
      }
    }
  ])

  tags = var.tags
}

# ECS Service with ServiceConnect
resource "aws_ecs_service" "this" {
  name            = "\${var.environment}-\${var.service_name}"
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  # ServiceConnect Configuration
  service_connect_configuration {
    enabled   = true
    namespace = var.namespace_arn

    service {
      port_name      = var.port_mapping_name
      discovery_name = var.service_connect_name
      client_alias {
        dns_name = var.service_connect_name
        port     = var.service_connect_port
      }
    }

    # Also act as a client for upstream services
    dynamic "service" {
      for_each = var.upstream_services
      content {
        discovery_name = service.value.discovery_name
        client_alias {
          dns_name = service.value.dns_name
          port     = service.value.port
        }
      }
    }

    log_configuration {
      log_driver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.this.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "service-connect"
      }
    }
  }

  # Optional: Attach to Load Balancer
  dynamic "load_balancer" {
    for_each = var.target_group_arn != null ? [1] : []
    content {
      target_group_arn = var.target_group_arn
      container_name   = var.container_name
      container_port   = var.container_port
    }
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [desired_count]
  }
}`}
        />

        <CodeBlock
          title="modules/ecs-service/variables.tf"
          language="hcl"
          code={`# modules/ecs-service/variables.tf

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "service_name" {
  description = "Name of the service"
  type        = string
}

variable "container_name" {
  description = "Container name in the task definition"
  type        = string
  default     = "rust-api"
}

variable "cluster_id" {
  description = "ECS Cluster ID"
  type        = string
}

variable "namespace_arn" {
  description = "Cloud Map Namespace ARN for ServiceConnect"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the service"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for the service"
  type        = string
}

variable "image_uri" {
  description = "Docker image URI"
  type        = string
}

variable "cpu" {
  description = "Fargate CPU units (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Fargate memory in MiB"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "port_mapping_name" {
  description = "Name for the port mapping"
  type        = string
  default     = "web"
}

variable "service_connect_name" {
  description = "DNS name for ServiceConnect discovery"
  type        = string
}

variable "service_connect_port" {
  description = "Port exposed via ServiceConnect"
  type        = number
  default     = 8080
}

variable "upstream_services" {
  description = "List of upstream services this service connects to"
  type = list(object({
    discovery_name = string
    dns_name       = string
    port           = number
  }))
  default = []
}

variable "extra_environment_variables" {
  description = "Additional environment variables"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "target_group_arn" {
  description = "ALB target group ARN (null if no ALB)"
  type        = string
  default     = null
}

variable "rust_log" {
  description = "RUST_LOG level"
  type        = string
  default     = "info"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}`}
        />

        <CodeBlock
          title="modules/ecs-service/outputs.tf"
          language="hcl"
          code={`# modules/ecs-service/outputs.tf

output "service_id" {
  description = "ECS Service ID"
  value       = aws_ecs_service.this.id
}

output "service_name" {
  description = "ECS Service Name"
  value       = aws_ecs_service.this.name
}

output "task_definition_arn" {
  description = "Task Definition ARN"
  value       = aws_ecs_task_definition.this.arn
}

output "service_connect_dns" {
  description = "ServiceConnect DNS endpoint"
  value       = "http://\${var.service_connect_name}:\${var.service_connect_port}"
}`}
        />
      </div>

      {/* Dev Environment */}
      <div id="dev-environment" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">🔧</span>
            Dev Environment
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          The dev environment uses smaller instance sizes, a single NAT Gateway for cost savings, and runs 1 task per service. Perfect for development and testing.
        </p>

        <CodeBlock
          title="environments/dev/main.tf"
          language="hcl"
          code={`# environments/dev/main.tf

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "terraform-state-serviceconnect"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
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

locals {
  environment        = "dev"
  availability_zones = ["\${var.aws_region}a", "\${var.aws_region}b"]
  common_tags = {
    Environment = local.environment
  }
}

# ──────────────────────────────────────────────
# VPC Module
# ──────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  environment        = local.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.availability_zones
  single_nat_gateway = true  # Cost savings for dev

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# ECS Cluster Module
# ──────────────────────────────────────────────
module "ecs_cluster" {
  source = "../../modules/ecs-cluster"

  environment        = local.environment
  cluster_name       = "service-connect"
  vpc_id             = module.vpc.vpc_id
  container_insights = true
  log_retention_days = 14  # Shorter retention for dev

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# Service A
# ──────────────────────────────────────────────
module "service_a" {
  source = "../../modules/ecs-service"

  environment          = local.environment
  service_name         = "service-a"
  cluster_id           = module.ecs_cluster.cluster_id
  namespace_arn        = module.ecs_cluster.namespace_arn
  private_subnet_ids   = module.vpc.private_subnet_ids
  security_group_id    = module.ecs_cluster.security_group_id
  image_uri            = var.service_a_image
  cpu                  = 256
  memory               = 512
  desired_count        = 1
  service_connect_name = "service-a"
  service_connect_port = 8080
  aws_region           = var.aws_region
  rust_log             = "debug"  # Verbose logging in dev

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# Service B (connects to A and C)
# ──────────────────────────────────────────────
module "service_b" {
  source = "../../modules/ecs-service"

  environment          = local.environment
  service_name         = "service-b"
  cluster_id           = module.ecs_cluster.cluster_id
  namespace_arn        = module.ecs_cluster.namespace_arn
  private_subnet_ids   = module.vpc.private_subnet_ids
  security_group_id    = module.ecs_cluster.security_group_id
  image_uri            = var.service_b_image
  cpu                  = 256
  memory               = 512
  desired_count        = 1
  service_connect_name = "service-b"
  service_connect_port = 8080
  aws_region           = var.aws_region
  rust_log             = "debug"

  upstream_services = [
    {
      discovery_name = "service-a"
      dns_name       = "service-a"
      port           = 8080
    },
    {
      discovery_name = "service-c"
      dns_name       = "service-c"
      port           = 8081
    }
  ]

  extra_environment_variables = [
    { name = "SERVICE_A_URL", value = "http://service-a:8080" },
    { name = "SERVICE_C_URL", value = "http://service-c:8081" }
  ]

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# Service C
# ──────────────────────────────────────────────
module "service_c" {
  source = "../../modules/ecs-service"

  environment          = local.environment
  service_name         = "service-c"
  cluster_id           = module.ecs_cluster.cluster_id
  namespace_arn        = module.ecs_cluster.namespace_arn
  private_subnet_ids   = module.vpc.private_subnet_ids
  security_group_id    = module.ecs_cluster.security_group_id
  image_uri            = var.service_c_image
  cpu                  = 256
  memory               = 512
  desired_count        = 1
  service_connect_name = "service-c"
  service_connect_port = 8081
  aws_region           = var.aws_region
  rust_log             = "debug"

  tags = local.common_tags
}`}
        />

        <CodeBlock
          title="environments/dev/variables.tf"
          language="hcl"
          code={`# environments/dev/variables.tf

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "service_a_image" {
  description = "Docker image for Service A"
  type        = string
  default     = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-a:latest"
}

variable "service_b_image" {
  description = "Docker image for Service B"
  type        = string
  default     = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-b:latest"
}

variable "service_c_image" {
  description = "Docker image for Service C"
  type        = string
  default     = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-c:latest"
}`}
        />

        <CodeBlock
          title="environments/dev/terraform.tfvars"
          language="hcl"
          code={`# environments/dev/terraform.tfvars

aws_region = "us-east-1"
vpc_cidr   = "10.0.0.0/16"

# Dev uses latest tags for rapid iteration
service_a_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-a:dev-latest"
service_b_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-b:dev-latest"
service_c_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-c:dev-latest"`}
        />

        <CodeBlock
          title="environments/dev/outputs.tf"
          language="hcl"
          code={`# environments/dev/outputs.tf

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "cluster_name" {
  value = module.ecs_cluster.cluster_name
}

output "service_a_endpoint" {
  value = module.service_a.service_connect_dns
}

output "service_b_endpoint" {
  value = module.service_b.service_connect_dns
}

output "service_c_endpoint" {
  value = module.service_c.service_connect_dns
}

output "namespace" {
  value = module.ecs_cluster.namespace_name
}`}
        />
      </div>

      {/* Prod Environment */}
      <div id="prod-environment" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs">🚀</span>
            Prod Environment
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          Production uses a different VPC CIDR (no overlap with dev), multiple NAT Gateways for high availability, larger task sizes, and 3 tasks per service for redundancy.
        </p>

        <CodeBlock
          title="environments/prod/main.tf"
          language="hcl"
          code={`# environments/prod/main.tf

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "terraform-state-serviceconnect"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "prod"
      Project     = "service-connect-demo"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  environment        = "prod"
  availability_zones = ["\${var.aws_region}a", "\${var.aws_region}b", "\${var.aws_region}c"]
  common_tags = {
    Environment = local.environment
    Criticality = "high"
  }
}

# ──────────────────────────────────────────────
# VPC Module (different CIDR, multi-AZ NAT)
# ──────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  environment        = local.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.availability_zones
  single_nat_gateway = false  # HA: one NAT per AZ

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# ECS Cluster Module
# ──────────────────────────────────────────────
module "ecs_cluster" {
  source = "../../modules/ecs-cluster"

  environment        = local.environment
  cluster_name       = "service-connect"
  vpc_id             = module.vpc.vpc_id
  container_insights = true
  log_retention_days = 90  # Longer retention for prod

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# Service A (3 tasks for HA)
# ──────────────────────────────────────────────
module "service_a" {
  source = "../../modules/ecs-service"

  environment          = local.environment
  service_name         = "service-a"
  cluster_id           = module.ecs_cluster.cluster_id
  namespace_arn        = module.ecs_cluster.namespace_arn
  private_subnet_ids   = module.vpc.private_subnet_ids
  security_group_id    = module.ecs_cluster.security_group_id
  image_uri            = var.service_a_image
  cpu                  = 1024   # 1 vCPU
  memory               = 2048   # 2 GB
  desired_count        = 3      # HA: 3 tasks across AZs
  service_connect_name = "service-a"
  service_connect_port = 8080
  aws_region           = var.aws_region
  rust_log             = "info"

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# Service B (3 tasks, connects to A and C)
# ──────────────────────────────────────────────
module "service_b" {
  source = "../../modules/ecs-service"

  environment          = local.environment
  service_name         = "service-b"
  cluster_id           = module.ecs_cluster.cluster_id
  namespace_arn        = module.ecs_cluster.namespace_arn
  private_subnet_ids   = module.vpc.private_subnet_ids
  security_group_id    = module.ecs_cluster.security_group_id
  image_uri            = var.service_b_image
  cpu                  = 1024
  memory               = 2048
  desired_count        = 3
  service_connect_name = "service-b"
  service_connect_port = 8080
  aws_region           = var.aws_region
  rust_log             = "info"

  upstream_services = [
    {
      discovery_name = "service-a"
      dns_name       = "service-a"
      port           = 8080
    },
    {
      discovery_name = "service-c"
      dns_name       = "service-c"
      port           = 8081
    }
  ]

  extra_environment_variables = [
    { name = "SERVICE_A_URL", value = "http://service-a:8080" },
    { name = "SERVICE_C_URL", value = "http://service-c:8081" }
  ]

  tags = local.common_tags
}

# ──────────────────────────────────────────────
# Service C (3 tasks for HA)
# ──────────────────────────────────────────────
module "service_c" {
  source = "../../modules/ecs-service"

  environment          = local.environment
  service_name         = "service-c"
  cluster_id           = module.ecs_cluster.cluster_id
  namespace_arn        = module.ecs_cluster.namespace_arn
  private_subnet_ids   = module.vpc.private_subnet_ids
  security_group_id    = module.ecs_cluster.security_group_id
  image_uri            = var.service_c_image
  cpu                  = 1024
  memory               = 2048
  desired_count        = 3
  service_connect_name = "service-c"
  service_connect_port = 8081
  aws_region           = var.aws_region
  rust_log             = "info"

  tags = local.common_tags
}`}
        />

        <CodeBlock
          title="environments/prod/terraform.tfvars"
          language="hcl"
          code={`# environments/prod/terraform.tfvars

aws_region = "us-east-1"
vpc_cidr   = "10.1.0.0/16"  # Different CIDR from dev!

# Prod uses pinned image tags for reproducibility
service_a_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-a:v1.2.3"
service_b_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-b:v1.2.3"
service_c_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/service-c:v1.2.3"`}
        />

        <CodeBlock
          title="environments/prod/outputs.tf"
          language="hcl"
          code={`# environments/prod/outputs.tf

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "cluster_name" {
  value = module.ecs_cluster.cluster_name
}

output "service_a_endpoint" {
  value = module.service_a.service_connect_dns
}

output "service_b_endpoint" {
  value = module.service_b.service_connect_dns
}

output "service_c_endpoint" {
  value = module.service_c.service_connect_dns
}

output "namespace" {
  value = module.ecs_cluster.namespace_name
}`}
        />
      </div>

      {/* Environment Comparison */}
      <div id="env-comparison" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">Environment Comparison</h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          Here's a side-by-side comparison of how the two environments differ:
        </p>

        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Setting</th>
                <th className="text-left py-3 px-4 text-cyan-400 font-medium">🔧 Dev</th>
                <th className="text-left py-3 px-4 text-orange-400 font-medium">🚀 Prod</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">VPC CIDR</td>
                <td className="py-3 px-4"><code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-xs">10.0.0.0/16</code></td>
                <td className="py-3 px-4"><code className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded text-xs">10.1.0.0/16</code></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">Availability Zones</td>
                <td className="py-3 px-4">2 AZs</td>
                <td className="py-3 px-4">3 AZs</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">NAT Gateways</td>
                <td className="py-3 px-4">1 (cost savings)</td>
                <td className="py-3 px-4">3 (one per AZ)</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">CPU / Memory</td>
                <td className="py-3 px-4">256 / 512 MiB</td>
                <td className="py-3 px-4">1024 / 2048 MiB</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">Desired Tasks</td>
                <td className="py-3 px-4">1 per service</td>
                <td className="py-3 px-4">3 per service</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">Log Retention</td>
                <td className="py-3 px-4">14 days</td>
                <td className="py-3 px-4">90 days</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">RUST_LOG</td>
                <td className="py-3 px-4"><code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-xs">debug</code></td>
                <td className="py-3 px-4"><code className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded text-xs">info</code></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 font-medium">Image Tags</td>
                <td className="py-3 px-4"><code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-xs">dev-latest</code></td>
                <td className="py-3 px-4"><code className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded text-xs">v1.2.3</code></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Namespace</td>
                <td className="py-3 px-4"><code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-xs">dev.highlands.local</code></td>
                <td className="py-3 px-4"><code className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded text-xs">prod.highlands.local</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment Commands */}
      <div id="deployment-commands" className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">Deploying</h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          With the modular structure in place, deploying to each environment is straightforward. Each environment has its own state file, so changes to dev never affect prod.
        </p>

        <CodeBlock
          title="Deploy Dev Environment"
          language="bash"
          code={`# Navigate to the dev environment
cd environments/dev

# Initialize Terraform (downloads modules & providers)
terraform init

# Preview changes
terraform plan -out=tfplan

# Review the plan, then apply
terraform apply tfplan

# View outputs
terraform output`}
        />

        <CodeBlock
          title="Deploy Prod Environment"
          language="bash"
          code={`# Navigate to the prod environment
cd environments/prod

# Initialize Terraform
terraform init

# Preview changes
terraform plan -out=tfplan

# Review carefully, then apply
terraform apply tfplan

# Verify outputs
terraform output service_b_endpoint`}
        />

        <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Pro Tips
          </h4>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Use <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">-target</code> to deploy individual services: <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">terraform apply -target=module.service_b</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Store state in S3 with DynamoDB locking to prevent concurrent modifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Pin image tags in prod (e.g., <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">v1.2.3</code>) and use <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">dev-latest</code> in dev</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Use <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">terraform workspace</code> as an alternative to separate directories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Add <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">prevent_destroy</code> lifecycle rules to critical resources like the VPC</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
