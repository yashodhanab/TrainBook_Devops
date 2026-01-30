pipeline {
    agent any

    environment {
        // AWS Credentials ID stored in Jenkins
        AWS_CRED_ID             = 'aws-credentials'
        
        // Docker Config
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        TAG                     = "${env.BUILD_NUMBER}"
        
        // Terraform Config (Set region here)
        TF_VAR_region           = 'ap-south-1'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    echo "Building and Pushing Docker Images..."
                    // Note: We don't need SERVER_IP for build anymore because frontend is dynamic!
                    
                    bat "docker build -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG% ./traindev"
                    bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG% ./traindevback"
                    
                    withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest
                        docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG%
                        docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest
                        docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG%
                        docker logout
                        '''
                    }
                }
            }
        }

        stage('Provision Infrastructure') {
            steps {
                script {
                    echo "Running Terraform..."
                    withCredentials([usernamePassword(credentialsId: AWS_CRED_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        
                        // --- FIX: Force delete the locked key file so Terraform can recreate it ---
                        // We use 'del /f /q' to force delete. 
                        // If it fails (file doesn't exist), '|| exit 0' keeps the pipeline running.
                        bat 'del /f /q trainbook-key.pem || exit 0'

                        bat 'terraform init'
                        bat 'terraform apply -auto-approve'
                        bat 'terraform output -raw public_ip > server_ip.txt'
                    }
                }
            }
        }
        stage('Deploy to EC2') {
            steps {
                script {
                    def SERVER_IP = readFile('server_ip.txt').trim()
                    echo "Deploying to ${SERVER_IP}..."

                    // 1. Fix Key Permissions (Attempt to handle Windows environment)
                    // If this fails on Windows, you might need to use 'icacls' manually or ignore strict checking
                    if (isUnix()) {
                        sh 'chmod 400 trainbook-key.pem'
                    }

                    // 2. Wait for Docker to finish installing (Simple sleep)
                    sleep 10 

                    // 3. Copy docker-compose.yml to the server
                    // Use StrictHostKeyChecking=no to avoid "Are you sure?" prompt
                    bat "scp -o StrictHostKeyChecking=no -i trainbook-key.pem docker-compose.yml ubuntu@${SERVER_IP}:/home/ubuntu/docker-compose.yml"

                    // 4. Run Docker Compose
                    // We pass the BUILD_NUMBER as IMAGE_TAG so it pulls the version we just built
                    bat """
                    ssh -o StrictHostKeyChecking=no -i trainbook-key.pem ubuntu@${SERVER_IP} "export IMAGE_TAG=${TAG} && docker compose pull && docker compose up -d"
                    """
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