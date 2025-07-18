from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import traceback

app = Flask(__name__)
CORS(app)

# Load the models
try:
    risk_model = joblib.load('risk_prediction_model.pkl')
    rec_model = joblib.load('recommendation_model.pkl')
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")
    risk_model = None
    rec_model = None

def transform_frontend_data_to_model_format(data):
    """Transform frontend form data to the format expected by the ML models"""
    transformed = {}

    # Map frontend field names to model expected names
    field_mapping = {
        'age': 'Age',
        'ageFirstSex': 'First Sexual Activity Age',
        'smoking': 'Smoking Status',
        'stdsHistory': 'STDs History',
        'region': 'Region',
        'insurance': 'Insurance Covered',
        'hpvTest': 'HPV Test Result',
        'papSmear': 'Pap Smear Result',
        'lastScreeningType': 'Screening Type Last'
    }

    # Transform the data
    for frontend_key, model_key in field_mapping.items():
        if frontend_key in data:
            transformed[model_key] = data[frontend_key]

    # Handle numeric fields
    if 'Age' in transformed:
        transformed['Age'] = int(transformed['Age'])
    if 'First Sexual Activity Age' in transformed:
        transformed['First Sexual Activity Age'] = int(transformed['First Sexual Activity Age'])

    return transformed

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not risk_model or not rec_model:
            return jsonify({'error': 'Models not loaded properly'}), 500

        if not request.json:
            return jsonify({'error': 'No data provided'}), 400

        data = request.json
        print(f"Received data: {data}")

        # Transform frontend data to model format
        transformed_data = transform_frontend_data_to_model_format(data)
        print(f"Transformed data: {transformed_data}")

        patient_df = pd.DataFrame([transformed_data])

        # One-hot encode the patient data
        categorical_columns = ['HPV Test Result', 'Pap Smear Result', 'Smoking Status',
                             'STDs History', 'Region', 'Insurance Covered', 'Screening Type Last']

        # Only encode columns that exist in the data
        columns_to_encode = [col for col in categorical_columns if col in patient_df.columns]

        if columns_to_encode:
            patient_encoded = pd.get_dummies(patient_df, columns=columns_to_encode)
        else:
            patient_encoded = patient_df.copy()

        # Ensure all columns from training are present
        expected_columns = risk_model.feature_names_in_
        for col in expected_columns:
            if col not in patient_encoded.columns:
                patient_encoded[col] = 0

        # Reorder columns to match training
        patient_encoded = patient_encoded[expected_columns]

        print(f"Final encoded data shape: {patient_encoded.shape}")
        print(f"Expected columns: {len(expected_columns)}")

        # Make predictions
        risk_pred = risk_model.predict(patient_encoded)[0]
        rec_pred = rec_model.predict(patient_encoded)[0]

        # Get prediction probabilities for risk assessment
        risk_proba = risk_model.predict_proba(patient_encoded)[0]

        # The model returns "High Risk" or "Low Risk" as strings
        risk_level = str(risk_pred)
        risk_numeric = 1 if 'High' in risk_level else 0

        # Calculate risk percentage (0-100) based on probability
        # For display purposes, we'll use the confidence of the prediction
        risk_percentage = int(max(risk_proba) * 100)

        # If it's low risk, we want to show a lower percentage
        if 'Low' in risk_level:
            risk_percentage = min(risk_percentage, 30)  # Cap low risk at 30%
        else:
            risk_percentage = max(risk_percentage, 60)  # High risk starts at 60%

        return jsonify({
            'success': True,
            'risk_prediction': risk_numeric,
            'risk_percentage': risk_percentage,
            'risk_probability': float(max(risk_proba)),
            'recommendation': str(rec_pred),
            'risk_level': risk_level
        })

    except Exception as e:
        print(f"Error in prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': risk_model is not None and rec_model is not None
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Cervical Cancer Risk Assessment API',
        'endpoints': {
            '/predict': 'POST - Make risk predictions',
            '/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
