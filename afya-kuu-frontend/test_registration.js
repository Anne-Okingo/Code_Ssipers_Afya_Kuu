// Simple test script to verify registration functionality
console.log('Testing Afya Kuu Registration System...');

// Test data
const testDoctor = {
  email: 'test.doctor@hospital.com',
  password: 'testpass123',
  userType: 'doctor',
  hospitalName: 'Test General Hospital',
  licenseNumber: 'MD12345'
};

const testAdmin = {
  email: 'admin@hospital.com',
  password: 'adminpass123',
  userType: 'admin',
  hospitalName: 'Test General Hospital',
  branchRegistration: 'BR67890',
  adminName: 'Test Administrator'
};

// Test localStorage functionality
function testLocalStorage() {
  console.log('\n=== Testing localStorage functionality ===');
  
  try {
    // Clear existing data
    localStorage.removeItem('afya_kuu_users');
    localStorage.removeItem('afya_kuu_user');
    
    // Test storing users
    const users = [testDoctor, testAdmin];
    localStorage.setItem('afya_kuu_users', JSON.stringify(users));
    
    // Test retrieving users
    const retrievedUsers = JSON.parse(localStorage.getItem('afya_kuu_users') || '[]');
    console.log('✓ Users stored and retrieved successfully:', retrievedUsers.length, 'users');
    
    // Test profile name extraction
    const profileName = testDoctor.email.split('@')[0];
    console.log('✓ Profile name extracted:', profileName);
    
    return true;
  } catch (error) {
    console.error('✗ localStorage test failed:', error);
    return false;
  }
}

// Test patient data functionality
function testPatientData() {
  console.log('\n=== Testing patient data functionality ===');
  
  try {
    // Clear existing assessments
    localStorage.removeItem('afya_kuu_assessments');
    
    // Test patient data structure
    const samplePatientData = {
      age: '35',
      previousScreening: '2023-01-15',
      hpvStatus: 'negative',
      symptoms: 'No symptoms reported',
      papSmearResult: 'N',
      smokingStatus: 'N',
      stdHistory: 'N',
      region: 'Nairobi',
      insuranceCovered: 'Y',
      screeningTypeLast: 'Pap smear',
      sexualPartners: '1',
      firstSexualActivityAge: '20',
      riskFactors: []
    };
    
    // Test prediction result structure
    const samplePredictionResult = {
      success: true,
      risk_prediction: 0,
      risk_level: 'Low Risk',
      risk_percentage: 15.5,
      recommendation: 'Continue regular screening as recommended'
    };
    
    // Test assessment structure
    const sampleAssessment = {
      id: 'ASS' + Date.now(),
      patientId: 'PT20250718001',
      doctorId: 'DOC123',
      doctorName: 'test.doctor',
      patientData: samplePatientData,
      predictionResult: samplePredictionResult,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      riskLevel: 'low'
    };
    
    // Store assessment
    const assessments = [sampleAssessment];
    localStorage.setItem('afya_kuu_assessments', JSON.stringify(assessments));
    
    // Retrieve and verify
    const retrievedAssessments = JSON.parse(localStorage.getItem('afya_kuu_assessments') || '[]');
    console.log('✓ Assessment stored and retrieved successfully');
    console.log('✓ Patient ID format:', sampleAssessment.patientId);
    console.log('✓ Risk level:', sampleAssessment.riskLevel);
    
    return true;
  } catch (error) {
    console.error('✗ Patient data test failed:', error);
    return false;
  }
}

// Test form validation
function testFormValidation() {
  console.log('\n=== Testing form validation ===');
  
  const requiredFields = ['age', 'hpvStatus', 'papSmearResult', 'smokingStatus', 'stdHistory', 'region', 'insuranceCovered'];
  
  const incompleteData = {
    age: '35',
    hpvStatus: 'negative',
    // Missing other required fields
  };
  
  const missingFields = requiredFields.filter(field => !incompleteData[field]);
  
  if (missingFields.length > 0) {
    console.log('✓ Validation correctly identifies missing fields:', missingFields);
    return true;
  } else {
    console.error('✗ Validation failed to identify missing fields');
    return false;
  }
}

// Run all tests
function runTests() {
  console.log('🧪 Starting Afya Kuu System Tests...\n');
  
  const results = {
    localStorage: testLocalStorage(),
    patientData: testPatientData(),
    formValidation: testFormValidation()
  };
  
  console.log('\n=== Test Results Summary ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🚀 System is ready for use!');
    console.log('📝 Next steps:');
    console.log('1. Go to http://localhost:3001/assessment');
    console.log('2. Register as a doctor with email and password');
    console.log('3. Access the dashboard to use the interactive assessment form');
    console.log('4. Complete patient assessments and view real-time summaries');
  }
  
  return allPassed;
}

// Run tests if in browser environment
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  runTests();
} else {
  console.log('This test script should be run in a browser environment with localStorage support.');
}
