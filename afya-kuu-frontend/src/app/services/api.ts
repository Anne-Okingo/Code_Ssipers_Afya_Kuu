// API service for communicating with the Python Flask backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface PatientData {
  // Personal Information
  phoneNumber: string;

  // Medical Assessment Data
  age: string;
  previousScreening: string;
  hpvStatus: string;
  symptoms: string;
  papSmearResult: string;
  smokingStatus: string;
  stdHistory: string;
  region: string;
  insuranceCovered: string;
  screeningTypeLast: string;
  sexualPartners: string;
  firstSexualActivityAge: string;
}

export interface PredictionRequest {
  age: string;
  ageFirstSex: string;
  sexualPartners: string;
  smoking: string;
  stdsHistory: string;
  region: string;
  insurance: string;
  hpvTest: string;
  papSmear: string;
  lastScreeningType: string;
}

export interface PredictionResponse {
  success: boolean;
  risk_prediction: number;
  risk_percentage: number;
  risk_probability: number;
  recommendation: string;
  risk_level: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  models_loaded: boolean;
}

// Transform frontend form data to the format expected by the Random Forest ML model
export function transformPatientDataToAPIFormat(patientData: PatientData): PredictionRequest {
  return {
    age: patientData.age,
    ageFirstSex: mapFirstSexualActivityAge(patientData.firstSexualActivityAge),
    sexualPartners: mapSexualPartners(patientData.sexualPartners),
    smoking: patientData.smokingStatus, // Send as 'Y' or 'N'
    stdsHistory: patientData.stdHistory, // Send as 'Y' or 'N'
    region: patientData.region, // Send as is (e.g., 'Nairobi', 'Mombasa')
    insurance: patientData.insuranceCovered, // Send as 'Y' or 'N'
    hpvTest: mapHPVStatus(patientData.hpvStatus),
    papSmear: mapPapSmearResult(patientData.papSmearResult),
    lastScreeningType: mapScreeningType(patientData.screeningTypeLast)
  };
}

// Helper functions to map frontend values to Random Forest API expected values
function mapHPVStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'positive':
      return 'POSITIVE';
    case 'negative':
      return 'NEGATIVE';
    case 'unknown':
    default:
      return 'NEGATIVE'; // Default to negative if unknown
  }
}

function mapPapSmearResult(result: string): string {
  // The Random Forest model expects 'Y' or 'N'
  switch (result) {
    case 'Y':
      return 'Y';
    case 'N':
      return 'N';
    default:
      return 'N'; // Default to N if unknown
  }
}

function mapScreeningType(type: string): string {
  // The Random Forest model expects exact values from the dataset
  switch (type) {
    case 'PAP SMEAR':
      return 'PAP SMEAR';
    case 'HPV DNA':
      return 'HPV DNA';
    case 'VIA':
      return 'VIA';
    case 'NONE':
      return 'PAP SMEAR'; // Map "never screened" to PAP SMEAR as default
    case '':
      return 'PAP SMEAR'; // Default to PAP SMEAR for empty values
    default:
      return 'PAP SMEAR'; // Default to PAP SMEAR
  }
}

function mapSexualPartners(partners: string): string {
  // Map dropdown values to numeric values expected by the model
  switch (partners) {
    case '0':
      return '0';
    case '1':
      return '1';
    case '2':
      return '2';
    case '3':
      return '3';
    case '4':
      return '4';
    case '5':
      return '5';
    case '6-10':
      return '8'; // Use middle value for range
    case '11+':
      return '15'; // Use representative value for 11+
    case '':
      return '1'; // Default to 1 if not provided
    default:
      return partners || '1'; // Return as-is or default to 1
  }
}

function mapFirstSexualActivityAge(age: string): string {
  // Map dropdown values to numeric values expected by the model
  switch (age) {
    case '12':
    case '13':
    case '14':
    case '15':
    case '16':
    case '17':
    case '18':
    case '19':
    case '20':
    case '21':
    case '22':
    case '23':
    case '24':
    case '25':
      return age;
    case '26-30':
      return '28'; // Use middle value for range
    case '31+':
      return '35'; // Use representative value for 31+
    case '':
      return '18'; // Default to 18 if not provided
    default:
      return age || '18'; // Return as-is or default to 18
  }
}

// API functions
export async function healthCheck(): Promise<HealthCheckResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

export async function predictRisk(patientData: PatientData): Promise<PredictionResponse> {
  try {
    // Transform the data to the format expected by the API
    const apiData = transformPatientDataToAPIFormat(patientData);
    
    console.log('Sending prediction request:', apiData);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`Prediction request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Prediction response:', result);

    return result;
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

// Utility function to check if the backend is available
export async function checkBackendAvailability(): Promise<boolean> {
  try {
    const health = await healthCheck();
    return health.status === 'healthy' && health.models_loaded;
  } catch (error) {
    console.error('Backend availability check failed:', error);
    return false;
  }
}
