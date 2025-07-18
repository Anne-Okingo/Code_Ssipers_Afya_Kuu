#!/usr/bin/env python3
"""
Random Forest Model Training Script
Based on the Jupyter notebook analysis that achieved 80.95% accuracy
"""

import pandas as pd
import numpy as np
import pickle
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.feature_selection import SelectFromModel
import warnings
warnings.filterwarnings('ignore')

def load_and_preprocess_data():
    """Load and preprocess the cervical cancer dataset"""
    print("Loading and preprocessing data...")
    
    # Load the dataset (adjust path as needed)
    try:
        df = pd.read_csv('cervical_cancer.csv')
    except FileNotFoundError:
        print("Error: cervical_cancer.csv not found. Please ensure the dataset is in the current directory.")
        return None, None, None, None, None, None

    print(f"Dataset shape: {df.shape}")
    print(f"Available columns: {list(df.columns)}")

    # Separate features and target
    # The target column is 'Recommended Action' based on the CSV
    target_column = 'Recommended Action'
    if target_column not in df.columns:
        print(f"Error: Target column '{target_column}' not found in dataset")
        print(f"Available columns: {list(df.columns)}")
        return None, None, None, None, None, None
    
    # Drop unnecessary columns
    columns_to_drop = [target_column, 'Patient ID', 'Unnamed: 12']
    columns_to_drop = [col for col in columns_to_drop if col in df.columns]

    X = df.drop(columns=columns_to_drop)
    y = df[target_column]

    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"Feature columns: {list(X.columns)}")
    
    # Identify categorical and numeric features
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    print(f"Categorical features: {len(categorical_features)}")
    print(f"Numeric features: {len(numeric_features)}")
    
    return X, y, categorical_features, numeric_features, df, target_column

def encode_target_and_split(X, y):
    """Encode target variable and perform train-test split"""
    print("\nEncoding target variable and splitting data...")
    
    # Label encode the target column
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Handle single-instance classes for stratification
    class_counts = pd.Series(y_encoded).value_counts()
    single_instance_classes = class_counts[class_counts < 2].index
    
    if len(single_instance_classes) > 0:
        print(f"Found {len(single_instance_classes)} single-instance classes. Duplicating them...")
        # Create a DataFrame for easier manipulation
        temp_df = pd.concat([X, pd.Series(y_encoded, name='target')], axis=1)
        
        # Duplicate single-instance classes
        for class_label in single_instance_classes:
            single_row = temp_df[temp_df['target'] == class_label]
            temp_df = pd.concat([temp_df, single_row], ignore_index=True)
        
        # Separate back into X and y
        X = temp_df.drop(columns=['target'])
        y_encoded = temp_df['target'].values
    
    # Perform train-test split (reduce test size due to small dataset)
    # With 27 classes and ~115 samples after duplication, we need a smaller test size
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded,
            test_size=0.1,  # Reduced test size
            random_state=42,
            stratify=y_encoded
        )
    except ValueError as e:
        print(f"Stratified split failed: {e}")
        print("Falling back to random split without stratification...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded,
            test_size=0.1,
            random_state=42
        )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    return X_train, X_test, y_train, y_test, le

def preprocess_features(X_train, X_test, categorical_features, numeric_features):
    """Preprocess categorical and numeric features"""
    print("\nPreprocessing features...")
    
    # One-hot encode categorical features
    if categorical_features:
        encoder = OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore')
        
        # Fit on training data and transform both train and test
        X_train_encoded = encoder.fit_transform(X_train[categorical_features])
        X_test_encoded = encoder.transform(X_test[categorical_features])
        
        # Get feature names
        encoded_feature_names = encoder.get_feature_names_out(categorical_features)
        
        # Convert to DataFrames
        X_train_encoded = pd.DataFrame(X_train_encoded, columns=encoded_feature_names)
        X_test_encoded = pd.DataFrame(X_test_encoded, columns=encoded_feature_names)
    else:
        X_train_encoded = pd.DataFrame()
        X_test_encoded = pd.DataFrame()
        encoder = None
    
    # Reset indices and combine with numeric features
    X_train_numeric_reset = X_train[numeric_features].reset_index(drop=True)
    X_test_numeric_reset = X_test[numeric_features].reset_index(drop=True)
    X_train_encoded_reset = X_train_encoded.reset_index(drop=True)
    X_test_encoded_reset = X_test_encoded.reset_index(drop=True)
    
    # Combine encoded categorical columns with numeric columns
    X_train_processed = pd.concat([X_train_numeric_reset, X_train_encoded_reset], axis=1)
    X_test_processed = pd.concat([X_test_numeric_reset, X_test_encoded_reset], axis=1)
    
    print(f"Processed training features shape: {X_train_processed.shape}")
    print(f"Processed test features shape: {X_test_processed.shape}")
    
    return X_train_processed, X_test_processed, encoder

def create_manual_weights(le):
    """Create manual class weights based on clinical importance"""
    print("\nCreating manual class weights...")
    
    # Create label mapping
    label_mapping = dict(zip(le.classes_, le.transform(le.classes_)))
    print("Available classes:", le.classes_)
    
    # Define manual weights based on clinical importance
    # Higher weight = higher penalty for misclassification
    manual_weights_dict = {}
    
    # Default weight for all classes
    for class_name in le.classes_:
        if 'REPEAT PAP SMEAR IN 3 YEARS AND FOR HPV VACCINE' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 1.0
        elif 'FOR HPV VACCINE AND SEXUAL EDUCATION' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 1.2
        elif 'FOR COLPOSCOPY, BIOPSY, AND CYTOLOGY' in class_name and 'TAH NOT RECOMMENDED' not in class_name:
            manual_weights_dict[label_mapping[class_name]] = 20.0
        elif 'FOR LASER THERAPY' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 30.0
        elif 'FOR COLPOSCOPY, BIOPSY, CYTOLOGY +/- TAH' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 25.0
        elif 'REPEAT PAP SMEAR IN 3 YEARS' in class_name and 'AND FOR HPV VACCINE' not in class_name:
            manual_weights_dict[label_mapping[class_name]] = 10.0
        elif 'FOR PAP SMEAR' in class_name and 'REPEAT' not in class_name:
            manual_weights_dict[label_mapping[class_name]] = 5.0
        elif 'FOR ANNUAL FOLLOW-UP AND PAP SMEAR IN 3 YEARS' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 20.0
        elif 'FOR HPV VACCINE, LIFESTYLE, AND SEXUAL EDUCATION' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 1.5
        elif 'FOR COLPOSCOPY, CYTOLOGY, THEN LASER THERAPY' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 30.0
        elif 'FOR REPEAT HPV TESTING ANNUALLY AND PAP SMEAR IN 3 YEARS' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 25.0
        elif 'TAH NOT RECOMMENDED' in class_name:
            manual_weights_dict[label_mapping[class_name]] = 20.0
        else:
            # Default weight for any other classes
            manual_weights_dict[label_mapping[class_name]] = 5.0
    
    print(f"Created weights for {len(manual_weights_dict)} classes")
    return manual_weights_dict

def feature_selection(X_train_processed, X_test_processed, y_train, manual_weights_dict):
    """Perform feature selection using Random Forest feature importance"""
    print("\nPerforming feature selection...")
    
    # Train a preliminary Random Forest model to get feature importances
    feature_selector_model = RandomForestClassifier(
        random_state=42,
        class_weight=manual_weights_dict
    )
    feature_selector_model.fit(X_train_processed, y_train)
    
    # Get feature importances
    importances = feature_selector_model.feature_importances_
    feature_names = X_train_processed.columns
    importance_df = pd.DataFrame({
        'feature': feature_names, 
        'importance': importances
    }).sort_values(by='importance', ascending=False)
    
    print("Top 10 most important features:")
    print(importance_df.head(10))
    
    # Select features using median threshold
    selector = SelectFromModel(feature_selector_model, threshold='median', prefit=True)
    
    # Transform datasets
    X_train_final = selector.transform(X_train_processed)
    X_test_final = selector.transform(X_test_processed)
    
    print(f"Original number of features: {X_train_processed.shape[1]}")
    print(f"Number of features selected: {X_train_final.shape[1]}")
    
    return X_train_final, X_test_final, selector, importance_df

def train_random_forest_model(X_train_final, y_train, manual_weights_dict):
    """Train the final Random Forest model"""
    print("\nTraining Random Forest model...")
    
    # Create and train the Random Forest model
    rf_model = RandomForestClassifier(
        random_state=42,
        class_weight=manual_weights_dict,
        n_estimators=100,  # You can adjust this
        max_depth=None,    # You can adjust this
        min_samples_split=2,
        min_samples_leaf=1
    )
    
    rf_model.fit(X_train_final, y_train)
    print("Random Forest model trained successfully!")
    
    return rf_model

def evaluate_model(model, X_test_final, y_test, le):
    """Evaluate the trained model"""
    print("\nEvaluating model...")
    
    # Make predictions
    y_pred = model.predict(X_test_final)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Classification report
    all_numeric_labels = le.transform(le.classes_)
    all_class_names = le.classes_
    
    report = classification_report(
        y_test, y_pred, 
        labels=all_numeric_labels,
        target_names=all_class_names,
        zero_division=0
    )
    print("\nClassification Report:")
    print(report)
    
    return accuracy, report

def save_model_and_components(model, le, encoder, selector, importance_df):
    """Save the trained model and preprocessing components"""
    print("\nSaving model and components...")
    
    # Save the Random Forest model
    joblib.dump(model, 'random_forest_model.pkl')
    print("✓ Random Forest model saved as 'random_forest_model.pkl'")
    
    # Save the label encoder
    joblib.dump(le, 'label_encoder.pkl')
    print("✓ Label encoder saved as 'label_encoder.pkl'")
    
    # Save the one-hot encoder (if exists)
    if encoder is not None:
        joblib.dump(encoder, 'onehot_encoder.pkl')
        print("✓ OneHot encoder saved as 'onehot_encoder.pkl'")
    
    # Save the feature selector
    joblib.dump(selector, 'feature_selector.pkl')
    print("✓ Feature selector saved as 'feature_selector.pkl'")
    
    # Save feature importance
    importance_df.to_csv('feature_importance.csv', index=False)
    print("✓ Feature importance saved as 'feature_importance.csv'")

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("RANDOM FOREST MODEL TRAINING PIPELINE")
    print("=" * 60)
    
    # Step 1: Load and preprocess data
    result = load_and_preprocess_data()
    if result[0] is None:
        return
    X, y, categorical_features, numeric_features, df, target_column = result
    
    # Step 2: Encode target and split data
    X_train, X_test, y_train, y_test, le = encode_target_and_split(X, y)
    
    # Step 3: Preprocess features
    X_train_processed, X_test_processed, encoder = preprocess_features(
        X_train, X_test, categorical_features, numeric_features
    )
    
    # Step 4: Create manual weights
    manual_weights_dict = create_manual_weights(le)
    
    # Step 5: Feature selection
    X_train_final, X_test_final, selector, importance_df = feature_selection(
        X_train_processed, X_test_processed, y_train, manual_weights_dict
    )
    
    # Step 6: Train Random Forest model
    rf_model = train_random_forest_model(X_train_final, y_train, manual_weights_dict)
    
    # Step 7: Evaluate model
    accuracy, report = evaluate_model(rf_model, X_test_final, y_test, le)
    
    # Step 8: Save model and components
    save_model_and_components(rf_model, le, encoder, selector, importance_df)
    
    print("\n" + "=" * 60)
    print(f"TRAINING COMPLETED! Final Accuracy: {accuracy*100:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()
