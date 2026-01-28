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
                    npm install || exit /b 1
                    npm test || exit /b 1
                    '''
                }
            }
        }

        stage('Client - Install & Build (Expo)') {
            steps {
                dir('client') {
                    bat '''
                    echo ===== CLIENT INSTALL AND BUILD (EXPO) =====
                    npm install || exit /b 1
                    npx expo export || exit /b 1
                    echo ===== DIST CONTENT =====
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
