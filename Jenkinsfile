pipeline {
  agent any

  environment {
    REGISTRY = "your-docker-registry.example.com" // e.g., docker.io/youruser
    IMAGE_BACKEND = "${env.REGISTRY}/java-simple-backend"
    IMAGE_FRONTEND = "${env.REGISTRY}/java-simple-frontend"
    COMPOSE_PROJECT_NAME = "java_simple"
  }

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend - Build JAR') {
      tools { jdk 'jdk8' }
      steps {
        sh 'mvn -v | cat'
        sh 'mvn -DskipTests package | cat'
        archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
      }
    }

    stage('Docker Build') {
      steps {
        script {
          sh 'docker version | cat'
          sh 'docker build -f Dockerfile.backend -t ${IMAGE_BACKEND}:$BUILD_NUMBER .' 
          sh 'docker build -f crud-frontend/Dockerfile.frontend -t ${IMAGE_FRONTEND}:$BUILD_NUMBER ./crud-frontend'
        }
      }
    }

    stage('Docker Push') {
      when { expression { return env.REGISTRY && env.REGISTRY != '' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login ${REGISTRY} -u "$DOCKER_USER" --password-stdin'
          sh 'docker push ${IMAGE_BACKEND}:$BUILD_NUMBER'
          sh 'docker push ${IMAGE_FRONTEND}:$BUILD_NUMBER'
        }
      }
    }

    stage('Deploy with docker-compose') {
      steps {
        sh 'docker compose version | cat || docker-compose version | cat'
        sh 'docker compose down || docker-compose down || true'
        sh 'docker compose up -d --build || docker-compose up -d --build'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: '**/surefire-reports/*.xml'
      cleanWs()
    }
  }
}


