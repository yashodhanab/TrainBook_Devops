// pipeline {
//     agent any

//     environment {
//         DOCKER_REGISTRY_CRED_ID = 'dockerhub'
//         DOCKERHUB_USERNAME      = 'yashodhana'
//         BACKEND_IMAGE           = 'trainbook_dev-backend'
//         FRONTEND_IMAGE          = 'trainbook_dev-frontend'
//         TAG                     = "${env.BUILD_NUMBER}"
//     }

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 checkout scm
//             }
//         }



//         stage('Build Images') {
//             steps {
//                 script {
//                     if (!fileExists('server_ip.txt')) { error "server_ip.txt missing" }
//                     def SERVER_IP = readFile('server_ip.txt').trim()
                    
//                     if (SERVER_IP.contains("Warning") || SERVER_IP == "") {
//                         error "BUILD FAILED: Terraform returned invalid IP."
//                     }
                    
//                     echo "Building with IP: ${SERVER_IP}"
//                     // Build with 'latest' and versioned tag
//                     bat "docker build --build-arg VITE_API_URL=http://${SERVER_IP}:5000 -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG% ./traindev"
//                     bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG% ./traindevback"
//                 }
//             }
//         }

//         stage('Push Images') {
//             steps {
//                 script {
//                     withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
//                         bat '''
//                         echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        
//                         docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest
//                         docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG%
                        
//                         docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest
//                         docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG%
                        
//                         docker logout
//                         '''
//                     }
//                 }
//             }
//         }

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
        // AWS Credentials ID from Jenkins
        AWS_CREDENTIALS_ID      = 'aws-credentials' 
        
        // Docker Config
        DOCKER_REGISTRY_CRED_ID = 'dockerhub'
        DOCKERHUB_USERNAME      = 'yashodhana'
        BACKEND_IMAGE           = 'trainbook_dev-backend'
        FRONTEND_IMAGE          = 'trainbook_dev-frontend'
        TAG                     = "${env.BUILD_NUMBER}"
        
        // Terraform Config
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
                    // Since frontend is dynamic, we don't need server IP here anymore!
                    
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

        stage('Provision Infrastructure (Terraform)') {
            steps {
                script {
                    // Inject AWS Credentials into env for Terraform
                    withCredentials([usernamePassword(credentialsId: AWS_CREDENTIALS_ID, usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        bat 'terraform init'
                        bat 'terraform apply -auto-approve'
                        
                        // Capture IP for Deployment Stage
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

                    // 1. Set Key Permissions (Windows/Linux compatible attempt)
                    if (isUnix()) {
                        sh 'chmod 400 trainbook-key.pem'
                    } else {
                        // Windows cacls or just hope permissions work in workspace
                        echo "Running on Windows, skipping chmod"
                    }

                    // 2. Wait for Server to be Ready (Simple check)
                    sleep 10 

                    // 3. Copy Docker Compose to Server
                    // We use the SSH Key generated by Terraform in the workspace
                    bat "scp -o StrictHostKeyChecking=no -i trainbook-key.pem docker-compose.yml ubuntu@${SERVER_IP}:/home/ubuntu/docker-compose.yml"

                    // 4. Run Docker Compose on Server
                    // We pass the BUILD_NUMBER as IMAGE_TAG so it pulls the exact version we just built
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