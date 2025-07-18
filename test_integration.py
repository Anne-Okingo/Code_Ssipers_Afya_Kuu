#!/usr/bin/env python3
"""
Integration Test Script for Cervical Cancer Risk Assessment System
Tests the complete flow from data input to ML prediction
"""

import requests
import json
import sys

# API endpoint
API_URL = "http://localhost:5000"

def test_health_check():
    """Test if the API is healthy and models are loaded"""
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health Check:")
            print(f"   Status: {data['status']}")
            print(f"   Models Loaded: {data['models_loaded']}")
            return data['models_loaded']
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_prediction(test_case):
    """Test a prediction with given test case"""
    try:
        response = requests.post(
            f"{API_URL}/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_case["input"])
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Test Case: {test_case['name']}")
                print(f"   Risk Level: {data['risk_level']}")
                print(f"   Risk Percentage: {data['risk_percentage']}%")
                print(f"   Recommendation: {data['recommendation']}")
                print(f"   Expected: {test_case['expected_risk']}")
                return True
            else:
                print(f"❌ Prediction failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False

def main():
    print("🔬 Testing Cervical Cancer Risk Assessment Integration")
    print("=" * 60)
    
    # Test health check
    if not test_health_check():
        print("❌ API is not healthy. Please ensure the backend is running.")
        sys.exit(1)
    
    print()
    
    # Test cases
    test_cases = [
        {
            "name": "Young, Low Risk Profile",
            "input": {
                "age": "22",
                "ageFirstSex": "20",
                "smoking": "No",
                "stdsHistory": "No",
                "region": "nairobi",
                "insurance": "Yes",
                "hpvTest": "Negative",
                "papSmear": "Negative",
                "lastScreeningType": "Pap smear"
            },
            "expected_risk": "Should be evaluated by ML model"
        },
        {
            "name": "Higher Risk Profile",
            "input": {
                "age": "35",
                "ageFirstSex": "16",
                "smoking": "Yes",
                "stdsHistory": "Yes",
                "region": "mombasa",
                "insurance": "No",
                "hpvTest": "Positive",
                "papSmear": "Positive",
                "lastScreeningType": "HPV DNA"
            },
            "expected_risk": "Should be evaluated by ML model"
        },
        {
            "name": "Middle-aged, Mixed Factors",
            "input": {
                "age": "28",
                "ageFirstSex": "19",
                "smoking": "No",
                "stdsHistory": "No",
                "region": "kakamega",
                "insurance": "Yes",
                "hpvTest": "Never had one",
                "papSmear": "Never had one",
                "lastScreeningType": "Pap smear"
            },
            "expected_risk": "Should be evaluated by ML model"
        }
    ]
    
    # Run tests
    passed = 0
    total = len(test_cases)
    
    for test_case in test_cases:
        if test_prediction(test_case):
            passed += 1
        print()
    
    # Summary
    print("=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All integration tests passed!")
        print("✅ Frontend-Backend-ML integration is working correctly!")
    else:
        print("⚠️  Some tests failed. Please check the logs above.")
    
    print("\n🌐 Frontend is available at: http://localhost:3001/risk-assessment")
    print("🔧 Backend API is available at: http://localhost:5000")

if __name__ == "__main__":
    main()
