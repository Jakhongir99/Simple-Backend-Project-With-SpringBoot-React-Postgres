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
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                // Exit 127 oldin: Jenkins ichida docker CLI yo'q edi.
                // Endi docker bor. Workspace ni tar bilan Maven konteyneriga uzatamiz
                // (Docker Desktop + named volume path muammosidan qochamiz).
                sh '''
                    set -e
                    docker version
                    echo "Running Maven tests..."
                    tar --exclude=./.git --exclude=./crud-frontend/node_modules --exclude=./target -cf - . \
                      | docker run --rm -i \
                          -w /app \
                          maven:3.9-eclipse-temurin-8 \
                          bash -lc 'mkdir -p /app && tar -xf - && mvn -B test -Dspring.profiles.active=test'
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
            }
        }

        stage('Deploy Production') {
            steps {
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
