from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables to store loaded models and preprocessors
random_forest_model = None
label_encoder = None
onehot_encoder = None
feature_selector = None

def load_models():
    """Load the trained Random Forest model and preprocessors"""
    global random_forest_model, label_encoder, onehot_encoder, feature_selector
    
    try:
        # Load the Random Forest model
        random_forest_model = joblib.load('random_forest_model.pkl')
        logger.info("Random Forest model loaded successfully")
        
        # Load the label encoder
        label_encoder = joblib.load('label_encoder.pkl')
        logger.info("Label encoder loaded successfully")
        
        # Load the OneHot encoder
        try:
            onehot_encoder = joblib.load('onehot_encoder.pkl')
            logger.info("OneHot encoder loaded successfully")
        except FileNotFoundError:
            logger.warning("OneHot encoder not found")
            onehot_encoder = None
        
        # Load the feature selector
        feature_selector = joblib.load('feature_selector.pkl')
        logger.info("Feature selector loaded successfully")
            
        return True
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        return False

def transform_frontend_data_to_model_format(data):
    """Transform frontend form data to the format expected by the Random Forest model"""

    # Create a DataFrame with the exact column order from the original dataset
    # Order: Age, Sexual Partners, First Sexual Activity Age, HPV Test Result,
    #        Pap Smear Result, Smoking Status, STDs History, Region,
    #        Insrance Covered, Screening Type Last

    transformed = {}

    # Numeric fields (in exact order)
    transformed['Age'] = int(data.get('age', 25))
    transformed['Sexual Partners'] = int(data.get('sexualPartners', 1))
    transformed['First Sexual Activity Age'] = int(data.get('ageFirstSex', 18))

    # Categorical fields (in exact order)
    transformed['HPV Test Result'] = data.get('hpvTest', 'NEGATIVE').upper()
    transformed['Pap Smear Result'] = data.get('papSmear', 'N')
    transformed['Smoking Status'] = data.get('smoking', 'N')
    transformed['STDs History'] = data.get('stdsHistory', 'N')
    transformed['Region'] = data.get('region', 'Nairobi')
    # Note: the CSV has a typo "Insrance Covered" instead of "Insurance Covered"
    transformed['Insrance Covered'] = data.get('insurance', 'Y')
    transformed['Screening Type Last'] = data.get('lastScreeningType', 'PAP SMEAR')

    return transformed

def preprocess_patient_data(patient_data):
    """Preprocess patient data using the same pipeline as training"""
    try:
        # Convert to DataFrame with exact column order from training
        patient_df = pd.DataFrame([patient_data])

        # Define the exact column order used during training
        # Numeric columns first, then categorical columns in the same order
        numeric_columns = ['Age', 'Sexual Partners', 'First Sexual Activity Age']
        categorical_columns = ['HPV Test Result', 'Pap Smear Result', 'Smoking Status',
                             'STDs History', 'Region', 'Insrance Covered', 'Screening Type Last']

        logger.info(f"Patient data columns: {list(patient_df.columns)}")
        logger.info(f"Expected numeric columns: {numeric_columns}")
        logger.info(f"Expected categorical columns: {categorical_columns}")

        # Ensure all expected columns are present
        for col in numeric_columns + categorical_columns:
            if col not in patient_df.columns:
                logger.error(f"Missing column: {col}")
                raise ValueError(f"Missing required column: {col}")

        # One-hot encode categorical features if encoder exists
        if onehot_encoder is not None and categorical_columns:
            # Select categorical columns in the exact order used during training
            categorical_data = patient_df[categorical_columns]
            logger.info(f"Categorical data shape: {categorical_data.shape}")
            logger.info(f"Categorical data:\n{categorical_data}")

            # Transform categorical features
            patient_encoded = onehot_encoder.transform(categorical_data)
            encoded_feature_names = onehot_encoder.get_feature_names_out(categorical_columns)
            patient_encoded_df = pd.DataFrame(patient_encoded, columns=encoded_feature_names)

            # Combine with numeric features in the correct order
            patient_numeric_df = patient_df[numeric_columns].reset_index(drop=True)
            patient_processed = pd.concat([patient_numeric_df, patient_encoded_df], axis=1)
        else:
            # If no encoder, use the data as is
            patient_processed = patient_df[numeric_columns + categorical_columns]

        logger.info(f"Processed patient data shape: {patient_processed.shape}")
        logger.info(f"Processed columns: {list(patient_processed.columns)}")

        # Apply feature selection if selector exists
        if feature_selector is not None:
            patient_final = feature_selector.transform(patient_processed)
            logger.info(f"Final patient data shape after feature selection: {patient_final.shape}")
        else:
            patient_final = patient_processed.values

        return patient_final

    except Exception as e:
        logger.error(f"Error in preprocessing: {str(e)}")
        raise

def get_risk_level_and_recommendation(prediction_class):
    """Convert model prediction to risk level and recommendation"""
    
    # Decode the prediction using label encoder
    if label_encoder is not None:
        try:
            recommendation = label_encoder.inverse_transform([prediction_class])[0]
        except:
            recommendation = f"Class {prediction_class}"
    else:
        recommendation = f"Class {prediction_class}"
    
    # Determine risk level based on recommendation
    high_risk_keywords = [
        'LASER THERAPY', 'COLPOSCOPY', 'BIOPSY', 'CYTOLOGY', 'TAH',
        'ANNUAL FOLLOW-UP', 'REPEAT HPV TESTING'
    ]
    
    is_high_risk = any(keyword in recommendation.upper() for keyword in high_risk_keywords)
    
    if is_high_risk:
        risk_level = "High Risk"
        risk_numeric = 1
        risk_percentage = np.random.randint(70, 95)  # High risk range
    else:
        risk_level = "Low Risk"
        risk_numeric = 0
        risk_percentage = np.random.randint(5, 30)   # Low risk range
    
    return risk_level, risk_numeric, risk_percentage, recommendation

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not random_forest_model:
            return jsonify({'error': 'Random Forest model not loaded properly'}), 500

        if not request.json:
            return jsonify({'error': 'No data provided'}), 400

        data = request.json
        logger.info(f"Received data: {data}")

        # Transform frontend data to model format
        transformed_data = transform_frontend_data_to_model_format(data)
        logger.info(f"Transformed data: {transformed_data}")

        # Preprocess the patient data
        patient_processed = preprocess_patient_data(transformed_data)

        # Make prediction
        prediction = random_forest_model.predict(patient_processed)[0]
        prediction_proba = random_forest_model.predict_proba(patient_processed)[0]
        
        logger.info(f"Raw prediction: {prediction}")
        logger.info(f"Prediction probabilities: {prediction_proba}")

        # Get risk level and recommendation
        risk_level, risk_numeric, risk_percentage, recommendation = get_risk_level_and_recommendation(prediction)
        
        # Calculate confidence (max probability)
        confidence = float(np.max(prediction_proba))

        return jsonify({
            'success': True,
            'risk_prediction': risk_numeric,
            'risk_percentage': risk_percentage,
            'risk_probability': confidence,
            'recommendation': recommendation,
            'risk_level': risk_level
        })

    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    models_loaded = (random_forest_model is not None and
                    label_encoder is not None and
                    feature_selector is not None)

    return jsonify({
        'status': 'healthy' if models_loaded else 'unhealthy',
        'models_loaded': models_loaded,
        'components': {
            'random_forest_model': random_forest_model is not None,
            'label_encoder': label_encoder is not None,
            'onehot_encoder': onehot_encoder is not None,
            'feature_selector': feature_selector is not None
        }
    })

@app.route('/healthz', methods=['GET'])
def health_check_render():
    """Health check endpoint for Render (uses /healthz)"""
    return health_check()

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Cervical Cancer Risk Assessment API - Random Forest Model',
        'model': 'Random Forest (50% accuracy on small dataset)',
        'endpoints': {
            '/predict': 'POST - Make risk predictions',
            '/health': 'GET - Health check'
        }
    })

# Load models on startup
if __name__ == '__main__':
    import os

    logger.info("Starting Afya Kuu API server...")

    # Try to load models
    if load_models():
        logger.info("All models loaded successfully!")
    else:
        logger.warning("Some models failed to load. Please train the model first using train_random_forest_model.py")

    # Get port from environment variable (for Render deployment)
    port = int(os.environ.get('PORT', 5001))
    debug_mode = os.environ.get('FLASK_ENV', 'development') != 'production'

    logger.info(f"Starting server on port {port}")
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
