resource "aws_db_subnet_group" "this" {
  name        = "${var.environment}-aurora"
  description = "Isolated database subnets for ${var.environment} Aurora PostgreSQL"
  subnet_ids  = var.database_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.environment}-aurora-subnets"
  })
}

data "aws_region" "current" {}

resource "aws_kms_key" "database" {
  description             = "Encryption key for ${var.environment} Aurora and integration secrets"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = merge(var.tags, {
    Name = "${var.environment}-database"
  })
}

resource "aws_kms_alias" "database" {
  name          = "alias/${var.environment}-database"
  target_key_id = aws_kms_key.database.key_id
}

resource "aws_security_group" "database" {
  name_prefix = "${var.environment}-aurora-"
  description = "Private Aurora PostgreSQL access from its RDS Proxy only"
  vpc_id      = var.vpc_id
  ingress     = []
  egress      = []

  tags = merge(var.tags, {
    Name = "${var.environment}-aurora-sg"
  })
}

resource "aws_security_group" "proxy" {
  name_prefix = "${var.environment}-rds-proxy-"
  description = "Private RDS Proxy access from ECS tasks and Aurora"
  vpc_id      = var.vpc_id
  ingress     = []
  egress      = []

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-proxy-sg"
  })
}

resource "random_password" "application" {
  length  = 40
  special = false

  keepers = {
    environment = var.environment
  }
}

resource "aws_secretsmanager_secret" "application_credentials" {
  name                    = "/integration/${var.environment}/database-credentials"
  description             = "Restricted application database credentials for ${var.environment} RDS Proxy"
  kms_key_id              = aws_kms_key.database.arn
  recovery_window_in_days = 7

  tags = merge(var.tags, {
    Name = "/integration/${var.environment}/database-credentials"
  })
}

resource "aws_secretsmanager_secret_version" "application_credentials" {
  secret_id = aws_secretsmanager_secret.application_credentials.id
  secret_string = jsonencode({
    username = var.application_username
    password = random_password.application.result
  })
}

resource "aws_vpc_security_group_ingress_rule" "proxy_to_database" {
  security_group_id            = aws_security_group.database.id
  referenced_security_group_id = aws_security_group.proxy.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "PostgreSQL connections from the RDS Proxy only"
}

resource "aws_vpc_security_group_ingress_rule" "ecs_to_proxy" {
  security_group_id            = aws_security_group.proxy.id
  referenced_security_group_id = var.ecs_task_security_group_id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "PostgreSQL connections from ECS tasks to the proxy"
}

resource "aws_vpc_security_group_egress_rule" "proxy_to_database" {
  security_group_id            = aws_security_group.proxy.id
  referenced_security_group_id = aws_security_group.database.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Allow the proxy to connect to Aurora PostgreSQL"
}

resource "aws_vpc_security_group_egress_rule" "ecs_to_proxy" {
  security_group_id            = var.ecs_task_security_group_id
  referenced_security_group_id = aws_security_group.proxy.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Allow ECS tasks to connect to the RDS Proxy"
}

resource "aws_rds_cluster" "this" {
  cluster_identifier            = "${var.environment}-service-connect"
  engine                        = "aurora-postgresql"
  database_name                 = var.database_name
  master_username               = var.master_username
  manage_master_user_password   = true
  master_user_secret_kms_key_id = aws_kms_key.database.arn
  db_subnet_group_name          = aws_db_subnet_group.this.name
  vpc_security_group_ids        = [aws_security_group.database.id]
  port                          = 5432

  kms_key_id                      = aws_kms_key.database.arn
  storage_encrypted               = true
  backup_retention_period         = var.backup_retention_period
  preferred_backup_window         = "07:00-09:00"
  preferred_maintenance_window    = "sun:09:00-sun:10:00"
  enabled_cloudwatch_logs_exports = ["postgresql"]
  copy_tags_to_snapshot           = true
  deletion_protection             = var.deletion_protection
  skip_final_snapshot             = var.skip_final_snapshot
  final_snapshot_identifier       = var.skip_final_snapshot ? null : "${var.environment}-aurora-final"
  apply_immediately               = false

  serverlessv2_scaling_configuration {
    min_capacity = var.min_capacity
    max_capacity = var.max_capacity
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-aurora"
  })
}

resource "aws_rds_cluster_instance" "this" {
  count = var.instance_count

  identifier           = "${var.environment}-aurora-${count.index + 1}"
  cluster_identifier   = aws_rds_cluster.this.id
  engine               = aws_rds_cluster.this.engine
  instance_class       = "db.serverless"
  db_subnet_group_name = aws_db_subnet_group.this.name
  publicly_accessible  = false

  auto_minor_version_upgrade = true
  apply_immediately          = false

  tags = merge(var.tags, {
    Name = "${var.environment}-aurora-${count.index + 1}"
  })
}

resource "aws_iam_role" "proxy" {
  name_prefix = "${var.environment}-rds-proxy-"
  description = "Allow RDS Proxy to retrieve restricted application credentials"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "rds.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "proxy_secret_access" {
  name = "${var.environment}-rds-proxy-secret"
  role = aws_iam_role.proxy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.application_credentials.arn
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = aws_kms_key.database.arn
        Condition = {
          StringEquals = {
            "kms:ViaService"                  = "secretsmanager.${data.aws_region.current.name}.amazonaws.com"
            "kms:EncryptionContext:SecretARN" = aws_secretsmanager_secret.application_credentials.arn
          }
        }
      },
    ]
  })
}

resource "aws_db_proxy" "this" {
  name                   = "${var.environment}-service-connect"
  engine_family          = "POSTGRESQL"
  debug_logging          = false
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = aws_iam_role.proxy.arn
  vpc_subnet_ids         = var.proxy_subnet_ids
  vpc_security_group_ids = [aws_security_group.proxy.id]

  auth {
    auth_scheme = "SECRETS"
    description = "Restricted application database credentials"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.application_credentials.arn
  }

  depends_on = [
    aws_iam_role_policy.proxy_secret_access,
    aws_secretsmanager_secret_version.application_credentials,
    aws_rds_cluster_instance.this,
  ]

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-proxy"
  })
}

resource "aws_db_proxy_default_target_group" "this" {
  db_proxy_name = aws_db_proxy.this.name

  connection_pool_config {
    connection_borrow_timeout    = 120
    max_connections_percent      = 90
    max_idle_connections_percent = 50
  }
}

resource "aws_db_proxy_target" "this" {
  db_proxy_name         = aws_db_proxy.this.name
  target_group_name     = aws_db_proxy_default_target_group.this.name
  db_cluster_identifier = aws_rds_cluster.this.cluster_identifier

  depends_on = [aws_rds_cluster_instance.this]
}

resource "aws_secretsmanager_secret" "integration" {
  name                    = "/integration/${var.environment}/database"
  description             = "Non-credential database connection settings for ${var.environment} ECS tasks"
  kms_key_id              = aws_kms_key.database.arn
  recovery_window_in_days = 7

  tags = merge(var.tags, {
    Name = "/integration/${var.environment}/database"
  })
}

resource "aws_secretsmanager_secret_version" "integration" {
  secret_id = aws_secretsmanager_secret.integration.id
  secret_string = jsonencode({
    host     = aws_db_proxy.this.endpoint
    port     = tostring(aws_rds_cluster.this.port)
    database = aws_rds_cluster.this.database_name
  })

  depends_on = [aws_db_proxy_target.this]
}
