pipeline {
    agent any

    environment {
        APP_NAME = 'java-simple'
        BACKEND_IMAGE = "${APP_NAME}-backend"
        FRONTEND_IMAGE = "${APP_NAME}-frontend"
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
        COMPOSE_FILE = 'docker-compose.prod.yml'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            docker run --rm \
                              -v "$PWD":/app \
                              -w /app \
                              maven:3.9-eclipse-temurin-8 \
                              mvn -B test -Dspring.profiles.active=test
                        '''
                    } else {
                        bat '''
                            docker run --rm -v "%cd%":/app -w /app maven:3.9-eclipse-temurin-8 mvn -B test -Dspring.profiles.active=test
                        '''
                    }
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                    } else {
                        bat "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                    } else {
                        bat "docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Deploy Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            export BACKEND_IMAGE_TAG=${IMAGE_TAG}
                            export FRONTEND_IMAGE_TAG=${IMAGE_TAG}
                            docker compose -f docker-compose.prod.yml down || true
                            docker compose -f docker-compose.prod.yml up -d
                        '''
                    } else {
                        bat '''
                            set BACKEND_IMAGE_TAG=%IMAGE_TAG%
                            set FRONTEND_IMAGE_TAG=%IMAGE_TAG%
                            docker compose -f docker-compose.prod.yml down
                            docker compose -f docker-compose.prod.yml up -d
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline muvaffaqiyatli yakunlandi. Backend: http://localhost:8080"
        }
        failure {
            echo 'Pipeline xato bilan yakunlandi.'
        }
    }
}
