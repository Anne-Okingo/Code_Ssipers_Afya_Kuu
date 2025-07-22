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

// Kenyan Standard Test Costs (in KES)
export const KENYAN_TEST_COSTS: Record<string, TestCost> = {
  // Screening Tests
  'via_screening': {
    testName: 'VIA Screening',
    cost: 150,
    description: 'Visual Inspection with Acetic Acid - basic cervical cancer screening',
    category: 'screening',
    duration: '15 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  'vili_screening': {
    testName: 'VILI Screening',
    cost: 200,
    description: 'Visual Inspection with Lugols Iodine - enhanced cervical screening',
    category: 'screening',
    duration: '20 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  'pap_smear': {
    testName: 'Pap Smear Test',
    cost: 2800,
    description: 'Cervical cytology test for abnormal cells detection',
    category: 'screening',
    duration: '10 minutes',
    preparation: 'No sexual intercourse, douching, or vaginal medications 48 hours before test'
  },
  'hpv_test': {
    testName: 'HPV DNA Test',
    cost: 3500,
    description: 'High-risk HPV DNA detection test',
    category: 'screening',
    duration: '10 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  
  // Diagnostic Tests
  'colposcopy': {
    testName: 'Colposcopy Examination',
    cost: 5500,
    description: 'Detailed examination of cervix using colposcope',
    category: 'diagnostic',
    duration: '30 minutes',
    preparation: 'Schedule during non-menstrual period, no sexual intercourse 24 hours before'
  },
  'cervical_biopsy': {
    testName: 'Cervical Biopsy',
    cost: 4500,
    description: 'Tissue sample collection for histopathological examination',
    category: 'diagnostic',
    duration: '20 minutes',
    preparation: 'Fasting not required, arrange transport home'
  },
  'endocervical_curettage': {
    testName: 'Endocervical Curettage (ECC)',
    cost: 3800,
    description: 'Sampling of endocervical canal tissue',
    category: 'diagnostic',
    duration: '15 minutes',
    preparation: 'Pain medication may be taken 1 hour before procedure'
  },
  
  // Imaging Tests
  'pelvic_ultrasound': {
    testName: 'Pelvic Ultrasound',
    cost: 2500,
    description: 'Ultrasound examination of pelvic organs',
    category: 'diagnostic',
    duration: '30 minutes',
    preparation: 'Full bladder required - drink 4 glasses of water 1 hour before'
  },
  'ct_pelvis': {
    testName: 'CT Scan Pelvis',
    cost: 15000,
    description: 'Computed tomography scan of pelvic region',
    category: 'diagnostic',
    duration: '45 minutes',
    preparation: 'Fasting 4 hours before, contrast may be used'
  },
  'mri_pelvis': {
    testName: 'MRI Pelvis',
    cost: 25000,
    description: 'Magnetic resonance imaging of pelvic organs',
    category: 'diagnostic',
    duration: '60 minutes',
    preparation: 'Remove all metal objects, inform about implants'
  },
  
  // Treatment Procedures
  'cryotherapy': {
    testName: 'Cryotherapy Treatment',
    cost: 8000,
    description: 'Freezing treatment for precancerous cervical lesions',
    category: 'treatment',
    duration: '20 minutes',
    preparation: 'Schedule during non-menstrual period, arrange transport'
  },
  'leep_procedure': {
    testName: 'LEEP Procedure',
    cost: 15000,
    description: 'Loop Electrosurgical Excision Procedure for cervical lesions',
    category: 'treatment',
    duration: '30 minutes',
    preparation: 'Local anesthesia, arrange transport home'
  },
  'cone_biopsy': {
    testName: 'Cone Biopsy',
    cost: 25000,
    description: 'Surgical removal of cone-shaped tissue from cervix',
    category: 'treatment',
    duration: '45 minutes',
    preparation: 'General anesthesia, fasting 8 hours before'
  },
  
  // Follow-up Tests
  'follow_up_pap': {
    testName: 'Follow-up Pap Smear',
    cost: 2800,
    description: 'Post-treatment Pap smear for monitoring',
    category: 'follow_up',
    duration: '10 minutes',
    preparation: 'No sexual intercourse 48 hours before test'
  },
  'follow_up_hpv': {
    testName: 'Follow-up HPV Test',
    cost: 3500,
    description: 'Post-treatment HPV testing for clearance',
    category: 'follow_up',
    duration: '10 minutes',
    preparation: 'No sexual intercourse 24 hours before test'
  },
  'follow_up_colposcopy': {
    testName: 'Follow-up Colposcopy',
    cost: 5500,
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

export function sendSMSReminder(reminderData: Omit<SMSReminder, 'id' | 'status' | 'createdAt'>): string {
  try {
    const reminders = getAllSMSReminders();
    
    const newReminder: SMSReminder = {
      ...reminderData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Simulate SMS sending (in real implementation, integrate with SMS gateway like Africa's Talking)
    setTimeout(() => {
      // Update status to sent
      updateSMSReminderStatus(newReminder.id, 'sent');
    }, 2000);
    
    reminders.push(newReminder);
    localStorage.setItem(SMS_REMINDERS_KEY, JSON.stringify(reminders));
    
    return newReminder.id;
  } catch (error) {
    console.error('Error sending SMS reminder:', error);
    throw new Error('Failed to send SMS reminder');
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
