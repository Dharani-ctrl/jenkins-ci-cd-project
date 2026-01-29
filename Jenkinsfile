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
                    sh '''
                        set -e
                        echo "================================"
                        echo "===== SERVER INSTALL & TEST ====="
                        echo "================================"

                        npm install
                        npm test
                    '''
                }
            }
        }

        stage('CI - Client Install & Build (Expo)') {
            steps {
                dir('client') {
                    sh '''
                        set -e
                        echo "======================================"
                        echo "===== CLIENT INSTALL & BUILD (EXPO) ==="
                        echo "======================================"

                        npm install
                        npx expo export

                        echo "===== CLIENT BUILD COMPLETED ====="
                    '''
                }
            }
        }

        stage('CD - Deploy to Linux Server') {
            steps {
                echo '🚀 STARTING DEPLOYMENT TO EC2...'

                sshagent(credentials: ['ec2-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ec2-user@13.211.153.37 << 'EOF'
                        set -e
                        echo "Connected as:" && whoami
                        cd /home/ec2-user/jenkins-ci-cd-project
                        git pull origin main
                        docker compose down
                        docker compose up --build -d
                        echo "Deployment completed successfully"
                        EOF
                    '''
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
