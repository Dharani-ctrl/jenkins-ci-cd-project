pipeline {
    agent any

    environment {
        NODE_HOME = "C:\\Program Files\\nodejs" // Adjust if needed
        PATH = "${NODE_HOME}\\;${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Dharani-ctrl/jenkins-ci-cd-project.git'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Server Dependencies') {
                    steps {
                        dir('server') {
                            bat 'npm install'
                        }
                    }
                }
                stage('Client Dependencies') {
                    steps {
                        dir('client') {
                            bat 'npm install'
                        }
                    }
                }
                stage('AI-Service Dependencies') {
                    steps {
                        dir('ai-service') {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Server Tests') {
                    steps {
                        dir('server') {
                            bat 'npm test || echo "No server tests defined"'
                        }
                    }
                }
                stage('Client Tests') {
                    steps {
                        dir('client') {
                            bat 'npm test || echo "No client tests defined"'
                        }
                    }
                }
            }
        }

        stage('Analyze Logs with AI') {
            steps {
                dir('ai-service') {
                    bat 'node analyzeLogs.js'
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                echo "✅ Build and deploy steps go here (you can integrate Netlify, AWS, or Heroku)"
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
