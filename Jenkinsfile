pipeline {
    agent any

    options {
        timestamps()
    }

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
                    echo ================================
                    echo ===== SERVER INSTALL & TEST =====
                    echo ================================

                    call npm install
                    IF %ERRORLEVEL% NEQ 0 exit /b 1

                    call npm test
                    IF %ERRORLEVEL% NEQ 0 exit /b 1
                    '''
                }
            }
        }

        stage('Client - Install & Build (Expo)') {
            steps {
                dir('client') {
                    bat '''
                    echo ======================================
                    echo ===== CLIENT INSTALL & BUILD (EXPO) ===
                    echo ======================================

                    call npm install
                    IF %ERRORLEVEL% NEQ 0 exit /b 1

                    call npx expo export
                    IF %ERRORLEVEL% NEQ 0 exit /b 1

                    echo ===== VERIFY DIST FOLDER =====
                    dir
                    echo ===== DIST CONTENT =====
                    dir dist
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI PIPELINE COMPLETED SUCCESSFULLY'
        }
        failure {
            echo '❌ CI PIPELINE FAILED'
        }
    }
}
