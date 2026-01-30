pipeline {
    agent any

    environment {
        // Docker Config
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        TAG                     = "${env.BUILD_NUMBER}"
        
        // Terraform Config
        AWS_REGION              = 'ap-south-1'
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
                    echo "Building Docker Images..."
                    // Build
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${TAG} ./traindev"
                    sh "docker build -t ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${TAG} ./traindevback"
                    
                    echo "Pushing to DockerHub..."
                    withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        docker push ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${TAG}
                        docker push ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${TAG}
                        docker logout
                        """
                    }
                }
            }
        }

        stage('Deploy Infra & App (Terraform)') {
            steps {
                script {
                    echo "Deploying to AWS EC2 via Terraform..."
                    
                    // Wrap Terraform actions in credentials bindings
                    withCredentials([
                        // 1. AWS Credentials for Terraform Provider
                        usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
                        // 2. SSH Private Key (Jenkins creates a temp file and gives us the path in SSH_KEY_PATH)
                        sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY_PATH', usernameVariable: 'SSH_USER'),
                        // 3. SSH Public Key (Passed as text string)
                        string(credentialsId: 'ec2-public-key-text', variable: 'SSH_PUB_KEY_TEXT')
                    ]) {
                        // If your terraform files are in a specific folder, uncomment below:
                        // dir('terraform-folder') { 
                        
                            // Init Terraform (only needs to run once, but safe to run every time)
                            sh 'terraform init'

                            // Apply Terraform
                            // We pass the Jenkins Build Variables into Terraform Variables using -var
                            sh """
                            terraform apply -auto-approve \\
                                -var="region=${AWS_REGION}" \\
                                -var="ssh_public_key=${SSH_PUB_KEY_TEXT}" \\
                                -var="ssh_private_key_path=${SSH_KEY_PATH}" \\
                                -var="docker_username=${DOCKERHUB_USERNAME}" \\
                                -var="frontend_image=${FRONTEND_IMAGE}" \\
                                -var="backend_image=${BACKEND_IMAGE}" \\
                                -var="image_tag=${TAG}"
                            """
                        // }
                    }
                }
            }
        }
    }

    post {
        always {
            // Cleanup local docker images
            sh "docker rmi ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${TAG} || true"
            sh "docker rmi ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${TAG} || true"
        }
    }
}