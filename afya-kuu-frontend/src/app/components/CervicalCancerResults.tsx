'use client';

import { useState, useEffect } from 'react';
import { 
  getCancerResults,
  saveCancerResult,
  getCancerStatistics,
  getStagingInfo,
  initializeSampleCancerResults,
  STAGING_CRITERIA,
  type CervicalCancerResult
} from '../services/cervicalCancerService';

interface CervicalCancerResultsProps {
  language: 'en' | 'sw';
  doctorId: string;
}

export default function CervicalCancerResults({ language, doctorId }: CervicalCancerResultsProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'view' | 'staging'>('submit');
  const [results, setResults] = useState<CervicalCancerResult[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    testDate: new Date().toISOString().split('T')[0],
    testType: 'pap_smear' as CervicalCancerResult['testType'],
    result: 'normal' as CervicalCancerResult['result'],
    details: '',
    cancerConfirmed: false,
    stage: '' as CervicalCancerResult['stage'],
    stageDescription: '',
    lesionSize: '',
    lesionLocation: '',
    lymphNodeInvolvement: false,
    parametrialInvolvement: false,
    vaginalInvolvement: false,
    bladderInvolvement: false,
    rectalInvolvement: false,
    distantMetastasis: false,
    primaryTreatment: '',
    additionalTreatments: '',
    followUpSchedule: '',
    referralRequired: false,
    referralTo: '',
    urgency: 'routine' as CervicalCancerResult['treatmentPlan']['urgency'],
    pathologyReport: '',
    radiologyReport: '',
    notes: ''
  });

  const content = {
    en: {
      title: 'Cervical Cancer Results & Staging',
      subtitle: 'Submit and manage actual cervical cancer test results',
      tabs: {
        submit: 'Submit Results',
        view: 'View Results',
        staging: 'Staging Guide'
      },
      form: {
        title: 'Submit Test Results',
        patientId: 'Patient ID',
        testDate: 'Test Date',
        testType: 'Test Type',
        result: 'Result',
        details: 'Details',
        cancerConfirmed: 'Cancer Confirmed',
        stage: 'Cancer Stage',
        stageDescription: 'Stage Description',
        clinicalFindings: 'Clinical Findings',
        lesionSize: 'Lesion Size',
        lesionLocation: 'Lesion Location',
        lymphNodes: 'Lymph Node Involvement',
        parametrial: 'Parametrial Involvement',
        vaginal: 'Vaginal Involvement',
        bladder: 'Bladder Involvement',
        rectal: 'Rectal Involvement',
        metastasis: 'Distant Metastasis',
        treatmentPlan: 'Treatment Plan',
        primaryTreatment: 'Primary Treatment',
        additionalTreatments: 'Additional Treatments',
        followUp: 'Follow-up Schedule',
        referralRequired: 'Referral Required',
        referralTo: 'Refer To',
        urgency: 'Urgency',
        pathologyReport: 'Pathology Report',
        radiologyReport: 'Radiology Report',
        notes: 'Clinical Notes',
        submit: 'Submit Results',
        cancel: 'Cancel'
      },
      testTypes: {
        pap_smear: 'Pap Smear',
        hpv_test: 'HPV Test',
        colposcopy: 'Colposcopy',
        biopsy: 'Biopsy',
        imaging: 'Imaging'
      },
      results: {
        normal: 'Normal',
        abnormal: 'Abnormal',
        positive: 'Positive',
        negative: 'Negative',
        inconclusive: 'Inconclusive'
      },
      urgency: {
        routine: 'Routine',
        urgent: 'Urgent',
        emergency: 'Emergency'
      },
      stats: {
        totalResults: 'Total Results',
        confirmedCases: 'Confirmed Cases',
        recentResults: 'Recent (30 days)',
        byStage: 'By Stage'
      },
      staging: {
        title: 'Cervical Cancer Staging Guide',
        subtitle: 'FIGO staging system for cervical cancer',
        stage: 'Stage',
        description: 'Description',
        characteristics: 'Characteristics',
        treatment: 'Treatment Options',
        prognosis: 'Prognosis'
      },
      noResults: 'No results found',
      loading: 'Loading results...'
    },
    sw: {
      title: 'Matokeo na Viwango vya Saratani ya Mlango wa Kizazi',
      subtitle: 'Wasilisha na simamia matokeo halisi ya vipimo vya saratani ya mlango wa kizazi',
      tabs: {
        submit: 'Wasilisha Matokeo',
        view: 'Ona Matokeo',
        staging: 'Mwongozo wa Viwango'
      },
      form: {
        title: 'Wasilisha Matokeo ya Vipimo',
        patientId: 'Nambari ya Mgonjwa',
        testDate: 'Tarehe ya Kipimo',
        testType: 'Aina ya Kipimo',
        result: 'Matokeo',
        details: 'Maelezo',
        cancerConfirmed: 'Saratani Imethibitishwa',
        stage: 'Kiwango cha Saratani',
        stageDescription: 'Maelezo ya Kiwango',
        clinicalFindings: 'Matokeo ya Kliniki',
        lesionSize: 'Ukubwa wa Kidonda',
        lesionLocation: 'Mahali pa Kidonda',
        lymphNodes: 'Ushiriki wa Fundo za Damu',
        parametrial: 'Ushiriki wa Parametrial',
        vaginal: 'Ushiriki wa Uke',
        bladder: 'Ushiriki wa Kibofu',
        rectal: 'Ushiriki wa Utumbo',
        metastasis: 'Kuenea Mbali',
        treatmentPlan: 'Mpango wa Matibabu',
        primaryTreatment: 'Matibabu ya Msingi',
        additionalTreatments: 'Matibabu ya Ziada',
        followUp: 'Ratiba ya Ufuatiliaji',
        referralRequired: 'Unahitaji Kupelekwa',
        referralTo: 'Peleka Kwa',
        urgency: 'Haraka',
        pathologyReport: 'Ripoti ya Pathology',
        radiologyReport: 'Ripoti ya Radiology',
        notes: 'Maelezo ya Kliniki',
        submit: 'Wasilisha Matokeo',
        cancel: 'Ghairi'
      },
      testTypes: {
        pap_smear: 'Pap Smear',
        hpv_test: 'Kipimo cha HPV',
        colposcopy: 'Colposcopy',
        biopsy: 'Biopsy',
        imaging: 'Picha za Mwili'
      },
      results: {
        normal: 'Kawaida',
        abnormal: 'Si Kawaida',
        positive: 'Chanya',
        negative: 'Hasi',
        inconclusive: 'Haijulikani'
      },
      urgency: {
        routine: 'Kawaida',
        urgent: 'Haraka',
        emergency: 'Dharura'
      },
      stats: {
        totalResults: 'Jumla ya Matokeo',
        confirmedCases: 'Kesi Zilizothibitishwa',
        recentResults: 'Za Hivi Karibuni (siku 30)',
        byStage: 'Kwa Kiwango'
      },
      staging: {
        title: 'Mwongozo wa Viwango vya Saratani ya Mlango wa Kizazi',
        subtitle: 'Mfumo wa FIGO wa viwango vya saratani ya mlango wa kizazi',
        stage: 'Kiwango',
        description: 'Maelezo',
        characteristics: 'Sifa',
        treatment: 'Chaguo za Matibabu',
        prognosis: 'Utabiri'
      },
      noResults: 'Hakuna matokeo yaliyopatikana',
      loading: 'Inapakia matokeo...'
    }
  };

  const t = content[language];

  useEffect(() => {
    loadResultsData();
  }, [doctorId]);

  const loadResultsData = async () => {
    setIsLoading(true);
    try {
      initializeSampleCancerResults(doctorId);
      const cancerResults = getCancerResults(doctorId);
      const stats = getCancerStatistics(doctorId);
      
      setResults(cancerResults);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resultData: Omit<CervicalCancerResult, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId: formData.patientId,
        doctorId,
        testDate: formData.testDate,
        testType: formData.testType,
        result: formData.result,
        details: formData.details,
        cancerConfirmed: formData.cancerConfirmed,
        ...(formData.cancerConfirmed && formData.stage && {
          stage: formData.stage,
          stageDescription: formData.stageDescription
        }),
        clinicalFindings: {
          lesionSize: formData.lesionSize || undefined,
          lesionLocation: formData.lesionLocation || undefined,
          lymphNodeInvolvement: formData.lymphNodeInvolvement,
          parametrialInvolvement: formData.parametrialInvolvement,
          vaginalInvolvement: formData.vaginalInvolvement,
          bladderInvolvement: formData.bladderInvolvement,
          rectalInvolvement: formData.rectalInvolvement,
          distantMetastasis: formData.distantMetastasis
        },
        treatmentPlan: {
          primaryTreatment: formData.primaryTreatment,
          additionalTreatments: formData.additionalTreatments.split(',').map(t => t.trim()).filter(t => t),
          followUpSchedule: formData.followUpSchedule,
          referralRequired: formData.referralRequired,
          referralTo: formData.referralTo || undefined,
          urgency: formData.urgency
        },
        pathologyReport: formData.pathologyReport || undefined,
        radiologyReport: formData.radiologyReport || undefined,
        notes: formData.notes
      };

      const resultId = saveCancerResult(resultData);
      
      if (resultId) {
        // Reset form
        setFormData({
          patientId: '',
          testDate: new Date().toISOString().split('T')[0],
          testType: 'pap_smear',
          result: 'normal',
          details: '',
          cancerConfirmed: false,
          stage: '',
          stageDescription: '',
          lesionSize: '',
          lesionLocation: '',
          lymphNodeInvolvement: false,
          parametrialInvolvement: false,
          vaginalInvolvement: false,
          bladderInvolvement: false,
          rectalInvolvement: false,
          distantMetastasis: false,
          primaryTreatment: '',
          additionalTreatments: '',
          followUpSchedule: '',
          referralRequired: false,
          referralTo: '',
          urgency: 'routine',
          pathologyReport: '',
          radiologyReport: '',
          notes: ''
        });
        
        setShowForm(false);
        await loadResultsData();
      }
    } catch (error) {
      console.error('Error submitting result:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-KE' : 'sw-KE');
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'normal':
      case 'negative':
        return 'text-green-600 bg-green-100';
      case 'abnormal':
      case 'positive':
        return 'text-red-600 bg-red-100';
      case 'inconclusive':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine': return 'text-green-600 bg-green-100';
      case 'urgent': return 'text-yellow-600 bg-yellow-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t.subtitle}</p>
        </div>
        {activeTab === 'submit' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            {t.form.title}
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalResults}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.totalResults}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{statistics.confirmedCases}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.confirmedCases}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{statistics.recentResults}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.recentResults}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(statistics.byStage).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.byStage}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['submit', 'view', 'staging'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.tabs[tab]}
            </button>
          ))}
        </nav>
      </div>

      {/* Submit Results Tab */}
      {activeTab === 'submit' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.form.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Submit actual cervical cancer test results and staging information
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition-colors"
            >
              {t.form.title}
            </button>
          </div>
        </div>
      )}

      {/* View Results Tab */}
      {activeTab === 'view' && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t.noResults}
            </div>
          ) : (
            results.map((result) => (
              <div key={result.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Patient: {result.patientId}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.testTypes[result.testType]} - {formatDate(result.testDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(result.result)}`}>
                      {t.results[result.result]}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(result.treatmentPlan.urgency)}`}>
                      {t.urgency[result.treatmentPlan.urgency]}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Details:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{result.details}</p>
                    
                    {result.cancerConfirmed && result.stage && (
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cancer Stage:</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {STAGING_CRITERIA[result.stage]?.stage}
                        </p>
                        {result.stageDescription && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {result.stageDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Treatment Plan:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Primary:</strong> {result.treatmentPlan.primaryTreatment}
                    </p>
                    {result.treatmentPlan.additionalTreatments.length > 0 && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Additional:</strong> {result.treatmentPlan.additionalTreatments.join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Follow-up:</strong> {result.treatmentPlan.followUpSchedule}
                    </p>
                    
                    {result.treatmentPlan.referralRequired && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Referral Required:</strong> {result.treatmentPlan.referralTo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {result.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Clinical Notes:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{result.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Staging Guide Tab */}
      {activeTab === 'staging' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.staging.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.staging.subtitle}
            </p>
            
            <div className="space-y-6">
              {Object.entries(STAGING_CRITERIA).map(([key, criteria]) => (
                <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {criteria.stage}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {criteria.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t.staging.characteristics}:
                      </h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {criteria.characteristics.map((char, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-pink-500 mr-2">•</span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t.staging.treatment}:
                      </h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {criteria.treatment.map((treatment, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {treatment}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t.staging.prognosis}:
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {criteria.prognosis}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.form.title}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.patientId}
                    </label>
                    <input
                      type="text"
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.testDate}
                    </label>
                    <input
                      type="date"
                      value={formData.testDate}
                      onChange={(e) => setFormData({...formData, testDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.testType}
                    </label>
                    <select
                      value={formData.testType}
                      onChange={(e) => setFormData({...formData, testType: e.target.value as CervicalCancerResult['testType']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(t.testTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Test Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.result}
                    </label>
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData({...formData, result: e.target.value as CervicalCancerResult['result']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(t.results).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.cancerConfirmed}
                        onChange={(e) => setFormData({...formData, cancerConfirmed: e.target.checked})}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t.form.cancerConfirmed}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.form.details}
                  </label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Cancer Staging (if confirmed) */}
                {formData.cancerConfirmed && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Cancer Staging Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t.form.stage}
                        </label>
                        <select
                          value={formData.stage}
                          onChange={(e) => setFormData({...formData, stage: e.target.value as CervicalCancerResult['stage']})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select Stage</option>
                          {Object.entries(STAGING_CRITERIA).map(([key, criteria]) => (
                            <option key={key} value={key}>{criteria.stage}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t.form.stageDescription}
                        </label>
                        <input
                          type="text"
                          value={formData.stageDescription}
                          onChange={(e) => setFormData({...formData, stageDescription: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Treatment Plan */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t.form.treatmentPlan}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.form.primaryTreatment}
                      </label>
                      <input
                        type="text"
                        value={formData.primaryTreatment}
                        onChange={(e) => setFormData({...formData, primaryTreatment: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t.form.additionalTreatments} (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.additionalTreatments}
                        onChange={(e) => setFormData({...formData, additionalTreatments: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t.form.followUp}
                        </label>
                        <input
                          type="text"
                          value={formData.followUpSchedule}
                          onChange={(e) => setFormData({...formData, followUpSchedule: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t.form.urgency}
                        </label>
                        <select
                          value={formData.urgency}
                          onChange={(e) => setFormData({...formData, urgency: e.target.value as CervicalCancerResult['treatmentPlan']['urgency']})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                        >
                          {Object.entries(t.urgency).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.referralRequired}
                          onChange={(e) => setFormData({...formData, referralRequired: e.target.checked})}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t.form.referralRequired}
                        </span>
                      </label>
                      
                      {formData.referralRequired && (
                        <input
                          type="text"
                          value={formData.referralTo}
                          onChange={(e) => setFormData({...formData, referralTo: e.target.value})}
                          placeholder={t.form.referralTo}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.form.notes}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t.form.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                  >
                    {t.form.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
