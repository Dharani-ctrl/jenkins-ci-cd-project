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
        stage('CI - Server Install ^& Test') {
            steps {
                dir('server') {
                    bat '''
                    echo ================================
                    echo ===== SERVER INSTALL ^& TEST =====
                    echo ================================

                    call npm install
                    IF %ERRORLEVEL% NEQ 0 exit /b 1

                    call npm test
                    IF %ERRORLEVEL% NEQ 0 exit /b 1
                    '''
                }
            }
        }
        stage('CD - Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2 using Plink...'
                bat '''
"C:\\Program Files\\PuTTY\\plink.exe" -batch -ssh ^
-i "C:\\keys\\ec2-key.ppk" ec2-user@13.211.153.37 ^
"cd /home/ec2-user/jenkins-ci-cd-project && \
 git pull origin main && \
 docker compose down || true && \
 docker compose up --build -d"
'''
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
