output "nameservers_hostinger" {
  value       = aws_route53_zone.main.name_servers
  description = "COPIA ESTOS VALORES Y PONLOS EN HOSTINGER DNS"
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}