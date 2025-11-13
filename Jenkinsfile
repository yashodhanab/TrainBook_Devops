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
                    sh 'docker compose build'
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {
                    echo 'Starting services...'
                    sh 'docker compose up -d'
                }
            }
        }

        stage('Verify Services') {
            steps {
                script {
                    echo 'Checking running containers...'
                    sh 'docker ps'
                }
            }
        }

        stage('Test Backend') {
            steps {
                script {
                    echo 'Testing backend API health...'
                    // Simple curl test to verify backend responds
                    sh 'sleep 10 && curl -f http://localhost:5000 || exit 1'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                script {
                    echo 'Testing frontend...'
                    sh 'curl -f http://localhost:5173 || exit 1'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker compose down'
        }
    }
}
