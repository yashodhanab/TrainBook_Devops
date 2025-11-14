// pipeline {
//     agent any

//     environment {
//         COMPOSE_FILE = 'docker-compose.yml'
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Build Images') {
//             steps {
//                 script {
//                     echo 'Building Docker images...'
//                     bat 'docker compose build'
//                 }
//             }
//         }

//         stage('Run Containers') {
//             steps {
//                 script {
//                     echo 'Cleaning old containers...'
//                     bat '''
//                     docker compose down
//                     docker rm -f mongo_container || echo "No existing mongo_container"
//                     docker rm -f node_backend || echo "No existing node_backend"
//                     docker rm -f vite_frontend || echo "No existing vite_frontend"
//                     docker volume prune -f
//                     '''

//                     echo 'Starting new services...'
//                     bat 'docker compose up -d'
//                 }
//             }
//         }

//         stage('Verify Services') {
//             steps {
//                 script {
//                     echo 'Checking running containers...'
//                     bat 'docker ps'
//                 }
//             }
//         }

//         stage('Test Backend') {
//             steps {
//                 script {
//                     echo 'Testing backend...'
//                     bat '''
//                     timeout /t 10
//                     curl http://localhost:5000 || exit /b 1
//                     '''
//                 }
//             }
//         }

//         stage('Test Frontend') {
//             steps {
//                 script {
//                     echo 'Testing frontend...'
//                     bat 'curl http://localhost:5173 || exit /b 1'
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Cleaning up after pipeline...'
//             bat 'docker compose down'
//         }
//     }
// }


pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        DOCKERHUB_CREDENTIALS = 'dockerhub' // Jenkins credentials ID
        DOCKERHUB_USERNAME = 'yashodhana' // will be set from credentials // will be set from credentials
        IMAGE_TAG = 'latest' // you can change to commit hash if needed
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                script {
                    echo 'Building Docker images...'
                    bat 'docker compose build'
                }
            }
        }

        stage('Tag & Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS,
                                                      usernameVariable: 'DOCKERHUB_USERNAME',
                                                      passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                        echo 'Logging in to Docker Hub...'
                        bat "docker login -u %DOCKERHUB_USERNAME% -p %DOCKERHUB_PASSWORD%"

                        echo 'Tagging images...'
                        bat "docker tag node_backend yourdockerhubusername/node_backend:%IMAGE_TAG%"
                        bat "docker tag vite_frontend yourdockerhubusername/vite_frontend:%IMAGE_TAG%"
                        bat "docker tag mongo_container yourdockerhubusername/mongo_container:%IMAGE_TAG%"

                        echo 'Pushing images to Docker Hub...'
                        bat "docker push yourdockerhubusername/node_backend:%IMAGE_TAG%"
                        bat "docker push yourdockerhubusername/vite_frontend:%IMAGE_TAG%"
                        bat "docker push yourdockerhubusername/mongo_container:%IMAGE_TAG%"
                    }
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {
                    echo 'Cleaning old containers...'
                    bat '''
                    docker compose down
                    docker rm -f mongo_container || echo "No existing mongo_container"
                    docker rm -f node_backend || echo "No existing node_backend"
                    docker rm -f vite_frontend || echo "No existing vite_frontend"
                    docker volume prune -f
                    '''
                    echo 'Starting new services...'
                    bat 'docker compose up -d'
                }
            }
        }

        stage('Verify Services') {
            steps {
                script {
                    echo 'Checking running containers...'
                    bat 'docker ps'
                }
            }
        }

        stage('Test Backend') {
            steps {
                script {
                    echo 'Testing backend...'
                    bat '''
                    timeout /t 10
                    curl http://localhost:5000 || exit /b 1
                    '''
                }
            }
        }

        stage('Test Frontend') {
            steps {
                script {
                    echo 'Testing frontend...'
                    bat 'curl http://localhost:5173 || exit /b 1'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up after pipeline...'
            bat 'docker compose down'
        }
    }
}
