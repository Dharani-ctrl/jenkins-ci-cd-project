pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('CI - Server Install & Test') {
            steps {
                dir('server') {
                    bat '''
echo ================================
echo ===== SERVER INSTALL ^& TEST =====
echo ================================

call npm install || exit /b 1
call npm test || exit /b 1
'''
                }
            }
        }

        stage('CI - ML Failure Prediction') {
            steps {
                bat '''
echo ===========================================
echo ===== ML HISTORICAL FAILURE PREDICTOR =====
echo ===========================================
REM Install required ML libraries for the Jenkins user
"C:\\Python312\\python.exe" -m pip install scikit-learn pandas numpy joblib
REM For demo purposes, we pass mock metrics
"C:\\Python312\\python.exe" ai_model/predict_failure.py predict 120 2 0 150 98.0
'''
            }
        }

        stage('CI - AI Log Analysis') {
            environment {
                GEMINI_API_KEY = credentials('gemini-api-key')
            }
            steps {
                dir('service') {
                    bat '''
echo =======================================
echo ===== AI LOG PREDICTION ^& ANALYSIS =====
echo =======================================

call npm install || exit /b 1
node analyzeLogs.js || exit /b 1
'''
                }
            }
        }

        stage('CD - Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2 using deploy.sh...'
                bat '''
"C:\\Program Files\\PuTTY\\plink.exe" -batch -ssh -i "C:\\keys\\ec2-key.ppk" ec2-user@13.211.153.37 "bash /home/ec2-user/deploy.sh"
'''
            }
        }
    }

    post {
        success {
            echo '✅ CI + CD PIPELINE COMPLETED SUCCESSFULLY'
        }
        failure {
            echo '❌ PIPELINE FAILED — CHECK LOGS FOR DETAILS'
        }
    }
}
