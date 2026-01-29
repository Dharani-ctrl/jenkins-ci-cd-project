pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        SERVER_USER = 'ec2-user'
        SERVER_IP   = '13.211.153.37'
        SERVER_PATH = '/home/ec2-user/jenkins-ci-cd-project'
    }

    stages {
        stage('CI - Server Install & Test') {
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

        stage('CI - Client Install & Build (Expo)') {
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

                    echo ===== CLIENT BUILD COMPLETED =====
                    '''
                }
            }
        }

        stage('CD - Deploy to Linux Server') {
            steps {
                echo '🚀 STARTING DEPLOYMENT TO EC2...'

                sshagent(credentials: ['ec2-ssh']) {
                    sh """
    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} '
        set -e
        echo "Connected as:" && whoami
        cd ${SERVER_PATH}
        git pull origin main
        docker compose down
        docker compose up --build -d
        echo "Deployment completed successfully"
    '
    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI + CD PIPELINE COMPLETED SUCCESSFULLY'
        }
        failure {
            echo '❌ PIPELINE FAILED — CHECK LOGS'
        }
    }
}
