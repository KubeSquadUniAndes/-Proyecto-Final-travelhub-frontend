terraform {
  required_version = ">= 1.3"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket  = "travelhub-frontend-prod"
    key     = "terraform/state.tfstate"
    region  = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront requiere que los certificados ACM estén en us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
