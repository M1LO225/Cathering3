terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = { Project = "AppCatering", Environment = "Prod" }
  }
}

# ==========================================
# 1. NETWORKING & DNS (Hostinger)
# ==========================================

# --- VPC ---
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "cat-prod-vpc"
  cidr   = "10.0.0.0/16"
  version = "5.8.1"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]     # Apps y DB
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"] # Load Balancer

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
}

# --- DNS PÚBLICO (Para Hostinger) ---
resource "aws_route53_zone" "main" {
  name = "aws.nexouniversitario.com"
}

# --- Service Discovery (DNS Interno) ---
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "cat.local"
  description = "DNS interno para microservicios"
  vpc         = module.vpc.vpc_id
}

# ==========================================
# 2. SEGURIDAD
# ==========================================

# ALB SG (Público)
resource "aws_security_group" "alb_sg" {
  name   = "cat-prod-alb-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Apps SG (Privado)
resource "aws_security_group" "apps_sg" {
  name   = "cat-prod-apps-sg"
  vpc_id = module.vpc.vpc_id

  # Acepta tráfico del ALB
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Acepta tráfico entre ellos mismos
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# DB SG (Solo desde Apps)
resource "aws_security_group" "db_sg" {
  name   = "cat-prod-db-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.apps_sg.id]
  }
}

# ==========================================
# 3. INFRAESTRUCTURA CORE
# ==========================================

# --- Base de Datos (RDS) ---
resource "aws_db_subnet_group" "main" {
  name       = "cat-prod-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "postgres" {
  identifier             = "cat-prod-db"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = "db.t3.micro"
  db_name                = "cateringdb"
  username               = "catering_admin"
  password               = "PasswordSuperSeguro123!"
  skip_final_snapshot    = true
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}

# --- SQS Queues ---
resource "aws_sqs_queue" "wallet_deduction" {
  name = "cat-prod-wallet-deduction"
}

resource "aws_sqs_queue" "order_result" {
  name = "cat-prod-order-result"
}

# --- Cluster ECS ---
resource "aws_ecs_cluster" "main" {
  name = "cat-prod-cluster"
}

# --- Logs ---
resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/cat-prod"
  retention_in_days = 1
}

# ==========================================
# 4. LOAD BALANCER & IAM
# ==========================================

resource "aws_lb" "main" {
  name               = "cat-prod-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Catering API Gateway OK"
      status_code  = "200"
    }
  }
}

# --- Roles IAM ---
resource "aws_iam_role" "ecs_execution_role" {
  name = "cat-prod-ecs-exec-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_exec_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "cat-prod-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "sqs_access" {
  name = "sqs-access"
  role = aws_iam_role.ecs_task_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = "sqs:*",
      Effect   = "Allow",
      Resource = "*"
    }]
  })
}