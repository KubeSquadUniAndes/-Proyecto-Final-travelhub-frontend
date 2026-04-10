output "cloudfront_url" {
  description = "URL pública de la aplicación"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront (necesario para invalidar cache)"
  value       = aws_cloudfront_distribution.frontend.id
}
