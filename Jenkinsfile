// pipeline {
//     agent any

//     environment {
       
        
//         // Docker Config
//         DOCKER_REGISTRY_CRED_ID = 'dockerhub'
//         DOCKERHUB_USERNAME      = 'yashodhana'
//         BACKEND_IMAGE           = 'trainbook_dev-backend'
//         FRONTEND_IMAGE          = 'trainbook_dev-frontend'
//         TAG                     = "${env.BUILD_NUMBER}"
        
//         // Terraform Config (Set region here)
//         TF_VAR_region           = 'ap-south-1'
//     }

//     stages {
//         stage('Checkout Code') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Build & Push Images') {
//             steps {
//                 script {
//                     echo "Building and Pushing Docker Images..."
//                     // Note: We don't need SERVER_IP for build anymore because frontend is dynamic!
                    
//                     bat "docker build -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG% ./traindev"
//                     bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:latest -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG% ./traindevback"
                    
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
                    // Build using the TAG
                    bat "docker build -t %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG% ./traindev"
                    bat "docker build -t %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG% ./traindevback"
                    
                    withCredentials([usernamePassword(credentialsId: DOCKER_REGISTRY_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push %DOCKERHUB_USERNAME%/%FRONTEND_IMAGE%:%TAG%
                        docker push %DOCKERHUB_USERNAME%/%BACKEND_IMAGE%:%TAG%
                        docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy Infrastructure') {
            steps {
                script {
                    // 1. Get AWS Credentials
                    // 2. Get SSH Key (Private Key File + Generate Public Key from it)
                    withCredentials([
                        usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
                        sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USER')
                    ]) {
                        // We need to extract the public key from the private key file for Terraform to upload to AWS
                        // Note: ssh-keygen -y -f <private_key> prints the public key
                        bat 'ssh-keygen -y -f %SSH_KEY_FILE% > public_key.pub'
                        
                        // We read the public key into a variable to pass to Terraform
                        def publicKeyContent = readFile('public_key.pub').trim()

                        // Initialize Terraform
                        bat 'terraform init'

                        // Apply Terraform
                        // We pass the Docker info and Keys as variables
                        bat """
                            terraform apply -auto-approve \
                            -var="ssh_public_key=${publicKeyContent}" \
                            -var="ssh_private_key_path=${SSH_KEY_FILE}" \
                            -var="docker_username=${DOCKERHUB_USERNAME}" \
                            -var="frontend_image=${FRONTEND_IMAGE}" \
                            -var="backend_image=${BACKEND_IMAGE}" \
                            -var="image_tag=${TAG}"
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout || exit 0'
            // Optional: Destroy infra if this is just a test
            // bat 'terraform destroy -auto-approve ...' 
        }
    }
}