import numpy as np
from sklearn.linear_model import LogisticRegression
import json
import sys

def main():
    # Example Training logic (simplified)
    # Features: [failed_logins, traffic_spike, suspicious_ips]
    X = np.array([
        [2, 10, 1],
        [5, 20, 3],
        [10, 50, 7],
        [3, 15, 2],
        [12, 70, 8]
    ])
    y = np.array([0, 0, 1, 0, 1])

    model = LogisticRegression()
    model.fit(X, y)

    # Read input data from command line argument
    try:
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
            # input_data expected format: [failed_logins, traffic_spike, suspicious_ips]
            current_state = np.array([input_data])
            
            # Predict
            prob = model.predict_proba(current_state)[0][1]
            
            # Output JSON for Node backend to consume
            result = {
                "risk_score": round(prob * 100, 2),
                "status": "CRITICAL" if prob > 0.7 else "WARNING" if prob > 0.4 else "HEALTHY"
            }
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "No input data provided"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
