pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        AWS_CREDS_ID            = 'aws-terraform-creds'
        AWS_DEFAULT_REGION      = 'us-east-1'
        TAG                     = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // stage('Provision Infrastructure') {
        //     steps {
        //         dir('terraform') {
        //             withCredentials([
        //                 usernamePassword(credentialsId: AWS_CREDS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
        //                 usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
        //             ]) {
        //                 bat 'terraform init -no-color'
        //                 bat 'terraform plan -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%" -out=tfplan'
        //                 bat 'terraform apply -no-color -auto-approve tfplan'
        //                 bat 'terraform refresh -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%"'
        //                 bat 'terraform output -raw instance_ip > ../server_ip.txt'
        //             }
        //         }
        //     }
        // }

        stage('Build Images') {
            steps {
                script {
                    if (!fileExists('server_ip.txt')) { error "server_ip.txt missing" }
                    def SERVER_IP = readFile('server_ip.txt').trim()
                    
                    if (SERVER_IP.contains("Warning") || SERVER_IP == "") {
                        error "BUILD FAILED: Terraform returned invalid IP."
                    }
                    
                    echo "Building with IP: ${SERVER_IP}"
                    // Build with 'latest' and versioned tag
                    bat "docker build --build-arg VITE_API_URL=http://${SERVER_IP}:5000 -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG% ./traindev"
                    bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG% ./traindevback"
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
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

        // stage('Deploy to EC2') {
        //     steps {
        //         script {
        //             def SERVER_IP = readFile('server_ip.txt').trim()
        //             echo "Deploying to Server at: ${SERVER_IP}"
        //             sleep time: 45, unit: 'SECONDS' 
        //
        //             // FRESH START FIX: 'sshagent' holds the key in memory.
        //             // No files, no permission errors, no 'icacls'.
        //             sshagent(credentials: ['ec2-ssh-key']) {
        //                 bat """
        //                     ssh -o StrictHostKeyChecking=no ubuntu@${SERVER_IP} "sudo docker pull mongo:6 && sudo docker pull ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest && sudo docker pull ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest && sudo docker stop trainbook_dev-frontend trainbook_dev-backend mongo-db || true && sudo docker rm trainbook_dev-frontend trainbook_dev-backend mongo-db || true && sudo docker network create app-network || true && sudo docker run -d --name mongo-db --network app-network -p 27017:27017 mongo:6 && sudo docker run -d --name trainbook_dev-backend --network app-network -p 5000:5000 -e MONGO_URL=mongodb://mongo-db:27017/authdb ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest && sudo docker run -d --name trainbook_dev-frontend --network app-network -p 80:5173 ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest"
        //                 """
        //             }
        //         }
        //     }
        // }
    }

    post {
        always {
            bat 'docker logout || exit 0'
        }
    }
}