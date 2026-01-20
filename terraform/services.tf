# ==========================================
# 1. API GATEWAY
# ==========================================
resource "aws_lb_target_group" "gateway" {
  name        = "cat-gateway-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path    = "/health"
    matcher = "200-499"
  }
}

resource "aws_lb_listener_rule" "gateway_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_ecs_task_definition" "gateway" {
  family                   = "cat-prod-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name  = "api-gateway"
    image = "${var.account_id}.dkr.ecr.us-east-1.amazonaws.com/api-gateway:latest"
    portMappings = [{ containerPort = 3000 }]
    environment = [
      { name = "ORDER_SERVICE_URL", value = "http://order.cat.local:3000" },
      { name = "AUTH_SERVICE_URL", value = "http://auth.cat.local:3000" },
      { name = "CATALOG_SERVICE_URL", value = "http://catalog.cat.local:3000" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/cat-prod"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "gateway"
      }
    }
  }])
}

resource "aws_ecs_service" "gateway" {
  name            = "gateway-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.gateway.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.apps_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.gateway.arn
    container_name   = "api-gateway"
    container_port   = 3000
  }
}

# ==========================================
# 2. ORDER SERVICE
# ==========================================
resource "aws_service_discovery_service" "order" {
  name = "order"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "order" {
  family                   = "cat-prod-order"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name  = "order-service"
    image = "${var.account_id}.dkr.ecr.us-east-1.amazonaws.com/order-service:latest"
    portMappings = [{ containerPort = 3000 }]
    environment = [
      { name = "DB_HOST", value = aws_db_instance.postgres.address },
      { name = "DB_USER", value = aws_db_instance.postgres.username },
      { name = "DB_PASS", value = aws_db_instance.postgres.password },
      { name = "DB_NAME", value = aws_db_instance.postgres.db_name },
      { name = "NODE_ENV", value = "production" },
      { name = "SQS_WALLET_URL", value = aws_sqs_queue.wallet_deduction.id }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/cat-prod"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "order"
      }
    }
  }])
}

resource "aws_ecs_service" "order" {
  name            = "order-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.order.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.apps_sg.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.order.arn
  }
}

# ==========================================
# 3. AUTH SERVICE
# ==========================================
resource "aws_service_discovery_service" "auth" {
  name = "auth"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "auth" {
  family                   = "cat-prod-auth"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name  = "auth-service"
    image = "${var.account_id}.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest"
    portMappings = [{ containerPort = 3001 }]
    environment = [
      { name = "DB_HOST", value = aws_db_instance.postgres.address },
      { name = "DB_USER", value = aws_db_instance.postgres.username },
      { name = "DB_PASS", value = aws_db_instance.postgres.password },
      { name = "DB_NAME", value = aws_db_instance.postgres.db_name },
      { name = "NODE_ENV", value = "production" },
      { name = "SQS_WALLET_URL", value = aws_sqs_queue.wallet_deduction.id }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/cat-prod"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "auth"
      }
    }
  }])
}

resource "aws_ecs_service" "auth" {
  name            = "auth-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.apps_sg.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.auth.arn
  }
}

# ==========================================
# 4. FRONTEND (React)
# ==========================================
resource "aws_lb_target_group" "frontend" {
  name        = "cat-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path    = "/"
    matcher = "200"
  }
}

resource "aws_lb_listener_rule" "frontend_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "cat-prod-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name  = "frontend"
    image = "${var.account_id}.dkr.ecr.us-east-1.amazonaws.com/frontend:latest"
    portMappings = [{ containerPort = 80 }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/cat-prod"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "frontend"
      }
    }
  }])
}

resource "aws_ecs_service" "frontend" {
  name            = "frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.apps_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }
}