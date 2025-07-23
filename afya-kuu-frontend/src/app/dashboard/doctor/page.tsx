'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { predictRisk, checkBackendAvailability, type PatientData, type PredictionResponse } from '../../services/api';
import { savePatientAssessment, getTodaysSummaryForDoctor, type DailySummary } from '../../services/patientData';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import VoiceInput from '../../components/VoiceInput';
import InventoryManagement from '../../components/InventoryManagement';
import ResourcesManagement from '../../components/ResourcesManagement';
import PatientRecords from '../../components/PatientRecords';
import FeedbackSystem from '../../components/FeedbackSystem';
import CervicalCancerResults from '../../components/CervicalCancerResults';
import AssessmentResults from '../../components/AssessmentResults';

type AssessmentStep = 'patient-info' | 'results' | 'recommendations';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [activeTab, setActiveTab] = useState<'assessment' | 'inventory' | 'patients' | 'resources' | 'feedback' | 'results'>('assessment');
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('patient-info');
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todaysSummary, setTodaysSummary] = useState<DailySummary | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  const [patientData, setPatientData] = useState<PatientData>({
    phoneNumber: '',
    age: '',
    previousScreening: '',
    hpvStatus: '',
    symptoms: '',
    papSmearResult: '',
    smokingStatus: '',
    stdHistory: '',
    region: '',
    insuranceCovered: '',
    screeningTypeLast: '',
    sexualPartners: '',
    firstSexualActivityAge: '',
    riskFactors: []
  });

  const content = {
    en: {
      title: "Doctor Dashboard",
      subtitle: "Cervical Cancer Risk Assessment Platform",
      nav: {
        assessment: "New Assessment",
        inventory: "Inventory",
        patients: "Patient Records",
        resources: "Resources",
        feedback: "Feedback",
        results: "Cancer Results",
        logout: "Logout"
      },
      assessment: {
        title: "Risk Assessment Tool",
        steps: {
          'patient-info': "Patient Information",
          'results': "AI Analysis",
          'recommendations': "Recommendations"
        },
        fields: {
          age: "Age",
          previousScreening: "Previous Screening Date",
          hpvStatus: "HPV Test Results",
          symptoms: "Current Symptoms",
          papSmearResult: "Pap Smear Result",
          smokingStatus: "Smoking Status",
          stdHistory: "STDs History",
          region: "Region",
          insuranceCovered: "Insurance Coverage",
          screeningTypeLast: "Last Screening Type",
          sexualPartners: "Number of Sexual Partners",
          firstSexualActivityAge: "Age at First Sexual Activity"
        },
        buttons: {
          predict: "Predict Risk",
          next: "Next Step",
          previous: "Previous",
          save: "Save Assessment"
        }
      }
    },
    sw: {
      title: "Dashibodi ya Daktari",
      subtitle: "Jukwaa la Tathmini ya Hatari ya Saratani ya Mlango wa Kizazi",
      nav: {
        assessment: "Tathmini Mpya",
        inventory: "Hesabu",
        patients: "Rekodi za Wagonjwa",
        resources: "Rasilimali",
        feedback: "Maoni",
        results: "Matokeo ya Saratani",
        logout: "Toka"
      },
      assessment: {
        title: "Chombo cha Tathmini ya Hatari",
        steps: {
          'patient-info': "Maelezo ya Mgonjwa",
          'results': "Uchambuzi wa AI",
          'recommendations': "Mapendekezo"
        },
        fields: {
          age: "Umri",
          previousScreening: "Tarehe ya Uchunguzi wa Awali",
          hpvStatus: "Matokeo ya Kipimo cha HPV",
          symptoms: "Dalili za Sasa",
          papSmearResult: "Matokeo ya Pap Smear",
          smokingStatus: "Hali ya Uvutaji Sigara",
          stdHistory: "Historia ya Magonjwa ya Zinaa",
          region: "Mkoa",
          insuranceCovered: "Ufunikaji wa Bima",
          screeningTypeLast: "Aina ya Uchunguzi wa Mwisho",
          sexualPartners: "Idadi ya Washirika wa Kijinsia",
          firstSexualActivityAge: "Umri wa Shughuli ya Kwanza ya Kijinsia"
        },
        buttons: {
          predict: "Tabiri Hatari",
          next: "Hatua Ijayo",
          previous: "Nyuma",
          save: "Hifadhi Tathmini"
        }
      }
    }
  };

  const t = content[language];

  // Load today's summary on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadTodaysSummary();
    }
  }, [user?.id]);

  const loadTodaysSummary = () => {
    if (user?.id) {
      const summary = getTodaysSummaryForDoctor(user.id);
      setTodaysSummary(summary);
    }
  };

  const resetForm = () => {
    setPatientData({
      phoneNumber: '',
      age: '',
      previousScreening: '',
      hpvStatus: '',
      symptoms: '',
      papSmearResult: '',
      smokingStatus: '',
      stdHistory: '',
      region: '',
      insuranceCovered: '',
      screeningTypeLast: '',
      sexualPartners: '',
      firstSexualActivityAge: ''
    });
    setPredictionResult(null);
    setCurrentStep('patient-info');
    setError(null);
    setCurrentPatientId(null);
  };

  const handlePatientDataChange = (data: PatientData) => {
    setPatientData(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoiceInput = (fieldName: string, transcript: string) => {
    // Process voice input based on field type
    let processedValue = transcript.toLowerCase().trim();

    // Handle specific field mappings
    switch (fieldName) {
      case 'age':
        // Extract numbers from transcript
        const ageMatch = transcript.match(/\d+/);
        processedValue = ageMatch ? ageMatch[0] : '';
        break;
      case 'hpvStatus':
        if (processedValue.includes('positive') || processedValue.includes('chanya')) {
          processedValue = 'positive';
        } else if (processedValue.includes('negative') || processedValue.includes('hasi')) {
          processedValue = 'negative';
        } else {
          processedValue = 'unknown';
        }
        break;
      case 'papSmearResult':
        if (processedValue.includes('yes') || processedValue.includes('abnormal') || processedValue.includes('ndio')) {
          processedValue = 'Y';
        } else {
          processedValue = 'N';
        }
        break;
      case 'smokingStatus':
      case 'stdHistory':
      case 'insuranceCovered':
        if (processedValue.includes('yes') || processedValue.includes('ndio')) {
          processedValue = 'Y';
        } else {
          processedValue = 'N';
        }
        break;
      default:
        // For text fields, use transcript as-is
        processedValue = transcript;
        break;
    }

    setPatientData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
  };

  const handleFormSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if backend is available
      const isBackendAvailable = await checkBackendAvailability();
      if (!isBackendAvailable) {
        throw new Error(language === 'en'
          ? 'Prediction service is currently unavailable. Please try again later.'
          : 'Huduma ya utabiri haipo kwa sasa. Tafadhali jaribu tena baadaye.'
        );
      }

      const result = await predictRisk(patientData as PatientData);
      setPredictionResult(result);

      if (result.success) {
        // Save the assessment data
        if (user?.id && user?.profileName) {
          const assessment = savePatientAssessment(
            patientData as PatientData,
            result,
            user.id,
            user.profileName
          );
          // Store the patient ID for display
          setCurrentPatientId(assessment.patientId);
          // Update today's summary
          loadTodaysSummary();
        }
        
        setCurrentStep('results');
      } else {
        throw new Error(result.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'results') {
      setCurrentStep('recommendations');
    } else if (currentStep === 'recommendations') {
      // Save and start new assessment
      resetForm();
      // Show success message
      alert(language === 'en' 
        ? 'Assessment saved successfully! Ready for new assessment.' 
        : 'Tathmini imehifadhiwa kwa mafanikio! Tayari kwa tathmini mpya.'
      );
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'recommendations') {
      setCurrentStep('results');
    } else if (currentStep === 'results') {
      setCurrentStep('patient-info');
    }
  };

  return (
    <ProtectedRoute requiredUserType="doctor" showUnauthorizedPage={false}>
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`shadow-sm border-b transition-colors duration-200 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Afya Kuu</h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle showLabel={false} />

                <button
                  onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {language === 'en' ? 'SW' : 'EN'}
                </button>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Dr. {user?.profileName || 'User'}
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  {t.nav.logout}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.title}</h2>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('assessment')}
                      className={`w-full text-left px-3 py-2 rounded-md font-medium ${
                        activeTab === 'assessment'
                          ? 'text-pink-600 bg-pink-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.nav.assessment}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeTab === 'inventory'
                          ? 'text-pink-600 bg-pink-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.nav.inventory}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('patients')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeTab === 'patients'
                          ? 'text-pink-600 bg-pink-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.nav.patients}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeTab === 'resources'
                          ? 'text-pink-600 bg-pink-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.nav.resources}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeTab === 'feedback'
                          ? 'text-pink-600 bg-pink-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.nav.feedback}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('results')}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeTab === 'results'
                          ? 'text-pink-600 bg-pink-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.nav.results}
                    </button>
                  </li>
                </ul>
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Today\'s Summary' : 'Muhtasari wa Leo'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'en' ? 'Assessments' : 'Tathmini'}
                    </span>
                    <span className="text-sm font-medium">{todaysSummary?.totalAssessments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'en' ? 'High Risk' : 'Hatari ya Juu'}
                    </span>
                    <span className="text-sm font-medium text-red-600">{todaysSummary?.highRiskCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'en' ? 'Low Risk' : 'Hatari ya Chini'}
                    </span>
                    <span className="text-sm font-medium text-green-600">{todaysSummary?.lowRiskCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Assessment Tab */}
              {activeTab === 'assessment' && currentStep === 'patient-info' && (
                <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="mb-8">
                    <h2 className={`text-3xl font-bold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {t.assessment.title}
                    </h2>
                    <p className={`text-lg ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {language === 'en'
                        ? '🎤 Complete all required fields to generate an AI-powered risk assessment. Use voice input by clicking the microphone icons!'
                        : '🎤 Jaza sehemu zote zinazohitajika ili kupata tathmini ya hatari inayotumia AI. Tumia sauti kwa kubonyeza ikoni za kipaza sauti!'}
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className={`border rounded-xl p-6 mb-8 ${
                      isDarkMode
                        ? 'bg-red-900/20 border-red-600 text-red-300'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex">
                        <svg className="w-6 h-6 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <p className="text-lg font-bold mb-2">
                            {language === 'en' ? 'Error' : 'Kosa'}
                          </p>
                          <p className="text-base">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className={`rounded-lg p-6 border-2 shadow-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-pink-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">1</span>
                        {language === 'en' ? 'Basic Information' : 'Maelezo ya Msingi'}
                      </h3>
                      <div className="grid md:grid-cols-1 gap-6">
                        {/* Patient Information */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="relative">
                            <label className={`block text-sm font-bold mb-3 ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {language === 'en' ? 'Patient Phone Number' : 'Nambari ya Simu ya Mgonjwa'} <span className="text-red-500 text-lg">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                name="phoneNumber"
                                value={patientData.phoneNumber}
                                onChange={handleInputChange}
                                className="enhanced-input"
                                placeholder={language === 'en' ? 'Enter phone number (+254...)' : 'Ingiza nambari ya simu (+254...)'}
                                pattern="^\+254[0-9]{9}$"
                                required
                              />
                              <VoiceInput
                                onTranscript={(transcript) => handleVoiceInput('phoneNumber', transcript)}
                                language={language === 'en' ? 'en-US' : 'sw-KE'}
                                className="absolute inset-0"
                                fieldName="phoneNumber"
                              />
                            </div>
                            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {language === 'en' ? '📱 Format: +254712345678 (for SMS reminders)' : '📱 Muundo: +254712345678 (kwa mikumbusho ya SMS)'}
                            </p>
                          </div>

                          <div className="relative">
                            <label className={`block text-sm font-bold mb-3 ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {t.assessment.fields.age} <span className="text-red-500 text-lg">*</span>
                            </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="age"
                              value={patientData.age}
                              onChange={handleInputChange}
                              className="enhanced-input"
                              placeholder={language === 'en' ? 'Enter patient age (e.g., 25)' : 'Ingiza umri wa mgonjwa (mfano, 25)'}
                              min="1"
                              max="100"
                              required
                            />
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('age', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="age"
                            />
                          </div>
                            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {language === 'en' ? '🎤 Click microphone or type patient age in years (required)' : '🎤 Bonyeza kipaza sauti au andika umri wa mgonjwa kwa miaka (inahitajika)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Test Results Section */}
                    <div className={`rounded-lg p-6 border-2 shadow-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-blue-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">2</span>
                        {language === 'en' ? 'Test Results' : 'Matokeo ya Vipimo'}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.hpvStatus} <span className="text-red-500 text-lg">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="hpvStatus"
                              value={patientData.hpvStatus}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              required
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select HPV test status --' : '-- Chagua hali ya kipimo cha HPV --'}
                              </option>
                              <option value="positive">{language === 'en' ? 'Positive' : 'Chanya'}</option>
                              <option value="negative">{language === 'en' ? 'Negative' : 'Hasi'}</option>
                              <option value="unknown">{language === 'en' ? 'Unknown' : 'Haijulikani'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('hpvStatus', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="hpvStatus"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Click microphone or select HPV test result (required)' : '🎤 Bonyeza kipaza sauti au chagua matokeo ya kipimo cha HPV (inahitajika)'}
                          </p>
                        </div>
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.papSmearResult} <span className="text-red-500 text-lg">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="papSmearResult"
                              value={patientData.papSmearResult}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              required
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select Pap smear result --' : '-- Chagua matokeo ya Pap smear --'}
                              </option>
                              <option value="Y">{language === 'en' ? 'Yes (Abnormal)' : 'Ndio (Isiyo ya kawaida)'}</option>
                              <option value="N">{language === 'en' ? 'No (Normal)' : 'Hapana (Ya kawaida)'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('papSmearResult', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="papSmearResult"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Click microphone or select Pap smear result (required)' : '🎤 Bonyeza kipaza sauti au chagua matokeo ya Pap smear (inahitajika)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lifestyle Factors Section */}
                    <div className={`rounded-lg p-6 border-2 shadow-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-green-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">3</span>
                        {language === 'en' ? 'Lifestyle Factors' : 'Mambo ya Maisha'}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.smokingStatus} <span className="text-red-500 text-lg">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="smokingStatus"
                              value={patientData.smokingStatus}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              required
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select smoking status --' : '-- Chagua hali ya uvutaji sigara --'}
                              </option>
                              <option value="Y">{language === 'en' ? 'Yes (Current or former smoker)' : 'Ndio (Mvutaji wa sasa au wa zamani)'}</option>
                              <option value="N">{language === 'en' ? 'No (Never smoked)' : 'Hapana (Hajawahi kuvuta)'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('smokingStatus', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="smokingStatus"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Click microphone or select smoking history (required)' : '🎤 Bonyeza kipaza sauti au chagua historia ya uvutaji sigara (inahitajika)'}
                          </p>
                        </div>
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.stdHistory} <span className="text-red-500 text-lg">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="stdHistory"
                              value={patientData.stdHistory}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              required
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select STD history --' : '-- Chagua historia ya magonjwa ya zinaa --'}
                              </option>
                              <option value="Y">{language === 'en' ? 'Yes (Has history of STDs)' : 'Ndio (Ana historia ya magonjwa ya zinaa)'}</option>
                              <option value="N">{language === 'en' ? 'No (No history of STDs)' : 'Hapana (Hana historia ya magonjwa ya zinaa)'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('stdHistory', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="stdHistory"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Click microphone or select STD history (required)' : '🎤 Bonyeza kipaza sauti au chagua historia ya magonjwa ya zinaa (inahitajika)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Demographics Section */}
                    <div className={`rounded-lg p-6 border-2 shadow-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-purple-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">4</span>
                        {language === 'en' ? 'Demographics' : 'Takwimu za Kijamii'}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.region} <span className="text-red-500 text-lg">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="region"
                              value={patientData.region}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              required
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select patient\'s region --' : '-- Chagua mkoa wa mgonjwa --'}
                              </option>
                              <option value="Pumwani">Pumwani</option>
                              <option value="Kakamega">Kakamega</option>
                              <option value="Machakos">Machakos</option>
                              <option value="Embu">Embu</option>
                              <option value="Nakuru">Nakuru</option>
                              <option value="Loitoktok">Loitoktok</option>
                              <option value="Moi">Moi</option>
                              <option value="Kitale">Kitale</option>
                              <option value="Garissa">Garissa</option>
                              <option value="Kericho">Kericho</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('region', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="region"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Click microphone or select patient region (required)' : '🎤 Bonyeza kipaza sauti au chagua mkoa wa mgonjwa (inahitajika)'}
                          </p>
                        </div>
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.insuranceCovered} <span className="text-red-500 text-lg">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="insuranceCovered"
                              value={patientData.insuranceCovered}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              required
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select insurance coverage --' : '-- Chagua ufunikaji wa bima --'}
                              </option>
                              <option value="Y">{language === 'en' ? 'Yes (Has insurance)' : 'Ndio (Ana bima)'}</option>
                              <option value="N">{language === 'en' ? 'No (No insurance)' : 'Hapana (Hana bima)'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('insuranceCovered', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="insuranceCovered"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Click microphone or select insurance status (required)' : '🎤 Bonyeza kipaza sauti au chagua hali ya bima (inahitajika)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className={`rounded-lg p-6 border-2 shadow-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-orange-200'
                    }`}>
                      <h3 className={`text-xl font-bold mb-6 flex items-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <span className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">5</span>
                        {language === 'en' ? 'Additional Information' : 'Maelezo Mengine'}
                      </h3>

                      {/* Symptoms */}
                      <div className="mb-6 relative">
                        <label className={`block text-sm font-bold mb-3 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {t.assessment.fields.symptoms}
                        </label>
                        <div className="relative">
                          <textarea
                            name="symptoms"
                            value={patientData.symptoms}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 placeholder-gray-400 text-lg font-medium shadow-lg transition-all duration-200 resize-none ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder={language === 'en'
                              ? 'Describe any symptoms such as unusual bleeding, pelvic pain, discharge, etc...'
                              : 'Elezea dalili zoyote kama vile kutokwa damu kwa kawaida, maumivu ya kiuno, kutokwa, n.k...'}
                          />
                          <VoiceInput
                            onTranscript={(transcript) => handleVoiceInput('symptoms', transcript)}
                            language={language === 'en' ? 'en-US' : 'sw-KE'}
                            className="absolute inset-0"
                            fieldName="symptoms"
                          />
                        </div>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {language === 'en' ? '🎤 Click microphone or describe any symptoms the patient is experiencing' : '🎤 Bonyeza kipaza sauti au elezea dalili zoyote za mgonjwa'}
                        </p>
                      </div>

                      {/* Three column grid for additional fields */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.screeningTypeLast}
                          </label>
                          <div className="relative">
                            <select
                              name="screeningTypeLast"
                              value={patientData.screeningTypeLast}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select screening type --' : '-- Chagua aina ya uchunguzi --'}
                              </option>
                              <option value="PAP SMEAR">{language === 'en' ? 'Pap Smear' : 'Pap Smear'}</option>
                              <option value="HPV DNA">{language === 'en' ? 'HPV DNA Test' : 'Kipimo cha HPV DNA'}</option>
                              <option value="VIA">{language === 'en' ? 'VIA (Visual Inspection)' : 'VIA (Uchunguzi wa Macho)'}</option>
                              <option value="NONE">{language === 'en' ? 'Never screened' : 'Hajawahi kuchunguzwa'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('screeningTypeLast', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="screeningTypeLast"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Last screening type' : '🎤 Aina ya uchunguzi wa mwisho'}
                          </p>
                        </div>
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.sexualPartners}
                          </label>
                          <div className="relative">
                            <select
                              name="sexualPartners"
                              value={patientData.sexualPartners}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select number --' : '-- Chagua idadi --'}
                              </option>
                              <option value="0">{language === 'en' ? '0 (None)' : '0 (Hakuna)'}</option>
                              <option value="1">{language === 'en' ? '1 (One)' : '1 (Mmoja)'}</option>
                              <option value="2">{language === 'en' ? '2 (Two)' : '2 (Wawili)'}</option>
                              <option value="3">{language === 'en' ? '3 (Three)' : '3 (Watatu)'}</option>
                              <option value="4">{language === 'en' ? '4 (Four)' : '4 (Wanne)'}</option>
                              <option value="5">{language === 'en' ? '5 (Five)' : '5 (Watano)'}</option>
                              <option value="6-10">{language === 'en' ? '6-10 partners' : '6-10 washirika'}</option>
                              <option value="11+">{language === 'en' ? 'More than 10' : 'Zaidi ya 10'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('sexualPartners', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="sexualPartners"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Number of sexual partners' : '🎤 Idadi ya washirika wa kijinsia'}
                          </p>
                        </div>
                        <div className="relative">
                          <label className={`block text-sm font-bold mb-3 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {t.assessment.fields.firstSexualActivityAge}
                          </label>
                          <div className="relative">
                            <select
                              name="firstSexualActivityAge"
                              value={patientData.firstSexualActivityAge}
                              onChange={handleInputChange}
                              className={`w-full px-6 py-4 pr-16 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-lg font-medium shadow-lg transition-all duration-200 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                                {language === 'en' ? '-- Select age --' : '-- Chagua umri --'}
                              </option>
                              <option value="12">{language === 'en' ? '12 years' : 'Miaka 12'}</option>
                              <option value="13">{language === 'en' ? '13 years' : 'Miaka 13'}</option>
                              <option value="14">{language === 'en' ? '14 years' : 'Miaka 14'}</option>
                              <option value="15">{language === 'en' ? '15 years' : 'Miaka 15'}</option>
                              <option value="16">{language === 'en' ? '16 years' : 'Miaka 16'}</option>
                              <option value="17">{language === 'en' ? '17 years' : 'Miaka 17'}</option>
                              <option value="18">{language === 'en' ? '18 years' : 'Miaka 18'}</option>
                              <option value="19">{language === 'en' ? '19 years' : 'Miaka 19'}</option>
                              <option value="20">{language === 'en' ? '20 years' : 'Miaka 20'}</option>
                              <option value="21">{language === 'en' ? '21 years' : 'Miaka 21'}</option>
                              <option value="22">{language === 'en' ? '22 years' : 'Miaka 22'}</option>
                              <option value="23">{language === 'en' ? '23 years' : 'Miaka 23'}</option>
                              <option value="24">{language === 'en' ? '24 years' : 'Miaka 24'}</option>
                              <option value="25">{language === 'en' ? '25 years' : 'Miaka 25'}</option>
                              <option value="26-30">{language === 'en' ? '26-30 years' : 'Miaka 26-30'}</option>
                              <option value="31+">{language === 'en' ? 'Over 30 years' : 'Zaidi ya miaka 30'}</option>
                            </select>
                            <VoiceInput
                              onTranscript={(transcript) => handleVoiceInput('firstSexualActivityAge', transcript)}
                              language={language === 'en' ? 'en-US' : 'sw-KE'}
                              className="absolute inset-0"
                              fieldName="firstSexualActivityAge"
                            />
                          </div>
                          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'en' ? '🎤 Age at first sexual activity' : '🎤 Umri wa shughuli ya kwanza ya kijinsia'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-12 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 flex items-center transform hover:scale-105 shadow-2xl ${
                          isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 hover:shadow-3xl'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {language === 'en' ? 'Analyzing...' : 'Inachambuza...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {t.assessment.buttons.predict}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Results and Recommendations */}
              <div className="space-y-6">
                {currentStep === 'results' && (
                  <div>
                    {predictionResult ? (
                      <AssessmentResults
                        language={language}
                        patientData={{
                          phoneNumber: patientData.phoneNumber,
                          age: patientData.age
                        }}
                        riskLevel={predictionResult.risk_level as 'LOW' | 'MEDIUM' | 'HIGH'}
                        riskPercentage={Math.round(predictionResult.risk_percentage)}
                        recommendations={predictionResult.recommendation}
                        doctorId={user?.id || 'doctor_001'}
                        // Pass exact model results
                        riskPrediction={predictionResult.risk_prediction}
                        riskProbability={predictionResult.risk_probability}
                        modelRiskLevel={predictionResult.risk_level}
                        onSendReminder={(success) => {
                          if (success) {
                            alert(language === 'en' ? 'SMS reminder sent successfully!' : 'Ukumbusho wa SMS umetumwa kwa ufanisi!');
                          } else {
                            alert(language === 'en' ? 'Failed to send SMS reminder' : 'Imeshindwa kutuma ukumbusho wa SMS');
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                          <p className="text-gray-600 dark:text-gray-400">
                            {language === 'en' ? 'No prediction results available' : 'Hakuna matokeo ya utabiri yaliyopatikana'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Legacy Results Display (keeping for reference) */}
                {false && currentStep === 'results' && (
                  <div className="text-center py-12">
                    {predictionResult ? (
                      <div className={`rounded-2xl p-10 mb-8 shadow-2xl transition-colors duration-200 ${
                        predictionResult.risk_prediction === 1
                          ? isDarkMode
                            ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-600'
                            : 'bg-gradient-to-br from-red-100 to-orange-100 border-2 border-red-200'
                          : isDarkMode
                            ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-600'
                            : 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200'
                      }`}>
                        <div className="mb-6">
                          <div className={`text-lg mb-4 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {language === 'en' ? 'Patient ID: ' : 'Kitambulisho cha Mgonjwa: '}
                            <span className="font-mono font-bold text-xl">{currentPatientId}</span>
                          </div>
                          <h3 className={`text-4xl font-black ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {language === 'en' ? '🤖 AI Risk Analysis' : '🤖 Uchambuzi wa Hatari wa AI'}
                          </h3>
                        </div>

                        <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-4 ${
                          predictionResult.risk_prediction === 1
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {predictionResult.risk_level}
                        </div>

                        <div className={`text-6xl font-black mb-6 px-8 py-6 rounded-2xl shadow-2xl border-4 text-center transform hover:scale-105 transition-all duration-300 ${
                          predictionResult.risk_prediction === 1
                            ? isDarkMode
                              ? 'bg-red-900 border-red-600 text-red-100'
                              : 'bg-red-50 border-red-300 text-red-800'
                            : isDarkMode
                              ? 'bg-green-900 border-green-600 text-green-100'
                              : 'bg-green-50 border-green-300 text-green-800'
                        }`}>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="animate-pulse-slow">{Math.round(predictionResult.risk_percentage)}%</span>
                            {predictionResult.risk_prediction === 1 ? (
                              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            ) : (
                              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700">
                          {language === 'en'
                            ? `Based on the provided information, the patient shows ${predictionResult.risk_level.toLowerCase()} for cervical cancer.`
                            : `Kulingana na maelezo yaliyotolewa, mgonjwa anaonyesha ${predictionResult.risk_level.toLowerCase() === 'high risk' ? 'hatari ya juu' : 'hatari ya chini'} ya saratani ya mlango wa kizazi.`
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8">
                        <p className="text-gray-600">
                          {language === 'en' ? 'No prediction results available' : 'Hakuna matokeo ya utabiri yaliyopatikana'}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handlePreviousStep}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                      >
                        {t.assessment.buttons.previous}
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 font-medium"
                      >
                        {language === 'en' ? 'View Recommendations' : 'Ona Mapendekezo'}
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'recommendations' && (
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      {language === 'en' ? 'Clinical Recommendations' : 'Mapendekezo ya Kliniki'}
                    </h3>
                    
                    {predictionResult && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            {language === 'en' ? 'Recommended Action:' : 'Kitendo Kinachopendekeza:'}
                          </h4>
                          <p className="text-blue-800">{predictionResult.recommendation}</p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-900 mb-2">
                            {language === 'en' ? 'Follow-up Instructions:' : 'Maagizo ya Ufuatiliaji:'}
                          </h4>
                          <ul className="text-yellow-800 space-y-1">
                            <li>• {language === 'en' ? 'Schedule follow-up appointment' : 'Panga miadi ya ufuatiliaji'}</li>
                            <li>• {language === 'en' ? 'Patient education on risk factors' : 'Elimu ya mgonjwa kuhusu sababu za hatari'}</li>
                            <li>• {language === 'en' ? 'Document assessment results' : 'Andika matokeo ya tathmini'}</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center space-x-4 mt-8">
                      <button
                        onClick={handlePreviousStep}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                      >
                        {t.assessment.buttons.previous}
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                      >
                        {t.assessment.buttons.save}
                      </button>
                    </div>
                  </div>
                )}

              {/* Inventory Tab */}
              {activeTab === 'inventory' && (
                <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <InventoryManagement
                    language={language}
                    userRole="doctor"
                  />
                </div>
              )}

              {/* Patient Records Tab */}
              {activeTab === 'patients' && (
                <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <PatientRecords
                    language={language}
                    doctorId={user?.id || 'doctor_001'}
                  />
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <ResourcesManagement
                    language={language}
                    userRole="doctor"
                    userId={user?.id || 'doctor_001'}
                    userName={user?.profileName || user?.email || 'Doctor'}
                  />
                </div>
              )}

              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <FeedbackSystem
                    language={language}
                    userId={user?.id || 'doctor_001'}
                    userRole="doctor"
                    userName={user?.email || 'Doctor'}
                  />
                </div>
              )}

              {/* Cancer Results Tab */}
              {activeTab === 'results' && (
                <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <CervicalCancerResults
                    language={language}
                    doctorId={user?.id || 'doctor_001'}
                  />
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
