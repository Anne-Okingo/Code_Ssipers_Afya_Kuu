'use client';

import { useState } from 'react';
import {
  getRecommendedTests,
  getRecommendedTestsFromModelRecommendation,
  getTestCost,
  calculateTotalCost,
  formatKES,
  sendSMSReminder,
  generateSMSMessage,
  type TestCost
} from '../services/testCostsService';

interface AssessmentResultsProps {
  language: 'en' | 'sw';
  patientData: {
    phoneNumber: string;
    age: string;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskPercentage: number;
  recommendations: string;
  doctorId: string;
  onSendReminder?: (success: boolean) => void;
  // Additional props for exact model results
  riskPrediction?: number; // 0 = Low Risk, 1 = High Risk
  riskProbability?: number; // Model confidence score
  modelRiskLevel?: string; // Exact risk level from model
}

export default function AssessmentResults({
  language,
  patientData,
  riskLevel,
  riskPercentage,
  recommendations,
  doctorId,
  onSendReminder,
  riskPrediction = 0,
  riskProbability = 0,
  modelRiskLevel
}: AssessmentResultsProps) {
  const [showSMSForm, setShowSMSForm] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const content = {
    en: {
      title: 'Assessment Results',
      riskLevel: 'Risk Level',
      riskPercentage: 'Risk Percentage',
      recommendations: 'Clinical Recommendations',
      followUpTests: 'Recommended Follow-up Tests',
      testCosts: 'Test Costs',
      totalCost: 'Total Estimated Cost',
      patientInfo: 'Patient Information',
      sendReminder: 'Send SMS Reminder',
      smsForm: {
        title: 'Send Follow-up Reminder',
        selectTests: 'Select Tests to Include',
        scheduleDate: 'Scheduled Date',
        customMessage: 'Custom Message (Optional)',
        send: 'Send SMS',
        cancel: 'Cancel',
        sending: 'Sending...',
        success: 'SMS reminder sent successfully!',
        error: 'Failed to send SMS reminder'
      },
      testDetails: {
        cost: 'Cost',
        duration: 'Duration',
        preparation: 'Preparation',
        description: 'Description'
      },
      riskLevels: {
        LOW: 'Low Risk',
        MEDIUM: 'Medium Risk',
        HIGH: 'High Risk'
      }
    },
    sw: {
      title: 'Matokeo ya Tathmini',
      riskLevel: 'Kiwango cha Hatari',
      riskPercentage: 'Asilimia ya Hatari',
      recommendations: 'Mapendekezo ya Kliniki',
      followUpTests: 'Vipimo vya Ufuatiliaji Vinavyopendekezwa',
      testCosts: 'Gharama za Vipimo',
      totalCost: 'Jumla ya Gharama Inayokadiriwa',
      patientInfo: 'Taarifa za Mgonjwa',
      sendReminder: 'Tuma Ukumbusho wa SMS',
      smsForm: {
        title: 'Tuma Ukumbusho wa Ufuatiliaji',
        selectTests: 'Chagua Vipimo vya Kujumuisha',
        scheduleDate: 'Tarehe Iliyopangwa',
        customMessage: 'Ujumbe wa Kibinafsi (Si Lazima)',
        send: 'Tuma SMS',
        cancel: 'Ghairi',
        sending: 'Inatuma...',
        success: 'Ukumbusho wa SMS umetumwa kwa ufanisi!',
        error: 'Imeshindwa kutuma ukumbusho wa SMS'
      },
      testDetails: {
        cost: 'Gharama',
        duration: 'Muda',
        preparation: 'Maandalizi',
        description: 'Maelezo'
      },
      riskLevels: {
        LOW: 'Hatari Ndogo',
        MEDIUM: 'Hatari ya Kati',
        HIGH: 'Hatari Kubwa'
      }
    }
  };

  const t = content[language];

  // Get recommended tests based on model recommendation (not just risk level)
  const modelRecommendationData = getRecommendedTestsFromModelRecommendation(recommendations);
  const recommendedTestKeys = modelRecommendationData.tests;
  const recommendedTests = recommendedTestKeys.map(key => ({
    key,
    ...getTestCost(key)!
  }));

  const totalCost = modelRecommendationData.totalCost;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-600 bg-red-100 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleSendSMS = async () => {
    if (!scheduledDate || selectedTests.length === 0) return;

    setIsSending(true);
    try {
      const selectedTestNames = selectedTests.map(key => {
        const test = getTestCost(key);
        return test ? test.testName : key;
      }).join(', ');
      
      const selectedTestsCost = calculateTotalCost(selectedTests);
      const patientIdentifier = patientData.phoneNumber;

      const message = customMessage || `Hello, this is your cervical cancer screening follow-up from Afya Kuu Clinic. ${modelRecommendationData.briefDescription} Appointment: ${new Date(scheduledDate).toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}. Total Cost: ${formatKES(selectedTestsCost)}. Please arrive 30 minutes early. For queries, call us. Thank you.`;

      const reminderId = sendSMSReminder({
        patientId: patientData.phoneNumber,
        patientNumber: patientData.phoneNumber,
        doctorId,
        message,
        scheduledDate,
        testType: selectedTests.join(','),
        cost: selectedTestsCost
      });

      if (reminderId) {
        onSendReminder?.(true);
        setShowSMSForm(false);
        setSelectedTests([]);
        setScheduledDate('');
        setCustomMessage('');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      onSendReminder?.(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.patientInfo}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {language === 'en' ? 'Patient Phone:' : 'Simu ya Mgonjwa:'}
            </span>
            <p className="text-gray-900 dark:text-white font-mono text-lg">{patientData.phoneNumber}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {language === 'en' ? 'Age:' : 'Umri:'}
            </span>
            <p className="text-gray-900 dark:text-white">{patientData.age} {language === 'en' ? 'years' : 'miaka'}</p>
          </div>
        </div>
      </div>

      {/* Prominent Risk Assessment Results - Exact Model Results */}
      <div className={`rounded-2xl p-8 shadow-2xl transition-all duration-300 ${
        riskPrediction === 1
          ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700'
          : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700'
      }`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'en' ? 'Cervical Cancer Risk Assessment Results' : 'Matokeo ya Tathmini ya Hatari ya Saratani ya Mlango wa Kizazi'}
          </h3>

          {/* Large Risk Percentage Display - Based on Model Prediction */}
          <div className={`inline-block p-8 rounded-2xl shadow-xl mb-6 transform hover:scale-105 transition-all duration-300 ${
            riskPrediction === 1
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            <div className="text-6xl font-black mb-2 animate-pulse-slow">
              {riskPercentage}%
            </div>
            <div className="text-xl font-semibold flex items-center justify-center space-x-2">
              <span>
                {riskPrediction === 1 ? '⚠️' : '✅'}
              </span>
              <span>{modelRiskLevel || (riskPrediction === 1 ? 'High Risk' : 'Low Risk')}</span>
            </div>
          </div>

          {/* Model Results Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                {language === 'en' ? 'Model Prediction' : 'Utabiri wa Mfumo'}
              </h4>
              <p className={`text-lg font-bold ${riskPrediction === 1 ? 'text-red-600' : 'text-green-600'}`}>
                {riskPrediction === 1 ? 'HIGH RISK' : 'LOW RISK'}
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                {language === 'en' ? 'Risk Percentage' : 'Asilimia ya Hatari'}
              </h4>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {riskPercentage}%
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                {language === 'en' ? 'Model Confidence' : 'Uhakika wa Mfumo'}
              </h4>
              <p className="text-lg font-bold text-blue-600">
                {Math.round(riskProbability * 100)}%
              </p>
            </div>
          </div>

          {/* Risk Level Description */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {language === 'en'
              ? `Based on the ML model analysis, the patient shows ${riskPrediction === 1 ? 'HIGH' : 'LOW'} risk for cervical cancer with ${riskPercentage}% risk score.`
              : `Kulingana na uchambuzi wa mfumo wa ML, mgonjwa anaonyesha hatari ya ${riskPrediction === 1 ? 'JUU' : 'CHINI'} ya saratani ya mlango wa kizazi na alama ya hatari ya ${riskPercentage}%.`
            }
          </p>
        </div>

        {/* Clinical Recommendations */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t.recommendations}
          </h4>
          <p className="text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-500 text-lg">
            {recommendations}
          </p>
        </div>
      </div>

      {/* Recommended Follow-up Tests - Synced with Model Recommendation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'en' ? 'Recommended Action & Tests' : 'Kitendo na Vipimo Vinavyopendekezwa'}
          </h3>
          <button
            onClick={() => setShowSMSForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{language === 'en' ? 'Send to Patient' : 'Tumia kwa Mgonjwa'}</span>
          </button>
        </div>

        {/* Brief Description - SMS Ready */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            {language === 'en' ? 'Brief Summary for Patient:' : 'Muhtasari kwa Mgonjwa:'}
          </h4>
          <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
            {modelRecommendationData.briefDescription}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {language === 'en' ? 'Estimated Total Cost:' : 'Jumla ya Gharama:'}
            </span>
            <span className="text-lg font-bold text-green-600">{formatKES(totalCost)}</span>
          </div>
        </div>

        <div className="space-y-4">
          {recommendedTests.map((test, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{test.testName}</h4>
                <span className="text-lg font-bold text-green-600">{formatKES(test.cost)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{test.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div><strong>{t.testDetails.duration}:</strong> {test.duration}</div>
                {test.preparation && (
                  <div><strong>{t.testDetails.preparation}:</strong> {test.preparation}</div>
                )}
              </div>
            </div>
          ))}
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{t.totalCost}:</span>
              <span className="text-2xl font-bold text-green-600">{formatKES(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Form Modal */}
      {showSMSForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.smsForm.title}
                </h3>
                <button
                  onClick={() => setShowSMSForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Test Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.smsForm.selectTests}
                  </label>
                  <div className="space-y-2">
                    {recommendedTests.map((test, index) => (
                      <label key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(test.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTests([...selectedTests, test.key]);
                            } else {
                              setSelectedTests(selectedTests.filter(t => t !== test.key));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {test.testName} - {formatKES(test.cost)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedTests.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <span className="text-sm text-green-800 dark:text-green-200">
                        Selected tests total: {formatKES(calculateTotalCost(selectedTests))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scheduled Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.smsForm.scheduleDate}
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.smsForm.customMessage}
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                    placeholder="Leave empty to use default message template"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Preview */}
                {selectedTests.length > 0 && scheduledDate && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Message Preview:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {customMessage || `Hello, this is your cervical cancer screening follow-up from Afya Kuu Clinic. ${modelRecommendationData.briefDescription} Appointment: ${new Date(scheduledDate).toLocaleDateString('en-KE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}. Total Cost: ${formatKES(calculateTotalCost(selectedTests))}. Please arrive 30 minutes early. For queries, call us. Thank you.`}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSMSForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t.smsForm.cancel}
                  </button>
                  <button
                    onClick={handleSendSMS}
                    disabled={isSending || selectedTests.length === 0 || !scheduledDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? t.smsForm.sending : t.smsForm.send}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
