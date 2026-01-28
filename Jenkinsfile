pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Server - Install & Test') {
            steps {
                dir('server') {
                    bat '''
                    echo ===== SERVER INSTALL AND TEST =====
                    npm install
                    npm test
                    '''
                }
            }
        }

        stage('Client - Install & Build (Expo)') {
            steps {
                dir('client') {
                    bat '''
                    echo ===== CLIENT INSTALL AND BUILD (EXPO) =====
                    npm install
                    npx expo export
                    echo ===== DIST FILES =====
                    dir dist
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI Pipeline Completed Successfully'
        }
        failure {
            echo '❌ CI Pipeline Failed'
        }
    }
}
