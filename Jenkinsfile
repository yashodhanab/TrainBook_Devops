pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
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
