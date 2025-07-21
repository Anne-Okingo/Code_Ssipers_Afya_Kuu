'use client';

import { useState, useEffect } from 'react';
import { 
  getPatientRecords, 
  getPatientSummaries,
  searchPatientRecords,
  getPatientStatistics,
  getPatientsNeedingFollowUp,
  initializeSamplePatientRecords,
  type PatientRecord,
  type PatientSummary
} from '../services/patientRecordsService';

interface PatientRecordsProps {
  language: 'en' | 'sw';
  doctorId: string;
}

export default function PatientRecords({ language, doctorId }: PatientRecordsProps) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [showFollowUpOnly, setShowFollowUpOnly] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPatientDetail, setShowPatientDetail] = useState(false);

  const content = {
    en: {
      title: 'Patient Records',
      subtitle: 'Comprehensive patient assessment history',
      search: 'Search patients...',
      filters: {
        allRisk: 'All Risk Levels',
        high: 'High Risk',
        medium: 'Medium Risk',
        low: 'Low Risk',
        followUp: 'Show Follow-up Needed Only'
      },
      stats: {
        total: 'Total Patients',
        highRisk: 'High Risk',
        mediumRisk: 'Medium Risk',
        lowRisk: 'Low Risk',
        followUp: 'Need Follow-up',
        thisMonth: 'This Month'
      },
      table: {
        patientId: 'Patient ID',
        name: 'Full Name',
        age: 'Age',
        phone: 'Phone',
        lastAssessment: 'Last Assessment',
        riskLevel: 'Risk Level',
        status: 'Status',
        actions: 'Actions'
      },
      actions: {
        view: 'View Details',
        edit: 'Edit Record',
        followUp: 'Schedule Follow-up'
      },
      patientDetail: {
        title: 'Patient Details',
        personalInfo: 'Personal Information',
        medicalHistory: 'Medical History',
        assessmentResults: 'Assessment Results',
        followUp: 'Follow-up Information',
        close: 'Close'
      },
      personalInfo: {
        firstName: 'First Name',
        lastName: 'Last Name',
        dateOfBirth: 'Date of Birth',
        age: 'Age',
        phone: 'Phone Number',
        email: 'Email',
        address: 'Address',
        emergencyContact: 'Emergency Contact',
        emergencyPhone: 'Emergency Phone'
      },
      medicalHistory: {
        previousScreening: 'Previous Screening',
        hpvStatus: 'HPV Status',
        symptoms: 'Symptoms',
        papSmearResult: 'Pap Smear Result',
        smokingStatus: 'Smoking Status',
        stdHistory: 'STD History',
        region: 'Region',
        insurance: 'Insurance Coverage',
        lastScreeningType: 'Last Screening Type',
        sexualPartners: 'Sexual Partners',
        firstSexualAge: 'First Sexual Activity Age',
        riskFactors: 'Risk Factors'
      },
      assessmentResults: {
        riskLevel: 'Risk Level',
        riskPercentage: 'Risk Percentage',
        probability: 'Risk Probability',
        recommendations: 'Recommendations',
        assessmentDate: 'Assessment Date',
        assessedBy: 'Assessed By'
      },
      followUpInfo: {
        nextAppointment: 'Next Appointment',
        instructions: 'Follow-up Instructions',
        status: 'Status'
      },
      status: {
        pending: 'Pending',
        scheduled: 'Scheduled',
        completed: 'Completed',
        overdue: 'Overdue'
      },
      riskLevels: {
        HIGH: 'High Risk',
        MEDIUM: 'Medium Risk',
        LOW: 'Low Risk'
      },
      noResults: 'No patients found matching your criteria',
      loading: 'Loading patient records...'
    },
    sw: {
      title: 'Rekodi za Wagonjwa',
      subtitle: 'Historia kamili ya tathmini za wagonjwa',
      search: 'Tafuta wagonjwa...',
      filters: {
        allRisk: 'Viwango Vyote vya Hatari',
        high: 'Hatari Kubwa',
        medium: 'Hatari ya Kati',
        low: 'Hatari Ndogo',
        followUp: 'Onyesha Wanaohitaji Ufuatiliaji Tu'
      },
      stats: {
        total: 'Jumla ya Wagonjwa',
        highRisk: 'Hatari Kubwa',
        mediumRisk: 'Hatari ya Kati',
        lowRisk: 'Hatari Ndogo',
        followUp: 'Wanahitaji Ufuatiliaji',
        thisMonth: 'Mwezi Huu'
      },
      table: {
        patientId: 'Nambari ya Mgonjwa',
        name: 'Jina Kamili',
        age: 'Umri',
        phone: 'Simu',
        lastAssessment: 'Tathmini ya Mwisho',
        riskLevel: 'Kiwango cha Hatari',
        status: 'Hali',
        actions: 'Vitendo'
      },
      actions: {
        view: 'Ona Maelezo',
        edit: 'Hariri Rekodi',
        followUp: 'Panga Ufuatiliaji'
      },
      patientDetail: {
        title: 'Maelezo ya Mgonjwa',
        personalInfo: 'Taarifa za Kibinafsi',
        medicalHistory: 'Historia ya Matibabu',
        assessmentResults: 'Matokeo ya Tathmini',
        followUp: 'Taarifa za Ufuatiliaji',
        close: 'Funga'
      },
      personalInfo: {
        firstName: 'Jina la Kwanza',
        lastName: 'Jina la Mwisho',
        dateOfBirth: 'Tarehe ya Kuzaliwa',
        age: 'Umri',
        phone: 'Nambari ya Simu',
        email: 'Barua Pepe',
        address: 'Anwani',
        emergencyContact: 'Mtu wa Dharura',
        emergencyPhone: 'Simu ya Dharura'
      },
      medicalHistory: {
        previousScreening: 'Uchunguzi wa Awali',
        hpvStatus: 'Hali ya HPV',
        symptoms: 'Dalili',
        papSmearResult: 'Matokeo ya Pap Smear',
        smokingStatus: 'Hali ya Uvutaji Sigara',
        stdHistory: 'Historia ya Magonjwa ya Ngono',
        region: 'Mkoa',
        insurance: 'Bima ya Afya',
        lastScreeningType: 'Aina ya Uchunguzi wa Mwisho',
        sexualPartners: 'Washirika wa Ngono',
        firstSexualAge: 'Umri wa Kwanza wa Ngono',
        riskFactors: 'Sababu za Hatari'
      },
      assessmentResults: {
        riskLevel: 'Kiwango cha Hatari',
        riskPercentage: 'Asilimia ya Hatari',
        probability: 'Uwezekano wa Hatari',
        recommendations: 'Mapendekezo',
        assessmentDate: 'Tarehe ya Tathmini',
        assessedBy: 'Aliyetathmini'
      },
      followUpInfo: {
        nextAppointment: 'Miadi Ijayo',
        instructions: 'Maagizo ya Ufuatiliaji',
        status: 'Hali'
      },
      status: {
        pending: 'Inasubiri',
        scheduled: 'Imepangwa',
        completed: 'Imekamilika',
        overdue: 'Imechelewa'
      },
      riskLevels: {
        HIGH: 'Hatari Kubwa',
        MEDIUM: 'Hatari ya Kati',
        LOW: 'Hatari Ndogo'
      },
      noResults: 'Hakuna wagonjwa waliopatikana kulingana na vigezo vyako',
      loading: 'Inapakia rekodi za wagonjwa...'
    }
  };

  const t = content[language];

  useEffect(() => {
    loadPatientData();
  }, [doctorId]);

  const loadPatientData = async () => {
    setIsLoading(true);
    try {
      // Initialize sample data if needed
      initializeSamplePatientRecords(doctorId);
      
      const patientSummaries = getPatientSummaries(doctorId);
      const stats = getPatientStatistics(doctorId);
      
      setPatients(patientSummaries);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPatient = (patientId: string) => {
    const allRecords = getPatientRecords(doctorId);
    const patient = allRecords.find(p => p.patientId === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientDetail(true);
    }
  };

  const filteredPatients = patients.filter(patient => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!patient.patientId.toLowerCase().includes(query) &&
          !patient.fullName.toLowerCase().includes(query) &&
          !patient.phoneNumber.includes(query)) {
        return false;
      }
    }

    // Risk level filter
    if (filterRisk !== 'all' && patient.riskLevel !== filterRisk.toUpperCase()) {
      return false;
    }

    // Follow-up filter
    if (showFollowUpOnly && patient.status !== 'pending' && patient.status !== 'overdue') {
      return false;
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-KE' : 'sw-KE');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{t.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalPatients}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{statistics.highRisk}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.highRisk}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{statistics.mediumRisk}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.mediumRisk}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{statistics.lowRisk}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.lowRisk}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{statistics.needingFollowUp}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.followUp}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{statistics.assessmentsThisMonth}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.thisMonth}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t.filters.allRisk}</option>
              <option value="high">{t.filters.high}</option>
              <option value="medium">{t.filters.medium}</option>
              <option value="low">{t.filters.low}</option>
            </select>
          </div>

          {/* Follow-up Filter */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFollowUpOnly}
                onChange={(e) => setShowFollowUpOnly(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t.filters.followUp}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Patient Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.patientId}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.age}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.phone}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.lastAssessment}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.riskLevel}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t.noResults}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {patient.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {patient.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {patient.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(patient.lastAssessment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(patient.riskLevel)}`}>
                        {t.riskLevels[patient.riskLevel as keyof typeof t.riskLevels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                        {t.status[patient.status as keyof typeof t.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewPatient(patient.patientId)}
                        className="text-pink-600 hover:text-pink-900 mr-3"
                      >
                        {t.actions.view}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {showPatientDetail && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.patientDetail.title} - {selectedPatient.patientId}
                </h3>
                <button
                  onClick={() => setShowPatientDetail(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t.patientDetail.personalInfo}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.personalInfo.firstName}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.personalInfo.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.personalInfo.lastName}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.personalInfo.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.personalInfo.age}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.personalInfo.age}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.personalInfo.phone}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.personalInfo.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.personalInfo.email}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.personalInfo.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.personalInfo.address}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedPatient.personalInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Assessment Results */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t.patientDetail.assessmentResults}
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {t.assessmentResults.riskLevel}
                        </label>
                        <p className={`font-semibold ${selectedPatient.assessmentResults.riskLevel === 'HIGH' ? 'text-red-600' : 
                          selectedPatient.assessmentResults.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {t.riskLevels[selectedPatient.assessmentResults.riskLevel as keyof typeof t.riskLevels]}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {t.assessmentResults.riskPercentage}
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedPatient.assessmentResults.riskPercentage}%</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t.assessmentResults.recommendations}
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1 p-3 bg-white dark:bg-gray-600 rounded border">
                        {selectedPatient.assessmentResults.recommendations}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
