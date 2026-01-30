pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        AWS_CREDS_ID            = 'aws-terraform-creds'
        AWS_DEFAULT_REGION      = 'us-east-1c'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Provision Infrastructure') {
            steps {
                dir('terraform') {
                    withCredentials([
                        usernamePassword(credentialsId: AWS_CREDS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
                        usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
                    ]) {
                        // 1. Init
                        bat 'terraform init -no-color'
                        
                        // 2. Plan
                        bat 'terraform plan -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%" -out=tfplan'
                        
                        // 3. Apply
                        bat 'terraform apply -no-color -auto-approve tfplan'
                        
                        // 4. FIX: Refresh also needs variables!
                        bat 'terraform refresh -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%"'
                        
                        // 5. Output
                        bat 'terraform output -raw instance_ip > ../server_ip.txt'
                    }
                }
            }
        }

        stage('Build Images') {
            steps {
                script {
                    if (!fileExists('server_ip.txt')) {
                        error "server_ip.txt was not found. Terraform failed."
                    }
                    
                    def SERVER_IP = readFile('server_ip.txt').trim()
                    
                    // SAFETY CHECK
                    if (SERVER_IP.contains("Warning") || SERVER_IP.contains("No outputs") || SERVER_IP == "") {
                        echo "Terraform Output was: ${SERVER_IP}"
                        error "BUILD FAILED: Terraform did not return a valid IP Address."
                    }
                    
                    echo "Valid IP Found: ${SERVER_IP}"
                    echo "Building Frontend with API URL: http://${SERVER_IP}:5000"

                    // Build commands
                    bat "docker build --build-arg VITE_API_URL=http://${SERVER_IP}:5000 -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest ./traindev"
                    bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest ./traindevback"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: DOCKER_REGISTRY_CRED_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        
                        docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest
                        docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest
                        
                        docker logout
                        '''
                    }
                }
            }
        }

       stage('Deploy to EC2') {
            steps {
                script {
                    def SERVER_IP = readFile('server_ip.txt').trim()
                    echo "Deploying to Server at: ${SERVER_IP}"
                    
                    sleep time: 45, unit: 'SECONDS' 

                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        powershell """
                            \$ErrorActionPreference = 'Stop'
                            \$keyPath = "\$env:SSH_KEY"
                            
                            # 1. FIX PERMISSIONS (Simplified)
                            # First, remove inheritance (strips 'Users' group access)
                            Write-Host "Securing private key: Removing inheritance..."
                            icacls "\$keyPath" /inheritance:r
                            
                            # Second, explicitly grant Read access to the current Jenkins user
                            # (Removed ':r' to fix the Invalid Parameter error)
                            Write-Host "Securing private key: Granting user access..."
                            icacls "\$keyPath" /grant "\$env:USERNAME:R"
                            
                            # 2. DEFINE COMMANDS
                            \$ip = "${SERVER_IP}"
                            \$dockerCmd = "sudo docker pull mongo:6 && sudo docker pull ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest && sudo docker pull ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest && sudo docker stop trainbook_dev-frontend trainbook_dev-backend mongo-db || true && sudo docker rm trainbook_dev-frontend trainbook_dev-backend mongo-db || true && sudo docker network create app-network || true && sudo docker run -d --name mongo-db --network app-network -p 27017:27017 mongo:6 && sudo docker run -d --name trainbook_dev-backend --network app-network -p 5000:5000 -e MONGO_URL=mongodb://mongo-db:27017/authdb ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest && sudo docker run -d --name trainbook_dev-frontend --network app-network -p 80:5173 ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest"

                            # 3. CONNECT
                            Write-Host "Connecting to \$ip..."
                            ssh -i "\$keyPath" -o StrictHostKeyChecking=no ubuntu@\$ip \$dockerCmd
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout || exit 0'
        }
    }
}