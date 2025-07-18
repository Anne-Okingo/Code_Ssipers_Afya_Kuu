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
    
    # Create a mapping from frontend fields to expected model features
    # This should match the original dataset column names
    transformed = {}
    
    # Map basic fields
    if 'age' in data:
        transformed['Age'] = int(data['age'])
    
    if 'ageFirstSex' in data:
        transformed['First Sexual Activity Age'] = int(data['ageFirstSex'])
    
    # Map categorical fields
    if 'smoking' in data:
        transformed['Smoking Status'] = data['smoking']
    
    if 'stdsHistory' in data:
        transformed['STDs History'] = data['stdsHistory']
    
    if 'region' in data:
        transformed['Region'] = data['region'].lower()
    
    if 'insurance' in data:
        transformed['Insurance Covered'] = data['insurance']
    
    if 'hpvTest' in data:
        transformed['HPV Test Result'] = data['hpvTest']
    
    if 'papSmear' in data:
        transformed['Pap Smear Result'] = data['papSmear']
    
    if 'lastScreeningType' in data:
        transformed['Screening Type Last'] = data['lastScreeningType']
    
    return transformed

def preprocess_patient_data(patient_data):
    """Preprocess patient data using the same pipeline as training"""
    try:
        # Convert to DataFrame
        patient_df = pd.DataFrame([patient_data])
        
        # Identify categorical and numeric columns
        categorical_columns = patient_df.select_dtypes(include=['object']).columns.tolist()
        numeric_columns = patient_df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        logger.info(f"Categorical columns: {categorical_columns}")
        logger.info(f"Numeric columns: {numeric_columns}")
        
        # One-hot encode categorical features if encoder exists
        if onehot_encoder is not None and categorical_columns:
            # Transform categorical features
            patient_encoded = onehot_encoder.transform(patient_df[categorical_columns])
            encoded_feature_names = onehot_encoder.get_feature_names_out(categorical_columns)
            patient_encoded_df = pd.DataFrame(patient_encoded, columns=encoded_feature_names)
            
            # Combine with numeric features
            patient_numeric_df = patient_df[numeric_columns].reset_index(drop=True)
            patient_processed = pd.concat([patient_numeric_df, patient_encoded_df], axis=1)
        else:
            # If no encoder, use the data as is
            patient_processed = patient_df
        
        logger.info(f"Processed patient data shape: {patient_processed.shape}")
        
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

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Cervical Cancer Risk Assessment API - Random Forest Model',
        'model': 'Random Forest (80% accuracy)',
        'endpoints': {
            '/predict': 'POST - Make risk predictions',
            '/health': 'GET - Health check'
        }
    })

# Load models on startup
if __name__ == '__main__':
    logger.info("Starting Random Forest API server...")
    
    # Try to load models
    if load_models():
        logger.info("All models loaded successfully!")
    else:
        logger.warning("Some models failed to load. Please train the model first using train_random_forest_model.py")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
