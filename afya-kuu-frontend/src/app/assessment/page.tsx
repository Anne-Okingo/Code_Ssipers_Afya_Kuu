'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

type UserType = 'doctor' | 'admin';
type AuthMode = 'login' | 'signup';

export default function Assessment() {
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [userType, setUserType] = useState<UserType>('doctor');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    hospitalName: '',
    licenseNumber: '',
    branchRegistration: '',
    adminName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL parameters for redirect messages
  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    if (message || error) {
      const messages = {
        login_required: language === 'en'
          ? 'Please login to access the dashboard.'
          : 'Tafadhali ingia ili kufikia dashibodi.',
        doctor_access_required: language === 'en'
          ? 'Doctor access required. Please login as a licensed practitioner.'
          : 'Ufikiaji wa daktari unahitajika. Tafadhali ingia kama mtaalamu wa afya.',
        admin_access_required: language === 'en'
          ? 'Administrator access required. Please login as a hospital administrator.'
          : 'Ufikiaji wa msimamizi unahitajika. Tafadhali ingia kama msimamizi wa hospitali.',
        session_expired: language === 'en'
          ? 'Your session has expired. Please login again.'
          : 'Kipindi chako kimemalizika. Tafadhali ingia tena.',
        access_denied: language === 'en'
          ? 'Access denied. Please login with appropriate credentials.'
          : 'Ufikiaji umekatazwa. Tafadhali ingia na utambulisho sahihi.'
      };

      const messageText = messages[message as keyof typeof messages] || messages[error as keyof typeof messages];
      if (messageText) {
        setRedirectMessage(messageText);
        setAuthMode('login'); // Switch to login mode when redirected

        // Clear the URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('message');
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, language]);

  const content = {
    en: {
      title: "Start Assessment",
      subtitle: "Sign up or login to access the cervical cancer risk assessment platform",
      nav: {
        home: "Home",
        howItWorks: "How It Works",
        startAssessment: "Start Assessment"
      },
      userTypes: {
        doctor: "Licensed Practitioner",
        admin: "Hospital Administrator"
      },
      authModes: {
        signup: "Sign Up",
        login: "Login"
      },
      forms: {
        doctor: {
          signup: {
            title: "Doctor Registration",
            subtitle: "Register as a licensed healthcare practitioner",
            fields: {
              email: "Email Address",
              hospitalName: "Hospital Name",
              licenseNumber: "Medical License Number",
              password: "Password",
              confirmPassword: "Confirm Password"
            },
            button: "Register as Doctor",
            note: "Your profile name will be the first part of your email address"
          },
          login: {
            title: "Doctor Login",
            subtitle: "Access your practitioner dashboard",
            fields: {
              email: "Email Address",
              password: "Password"
            },
            button: "Login to Dashboard"
          }
        },
        admin: {
          signup: {
            title: "Administrator Registration",
            subtitle: "Register as a hospital administrator",
            fields: {
              email: "Email Address",
              hospitalName: "Hospital Name",
              branchRegistration: "Branch Registration Number",
              adminName: "Administrator Name",
              password: "Password",
              confirmPassword: "Confirm Password"
            },
            button: "Register as Admin",
            note: "Your profile name will be the first part of your email address"
          },
          login: {
            title: "Administrator Login",
            subtitle: "Access your admin dashboard",
            fields: {
              email: "Email Address",
              password: "Password"
            },
            button: "Login to Admin Panel"
          }
        }
      },
      toggleText: {
        haveAccount: "Already have an account?",
        needAccount: "Don't have an account?",
        loginLink: "Login here",
        signupLink: "Sign up here"
      }
    },
    sw: {
      title: "Anza Tathmini",
      subtitle: "Jisajili au ingia ili kufikia jukwaa la tathmini ya hatari ya saratani ya mlango wa kizazi",
      nav: {
        home: "Nyumbani",
        howItWorks: "Jinsi Inavyofanya Kazi",
        startAssessment: "Anza Tathmini"
      },
      userTypes: {
        doctor: "Mtaalamu Aliye na Leseni",
        admin: "Msimamizi wa Hospitali"
      },
      authModes: {
        signup: "Jisajili",
        login: "Ingia"
      },
      forms: {
        doctor: {
          signup: {
            title: "Usajili wa Daktari",
            subtitle: "Jisajili kama mtaalamu wa afya aliye na leseni",
            fields: {
              email: "Anwani ya Barua Pepe",
              hospitalName: "Jina la Hospitali",
              licenseNumber: "Nambari ya Leseni ya Matibabu",
              password: "Nywila",
              confirmPassword: "Thibitisha Nywila"
            },
            button: "Jisajili kama Daktari",
            note: "Jina lako la wasifu litakuwa sehemu ya kwanza ya barua pepe yako"
          },
          login: {
            title: "Kuingia kwa Daktari",
            subtitle: "Fikia dashibodi yako ya utaalamu",
            fields: {
              email: "Anwani ya Barua Pepe",
              password: "Nywila"
            },
            button: "Ingia kwenye Dashibodi"
          }
        },
        admin: {
          signup: {
            title: "Usajili wa Msimamizi",
            subtitle: "Jisajili kama msimamizi wa hospitali",
            fields: {
              email: "Anwani ya Barua Pepe",
              hospitalName: "Jina la Hospitali",
              branchRegistration: "Nambari ya Usajili wa Tawi",
              adminName: "Jina la Msimamizi",
              password: "Nywila",
              confirmPassword: "Thibitisha Nywila"
            },
            button: "Jisajili kama Msimamizi",
            note: "Jina lako la wasifu litakuwa sehemu ya kwanza ya barua pepe yako"
          },
          login: {
            title: "Kuingia kwa Msimamizi",
            subtitle: "Fikia dashibodi yako ya usimamizi",
            fields: {
              email: "Anwani ya Barua Pepe",
              password: "Nywila"
            },
            button: "Ingia kwenye Paneli ya Msimamizi"
          }
        }
      },
      toggleText: {
        haveAccount: "Tayari una akaunti?",
        needAccount: "Huna akaunti?",
        loginLink: "Ingia hapa",
        signupLink: "Jisajili hapa"
      }
    }
  };

  const t = content[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        throw new Error(language === 'en' ? 'Email and password are required' : 'Barua pepe na nywila zinahitajika');
      }

      if (authMode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error(language === 'en' ? 'Passwords do not match' : 'Nywila hazifanani');
        }

        if (userType === 'doctor' && (!formData.hospitalName || !formData.licenseNumber)) {
          throw new Error(language === 'en' ? 'Hospital name and license number are required' : 'Jina la hospitali na nambari ya leseni zinahitajika');
        }

        if (userType === 'admin' && (!formData.hospitalName || !formData.branchRegistration || !formData.adminName)) {
          throw new Error(language === 'en' ? 'All admin fields are required' : 'Sehemu zote za msimamizi zinahitajika');
        }

        // Sign up
        const success = await signup({
          email: formData.email,
          password: formData.password,
          userType,
          hospitalName: formData.hospitalName,
          licenseNumber: formData.licenseNumber,
          branchRegistration: formData.branchRegistration,
          adminName: formData.adminName
        });

        if (!success) {
          throw new Error(language === 'en' ? 'User already exists with this email' : 'Mtumiaji tayari yupo na barua pepe hii');
        }
      } else {
        // Login
        const success = await login(formData.email, formData.password, userType);
        if (!success) {
          throw new Error(language === 'en' ? 'Invalid credentials' : 'Utambulisho si sahihi');
        }
      }

      // Redirect to appropriate dashboard
      if (userType === 'doctor') {
        router.push('/dashboard/doctor');
      } else {
        router.push('/dashboard/admin');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const currentForm = t.forms[userType][authMode];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50'
    }`}>
      {/* Navigation */}
      <Navigation
        currentPage="startAssessment"
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.title}
            </h1>
            <p className={`text-sm sm:text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t.subtitle}
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setUserType('doctor')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'doctor'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.userTypes.doctor}
              </button>
              <button
                onClick={() => setUserType('admin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'admin'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.userTypes.admin}
              </button>
            </div>
          </div>

          {/* Auth Mode Selection */}
          <div className="mb-8">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'signup'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.authModes.signup}
              </button>
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'login'
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.authModes.login}
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentForm.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {currentForm.subtitle}
              </p>
            </div>

            {/* Redirect Message */}
            {redirectMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">
                      {language === 'en' ? 'Authentication Required' : 'Uthibitisho Unahitajika'}
                    </p>
                    <p className="text-blue-700 text-sm mt-1">{redirectMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamic form fields based on user type and auth mode */}
              {Object.entries(currentForm.fields).map(([fieldKey, fieldLabel]) => (
                <div key={fieldKey}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fieldLabel}
                  </label>
                  <input
                    type={fieldKey.includes('password') ? 'password' : fieldKey === 'email' ? 'email' : 'text'}
                    name={fieldKey}
                    value={formData[fieldKey as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {language === 'en' ? 'Processing...' : 'Inachakata...'}
                  </>
                ) : (
                  currentForm.button
                )}
              </button>
            </form>

            {/* Note for signup */}
            {authMode === 'signup' && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                {currentForm.note}
              </p>
            )}

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {authMode === 'signup' ? t.toggleText.haveAccount : t.toggleText.needAccount}{' '}
                <button
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  {authMode === 'signup' ? t.toggleText.loginLink : t.toggleText.signupLink}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
