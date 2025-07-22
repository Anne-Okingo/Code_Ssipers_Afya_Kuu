import pandas as pd
import joblib
import numpy as np

model = joblib.load("cervical_model.pkl")
model_features = joblib.load("model_features.pkl")

def map_user_input(raw_input):
    """Map user input values to numeric equivalents"""
    
    # Handle Region - convert string to number (adjust based on your training data)
    region_value = raw_input.get("Region", "").lower().strip()
    if region_value == "mombasa":
        region_numeric = 0
    elif region_value == "kisumu":
        region_numeric = 1
    elif region_value == "nairobi":
        region_numeric = 2
    elif region_value == "nakuru":
        region_numeric = 3
    else:
        region_numeric = 0
    
    # Handle Screening Type - convert string to number (adjust based on your training data)
    screening_value = raw_input.get("Screening Type Last", "").lower().strip()
    if screening_value in ["via"]:
        screening_numeric = 0
    elif screening_value in ["pap"]:
        screening_numeric = 1
    elif screening_value in ["hpv"]:
        screening_numeric = 2
    else:
        screening_numeric = 0
    
    return {
        "Age": int(raw_input.get("Age", 25)),
        "Sexual Partners": int(raw_input.get("Sexual Partners", 1)),
        "First Sexual Activity Age": int(raw_input.get("First Sexual Activity Age", 18)),
        "HPV Test Result": 1 if raw_input.get("HPV Test Result") in ["1", "POSITIVE"] else 0,
        "Pap Smear Result": 1 if raw_input.get("Pap Smear Result") in ["1", "YES"] else 0,
        "Smoking Status": 1 if raw_input.get("Smoking Status") in ["1", "YES"] else 0,
        "STDs History": 1 if raw_input.get("STDs History") in ["1", "YES"] else 0,
        "Region": region_numeric,
        "Insurance Covered": 1 if raw_input.get("Insurance Covered") in ["1", "YES"] else 0,
        "Screening Type Last": screening_numeric
    }

def predict_from_input(user_input_dict):
    cleaned_input = map_user_input(user_input_dict)
    input_df = pd.DataFrame([cleaned_input])

    # Add missing features with defaults
    for feature in model_features:
        if feature not in input_df.columns:
            input_df[feature] = 0

    # Convert to numpy array and ensure exactly 14 features
    feature_array = input_df.values
    if feature_array.shape[1] != 14:
        # Pad with zeros to reach 14 features
        current_features = feature_array.shape[1]
        missing_features = 14 - current_features
        padding = np.zeros((feature_array.shape[0], missing_features))
        feature_array = np.concatenate([feature_array, padding], axis=1)

    # Make prediction
    prediction = model.predict(feature_array)[0]
    
    # Map prediction index to actual medical recommendations
    recommendations = {
        0: 'REPEAT PAP SMEAR IN 3 YEARS AND FOR HPV VACCINE',
        1: 'FOR HPV VACCINE AND SEXUAL EDUCATION', 
        2: 'FOR COLPOSCOPY, BIOPSY, AND CYTOLOGY',
        3: 'FOR LASER THERAPY',
        4: 'FOR COLPOSCOPY, BIOPSY, CYTOLOGY +/- TAH',
        5: 'REPEAT PAP SMEAR IN 3 YEARS',
        6: 'FOR PAP SMEAR',
        7: 'FOR ANNUAL FOLLOW-UP AND PAP SMEAR IN 3 YEARS',
        8: 'FOR HPV VACCINE, LIFESTYLE, AND SEXUAL EDUCATION',
        9: 'FOR COLPOSCOPY, CYTOLOGY, THEN LASER THERAPY',
        10: 'FOR REPEAT HPV TESTING ANNUALLY AND PAP SMEAR IN 3 YEARS',
        11: 'FOR COLPOSCOPY, BIOPSY, AND CYTOLOGY (TAH NOT RECOMMENDED)',
        12: 'FOR BIOPSY AND CYTOLOGY (TAH NOT RECOMMENDED)'
    }
    
    return recommendations.get(prediction, f"Consult healthcare provider immediately. (Code: {prediction})")