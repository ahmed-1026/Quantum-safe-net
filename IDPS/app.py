from huggingface_hub import hf_hub_download
import joblib
from flask import Flask, request, jsonify
from flask_ngrok import run_with_ngrok
from pyngrok import ngrok
import threading
import time
import json
import pandas as pd

# Load config for NGROK
with open('config.json', 'r') as file:
    config = json.load(file)

# Set up ngrok authentication
NGROK_AUTH_TOKEN = config['NGROK_AUTH_TOKEN']
ngrok.set_auth_token(NGROK_AUTH_TOKEN)

repo_id = "M-Yaqoob/intrusion_detection_system"
model_filename = "introusion_detection_sytem.pkl"

# Download the model file from the repo
local_model_path = hf_hub_download(repo_id=repo_id, filename=model_filename)

# Load the model using joblib
model = joblib.load(local_model_path)

# Flask app initialization
app = Flask(__name__)
run_with_ngrok(app)

@app.route('/')
def hello():
    return 'Hello, World!'


def preprocess_request(data):
    """
    Preprocess user input for prediction.
    
    Args:
        data (list of dict): Input data from the user's API request.

    Returns:
        numpy.ndarray: Preprocessed data ready for prediction.
    """
    # Convert the input data to a DataFrame
    df = pd.DataFrame(data)

    # Protocol type feature mapping
    pmap = {'icmp': 0, 'tcp': 1, 'udp': 2}
    if 'protocol_type' in df.columns:
        df['protocol_type'] = df['protocol_type'].map(pmap)

    # Flag feature mapping
    fmap = {'SF': 0, 'S0': 1, 'REJ': 2, 'RSTR': 3, 'RSTO': 4, 
            'SH': 5, 'S1': 6, 'S2': 7, 'RSTOS0': 8, 'S3': 9, 'OTH': 10}
    if 'flag' in df.columns:
        df['flag'] = df['flag'].map(fmap)

    # Ensure missing mappings are filled with default values (optional)
    df.fillna(0, inplace=True)

    # Drop any non-numeric columns (if present)
    df = df.select_dtypes(include=['int64', 'float64'])

    # Convert the DataFrame to a NumPy array for model input
    return df.to_numpy()

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Parse JSON input
        data = request.get_json()

        # Preprocess the data
        input_array = preprocess_request(data)

        # Predict using the loaded model
        prediction = model.predict(input_array)

        # Return the prediction as JSON
        return jsonify({"prediction": prediction.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Run the app
def run_flask():
    app.run()

def start_ngrok():
    time.sleep(2)  # Give the Flask server some time to start
    public_url = ngrok.connect(5000)
    print('Public URL:', public_url)
    return public_url

def main():
    # Start Flask server in a new thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Start ngrok tunnel
    public_url = start_ngrok()

    try:
        flask_thread.join()
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        ngrok.disconnect(public_url)
        ngrok.kill()

if __name__ == "__main__":
    main()