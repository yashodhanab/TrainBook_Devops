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
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This checks out code from the GitHub repo configured in the Job
                checkout scm
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    echo "Building Docker Images..."
                    // Note: 'sh' is used for WSL/Linux instead of 'bat'
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
    }

    post {
        always {
            // Clean up local images to save WSL disk space (Optional)
            sh "docker rmi ${DOCKERHUB_USERNAME}/${FRONTEND_IMAGE}:${TAG} || true"
            sh "docker rmi ${DOCKERHUB_USERNAME}/${BACKEND_IMAGE}:${TAG} || true"
        }
    }
}