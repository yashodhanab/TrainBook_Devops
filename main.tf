# terraform {
#   required_providers {
#     aws = {
#       source  = "hashicorp/aws"
#       version = "~> 5.0"
#     }
#   }
# }

# provider "aws" {
#   region = "ap-south-1" # You can change this to us-east-1 if needed
# }

# # --- 1. Key Pair Generation ---
# # This creates a new SSH key explicitly for this deployment
# resource "tls_private_key" "pk" {
#   algorithm = "RSA"
#   rsa_bits  = 4096
# }

# resource "aws_key_pair" "kp" {
#   key_name   = "trainbook-key"
#   public_key = tls_private_key.pk.public_key_openssh
# }

# # Saves the private key to your computer so you can SSH later
# resource "local_file" "ssh_key" {
#   filename        = "${path.module}/trainbook-key.pem"
#   content         = tls_private_key.pk.private_key_pem
#   file_permission = "0400"
# }

# # --- 2. Security Group ---
# resource "aws_security_group" "web_sg" {
#   name_prefix = "trainbook-sg-"
#   description = "Allow SSH, Backend, and Frontend"

#   # SSH
#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   # Backend Port (5000)
#   ingress {
#     from_port   = 5000
#     to_port     = 5000
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   # Frontend Port (5173)
#   ingress {
#     from_port   = 5173
#     to_port     = 5173
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   # Allow all outbound traffic
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }

# # --- 3. EC2 Instance ---
# data "aws_ami" "ubuntu" {
#   most_recent = true
#   owners      = ["099720109477"] # Canonical

#   filter {
#     name   = "name"
#     values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
#   }
# }

# resource "aws_instance" "web_server" {
#   ami                    = data.aws_ami.ubuntu.id
#   instance_type          = "t3.micro"
#   key_name               = aws_key_pair.kp.key_name
#   vpc_security_group_ids = [aws_security_group.web_sg.id]

#   # SSH Connection details for the provisioners below
#   connection {
#     type        = "ssh"
#     user        = "ubuntu"
#     private_key = tls_private_key.pk.private_key_pem
#     host        = self.public_ip
#   }

#   # A. Copy Backend Folder
#   provisioner "file" {
#     source      = "./traindevback"
#     destination = "/home/ubuntu/traindevback"
#   }

#   # B. Copy Frontend Folder
#   provisioner "file" {
#     source      = "./traindev"
#     destination = "/home/ubuntu/traindev"
#   }

#   # C. Copy Docker Compose File
#   provisioner "file" {
#     source      = "./docker-compose.yml"
#     destination = "/home/ubuntu/docker-compose.yml"
#   }

#   # D. Install Docker & Start App
#   provisioner "remote-exec" {
#     inline = [
#       # 1. Install Docker Essentials
#       "sudo apt-get update -y",
#       "sudo apt-get install -y ca-certificates curl gnupg",
#       "sudo install -m 0755 -d /etc/apt/keyrings",
#       "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg",
#       "sudo chmod a+r /etc/apt/keyrings/docker.gpg",
#       "echo \"deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \"$(. /etc/os-release && echo \"$VERSION_CODENAME\")\" stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
#       "sudo apt-get update -y",
#       "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
#       "sudo usermod -aG docker ubuntu",

#       # 2. Build and Run the App
#       "cd /home/ubuntu",
#       # (Optional) If you have environment variables, you can create a .env file here
#       # "echo 'IMAGE_TAG=latest' > .env",
      
#       "sudo docker compose up -d --build"
#     ]
#   }
# }

# # --- 4. Output ---
# output "ssh_command" {
#   value = "ssh -i trainbook-key.pem ubuntu@${aws_instance.web_server.public_ip}"
# }

# output "frontend_url" {
#   value = "http://${aws_instance.web_server.public_ip}:5173"
# }

# output "backend_url" {
#   value = "http://${aws_instance.web_server.public_ip}:5000"
# }


terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# --- Variables (Passed from Jenkins) ---
variable "region" {}
variable "ssh_public_key" {}      # The actual public key text
variable "ssh_private_key_path" {} # Path to the private key file on Jenkins agent
variable "docker_username" {}
variable "frontend_image" {}
variable "backend_image" {}
variable "image_tag" {}

# --- 1. Key Pair ---
# Use the Public Key provided by Jenkins Credential
resource "aws_key_pair" "kp" {
  key_name   = "trainbook-jenkins-key"
  public_key = var.ssh_public_key
}

# --- 2. Security Group ---
resource "aws_security_group" "web_sg" {
  name_prefix = "trainbook-sg-"
  description = "Allow SSH, Backend, and Frontend"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5173
    to_port     = 5173
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

# --- 3. EC2 Instance ---
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "web_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # SSH Connection for provisioners
  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file(var.ssh_private_key_path)
    host        = self.public_ip
  }

  # Copy Docker Compose File only
  provisioner "file" {
    source      = "./docker-compose.yml"
    destination = "/home/ubuntu/docker-compose.yml"
  }

  # Create .env file for Docker variables
  provisioner "remote-exec" {
    inline = [
      "echo 'DOCKER_USERNAME=${var.docker_username}' > /home/ubuntu/.env",
      "echo 'FRONTEND_IMAGE=${var.frontend_image}' >> /home/ubuntu/.env",
      "echo 'BACKEND_IMAGE=${var.backend_image}' >> /home/ubuntu/.env",
      "echo 'IMAGE_TAG=${var.image_tag}' >> /home/ubuntu/.env"
    ]
  }

  # Install Docker & Start App
  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get install -y ca-certificates curl gnupg",
      "sudo install -m 0755 -d /etc/apt/keyrings",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg",
      "sudo chmod a+r /etc/apt/keyrings/docker.gpg",
      "echo \"deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \"$(. /etc/os-release && echo \"$VERSION_CODENAME\")\" stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "sudo apt-get update -y",
      "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      "sudo usermod -aG docker ubuntu",
      
      # Pull images and run
      "cd /home/ubuntu",
      "sudo docker compose pull", 
      "sudo docker compose up -d"
    ]
  }
}

output "frontend_url" {
  value = "http://${aws_instance.web_server.public_ip}:5173"
}