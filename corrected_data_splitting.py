#!/usr/bin/env python3
"""
CORRECTED Data Splitting Pipeline - Fixes Data Leakage Issue
This script demonstrates the correct way to handle data splitting to prevent data leakage.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings('ignore')

def load_data():
    """Load the dataset"""
    print("Loading dataset...")
    try:
        data = pd.read_excel('data_final.xlsx')
        df = pd.DataFrame(data)
        print(f"Dataset loaded successfully. Shape: {df.shape}")
        return df
    except FileNotFoundError:
        print("Error: data_final.xlsx not found!")
        return None

def prepare_features_and_target(df):
    """Separate features and target"""
    target_column = 'Recommended Action_Cleaned'
    
    # Remove target and unnecessary columns
    columns_to_drop = [target_column]
    if 'Patient ID' in df.columns:
        columns_to_drop.append('Patient ID')
    if 'Unnamed: 12' in df.columns:
        columns_to_drop.append('Unnamed: 12')
    
    X = df.drop(columns=columns_to_drop)
    y = df[target_column]
    
    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"Number of unique classes: {y.nunique()}")
    
    return X, y

def correct_data_splitting_pipeline(X, y):
    """
    CORRECTED data splitting pipeline that prevents data leakage
    """
    print("\n" + "="*80)
    print("CORRECTED DATA SPLITTING PIPELINE - NO DATA LEAKAGE")
    print("="*80)
    
    # Step 1: Encode target labels for stratification
    print("\n--- Step 1: Encoding Target Labels ---")
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print(f"Original classes: {len(le.classes_)}")
    print("Class distribution:")
    class_counts = pd.Series(y_encoded).value_counts().sort_index()
    for i, count in enumerate(class_counts):
        print(f"  Class {i} ({le.classes_[i]}): {count} samples")
    
    # Step 2: FIRST perform train-test split (BEFORE any duplication)
    print("\n--- Step 2: Initial Train-Test Split (BEFORE duplication) ---")
    print("🔒 CRITICAL: Splitting BEFORE duplication to prevent data leakage!")
    
    # Check if stratification is possible
    single_instance_classes = class_counts[class_counts < 2]
    if len(single_instance_classes) > 0:
        print(f"⚠️  Warning: {len(single_instance_classes)} classes have only 1 sample.")
        print("   Cannot use stratified split. Using random split instead.")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded,
            test_size=0.2,
            random_state=42,
            stratify=None  # Cannot stratify with single-instance classes
        )
    else:
        print("✅ All classes have multiple samples. Using stratified split.")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded,
            test_size=0.2,
            random_state=42,
            stratify=y_encoded
        )
    
    print(f"Initial training set size: {len(X_train)}")
    print(f"Initial test set size: {len(X_test)}")
    
    # Step 3: Handle single-instance classes ONLY in training set
    print("\n--- Step 3: Handling Single-Instance Classes in Training Set ONLY ---")
    
    train_class_counts = pd.Series(y_train).value_counts()
    train_single_classes = train_class_counts[train_class_counts < 2].index
    
    if len(train_single_classes) > 0:
        print(f"Found {len(train_single_classes)} classes with only 1 sample in training set.")
        print("🔧 Duplicating these samples ONLY in training set (NO test set contamination)")
        
        # Find indices of single-instance classes in training set
        indices_to_duplicate = pd.Series(y_train).isin(train_single_classes)
        
        # Duplicate only the training samples
        X_train_to_duplicate = X_train[indices_to_duplicate]
        y_train_to_duplicate = y_train[indices_to_duplicate]
        
        # Add duplicates to training set
        X_train_fixed = pd.concat([X_train, X_train_to_duplicate], ignore_index=True)
        y_train_fixed = np.concatenate([y_train, y_train_to_duplicate])
        
        print(f"Training set size after duplication: {len(X_train_fixed)}")
        print(f"Test set size (unchanged): {len(X_test)}")
        
        # Verify no contamination
        print("\n🔍 Verification: Checking for data leakage...")
        train_indices = set(X_train_fixed.index)
        test_indices = set(X_test.index)
        overlap = train_indices.intersection(test_indices)
        
        if len(overlap) == 0:
            print("✅ SUCCESS: No overlap between training and test sets!")
        else:
            print(f"❌ ERROR: Found {len(overlap)} overlapping indices!")
            
    else:
        print("✅ No single-instance classes in training set. No duplication needed.")
        X_train_fixed = X_train
        y_train_fixed = y_train
    
    # Step 4: Verify final class distribution
    print("\n--- Step 4: Final Class Distribution Verification ---")
    final_train_counts = pd.Series(y_train_fixed).value_counts().sort_index()
    final_test_counts = pd.Series(y_test).value_counts().sort_index()
    
    print("Final training set class distribution:")
    for i, count in enumerate(final_train_counts):
        class_name = le.classes_[i] if i < len(le.classes_) else f"Class_{i}"
        print(f"  Class {i}: {count} samples")
    
    print("\nFinal test set class distribution:")
    for i, count in enumerate(final_test_counts):
        class_name = le.classes_[i] if i < len(le.classes_) else f"Class_{i}"
        print(f"  Class {i}: {count} samples")
    
    return X_train_fixed, X_test, y_train_fixed, y_test, le

def preprocess_features_correctly(X_train, X_test):
    """
    Correct feature preprocessing that prevents data leakage
    """
    print("\n--- Step 5: Feature Preprocessing (Leakage-Free) ---")
    
    # Identify feature types from TRAINING set only
    numeric_features = X_train.select_dtypes(include='number').columns
    categorical_features = X_train.select_dtypes(include='object').columns
    
    print(f"Numeric features: {len(numeric_features)}")
    print(f"Categorical features: {len(categorical_features)}")
    
    # One-hot encode categorical features
    if len(categorical_features) > 0:
        print("🔧 One-hot encoding categorical features...")
        
        # FIT encoder ONLY on training data
        encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        encoder.fit(X_train[categorical_features])
        
        # TRANSFORM both training and test data
        X_train_encoded = pd.DataFrame(
            encoder.transform(X_train[categorical_features]),
            columns=encoder.get_feature_names_out(categorical_features),
            index=X_train.index
        )
        X_test_encoded = pd.DataFrame(
            encoder.transform(X_test[categorical_features]),
            columns=encoder.get_feature_names_out(categorical_features),
            index=X_test.index
        )
        
        # Combine with numeric features
        X_train_processed = pd.concat([
            X_train[numeric_features].reset_index(drop=True),
            X_train_encoded.reset_index(drop=True)
        ], axis=1)
        
        X_test_processed = pd.concat([
            X_test[numeric_features].reset_index(drop=True),
            X_test_encoded.reset_index(drop=True)
        ], axis=1)
        
    else:
        print("No categorical features to encode.")
        X_train_processed = X_train
        X_test_processed = X_test
        encoder = None
    
    print(f"Processed training features shape: {X_train_processed.shape}")
    print(f"Processed test features shape: {X_test_processed.shape}")
    
    return X_train_processed, X_test_processed, encoder

def feature_selection_correctly(X_train_processed, X_test_processed, y_train):
    """
    Correct feature selection that prevents data leakage
    """
    print("\n--- Step 6: Feature Selection (Leakage-Free) ---")
    
    # Train feature selector ONLY on training data
    print("🔧 Training feature selector on training data only...")
    feature_selector = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        class_weight='balanced'
    )
    feature_selector.fit(X_train_processed, y_train)
    
    # Get feature importances
    importances = feature_selector.feature_importances_
    feature_names = X_train_processed.columns
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values(by='importance', ascending=False)
    
    print("Top 10 most important features:")
    print(importance_df.head(10))
    
    # Select features using median threshold
    selector = SelectFromModel(feature_selector, threshold='median', prefit=True)
    
    # TRANSFORM both training and test data
    X_train_final = selector.transform(X_train_processed)
    X_test_final = selector.transform(X_test_processed)
    
    print(f"Original features: {X_train_processed.shape[1]}")
    print(f"Selected features: {X_train_final.shape[1]}")
    
    return X_train_final, X_test_final, selector, importance_df

def main():
    """Main pipeline demonstrating correct data splitting"""
    print("CORRECTED DATA SPLITTING PIPELINE")
    print("Fixing Data Leakage Issues in ML Pipeline")
    print("="*80)
    
    # Load data
    df = load_data()
    if df is None:
        return
    
    # Prepare features and target
    X, y = prepare_features_and_target(df)
    
    # CORRECTED data splitting (no leakage)
    X_train, X_test, y_train, y_test, le = correct_data_splitting_pipeline(X, y)
    
    # CORRECTED feature preprocessing (no leakage)
    X_train_processed, X_test_processed, encoder = preprocess_features_correctly(X_train, X_test)
    
    # CORRECTED feature selection (no leakage)
    X_train_final, X_test_final, selector, importance_df = feature_selection_correctly(
        X_train_processed, X_test_processed, y_train
    )
    
    print("\n" + "="*80)
    print("✅ CORRECTED PIPELINE COMPLETED - NO DATA LEAKAGE!")
    print("="*80)
    print(f"Final training set shape: {X_train_final.shape}")
    print(f"Final test set shape: {X_test_final.shape}")
    print("\n🔒 Key Improvements:")
    print("  1. Train-test split BEFORE any data duplication")
    print("  2. Duplication only applied to training set")
    print("  3. All preprocessing fitted only on training data")
    print("  4. Feature selection based only on training data")
    print("  5. No test data contamination in any step")

if __name__ == "__main__":
    main()
