pipeline {
    agent any

    environment {
        APP_NAME = 'java-simple'
        BACKEND_IMAGE = "${APP_NAME}-backend"
        FRONTEND_IMAGE = "${APP_NAME}-frontend"
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 40, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('1. Checkout') {
            steps {
                echo 'GitHub dan kod olinmoqda...'
                checkout scm
            }
        }

        stage('2. Test') {
            steps {
                echo 'Maven testlar ishga tushirilmoqda...'
                // Workspace ni tar bilan Maven konteyneriga uzatamiz
                sh '''
                    set -e
                    docker version
                    tar --exclude=./.git --exclude=./crud-frontend/node_modules --exclude=./target -cf - . \
                      | docker run --rm -i \
                          -w /app \
                          maven:3.9-eclipse-temurin-8 \
                          bash -lc 'mkdir -p /app && tar -xf - && mvn -B test -Dspring.profiles.active=test'
                '''
            }
        }

        stage('3. Build Backend Image') {
            steps {
                echo "Backend Docker image: ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
            }
        }

        stage('4. Build Frontend Image') {
            steps {
                echo "Frontend Docker image: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
            }
        }

        stage('5. Deploy Production') {
            steps {
                echo 'docker-compose.prod.yml orqali deploy...'
                sh '''
                    export BACKEND_IMAGE_TAG=${IMAGE_TAG}
                    export FRONTEND_IMAGE_TAG=${IMAGE_TAG}
                    docker compose -f docker-compose.prod.yml up -d --build
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline muvaffaqiyatli. Frontend: http://localhost:3000 Backend: http://localhost:8080"
        }
        failure {
            echo 'Pipeline xato bilan yakunlandi. Console Output ni tekshiring.'
        }
    }
}
