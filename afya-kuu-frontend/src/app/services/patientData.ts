// Patient data persistence service
import { PatientData, PredictionResponse } from './api';

export interface PatientAssessment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientData: PatientData;
  predictionResult: PredictionResponse;
  timestamp: string;
  date: string; // YYYY-MM-DD format for daily grouping
  riskLevel: 'high' | 'low';
}

export interface DailySummary {
  date: string;
  totalAssessments: number;
  highRiskCount: number;
  lowRiskCount: number;
  assessments: PatientAssessment[];
}

// Generate unique patient ID
export function generatePatientId(): string {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const existingAssessments = getAssessmentsForDate(new Date().toISOString().split('T')[0]);
  const dailyCount = existingAssessments.length + 1;
  return `PT${today}${dailyCount.toString().padStart(3, '0')}`;
}

// Generate unique assessment ID
export function generateAssessmentId(): string {
  return `ASS${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
}

// Save patient assessment to localStorage
export function savePatientAssessment(
  patientData: PatientData,
  predictionResult: PredictionResponse,
  doctorId: string,
  doctorName: string
): PatientAssessment {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  
  const assessment: PatientAssessment = {
    id: generateAssessmentId(),
    patientId: generatePatientId(),
    doctorId,
    doctorName,
    patientData,
    predictionResult,
    timestamp: now.toISOString(),
    date,
    riskLevel: predictionResult.risk_prediction === 1 ? 'high' : 'low'
  };

  // Get existing assessments
  const existingAssessments = getAllAssessments();
  existingAssessments.push(assessment);

  // Save to localStorage
  localStorage.setItem('afya_kuu_assessments', JSON.stringify(existingAssessments));

  return assessment;
}

// Get all assessments from localStorage
export function getAllAssessments(): PatientAssessment[] {
  try {
    const assessments = localStorage.getItem('afya_kuu_assessments');
    return assessments ? JSON.parse(assessments) : [];
  } catch (error) {
    console.error('Error loading assessments:', error);
    return [];
  }
}

// Get assessments for a specific date
export function getAssessmentsForDate(date: string): PatientAssessment[] {
  const allAssessments = getAllAssessments();
  return allAssessments.filter(assessment => assessment.date === date);
}

// Get assessments for a specific doctor
export function getAssessmentsForDoctor(doctorId: string): PatientAssessment[] {
  const allAssessments = getAllAssessments();
  return allAssessments.filter(assessment => assessment.doctorId === doctorId);
}

// Get today's summary for a specific doctor
export function getTodaysSummaryForDoctor(doctorId: string): DailySummary {
  const today = new Date().toISOString().split('T')[0];
  const allAssessments = getAllAssessments();
  
  // Filter assessments for today and this doctor
  const todaysAssessments = allAssessments.filter(
    assessment => assessment.date === today && assessment.doctorId === doctorId
  );

  const highRiskCount = todaysAssessments.filter(a => a.riskLevel === 'high').length;
  const lowRiskCount = todaysAssessments.filter(a => a.riskLevel === 'low').length;

  return {
    date: today,
    totalAssessments: todaysAssessments.length,
    highRiskCount,
    lowRiskCount,
    assessments: todaysAssessments
  };
}

// Get overall today's summary (all doctors)
export function getTodaysSummary(): DailySummary {
  const today = new Date().toISOString().split('T')[0];
  const todaysAssessments = getAssessmentsForDate(today);

  const highRiskCount = todaysAssessments.filter(a => a.riskLevel === 'high').length;
  const lowRiskCount = todaysAssessments.filter(a => a.riskLevel === 'low').length;

  return {
    date: today,
    totalAssessments: todaysAssessments.length,
    highRiskCount,
    lowRiskCount,
    assessments: todaysAssessments
  };
}

// Get summary for a date range
export function getSummaryForDateRange(startDate: string, endDate: string): DailySummary[] {
  const allAssessments = getAllAssessments();
  const summaries: { [date: string]: DailySummary } = {};

  // Filter assessments within date range
  const filteredAssessments = allAssessments.filter(assessment => {
    return assessment.date >= startDate && assessment.date <= endDate;
  });

  // Group by date
  filteredAssessments.forEach(assessment => {
    if (!summaries[assessment.date]) {
      summaries[assessment.date] = {
        date: assessment.date,
        totalAssessments: 0,
        highRiskCount: 0,
        lowRiskCount: 0,
        assessments: []
      };
    }

    summaries[assessment.date].totalAssessments++;
    summaries[assessment.date].assessments.push(assessment);
    
    if (assessment.riskLevel === 'high') {
      summaries[assessment.date].highRiskCount++;
    } else {
      summaries[assessment.date].lowRiskCount++;
    }
  });

  return Object.values(summaries).sort((a, b) => a.date.localeCompare(b.date));
}

// Export assessment data as JSON (for backup/download)
export function exportAssessmentData(): string {
  const allAssessments = getAllAssessments();
  return JSON.stringify(allAssessments, null, 2);
}

// Clear all assessment data (for testing/reset)
export function clearAllAssessments(): void {
  localStorage.removeItem('afya_kuu_assessments');
}

// Get recent assessments (last N assessments)
export function getRecentAssessments(limit: number = 10): PatientAssessment[] {
  const allAssessments = getAllAssessments();
  return allAssessments
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
