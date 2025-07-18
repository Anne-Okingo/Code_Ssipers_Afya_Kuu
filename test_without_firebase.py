#!/usr/bin/env python3
"""
Test script to verify the project works without Firebase
"""

import requests
import json
import time

def test_backend():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is running")
            print(f"   Status: {data['status']}")
            print(f"   Models loaded: {data['models_loaded']}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_ml_prediction():
    """Test ML prediction endpoint"""
    try:
        test_data = {
            "age": "28",
            "ageFirstSex": "19",
            "smoking": "No",
            "stdsHistory": "No",
            "region": "nairobi",
            "insurance": "Yes",
            "hpvTest": "Negative",
            "papSmear": "Negative",
            "lastScreeningType": "Pap smear"
        }
        
        response = requests.post(
            "http://localhost:5000/predict",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data),
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ ML Prediction working")
                print(f"   Risk Level: {data['risk_level']}")
                print(f"   Risk Percentage: {data['risk_percentage']}%")
                print(f"   Recommendation: {data['recommendation']}")
                return True
            else:
                print(f"❌ Prediction failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Prediction request failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction request error: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    try:
        response = requests.get("http://localhost:3001", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def main():
    print("🧪 Testing Project Without Firebase")
    print("=" * 50)
    
    # Test backend
    backend_ok = test_backend()
    print()
    
    # Test ML functionality
    if backend_ok:
        ml_ok = test_ml_prediction()
        print()
    else:
        ml_ok = False
    
    # Test frontend
    frontend_ok = test_frontend()
    print()
    
    # Summary
    print("=" * 50)
    print("📊 Test Results:")
    print(f"   Backend API: {'✅ Working' if backend_ok else '❌ Failed'}")
    print(f"   ML Predictions: {'✅ Working' if ml_ok else '❌ Failed'}")
    print(f"   Frontend: {'✅ Accessible' if frontend_ok else '❌ Failed'}")
    
    if backend_ok and ml_ok:
        print("\n🎉 Core functionality working without Firebase!")
        print("📝 The project can run completely without Firebase authentication.")
        print("🌐 Access the app at: http://localhost:3001/risk-assessment")
    else:
        print("\n⚠️  Some components need attention. Check the logs above.")
    
    print("\n💡 Firebase is only needed for:")
    print("   - User authentication (optional)")
    print("   - Persistent data storage (uses localStorage as fallback)")
    print("   - The core ML functionality works independently!")

if __name__ == "__main__":
    main()
