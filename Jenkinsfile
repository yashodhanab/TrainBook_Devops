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
                    echo 'Starting services...'
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
            echo 'Cleaning up...'
            bat 'docker compose down'
        }
    }
}
