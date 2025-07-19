'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const content = {
    en: {
      title: "Something went wrong!",
      subtitle: "An unexpected error occurred",
      description: "We apologize for the inconvenience. Our team has been notified and is working to fix this issue.",
      buttons: {
        retry: "Try Again",
        home: "Go to Homepage",
        refresh: "Refresh Page"
      },
      errorDetails: {
        title: "Error Details",
        message: "Error Message:",
        showDetails: "Show Technical Details",
        hideDetails: "Hide Technical Details"
      },
      troubleshooting: {
        title: "Troubleshooting Steps:",
        steps: [
          "Refresh the page using the button above",
          "Clear your browser cache and cookies",
          "Try accessing the page in an incognito/private window",
          "Check your internet connection",
          "Contact support if the problem persists"
        ]
      },
      support: {
        title: "Need Help?",
        description: "If this error continues to occur, please contact our support team with the error details above."
      }
    },
    sw: {
      title: "Kuna tatizo!",
      subtitle: "Kosa lisilotarajiwa limetokea",
      description: "Tunaomba msamaha kwa usumbufu. Timu yetu imearifiwa na inafanya kazi kutatua tatizo hili.",
      buttons: {
        retry: "Jaribu Tena",
        home: "Nenda Nyumbani",
        refresh: "Onyesha Upya Ukurasa"
      },
      errorDetails: {
        title: "Maelezo ya Kosa",
        message: "Ujumbe wa Kosa:",
        showDetails: "Onyesha Maelezo ya Kiufundi",
        hideDetails: "Ficha Maelezo ya Kiufundi"
      },
      troubleshooting: {
        title: "Hatua za Kutatua Tatizo:",
        steps: [
          "Onyesha upya ukurasa kwa kutumia kitufe hapo juu",
          "Futa cache na cookies za kivinjari chako",
          "Jaribu kufikia ukurasa katika dirisha la faragha",
          "Angalia muunganisho wako wa mtandao",
          "Wasiliana na msaada ikiwa tatizo linaendelea"
        ]
      },
      support: {
        title: "Unahitaji Msaada?",
        description: "Ikiwa kosa hili linaendelea kutokea, tafadhali wasiliana na timu yetu ya msaada pamoja na maelezo ya kosa hapo juu."
      }
    }
  };

  const t = content[language];
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header with Language Toggle */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Afya Kuu</h1>
                <p className="text-xs text-gray-600">Prime Health</p>
              </div>
            </Link>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {language === 'en' ? 'SW' : 'EN'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.title}</h2>
          <p className="text-lg text-gray-600 mb-4">{t.subtitle}</p>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            {t.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={reset}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.buttons.retry}
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t.buttons.home}
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.buttons.refresh}
            </button>
          </div>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{t.errorDetails.title}</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showDetails ? t.errorDetails.hideDetails : t.errorDetails.showDetails}
            </button>
          </div>
          
          {showDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{t.errorDetails.message}</p>
              <code className="text-sm text-red-600 bg-red-50 p-2 rounded block overflow-x-auto">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Troubleshooting */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t.troubleshooting.title}</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            {t.troubleshooting.steps.map((step, index) => (
              <li key={index} className="text-sm">{step}</li>
            ))}
          </ol>
        </div>

        {/* Support Section */}
        <div className="bg-yellow-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">{t.support.title}</h3>
          <p className="text-yellow-800">{t.support.description}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 CodeSsipers. {language === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
