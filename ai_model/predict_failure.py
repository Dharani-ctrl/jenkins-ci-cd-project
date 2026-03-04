"""
predict_failure.py
AI-Based Intelligent CI/CD Pipeline - ML Failure Prediction Model

This script trains a Machine Learning model (Random Forest) to predict CI/CD
pipeline failures based on historical build metrics (duration, error keywords,
test coverage, line changes, etc.).
"""

import os
import random
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

MODEL_PATH = "cicd_model.pkl"

def generate_historical_data(samples=1000):
    '''
    Generates synthetic historical Jenkins build logs and metrics.
    Features:
    - build_duration (seconds)
    - num_warnings
    - num_errors
    - lines_changed (PR size)
    - test_pass_rate (0-100)
    Target:
    - status (0: Success, 1: Failure)
    '''
    print("[INFO] Generating synthetic historical Jenkins build data...")
    data = []
    # Force repeatable randomness for demo stability
    random.seed(42)
    
    for _ in range(samples):
        duration = random.randint(30, 600)
        warnings = random.randint(0, 50)
        errors = random.randint(0, 10)
        lines = random.randint(10, 2000)
        test_rate = random.uniform(80.0, 100.0)
        
        # Rule slightly skewed to simulate realistic failures
        failure_chance = 0.05 # Base 5%
        
        if errors > 0:
            failure_chance += 0.8
        if lines > 1000:
            failure_chance += 0.2
        if test_rate < 90.0:
            failure_chance += 0.4
            
        status = 1 if random.random() < failure_chance else 0
        
        data.append([duration, warnings, errors, lines, test_rate, status])
        
    return pd.DataFrame(data, columns=['duration', 'warnings', 'errors', 'lines', 'test_rate', 'status'])

def train_model():
    print("[START] Starting AI Model Training phase...")
    df = generate_historical_data()
    
    X = df[['duration', 'warnings', 'errors', 'lines', 'test_rate']]
    y = df['status']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"[PROCESS] Training Random Forest Classifier on {len(X_train)} samples...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    print("\n[METRICS] Evaluating Model Performance:")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"[SUCCESS] Accuracy: {accuracy * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["Success", "Failure"]))
    
    # Save Model
    joblib.dump(model, MODEL_PATH)
    print(f"\n[SAVED] Model saved successfully to {os.path.abspath(MODEL_PATH)}")

def predict_current_build(duration, warnings, errors, lines, test_rate):
    import sys
    if not os.path.exists(MODEL_PATH):
        print("[ERROR] Model not found! Please train the model first by running:")
        print("   python predict_failure.py train")
        return

    print(f"[PREDICT] Analyzing build: duration={duration}s, warnings={warnings}, errors={errors}, lines={lines}, test_rate={test_rate:.1f}%")
    model = joblib.load(MODEL_PATH)

    features = pd.DataFrame(
        [[duration, warnings, errors, lines, test_rate]],
        columns=['duration', 'warnings', 'errors', 'lines', 'test_rate']
    )
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0]

    # Confidence scores
    failure_confidence = probability[1] * 100   # % chance of failure
    success_confidence = probability[0] * 100   # % chance of success

    print("\n========== [ AI CONFIDENCE THRESHOLD GATE ] ==========")
    print(f"  Failure Confidence : {failure_confidence:.1f}%")
    print(f"  Success Confidence : {success_confidence:.1f}%")
    print("------------------------------------------------------")

    # ---- 3-Tier Decision Gate ----
    if prediction == 1 and failure_confidence >= 90:
        # TIER 1: Very High Failure Risk → BLOCK deployment
        print("  DECISION : [BLOCK] AUTO-BLOCKED")
        print("  REASON   : AI confidence of failure exceeds 90%.")
        print("  ACTION   : Deployment stopped. Fix errors before retrying.")
        print("======================================================\n")
        sys.exit(1)  # Fails Jenkins build immediately

    elif prediction == 1 and 60 <= failure_confidence < 90:
        # TIER 2: Moderate Risk → WARN, continue pipeline but flag it
        print("  DECISION : [WARN] MANUAL REVIEW RECOMMENDED")
        print(f"  REASON   : Failure confidence is {failure_confidence:.1f}% (60-90% range).")
        print("  ACTION   : Pipeline continues, but human review is advised before deployment.")
        print("======================================================\n")
        # Do NOT exit — pipeline continues with a warning

    else:
        # TIER 3: Low Risk → AUTO-DEPLOY
        print("  DECISION : [PASS] AUTO-DEPLOY APPROVED")
        print(f"  REASON   : Success confidence is {success_confidence:.1f}% (above threshold).")
        print("  ACTION   : Pipeline cleared for deployment to EC2.")
        print("======================================================\n")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "train":
        train_model()
    elif len(sys.argv) > 1 and sys.argv[1] == "predict":
        # python predict_failure.py predict [duration] [warnings] [errors] [lines] [test_rate]
        if len(sys.argv) >= 7:
            predict_current_build(
                float(sys.argv[2]), 
                int(sys.argv[3]), 
                int(sys.argv[4]), 
                int(sys.argv[5]), 
                float(sys.argv[6])
            )
        else:
            print("Usage: python predict_failure.py predict <duration> <warnings> <errors> <lines> <test_rate>")
            print("Example: python predict_failure.py predict 120 5 1 500 95.5")
    else:
        print("Usage:")
        print("  python predict_failure.py train    -> Trains the model and saves it.")
        print("  python predict_failure.py predict  -> Run a prediction.")
        print("\nTry running: python predict_failure.py train")
