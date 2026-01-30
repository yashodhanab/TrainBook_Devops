// pipeline {
//     agent any

//     environment {
//         DOCKER_REGISTRY_CRED_ID = 'dockerhub'
//         DOCKERHUB_USERNAME      = 'yashodhana'
//         BACKEND_IMAGE           = 'trainbook_dev-backend'
//         FRONTEND_IMAGE          = 'trainbook_dev-frontend'
//         AWS_CREDS_ID            = 'aws-terraform-creds'
//         // Corrected Region (removed 'c' suffix for standard AWS compatibility)
//         AWS_DEFAULT_REGION      = 'us-east-1' 
//     }

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Provision Infrastructure') {
//             steps {
//                 dir('terraform') {
//                     withCredentials([
//                         usernamePassword(credentialsId: AWS_CREDS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
//                         usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
//                     ]) {
//                         bat 'terraform init -no-color'
//                         bat 'terraform plan -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%" -out=tfplan'
//                         bat 'terraform apply -no-color -auto-approve tfplan'
//                         bat 'terraform refresh -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%"'
//                         bat 'terraform output -raw instance_ip > ../server_ip.txt'
//                     }
//                 }
//             }
//         }

//         stage('Build Images') {
//             steps {
//                 script {
//                     if (!fileExists('server_ip.txt')) {
//                         error "server_ip.txt was not found. Terraform failed."
//                     }
                    
//                     def SERVER_IP = readFile('server_ip.txt').trim()
                    
//                     if (SERVER_IP.contains("Warning") || SERVER_IP == "") {
//                         error "BUILD FAILED: Terraform did not return a valid IP Address."
//                     }
                    
//                     echo "Building with IP: ${SERVER_IP}"
//                     bat "docker build --build-arg VITE_API_URL=http://${SERVER_IP}:5000 -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest ./traindev"
//                     bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest ./traindevback"
//                 }
//             }
//         }

//         stage('Push Images to Docker Hub') {
//             steps {
//                 script {
//                     withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
//                         bat '''
//                         echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
//                         docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest
//                         docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest
//                         docker logout
//                         '''
//                     }
//                 }
//             }
//         }

//         stage('Deploy to EC2') {
//     steps {
//         script {
//             def SERVER_IP = readFile('server_ip.txt').trim()
//             echo "Deploying to Server at: ${SERVER_IP}"

//             sleep time: 45, unit: 'SECONDS'

//             withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY_FILE')]) {
//                 powershell """
//                     \$ErrorActionPreference = 'Stop'

//                     \$key = "\$env:SSH_KEY_FILE"
//                     \$ip  = "${SERVER_IP}"

//                     Write-Host "Deploying to \$ip..."

//                     \$cmd = @"
// sudo docker pull mongo:6 &&
// sudo docker pull ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest &&
// sudo docker pull ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest &&

// sudo docker stop trainbook_dev-frontend trainbook_dev-backend mongo-db || true &&
// sudo docker rm trainbook_dev-frontend trainbook_dev-backend mongo-db || true &&

// sudo docker network create app-network || true &&

// sudo docker run -d --name mongo-db --network app-network -p 27017:27017 mongo:6 &&

// sudo docker run -d --name trainbook_dev-backend --network app-network -p 5000:5000 \
//   -e MONGO_URL=mongodb://mongo-db:27017/authdb \
//   ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest &&

// sudo docker run -d --name trainbook_dev-frontend --network app-network -p 80:5173 \
//   ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
// "@

//                     ssh -i "\$key" -o StrictHostKeyChecking=no ubuntu@\$ip "\$cmd"
//                 """
//             }
//         }
//     }
// }

//     }

//     post {
//         always {
//             bat 'docker logout || exit 0'
//         }
//     }
// }

pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        AWS_CREDS_ID            = 'aws-terraform-creds'
        AWS_DEFAULT_REGION      = 'us-east-1'
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
                        bat 'terraform init -no-color'
                        bat 'terraform plan -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%" -out=tfplan'
                        bat 'terraform apply -no-color -auto-approve tfplan'
                        bat 'terraform refresh -no-color -var="docker_username=%DOCKER_USER%" -var="docker_password=%DOCKER_PASS%"'
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
                    
                    if (SERVER_IP.contains("Warning") || SERVER_IP == "") {
                        error "BUILD FAILED: Terraform did not return a valid IP Address."
                    }
                    
                    echo "Building with IP: ${SERVER_IP}"
                    bat "docker build --build-arg VITE_API_URL=http://${SERVER_IP}:5000 -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest ./traindev"
                    bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest ./traindevback"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
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

                    sleep time: 20, unit: 'SECONDS'

                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY_FILE')]) {
                        powershell """
                            \$ErrorActionPreference = 'Stop'

                            \$key = "\$env:SSH_KEY_FILE"
                            \$ip  = "${SERVER_IP}"

                            Write-Host "Fixing SSH key permissions..."
                            # Remove inherited permissions
                            icacls \$key /inheritance:r
                            # Grant read access only to Jenkins user
                            icacls \$key /grant:r "\$env:USERNAME:(R)"
                            # Remove BUILTIN\Users access
                            icacls \$key /remove "Users" /T /C

                            Write-Host "Deploying Docker containers to \$ip..."
                            \$cmd = @"
sudo docker pull mongo:6 &&
sudo docker pull ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest &&
sudo docker pull ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest &&

sudo docker stop trainbook_dev-frontend trainbook_dev-backend mongo-db || true &&
sudo docker rm trainbook_dev-frontend trainbook_dev-backend mongo-db || true &&

sudo docker network create app-network || true &&

sudo docker run -d --name mongo-db --network app-network -p 27017:27017 mongo:6 &&
sudo docker run -d --name trainbook_dev-backend --network app-network -p 5000:5000 -e MONGO_URL=mongodb://mongo-db:27017/authdb ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:latest &&
sudo docker run -d --name trainbook_dev-frontend --network app-network -p 80:5173 ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:latest
"@

                            ssh -i "\$key" -o StrictHostKeyChecking=no ubuntu@\$ip "\$cmd"
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
