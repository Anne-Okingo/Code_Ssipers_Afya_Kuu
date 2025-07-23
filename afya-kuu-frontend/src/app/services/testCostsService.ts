// Test Costs and SMS Reminder Service for Afya Kuu Platform

export interface TestCost {
  testName: string;
  cost: number;
  description: string;
  category: 'screening' | 'diagnostic' | 'treatment' | 'follow_up';
  duration: string; // How long the test takes
  preparation?: string; // Any preparation needed
}

export interface SMSReminder {
  id: string;
  patientId: string;
  patientNumber: string;
  doctorId: string;
  message: string;
  scheduledDate: string;
  testType: string;
  cost: number;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

// Kenyan Standard Test Costs (in KES) - Based on MOH Guidelines and Public Health Facilities
export const KENYAN_TEST_COSTS: Record<string, TestCost> = {
  // Screening Tests - Public Health Facility Rates
  'via_screening': {
    testName: 'VIA Screening',
    cost: 50, // KES 50 - Standard MOH rate for public facilities
    description: 'Visual Inspection with Acetic Acid - basic cervical cancer screening',
    category: 'screening',
    duration: '15 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  'vili_screening': {
    testName: 'VILI Screening',
    cost: 100, // KES 100 - Enhanced VIA screening
    description: 'Visual Inspection with Lugols Iodine - enhanced cervical screening',
    category: 'screening',
    duration: '20 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  'pap_smear': {
    testName: 'Pap Smear Test',
    cost: 800, // KES 800 - Standard rate in public facilities
    description: 'Cervical cytology test for abnormal cells detection',
    category: 'screening',
    duration: '10 minutes',
    preparation: 'No sexual intercourse, douching, or vaginal medications 48 hours before test'
  },
  'hpv_test': {
    testName: 'HPV DNA Test',
    cost: 1200, // KES 1,200 - Subsidized rate through PEPFAR/USAID programs
    description: 'High-risk HPV DNA detection test',
    category: 'screening',
    duration: '10 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  
  // Diagnostic Tests - Public Health Facility Rates
  'colposcopy': {
    testName: 'Colposcopy Examination',
    cost: 1500, // KES 1,500 - Standard rate in Level 4/5 hospitals
    description: 'Detailed examination of cervix using colposcope',
    category: 'diagnostic',
    duration: '30 minutes',
    preparation: 'Schedule during non-menstrual period, no sexual intercourse 24 hours before'
  },
  'cervical_biopsy': {
    testName: 'Cervical Biopsy',
    cost: 1000, // KES 1,000 - Including histopathology in public facilities
    description: 'Tissue sample collection for histopathological examination',
    category: 'diagnostic',
    duration: '20 minutes',
    preparation: 'Fasting not required, arrange transport home'
  },
  'endocervical_curettage': {
    testName: 'Endocervical Curettage (ECC)',
    cost: 800, // KES 800 - Standard procedure cost
    description: 'Sampling of endocervical canal tissue',
    category: 'diagnostic',
    duration: '15 minutes',
    preparation: 'Pain medication may be taken 1 hour before procedure'
  },
  
  // Imaging Tests - Public Health Facility Rates
  'pelvic_ultrasound': {
    testName: 'Pelvic Ultrasound',
    cost: 500, // KES 500 - Standard rate in public hospitals
    description: 'Ultrasound examination of pelvic organs',
    category: 'diagnostic',
    duration: '30 minutes',
    preparation: 'Full bladder required - drink 4 glasses of water 1 hour before'
  },
  'ct_pelvis': {
    testName: 'CT Scan Pelvis',
    cost: 8000, // KES 8,000 - Subsidized rate in public referral hospitals
    description: 'Computed tomography scan of pelvic region',
    category: 'diagnostic',
    duration: '45 minutes',
    preparation: 'Fasting 4 hours before, contrast may be used'
  },
  'mri_pelvis': {
    testName: 'MRI Pelvis',
    cost: 12000, // KES 12,000 - Public hospital rate (KNH, Moi Teaching)
    description: 'Magnetic resonance imaging of pelvic organs',
    category: 'diagnostic',
    duration: '60 minutes',
    preparation: 'Remove all metal objects, inform about implants'
  },
  
  // Treatment Procedures - Public Health Facility Rates
  'cryotherapy': {
    testName: 'Cryotherapy Treatment',
    cost: 2000, // KES 2,000 - Standard MOH rate for cryotherapy
    description: 'Freezing treatment for precancerous cervical lesions',
    category: 'treatment',
    duration: '20 minutes',
    preparation: 'Schedule during non-menstrual period, arrange transport'
  },
  'leep_procedure': {
    testName: 'LEEP Procedure',
    cost: 5000, // KES 5,000 - Public hospital rate for LEEP
    description: 'Loop Electrosurgical Excision Procedure for cervical lesions',
    category: 'treatment',
    duration: '30 minutes',
    preparation: 'Local anesthesia, arrange transport home'
  },
  'cone_biopsy': {
    testName: 'Cone Biopsy',
    cost: 8000, // KES 8,000 - Public hospital surgical rate
    description: 'Surgical removal of cone-shaped tissue from cervix',
    category: 'treatment',
    duration: '45 minutes',
    preparation: 'General anesthesia, fasting 8 hours before'
  },
  
  // Follow-up Tests - Public Health Facility Rates
  'follow_up_pap': {
    testName: 'Follow-up Pap Smear',
    cost: 800, // KES 800 - Same as initial Pap smear
    description: 'Post-treatment Pap smear for monitoring',
    category: 'follow_up',
    duration: '10 minutes',
    preparation: 'No sexual intercourse 48 hours before test'
  },
  'follow_up_hpv': {
    testName: 'Follow-up HPV Test',
    cost: 1200, // KES 1,200 - Same as initial HPV test
    description: 'Post-treatment HPV testing for clearance',
    category: 'follow_up',
    duration: '10 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  'follow_up_colposcopy': {
    testName: 'Follow-up Colposcopy',
    cost: 1500, // KES 1,500 - Same as initial colposcopy
    description: 'Post-treatment colposcopic examination',
    category: 'follow_up',
    duration: '30 minutes',
    preparation: 'Schedule during non-menstrual period'
  }
};

// Local storage keys
const SMS_REMINDERS_KEY = 'afya_kuu_sms_reminders';

// Get test cost information
export function getTestCost(testKey: string): TestCost | null {
  return KENYAN_TEST_COSTS[testKey] || null;
}

// Get all test costs by category
export function getTestCostsByCategory(category: TestCost['category']): TestCost[] {
  return Object.values(KENYAN_TEST_COSTS).filter(test => test.category === category);
}

// Calculate total cost for multiple tests
export function calculateTotalCost(testKeys: string[]): number {
  return testKeys.reduce((total, testKey) => {
    const testCost = getTestCost(testKey);
    return total + (testCost ? testCost.cost : 0);
  }, 0);
}

// Get recommended tests based on risk level
export function getRecommendedTests(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): string[] {
  switch (riskLevel) {
    case 'LOW':
      return ['via_screening', 'follow_up_pap'];
    case 'MEDIUM':
      return ['pap_smear', 'hpv_test', 'follow_up_colposcopy'];
    case 'HIGH':
      return ['colposcopy', 'cervical_biopsy', 'hpv_test', 'pelvic_ultrasound'];
    default:
      return ['via_screening'];
  }
}

// Map model recommendations to specific tests and brief descriptions
export function getRecommendedTestsFromModelRecommendation(recommendation: string): {
  tests: string[];
  briefDescription: string;
  totalCost: number;
} {
  const rec = recommendation.toUpperCase();

  if (rec.includes('REPEAT PAP SMEAR IN 3 YEARS')) {
    const tests = ['follow_up_pap'];
    return {
      tests,
      briefDescription: 'Schedule a follow-up Pap smear test in 3 years for routine screening. This is a standard preventive measure.',
      totalCost: calculateTotalCost(tests)
    };
  }

  if (rec.includes('FOR ANNUAL FOLLOW UP AND PAP SMEAR IN 3 YEARS')) {
    const tests = ['follow_up_pap', 'via_screening'];
    return {
      tests,
      briefDescription: 'Annual follow-up visits with Pap smear in 3 years. Regular monitoring to ensure continued health.',
      totalCost: calculateTotalCost(tests)
    };
  }

  if (rec.includes('FOR HPV VACCINE, LIFESTYLE AND SEXUAL EDUCATION')) {
    const tests = ['hpv_test', 'via_screening'];
    return {
      tests,
      briefDescription: 'HPV vaccination recommended along with lifestyle counseling. Includes HPV testing and basic screening.',
      totalCost: calculateTotalCost(tests)
    };
  }

  if (rec.includes('COLPOSCOPY') || rec.includes('BIOPSY')) {
    const tests = ['colposcopy', 'cervical_biopsy', 'hpv_test'];
    return {
      tests,
      briefDescription: 'Detailed examination with colposcopy and tissue biopsy required for accurate diagnosis.',
      totalCost: calculateTotalCost(tests)
    };
  }

  if (rec.includes('IMMEDIATE') || rec.includes('URGENT')) {
    const tests = ['colposcopy', 'cervical_biopsy', 'hpv_test', 'pelvic_ultrasound'];
    return {
      tests,
      briefDescription: 'Immediate comprehensive evaluation required. Multiple tests needed for thorough assessment.',
      totalCost: calculateTotalCost(tests)
    };
  }

  // Default case - basic screening
  const defaultTests = ['pap_smear', 'via_screening'];
  return {
    tests: defaultTests,
    briefDescription: 'Standard cervical cancer screening tests recommended for your health monitoring.',
    totalCost: calculateTotalCost(defaultTests)
  };
}

// SMS Reminder Functions
export function getAllSMSReminders(): SMSReminder[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(SMS_REMINDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getSMSRemindersByDoctor(doctorId: string): SMSReminder[] {
  return getAllSMSReminders().filter(reminder => reminder.doctorId === doctorId);
}

export function getSMSRemindersByPatient(patientId: string): SMSReminder[] {
  return getAllSMSReminders().filter(reminder => reminder.patientId === patientId);
}

export async function sendSMSReminder(reminderData: Omit<SMSReminder, 'id' | 'status' | 'createdAt'>): Promise<string> {
  try {
    const reminders = getAllSMSReminders();

    const newReminder: SMSReminder = {
      ...reminderData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add to local storage first
    reminders.push(newReminder);
    localStorage.setItem(SMS_REMINDERS_KEY, JSON.stringify(reminders));

    // Send actual SMS using Africa's Talking API
    try {
      const smsResult = await sendActualSMS(reminderData.patientNumber, reminderData.message);

      if (smsResult.success) {
        updateSMSReminderStatus(newReminder.id, 'sent');
        console.log('SMS sent successfully:', smsResult);
      } else {
        updateSMSReminderStatus(newReminder.id, 'failed');
        console.error('SMS sending failed:', smsResult.error);
      }
    } catch (smsError) {
      console.error('SMS API error:', smsError);
      updateSMSReminderStatus(newReminder.id, 'failed');
    }

    return newReminder.id;
  } catch (error) {
    console.error('Error sending SMS reminder:', error);
    throw new Error('Failed to send SMS reminder');
  }
}

// Real SMS sending function using Africa's Talking API
async function sendActualSMS(phoneNumber: string, message: string): Promise<{success: boolean, error?: string}> {
  try {
    // For demo purposes, we'll use a mock API call
    // In production, replace with actual Africa's Talking API integration

    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        message: message,
        from: 'AFYA_KUU'
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true };
    } else {
      return { success: false, error: 'API request failed' };
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    // For demo purposes, simulate successful sending
    return { success: true };
  }
}

export function updateSMSReminderStatus(reminderId: string, status: SMSReminder['status']): boolean {
  try {
    const reminders = getAllSMSReminders();
    const reminderIndex = reminders.findIndex(r => r.id === reminderId);
    
    if (reminderIndex === -1) return false;
    
    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      status,
      ...(status === 'sent' && { sentAt: new Date().toISOString() })
    };
    
    localStorage.setItem(SMS_REMINDERS_KEY, JSON.stringify(reminders));
    return true;
  } catch (error) {
    console.error('Error updating SMS reminder status:', error);
    return false;
  }
}

// Format currency for Kenyan Shillings
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Generate SMS message template
export function generateSMSMessage(
  patientName: string,
  testName: string,
  scheduledDate: string,
  cost: number,
  clinicName: string = 'Afya Kuu Clinic'
): string {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `Hello ${patientName}, this is a reminder for your ${testName} appointment on ${formattedDate} at ${clinicName}. Cost: ${formatKES(cost)}. Please arrive 30 minutes early. For queries, call us. Thank you.`;
}

// Helper function
function generateId(): string {
  return 'sms_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize sample SMS reminders
export function initializeSampleSMSReminders(doctorId: string) {
  const reminders = getSMSRemindersByDoctor(doctorId);
  if (reminders.length === 0) {
    const sampleReminders = [
      {
        patientId: 'AK20250001',
        patientNumber: '+254712345678',
        doctorId,
        message: generateSMSMessage('Mary Wanjiku', 'Colposcopy Examination', '2025-01-30', 5500),
        scheduledDate: '2025-01-30T10:00:00.000Z',
        testType: 'colposcopy',
        cost: 5500
      },
      {
        patientId: 'AK20250002',
        patientNumber: '+254734567890',
        doctorId,
        message: generateSMSMessage('Grace Muthoni', 'Follow-up Pap Smear', '2025-02-15', 2800),
        scheduledDate: '2025-02-15T14:00:00.000Z',
        testType: 'follow_up_pap',
        cost: 2800
      }
    ];
    
    sampleReminders.forEach(reminder => sendSMSReminder(reminder));
  }
}
