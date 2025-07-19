'use client';

import { useState, useEffect } from 'react';
import { PatientData } from '../services/api';
import FormFields from './FormFields';

interface FormStep {
  id: string;
  title: { en: string; sw: string };
  description: { en: string; sw: string };
  fields: string[];
  icon: string;
}

interface InteractiveAssessmentFormProps {
  patientData: PatientData;
  onDataChange: (data: PatientData) => void;
  onSubmit: () => void;
  language: 'en' | 'sw';
  isLoading: boolean;
}

const formSteps: FormStep[] = [
  {
    id: 'basic-info',
    title: { en: 'Basic Information', sw: 'Maelezo ya Msingi' },
    description: { en: 'Patient age and screening history', sw: 'Umri wa mgonjwa na historia ya uchunguzi' },
    fields: ['age', 'previousScreening'],
    icon: '👤'
  },
  {
    id: 'test-results',
    title: { en: 'Test Results', sw: 'Matokeo ya Vipimo' },
    description: { en: 'HPV and Pap smear test results', sw: 'Matokeo ya vipimo vya HPV na Pap smear' },
    fields: ['hpvStatus', 'papSmearResult'],
    icon: '🧪'
  },
  {
    id: 'lifestyle',
    title: { en: 'Lifestyle Factors', sw: 'Mambo ya Maisha' },
    description: { en: 'Smoking and health history', sw: 'Uvutaji sigara na historia ya afya' },
    fields: ['smokingStatus', 'stdHistory'],
    icon: '🚭'
  },
  {
    id: 'demographics',
    title: { en: 'Demographics', sw: 'Takwimu za Kijamii' },
    description: { en: 'Location and insurance information', sw: 'Maelezo ya mahali na bima' },
    fields: ['region', 'insuranceCovered'],
    icon: '🏥'
  },
  {
    id: 'symptoms',
    title: { en: 'Symptoms & Additional Info', sw: 'Dalili na Maelezo Mengine' },
    description: { en: 'Current symptoms and other details', sw: 'Dalili za sasa na maelezo mengine' },
    fields: ['symptoms', 'screeningTypeLast', 'sexualPartners', 'firstSexualActivityAge'],
    icon: '📝'
  }
];

export default function InteractiveAssessmentForm({
  patientData,
  onDataChange,
  onSubmit,
  language,
  isLoading
}: InteractiveAssessmentFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStep = formSteps[currentStepIndex];
  const isLastStep = currentStepIndex === formSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Check if current step is completed
  const isCurrentStepComplete = () => {
    return currentStep.fields.every(field => {
      const value = patientData[field as keyof PatientData];
      return value !== '' && value !== undefined && value !== null;
    });
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const updatedData = {
      ...patientData,
      [e.target.name]: e.target.value
    };
    onDataChange(updatedData);
  };

  // Navigate to next step
  const handleNext = () => {
    if (isCurrentStepComplete()) {
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      
      if (isLastStep) {
        onSubmit();
      } else {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
          setIsAnimating(false);
        }, 200);
      }
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  // Jump to specific step
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStepIndex || completedSteps.has(stepIndex)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex(stepIndex);
        setIsAnimating(false);
      }, 200);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / formSteps.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'en' ? 'Patient Assessment' : 'Tathmini ya Mgonjwa'}
          </h2>
          <span className="text-sm text-gray-500">
            {currentStepIndex + 1} / {formSteps.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {formSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                index === currentStepIndex
                  ? 'bg-pink-50 text-pink-600'
                  : index < currentStepIndex || completedSteps.has(index)
                  ? 'bg-green-50 text-green-600 cursor-pointer hover:bg-green-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={index > currentStepIndex && !completedSteps.has(index)}
            >
              <span className="text-lg mb-1">{step.icon}</span>
              <span className="text-xs font-medium hidden sm:block">
                {step.title[language]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStep.title[language]}
          </h3>
          <p className="text-gray-600 text-sm">
            {currentStep.description[language]}
          </p>
        </div>

        {/* Dynamic Form Fields */}
        <div className="space-y-6">
          <FormFields
            stepId={currentStep.id}
            patientData={patientData}
            onChange={handleInputChange}
            language={language}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            isFirstStep
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {language === 'en' ? '← Previous' : '← Nyuma'}
        </button>

        <div className="flex items-center space-x-2">
          {!isCurrentStepComplete() && (
            <span className="text-sm text-amber-600">
              {language === 'en' ? 'Complete all fields to continue' : 'Jaza sehemu zote ili kuendelea'}
            </span>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isCurrentStepComplete() || isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
            !isCurrentStepComplete() || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isLastStep
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {language === 'en' ? 'Processing...' : 'Inachakata...'}
            </>
          ) : isLastStep ? (
            language === 'en' ? 'Complete Assessment →' : 'Maliza Tathmini →'
          ) : (
            language === 'en' ? 'Next →' : 'Mbele →'
          )}
        </button>
      </div>
    </div>
  );
}
