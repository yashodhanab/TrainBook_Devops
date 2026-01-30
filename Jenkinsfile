pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        AWS_CREDS_ID            = 'aws-terraform-creds'
        AWS_DEFAULT_REGION      = 'ap-south-1'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // MOVED UP: Provision first so we get the IP Address
        stage('Provision Infrastructure') {
            steps {
                dir('terraform') {
                    withCredentials([
                        usernamePassword(credentialsId: AWS_CREDS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
                        usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
                    ]) {
                        sh '''
                        terraform init
                        terraform plan -var="docker_username=$DOCKER_USER" -var="docker_password=$DOCKER_PASS"
                        terraform apply -auto-approve -var="docker_username=$DOCKER_USER" -var="docker_password=$DOCKER_PASS"
                        terraform output -raw instance_ip > ../server_ip.txt
                        '''
                    }
                }
            }
        }

        // REORDERED: Now we build using the IP we just got
        stage('Build Images') {
            steps {
                script {
                     // 1. Read the IP from the previous stage
                    if (!fileExists('server_ip.txt')) {
                        error "server_ip.txt was not found. Terraform failed?"
                    }
                    def SERVER_IP = readFile('server_ip.txt').trim()
                    echo "Building Frontend with API URL: http://${SERVER_IP}:5000"

                    // 2. Build Frontend
                    // IMPORTANT: We pass the IP as a build-arg so Vite can bake it in
                    sh "docker build --build-arg VITE_API_URL=http://${SERVER_IP}:5000 -t $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:latest ./traindev"
                    
                    // 3. Build Backend
                    sh "docker build -t $DOCKERHUB_USERNAME/$BACKEND_IMAGE:latest ./traindevback"
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
                        sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        docker push $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:latest
                        docker push $DOCKERHUB_USERNAME/$BACKEND_IMAGE:latest
                        
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
                    
                    // Wait for EC2 to be fully initialized (sshd)
                    sleep time: 45, unit: 'SECONDS' 

                    sshagent(credentials: ['ec2-ssh-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@${SERVER_IP} '
                                # 1. Pull Latest Images
                                sudo docker pull mongo:6
                                sudo docker pull ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest
                                sudo docker pull ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest

                                # 2. Cleanup Old Containers (Added || true to prevent failure if they dont exist)
                                sudo docker stop trainbook_dev-frontend trainbook_dev-backend mongo-db || true
                                sudo docker rm trainbook_dev-frontend trainbook_dev-backend mongo-db || true
                                
                                # 3. Create Network (Added || true so it does not fail if network exists)
                                sudo docker network create app-network || true

                                # 4. Start MongoDB
                                sudo docker run -d --name mongo-db --network app-network -p 27017:27017 mongo:6

                                # 5. Start Backend 
                                # FIX: Changed DB name to "authdb" and variable to "MONGO_URL" to match docker-compose
                                sudo docker run -d --name trainbook_dev-backend --network app-network -p 5000:5000 -e MONGO_URL="mongodb://mongo-db:27017/authdb" ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest

                                # 6. Start Frontend 
                                # NOTE: VITE_API_URL is mostly ignored here (it was baked in build), but keeping it doesn't hurt.
                                sudo docker run -d --name trainbook_dev-frontend --network app-network -p 80:5173 ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}