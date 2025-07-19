'use client';

import { PatientData } from '../services/api';

interface FormFieldsProps {
  stepId: string;
  patientData: PatientData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  language: 'en' | 'sw';
}

export default function FormFields({ stepId, patientData, onChange, language }: FormFieldsProps) {
  const t = {
    en: {
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
      }
    },
    sw: {
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
      }
    }
  };

  const fields = t[language].fields;

  const renderBasicInfo = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.age} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="age"
          value={patientData.age}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 transition-all duration-200"
          placeholder={language === 'en' ? 'Enter age (e.g., 25)' : 'Ingiza umri (mfano, 25)'}
          min="1"
          max="100"
          required
        />
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Patient age in years' : 'Umri wa mgonjwa kwa miaka'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.previousScreening}
        </label>
        <input
          type="date"
          name="previousScreening"
          value={patientData.previousScreening}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
        />
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Date of last cervical cancer screening (if any)' : 'Tarehe ya uchunguzi wa mwisho wa saratani ya mlango wa kizazi (ikiwa ipo)'}
        </p>
      </div>
    </div>
  );

  const renderTestResults = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.hpvStatus} <span className="text-red-500">*</span>
        </label>
        <select
          name="hpvStatus"
          value={patientData.hpvStatus}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          required
        >
          <option value="" disabled className="text-gray-400">
            {language === 'en' ? '-- Select HPV test status --' : '-- Chagua hali ya kipimo cha HPV --'}
          </option>
          <option value="positive">{language === 'en' ? 'Positive' : 'Chanya'}</option>
          <option value="negative">{language === 'en' ? 'Negative' : 'Hasi'}</option>
          <option value="unknown">{language === 'en' ? 'Unknown' : 'Haijulikani'}</option>
        </select>
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Human Papillomavirus test result' : 'Matokeo ya kipimo cha virusi vya HPV'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.papSmearResult} <span className="text-red-500">*</span>
        </label>
        <select
          name="papSmearResult"
          value={patientData.papSmearResult}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          required
        >
          <option value="" disabled className="text-gray-400">
            {language === 'en' ? '-- Select Pap smear result --' : '-- Chagua matokeo ya Pap smear --'}
          </option>
          <option value="Y">{language === 'en' ? 'Yes (Abnormal)' : 'Ndio (Isiyo ya kawaida)'}</option>
          <option value="N">{language === 'en' ? 'No (Normal)' : 'Hapana (Ya kawaida)'}</option>
        </select>
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Papanicolaou test result for abnormal cells' : 'Matokeo ya kipimo cha Papanicolaou kwa seli zisizo za kawaida'}
        </p>
      </div>
    </div>
  );

  const renderLifestyle = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.smokingStatus} <span className="text-red-500">*</span>
        </label>
        <select
          name="smokingStatus"
          value={patientData.smokingStatus}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          required
        >
          <option value="" disabled className="text-gray-400">
            {language === 'en' ? '-- Select smoking status --' : '-- Chagua hali ya uvutaji sigara --'}
          </option>
          <option value="Y">{language === 'en' ? 'Yes (Current or former smoker)' : 'Ndio (Mvutaji wa sasa au wa zamani)'}</option>
          <option value="N">{language === 'en' ? 'No (Never smoked)' : 'Hapana (Hajawahi kuvuta)'}</option>
        </select>
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Current or past tobacco use' : 'Matumizi ya tumbaku ya sasa au ya zamani'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.stdHistory} <span className="text-red-500">*</span>
        </label>
        <select
          name="stdHistory"
          value={patientData.stdHistory}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          required
        >
          <option value="" disabled className="text-gray-400">
            {language === 'en' ? '-- Select STD history --' : '-- Chagua historia ya magonjwa ya zinaa --'}
          </option>
          <option value="Y">{language === 'en' ? 'Yes (Has history of STDs)' : 'Ndio (Ana historia ya magonjwa ya zinaa)'}</option>
          <option value="N">{language === 'en' ? 'No (No history of STDs)' : 'Hapana (Hana historia ya magonjwa ya zinaa)'}</option>
        </select>
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'History of sexually transmitted diseases' : 'Historia ya magonjwa yanayoambukizwa kwa njia ya ngono'}
        </p>
      </div>
    </div>
  );

  const renderDemographics = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.region} <span className="text-red-500">*</span>
        </label>
        <select
          name="region"
          value={patientData.region}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          required
        >
          <option value="" disabled className="text-gray-400">
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
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Geographic region where patient resides' : 'Eneo la kijiografia ambapo mgonjwa anaishi'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.insuranceCovered} <span className="text-red-500">*</span>
        </label>
        <select
          name="insuranceCovered"
          value={patientData.insuranceCovered}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          required
        >
          <option value="" disabled className="text-gray-400">
            {language === 'en' ? '-- Select insurance coverage --' : '-- Chagua ufunikaji wa bima --'}
          </option>
          <option value="Y">{language === 'en' ? 'Yes (Has insurance)' : 'Ndio (Ana bima)'}</option>
          <option value="N">{language === 'en' ? 'No (No insurance)' : 'Hapana (Hana bima)'}</option>
        </select>
        <p className="text-xs text-gray-500">
          {language === 'en' ? 'Health insurance coverage status' : 'Hali ya ufunikaji wa bima ya afya'}
        </p>
      </div>
    </div>
  );

  const renderSymptoms = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fields.symptoms}
        </label>
        <textarea
          name="symptoms"
          value={patientData.symptoms}
          onChange={onChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 transition-all duration-200"
          placeholder={language === 'en' 
            ? 'Describe any symptoms such as unusual bleeding, pelvic pain, discharge, etc...' 
            : 'Elezea dalili zoyote kama vile kutokwa damu kwa kawaida, maumivu ya kiuno, kutokwa, n.k...'}
        />
        <p className="text-xs text-gray-500">
          {language === 'en' 
            ? 'Include any unusual symptoms the patient is experiencing' 
            : 'Jumuisha dalili zoyote zisizo za kawaida ambazo mgonjwa anazipata'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fields.screeningTypeLast}
          </label>
          <select
            name="screeningTypeLast"
            value={patientData.screeningTypeLast}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          >
            <option value="" disabled className="text-gray-400">
              {language === 'en' ? '-- Select screening type --' : '-- Chagua aina ya uchunguzi --'}
            </option>
            <option value="PAP SMEAR">{language === 'en' ? 'Pap Smear' : 'Pap Smear'}</option>
            <option value="HPV DNA">{language === 'en' ? 'HPV DNA Test' : 'Kipimo cha HPV DNA'}</option>
            <option value="VIA">{language === 'en' ? 'VIA (Visual Inspection)' : 'VIA (Uchunguzi wa Macho)'}</option>
            <option value="NONE">{language === 'en' ? 'Never screened' : 'Hajawahi kuchunguzwa'}</option>
          </select>
          <p className="text-xs text-gray-500">
            {language === 'en' ? 'Type of last cervical cancer screening' : 'Aina ya uchunguzi wa mwisho wa saratani ya mlango wa kizazi'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fields.sexualPartners}
          </label>
          <select
            name="sexualPartners"
            value={patientData.sexualPartners}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          >
            <option value="" disabled className="text-gray-400">
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
          <p className="text-xs text-gray-500">
            {language === 'en' ? 'Total number of sexual partners in lifetime' : 'Jumla ya washirika wa kijinsia maishani'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fields.firstSexualActivityAge}
          </label>
          <select
            name="firstSexualActivityAge"
            value={patientData.firstSexualActivityAge}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          >
            <option value="" disabled className="text-gray-400">
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
          <p className="text-xs text-gray-500">
            {language === 'en' ? 'Age when first sexual activity occurred' : 'Umri wa shughuli ya kwanza ya kijinsia'}
          </p>
        </div>
      </div>
    </div>
  );

  switch (stepId) {
    case 'basic-info':
      return renderBasicInfo();
    case 'test-results':
      return renderTestResults();
    case 'lifestyle':
      return renderLifestyle();
    case 'demographics':
      return renderDemographics();
    case 'symptoms':
      return renderSymptoms();
    default:
      return <div>Unknown step</div>;
  }
}
