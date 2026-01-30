resource "aws_security_group" "web_sg" {
  name        = "jenkins-demo-sg-v2"
  description = "Allow SSH and HTTP"

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # FIX: Allow Port 80 for the browser
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

resource "aws_instance" "app_server" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.micro"
  key_name      = "my-key-pair"
  security_groups = [aws_security_group.web_sg.name]

  # FIX: Only install Docker. Do NOT run the app here. Let Jenkins do it.
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "DevOps-Project-Server"
  }
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}