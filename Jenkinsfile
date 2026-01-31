pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        SERVER_USER   = 'ec2-user'
        SERVER_IP     = '13.211.153.37'
        DEPLOY_SCRIPT = '/home/ec2-user/deploy.sh'
        SSH_KEY       = 'C:\\keys\\ec2-key.ppk'
        PLINK         = 'C:\\Program Files\\PuTTY\\plink.exe'
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

        stage('CD - Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2 using deploy.sh...'

                bat '''
"%PLINK%" -batch -ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "bash %DEPLOY_SCRIPT%"
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
