// Patient Records Management Service for Afya Kuu Platform

export interface PatientRecord {
  id: string;
  patientId: string;
  personalInfo: {
    phoneNumber: string;
    age: number;
    dateOfBirth: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  medicalHistory: {
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
    riskFactors: string[];
  };
  assessmentResults: {
    riskLevel: string;
    riskPercentage: number;
    riskProbability: number;
    recommendations: string;
    assessmentDate: string;
    assessedBy: string; // Doctor ID
  };
  followUp: {
    nextAppointment?: string;
    followUpInstructions?: string;
    recommendedTests?: string[];
    testCosts?: number;
    status: 'pending' | 'scheduled' | 'completed' | 'overdue';
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Doctor ID
}

export interface PatientSummary {
  id: string;
  patientId: string;
  phoneNumber: string;
  age: number;
  lastAssessment: string;
  riskLevel: string;
  status: string;
  followUp: {
    nextAppointment?: string;
    status: string;
  };
}

// Local storage keys
const PATIENT_RECORDS_KEY = 'afya_kuu_patient_records';
const PATIENT_COUNTER_KEY = 'afya_kuu_patient_counter';

// Get all patient records for a doctor
export function getPatientRecords(doctorId: string): PatientRecord[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(PATIENT_RECORDS_KEY);
  const allRecords: PatientRecord[] = stored ? JSON.parse(stored) : [];
  
  // Return records created by this doctor
  return allRecords.filter(record => record.createdBy === doctorId);
}

// Get patient record by ID
export function getPatientRecord(patientId: string): PatientRecord | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(PATIENT_RECORDS_KEY);
  const allRecords: PatientRecord[] = stored ? JSON.parse(stored) : [];
  
  return allRecords.find(record => record.patientId === patientId) || null;
}

// Save new patient record
export function savePatientRecord(record: Omit<PatientRecord, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): string {
  try {
    const stored = localStorage.getItem(PATIENT_RECORDS_KEY);
    const allRecords: PatientRecord[] = stored ? JSON.parse(stored) : [];
    
    // Generate patient ID
    const patientId = generatePatientId();
    
    const newRecord: PatientRecord = {
      ...record,
      id: generateId(),
      patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allRecords.push(newRecord);
    localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(allRecords));
    
    return patientId;
  } catch (error) {
    console.error('Error saving patient record:', error);
    throw new Error('Failed to save patient record');
  }
}

// Update patient record
export function updatePatientRecord(patientId: string, updates: Partial<PatientRecord>): boolean {
  try {
    const stored = localStorage.getItem(PATIENT_RECORDS_KEY);
    const allRecords: PatientRecord[] = stored ? JSON.parse(stored) : [];
    
    const recordIndex = allRecords.findIndex(record => record.patientId === patientId);
    if (recordIndex === -1) return false;
    
    allRecords[recordIndex] = {
      ...allRecords[recordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(allRecords));
    return true;
  } catch (error) {
    console.error('Error updating patient record:', error);
    return false;
  }
}

// Get patient summaries for dashboard
export function getPatientSummaries(doctorId: string): PatientSummary[] {
  const records = getPatientRecords(doctorId);
  
  return records.map(record => ({
    id: record.id,
    patientId: record.patientId,
    phoneNumber: record.personalInfo.phoneNumber,
    age: record.personalInfo.age,
    lastAssessment: record.assessmentResults.assessmentDate,
    riskLevel: record.assessmentResults.riskLevel,
    status: record.followUp.status,
    followUp: {
      nextAppointment: record.followUp.nextAppointment,
      status: record.followUp.status
    }
  }));
}

// Search patient records
export function searchPatientRecords(doctorId: string, query: string): PatientRecord[] {
  const records = getPatientRecords(doctorId);
  const lowercaseQuery = query.toLowerCase();
  
  return records.filter(record =>
    record.patientId.toLowerCase().includes(lowercaseQuery) ||
    record.personalInfo.phoneNumber.includes(query)
  );
}

// Get patients by risk level
export function getPatientsByRiskLevel(doctorId: string, riskLevel: string): PatientRecord[] {
  const records = getPatientRecords(doctorId);
  return records.filter(record => record.assessmentResults.riskLevel === riskLevel);
}

// Get patients needing follow-up
export function getPatientsNeedingFollowUp(doctorId: string): PatientRecord[] {
  const records = getPatientRecords(doctorId);
  const today = new Date();
  
  return records.filter(record => {
    if (record.followUp.status === 'overdue') return true;
    
    if (record.followUp.nextAppointment) {
      const appointmentDate = new Date(record.followUp.nextAppointment);
      return appointmentDate <= today && record.followUp.status !== 'completed';
    }
    
    return false;
  });
}

// Get patient statistics for doctor
export function getPatientStatistics(doctorId: string) {
  const records = getPatientRecords(doctorId);
  
  const stats = {
    totalPatients: records.length,
    highRisk: records.filter(r => r.assessmentResults.riskLevel === 'HIGH').length,
    mediumRisk: records.filter(r => r.assessmentResults.riskLevel === 'MEDIUM').length,
    lowRisk: records.filter(r => r.assessmentResults.riskLevel === 'LOW').length,
    needingFollowUp: getPatientsNeedingFollowUp(doctorId).length,
    assessmentsThisMonth: records.filter(r => {
      const assessmentDate = new Date(r.assessmentResults.assessmentDate);
      const thisMonth = new Date();
      return assessmentDate.getMonth() === thisMonth.getMonth() && 
             assessmentDate.getFullYear() === thisMonth.getFullYear();
    }).length
  };
  
  return stats;
}

// Helper functions
function generateId(): string {
  return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generatePatientId(): string {
  const counter = parseInt(localStorage.getItem(PATIENT_COUNTER_KEY) || '0') + 1;
  localStorage.setItem(PATIENT_COUNTER_KEY, counter.toString());
  
  const year = new Date().getFullYear();
  const paddedCounter = counter.toString().padStart(4, '0');
  
  return `AK${year}${paddedCounter}`;
}

// Initialize with sample data
export function initializeSamplePatientRecords(doctorId: string) {
  const records = getPatientRecords(doctorId);
  if (records.length === 0) {
    const sampleRecords = [
      {
        personalInfo: {
          phoneNumber: '+254712345678',
          age: 39,
          dateOfBirth: '1985-03-15',
          address: 'Nairobi, Kenya',
          emergencyContact: 'Emergency Contact',
          emergencyPhone: '+254723456789'
        },
        medicalHistory: {
          previousScreening: 'Y',
          hpvStatus: 'POSITIVE',
          symptoms: 'Irregular bleeding',
          papSmearResult: 'ABNORMAL',
          smokingStatus: 'N',
          stdHistory: 'N',
          region: 'Nairobi',
          insuranceCovered: 'Y',
          screeningTypeLast: 'PAP SMEAR',
          sexualPartners: '2',
          firstSexualActivityAge: '18',
          riskFactors: ['HPV Positive', 'Abnormal Pap Smear']
        },
        assessmentResults: {
          riskLevel: 'HIGH',
          riskPercentage: 85,
          riskProbability: 0.85,
          recommendations: 'IMMEDIATE COLPOSCOPY AND BIOPSY REQUIRED',
          assessmentDate: new Date().toISOString(),
          assessedBy: doctorId
        },
        followUp: {
          nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          followUpInstructions: 'Schedule colposcopy and cervical biopsy within 1 week',
          recommendedTests: ['colposcopy', 'cervical_biopsy', 'hpv_test'],
          testCosts: 3700, // KES 1,500 + 1,000 + 1,200 (updated MOH rates)
          status: 'scheduled' as const
        },
        createdBy: doctorId
      },
      {
        personalInfo: {
          phoneNumber: '+254734567890',
          age: 32,
          dateOfBirth: '1992-07-22',
          address: 'Kiambu, Kenya',
          emergencyContact: 'Emergency Contact',
          emergencyPhone: '+254745678901'
        },
        medicalHistory: {
          previousScreening: 'Y',
          hpvStatus: 'NEGATIVE',
          symptoms: 'None',
          papSmearResult: 'NORMAL',
          smokingStatus: 'N',
          stdHistory: 'N',
          region: 'Central',
          insuranceCovered: 'Y',
          screeningTypeLast: 'HPV TEST',
          sexualPartners: '1',
          firstSexualActivityAge: '22',
          riskFactors: []
        },
        assessmentResults: {
          riskLevel: 'LOW',
          riskPercentage: 15,
          riskProbability: 0.15,
          recommendations: 'CONTINUE ROUTINE SCREENING',
          assessmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assessedBy: doctorId
        },
        followUp: {
          nextAppointment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          followUpInstructions: 'Routine screening in 1 year - VIA screening recommended',
          recommendedTests: ['via_screening', 'follow_up_pap'],
          testCosts: 850, // KES 50 + 800 (updated MOH rates)
          status: 'scheduled' as const
        },
        createdBy: doctorId
      }
    ];
    
    sampleRecords.forEach(record => savePatientRecord(record));
  }
}
