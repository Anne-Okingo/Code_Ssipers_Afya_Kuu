// Cervical Cancer Results and Staging Service for Afya Kuu Platform

export interface CervicalCancerResult {
  id: string;
  patientId: string;
  doctorId: string;
  testDate: string;
  testType: 'pap_smear' | 'hpv_test' | 'colposcopy' | 'biopsy' | 'imaging';
  
  // Test Results
  result: 'normal' | 'abnormal' | 'positive' | 'negative' | 'inconclusive';
  details: string;
  
  // Staging Information (if cancer is confirmed)
  cancerConfirmed: boolean;
  stage?: 'stage_0' | 'stage_1a' | 'stage_1b' | 'stage_2a' | 'stage_2b' | 'stage_3a' | 'stage_3b' | 'stage_4a' | 'stage_4b';
  stageDescription?: string;
  
  // Clinical Findings
  clinicalFindings: {
    lesionSize?: string;
    lesionLocation?: string;
    lymphNodeInvolvement?: boolean;
    parametrialInvolvement?: boolean;
    vaginalInvolvement?: boolean;
    bladderInvolvement?: boolean;
    rectalInvolvement?: boolean;
    distantMetastasis?: boolean;
  };
  
  // Treatment Recommendations
  treatmentPlan: {
    primaryTreatment: string;
    additionalTreatments: string[];
    followUpSchedule: string;
    referralRequired: boolean;
    referralTo?: string;
    urgency: 'routine' | 'urgent' | 'emergency';
  };
  
  // Additional Information
  pathologyReport?: string;
  radiologyReport?: string;
  notes: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface StagingCriteria {
  stage: string;
  description: string;
  characteristics: string[];
  treatment: string[];
  prognosis: string;
}

// Local storage key
const CANCER_RESULTS_KEY = 'afya_kuu_cancer_results';

// Staging criteria reference
export const STAGING_CRITERIA: Record<string, StagingCriteria> = {
  stage_0: {
    stage: 'Stage 0 (Carcinoma in Situ)',
    description: 'Abnormal cells are found only in the innermost lining of the cervix',
    characteristics: [
      'Pre-cancerous cells confined to surface layer',
      'No invasion into deeper tissues',
      'Also called cervical intraepithelial neoplasia (CIN) Grade 3'
    ],
    treatment: [
      'LEEP (Loop Electrosurgical Excision Procedure)',
      'Cone biopsy',
      'Cryotherapy',
      'Laser therapy'
    ],
    prognosis: 'Excellent - nearly 100% cure rate with proper treatment'
  },
  stage_1a: {
    stage: 'Stage IA',
    description: 'Very small amount of cancer that can only be seen under a microscope',
    characteristics: [
      'Invasion ≤ 3mm deep and ≤ 7mm wide',
      'No lymph node involvement',
      'Microscopic invasion only'
    ],
    treatment: [
      'Simple hysterectomy',
      'Cone biopsy (for fertility preservation)',
      'Trachelectomy (radical cervical removal)'
    ],
    prognosis: 'Excellent - 95-99% 5-year survival rate'
  },
  stage_1b: {
    stage: 'Stage IB',
    description: 'Cancer is larger but still confined to the cervix',
    characteristics: [
      'Invasion > 3mm deep or > 7mm wide',
      'Visible lesion confined to cervix',
      'No parametrial involvement'
    ],
    treatment: [
      'Radical hysterectomy with lymph node dissection',
      'Radiation therapy with chemotherapy',
      'Trachelectomy (for fertility preservation in selected cases)'
    ],
    prognosis: 'Good - 85-95% 5-year survival rate'
  },
  stage_2a: {
    stage: 'Stage IIA',
    description: 'Cancer has spread beyond the cervix to the upper vagina',
    characteristics: [
      'Extension to upper 2/3 of vagina',
      'No parametrial involvement',
      'No lower vaginal involvement'
    ],
    treatment: [
      'Radical hysterectomy with lymph node dissection',
      'Concurrent chemoradiation therapy',
      'External beam radiation + brachytherapy'
    ],
    prognosis: 'Good - 75-85% 5-year survival rate'
  },
  stage_2b: {
    stage: 'Stage IIB',
    description: 'Cancer has spread to the parametrial tissues',
    characteristics: [
      'Parametrial involvement',
      'May involve upper vagina',
      'No pelvic wall involvement'
    ],
    treatment: [
      'Concurrent chemoradiation therapy',
      'External beam radiation + brachytherapy',
      'Cisplatin-based chemotherapy'
    ],
    prognosis: 'Moderate - 65-75% 5-year survival rate'
  },
  stage_3a: {
    stage: 'Stage IIIA',
    description: 'Cancer has spread to the lower third of the vagina',
    characteristics: [
      'Extension to lower 1/3 of vagina',
      'May have parametrial involvement',
      'No pelvic wall involvement'
    ],
    treatment: [
      'Concurrent chemoradiation therapy',
      'External beam radiation + brachytherapy',
      'Cisplatin-based chemotherapy'
    ],
    prognosis: 'Moderate - 45-55% 5-year survival rate'
  },
  stage_3b: {
    stage: 'Stage IIIB',
    description: 'Cancer has spread to the pelvic wall or caused kidney problems',
    characteristics: [
      'Extension to pelvic wall',
      'Hydronephrosis or non-functioning kidney',
      'May have positive pelvic lymph nodes'
    ],
    treatment: [
      'Concurrent chemoradiation therapy',
      'External beam radiation + brachytherapy',
      'Palliative care if needed'
    ],
    prognosis: 'Guarded - 35-45% 5-year survival rate'
  },
  stage_4a: {
    stage: 'Stage IVA',
    description: 'Cancer has spread to nearby organs',
    characteristics: [
      'Extension to bladder or rectum',
      'Involvement of pelvic organs',
      'No distant metastasis'
    ],
    treatment: [
      'Concurrent chemoradiation therapy',
      'Palliative surgery if needed',
      'Supportive care'
    ],
    prognosis: 'Poor - 15-25% 5-year survival rate'
  },
  stage_4b: {
    stage: 'Stage IVB',
    description: 'Cancer has spread to distant parts of the body',
    characteristics: [
      'Distant metastasis',
      'Involvement of distant organs',
      'Advanced disease'
    ],
    treatment: [
      'Palliative chemotherapy',
      'Radiation therapy for symptom control',
      'Supportive and palliative care'
    ],
    prognosis: 'Poor - 5-15% 5-year survival rate'
  }
};

// Get all cancer results for a doctor
export function getCancerResults(doctorId: string): CervicalCancerResult[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(CANCER_RESULTS_KEY);
  const allResults: CervicalCancerResult[] = stored ? JSON.parse(stored) : [];
  
  return allResults.filter(result => result.doctorId === doctorId);
}

// Get cancer results for a specific patient
export function getPatientCancerResults(patientId: string): CervicalCancerResult[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(CANCER_RESULTS_KEY);
  const allResults: CervicalCancerResult[] = stored ? JSON.parse(stored) : [];
  
  return allResults.filter(result => result.patientId === patientId);
}

// Save new cancer result
export function saveCancerResult(result: Omit<CervicalCancerResult, 'id' | 'createdAt' | 'updatedAt'>): string {
  try {
    const stored = localStorage.getItem(CANCER_RESULTS_KEY);
    const allResults: CervicalCancerResult[] = stored ? JSON.parse(stored) : [];
    
    const newResult: CervicalCancerResult = {
      ...result,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allResults.push(newResult);
    localStorage.setItem(CANCER_RESULTS_KEY, JSON.stringify(allResults));
    
    return newResult.id;
  } catch (error) {
    console.error('Error saving cancer result:', error);
    throw new Error('Failed to save cancer result');
  }
}

// Update cancer result
export function updateCancerResult(resultId: string, updates: Partial<CervicalCancerResult>): boolean {
  try {
    const stored = localStorage.getItem(CANCER_RESULTS_KEY);
    const allResults: CervicalCancerResult[] = stored ? JSON.parse(stored) : [];
    
    const resultIndex = allResults.findIndex(result => result.id === resultId);
    if (resultIndex === -1) return false;
    
    allResults[resultIndex] = {
      ...allResults[resultIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(CANCER_RESULTS_KEY, JSON.stringify(allResults));
    return true;
  } catch (error) {
    console.error('Error updating cancer result:', error);
    return false;
  }
}

// Get staging information
export function getStagingInfo(stage: string): StagingCriteria | null {
  return STAGING_CRITERIA[stage] || null;
}

// Get treatment recommendations based on stage
export function getTreatmentRecommendations(stage: string): string[] {
  const stagingInfo = getStagingInfo(stage);
  return stagingInfo ? stagingInfo.treatment : [];
}

// Get cancer statistics for doctor
export function getCancerStatistics(doctorId: string) {
  const results = getCancerResults(doctorId);
  
  const stats = {
    totalResults: results.length,
    confirmedCases: results.filter(r => r.cancerConfirmed).length,
    byStage: {} as Record<string, number>,
    byTestType: {} as Record<string, number>,
    recentResults: results.filter(r => {
      const resultDate = new Date(r.testDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return resultDate >= thirtyDaysAgo;
    }).length
  };
  
  // Count by stage
  results.forEach(result => {
    if (result.stage) {
      stats.byStage[result.stage] = (stats.byStage[result.stage] || 0) + 1;
    }
    stats.byTestType[result.testType] = (stats.byTestType[result.testType] || 0) + 1;
  });
  
  return stats;
}

// Helper function
function generateId(): string {
  return 'cancer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize with sample data
export function initializeSampleCancerResults(doctorId: string) {
  const results = getCancerResults(doctorId);
  if (results.length === 0) {
    const sampleResults = [
      {
        patientId: 'AK20250001',
        doctorId,
        testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        testType: 'biopsy' as const,
        result: 'abnormal' as const,
        details: 'Squamous cell carcinoma identified in cervical biopsy',
        cancerConfirmed: true,
        stage: 'stage_1b' as const,
        stageDescription: 'Invasive carcinoma confined to cervix, lesion >4cm',
        clinicalFindings: {
          lesionSize: '4.5cm',
          lesionLocation: 'Posterior cervix',
          lymphNodeInvolvement: false,
          parametrialInvolvement: false,
          vaginalInvolvement: false
        },
        treatmentPlan: {
          primaryTreatment: 'Radical hysterectomy with pelvic lymph node dissection',
          additionalTreatments: ['Adjuvant chemotherapy if high-risk features'],
          followUpSchedule: 'Every 3 months for 2 years, then every 6 months',
          referralRequired: true,
          referralTo: 'Gynecologic Oncology',
          urgency: 'urgent' as const
        },
        pathologyReport: 'Moderately differentiated squamous cell carcinoma, invasion depth 8mm, no lymphovascular invasion',
        notes: 'Patient counseled on diagnosis and treatment options. Referred to oncology for surgical planning.'
      },
      {
        patientId: 'AK20250002',
        doctorId,
        testDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        testType: 'pap_smear' as const,
        result: 'abnormal' as const,
        details: 'High-grade squamous intraepithelial lesion (HSIL)',
        cancerConfirmed: false,
        clinicalFindings: {},
        treatmentPlan: {
          primaryTreatment: 'Colposcopy with directed biopsy',
          additionalTreatments: ['LEEP procedure if CIN 2-3 confirmed'],
          followUpSchedule: 'Colposcopy in 2 weeks, then follow-up based on results',
          referralRequired: true,
          referralTo: 'Colposcopy clinic',
          urgency: 'urgent' as const
        },
        notes: 'Abnormal Pap smear requiring immediate colposcopic evaluation. Patient scheduled for colposcopy.'
      }
    ];
    
    sampleResults.forEach(result => saveCancerResult(result));
  }
}
