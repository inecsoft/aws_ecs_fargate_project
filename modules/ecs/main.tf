locals {
  services = {
    service-a = {
      discovery_port = 8080
      log_level      = var.log_level
    }
    service-b = {
      discovery_port = 8080
      log_level      = var.log_level
    }
    service-c = {
      discovery_port = 8081
      log_level      = var.log_level
    }
  }
}

resource "aws_ecs_cluster" "this" {
  name = "${var.environment}-service-connect"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-service-connect"
  })
}

resource "aws_service_discovery_private_dns_namespace" "this" {
  name        = "${var.environment}.highlands.local"
  description = "Service Connect namespace for ${var.environment}"
  vpc         = var.vpc_id

  tags = var.tags
}

resource "aws_ecr_repository" "services" {
  for_each = local.services

  name                 = "${var.environment}-${each.key}"
  image_tag_mutability = var.image_tag_mutability
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(var.tags, {
    Name    = "${var.environment}-${each.key}"
    Service = each.key
  })
}

resource "aws_cloudwatch_log_group" "services" {
  for_each = local.services

  name              = "/ecs/${var.environment}/${each.key}"
  retention_in_days = var.log_retention_days

  tags = merge(var.tags, {
    Service = each.key
  })
}

resource "aws_iam_role" "task_execution" {
  name_prefix = "${var.environment}-ecs-task-exec-"
  description = "ECS task execution role for ${var.environment} services"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "integration_secret_read" {
  name = "${var.environment}-integration-secret-read"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = [
          var.database_integration_secret_arn,
          var.database_credentials_secret_arn,
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.database_secrets_kms_key_arn
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${var.aws_region}.amazonaws.com"
            "kms:EncryptionContext:SecretARN" = [
              var.database_integration_secret_arn,
              var.database_credentials_secret_arn,
            ]
          }
        }
      },
    ]
  })
}

resource "aws_security_group" "load_balancer" {
  name_prefix = "${var.environment}-alb-"
  description = "Public HTTP access to the ${var.environment} service API"
  vpc_id      = var.vpc_id
  ingress     = []
  egress      = []

  tags = merge(var.tags, {
    Name = "${var.environment}-alb-sg"
  })
}

resource "aws_vpc_security_group_ingress_rule" "tasks_to_vpc_endpoints" {
  security_group_id            = var.vpc_endpoint_security_group_id
  referenced_security_group_id = var.task_security_group_id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
  description                  = "Allow ECS tasks to access private AWS service endpoints"
}

# Public HTTP is intentional for this demo endpoint; use HTTPS before exposing
# the load balancer to production traffic.
#tfsec:ignore:aws-ec2-no-public-ingress-sgr:exp:2027-10-09
resource "aws_vpc_security_group_ingress_rule" "public_http" {
  security_group_id = aws_security_group.load_balancer.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  description       = "Public HTTP access to the demo API"
}

resource "aws_vpc_security_group_egress_rule" "load_balancer_to_services" {
  security_group_id            = aws_security_group.load_balancer.id
  referenced_security_group_id = var.task_security_group_id
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
  description                  = "Forward HTTP requests to service B"
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer_to_services" {
  security_group_id            = var.task_security_group_id
  referenced_security_group_id = aws_security_group.load_balancer.id
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
  description                  = "Allow the load balancer to reach service B"
}

resource "aws_vpc_security_group_ingress_rule" "service_connect" {
  security_group_id            = var.task_security_group_id
  referenced_security_group_id = var.task_security_group_id
  ip_protocol                  = "-1"
  description                  = "Allow Service Connect and east-west task traffic"
}

resource "aws_vpc_security_group_egress_rule" "service_connect" {
  security_group_id            = var.task_security_group_id
  referenced_security_group_id = var.task_security_group_id
  ip_protocol                  = "-1"
  description                  = "Allow tasks to call services in the same ECS security group"
}

resource "aws_vpc_security_group_egress_rule" "https_to_vpc_endpoints" {
  security_group_id            = var.task_security_group_id
  referenced_security_group_id = var.vpc_endpoint_security_group_id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
  description                  = "Allow HTTPS egress to private AWS service endpoints"
}

resource "aws_vpc_security_group_egress_rule" "https_to_s3" {
  security_group_id = var.task_security_group_id
  prefix_list_id    = var.s3_vpc_endpoint_prefix_list_id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "Allow HTTPS egress to S3 through its gateway endpoint"
}

# The public load balancer is intentional for the demo API. Add an HTTPS
# listener and certificate before production use.
#tfsec:ignore:aws-elb-alb-not-public:exp:2027-10-09
resource "aws_lb" "this" {
  name                       = "${var.environment}-service-connect"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.load_balancer.id]
  subnets                    = var.public_subnet_ids
  drop_invalid_header_fields = true

  tags = merge(var.tags, {
    Name = "${var.environment}-service-connect"
  })
}

resource "aws_lb_target_group" "service_b" {
  name        = "${var.environment}-service-b"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = var.health_check_path
    matcher             = "200-399"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-service-b"
  })
}

# This listener is HTTP-only for the demo; secure production traffic with TLS.
#tfsec:ignore:aws-elb-http-not-used:exp:2027-10-09
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service_b.arn
  }
}

resource "aws_ecs_task_definition" "services" {
  for_each = local.services

  family                   = "${var.environment}-${each.key}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.task_execution.arn

  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([{
    name      = each.key
    image     = "${aws_ecr_repository.services[each.key].repository_url}:${var.image_tag}"
    essential = true
    cpu       = var.cpu
    secrets = each.key == "service-b" ? [
      { name = "DATABASE_HOST", valueFrom = "${var.database_integration_secret_arn}:host::" },
      { name = "DATABASE_PORT", valueFrom = "${var.database_integration_secret_arn}:port::" },
      { name = "DATABASE_NAME", valueFrom = "${var.database_integration_secret_arn}:database::" },
      { name = "DATABASE_USERNAME", valueFrom = "${var.database_credentials_secret_arn}:username::" },
      { name = "DATABASE_PASSWORD", valueFrom = "${var.database_credentials_secret_arn}:password::" },
    ] : []
    portMappings = [{
      containerPort = var.container_port
      hostPort      = var.container_port
      protocol      = "tcp"
      appProtocol   = "http"
      name          = "web"
    }]
    environment = concat(
      [
        { name = "BIND_ADDRESS", value = "0.0.0.0:${var.container_port}" },
        { name = "RUST_LOG", value = each.value.log_level },
      ],
      each.key == "service-b" ? [
        { name = "SERVICE_A_URL", value = "http://service-a:8080" },
        { name = "SERVICE_C_URL", value = "http://service-c:8081" },
      ] : []
    )
    healthCheck = {
      command     = ["CMD-SHELL", "curl -fsS http://localhost:${var.container_port}/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 10
    }
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.services[each.key].name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = each.key
      }
    }
  }])

  tags = merge(var.tags, {
    Service = each.key
  })
}

resource "aws_ecs_service" "services" {
  for_each = local.services

  name            = "${var.environment}-${each.key}"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  health_check_grace_period_seconds  = each.key == "service-b" ? 60 : null

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.task_security_group_id]
    assign_public_ip = false
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_private_dns_namespace.this.arn

    service {
      port_name      = "web"
      discovery_name = each.key

      client_alias {
        dns_name = each.key
        port     = each.value.discovery_port
      }
    }

    log_configuration {
      log_driver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.services[each.key].name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "service-connect"
      }
    }
  }

  dynamic "load_balancer" {
    for_each = each.key == "service-b" ? [1] : []

    content {
      target_group_arn = aws_lb_target_group.service_b.arn
      container_name   = each.key
      container_port   = var.container_port
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.task_execution,
    aws_iam_role_policy.integration_secret_read,
    aws_lb_listener.http,
  ]

  tags = merge(var.tags, {
    Service = each.key
  })
}
