pipeline {
    agent any

    environment {
        AWS_CRED_ID             = 'aws-credentials'
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        TAG                     = "${env.BUILD_NUMBER}"
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

                    // --- FIX: Robust Windows Permissions for Jenkins Service ---
                    if (isUnix()) {
                        sh 'chmod 400 trainbook-key.pem'
                    } else {
                        // 1. Reset permissions to default
                        bat 'icacls trainbook-key.pem /reset'
                        
                        // 2. Remove all inherited permissions (File becomes inaccessible to everyone)
                        bat 'icacls trainbook-key.pem /inheritance:r'
                        
                        // 3. Explicitly grant access to SYSTEM (The Jenkins Service)
                        bat 'icacls trainbook-key.pem /grant:r SYSTEM:R'
                        
                        // 4. Explicitly grant access to Administrators (Just in case)
                        bat 'icacls trainbook-key.pem /grant:r Administrators:R'
                    }

                    // --- Wait for Docker Installation ---
                    echo "Waiting 100 seconds for EC2 to finish installing Docker..."
                    sleep 100 

                    // --- Copy & Deploy ---
                    echo "Copying configuration..."
                    bat "scp -o StrictHostKeyChecking=no -i trainbook-key.pem docker-compose.yml ubuntu@${SERVER_IP}:/home/ubuntu/docker-compose.yml"

                    echo "Starting containers..."
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