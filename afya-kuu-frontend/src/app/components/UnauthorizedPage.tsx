'use client';

import { useState } from 'react';
import Link from 'next/link';

interface UnauthorizedPageProps {
  language?: 'en' | 'sw';
  reason?: 'not_authenticated' | 'wrong_user_type' | 'access_denied';
}

export default function UnauthorizedPage({ 
  language = 'en', 
  reason = 'not_authenticated' 
}: UnauthorizedPageProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'sw'>('en');

  const content = {
    en: {
      title: "Access Denied",
      subtitle: "You don't have permission to access this page",
      reasons: {
        not_authenticated: "You need to be logged in to access this page.",
        wrong_user_type: "This page is restricted to specific user types.",
        access_denied: "You don't have the required permissions."
      },
      actions: {
        login: "Login / Register",
        home: "Go to Homepage",
        back: "Go Back"
      },
      help: {
        title: "Need Help?",
        doctor: "Are you a healthcare professional? Register as a Doctor",
        admin: "Are you a hospital administrator? Register as an Admin",
        contact: "Contact support if you're having trouble accessing your account"
      }
    },
    sw: {
      title: "Ufikiaji Umekatazwa",
      subtitle: "Huna ruhusa ya kufikia ukurasa huu",
      reasons: {
        not_authenticated: "Unahitaji kuingia ili kufikia ukurasa huu.",
        wrong_user_type: "Ukurasa huu umezuiliwa kwa aina fulani za watumiaji.",
        access_denied: "Huna ruhusa zinazohitajika."
      },
      actions: {
        login: "Ingia / Jisajili",
        home: "Nenda Ukurasa wa Nyumbani",
        back: "Rudi Nyuma"
      },
      help: {
        title: "Unahitaji Msaada?",
        doctor: "Je, wewe ni mtaalamu wa afya? Jisajili kama Daktari",
        admin: "Je, wewe ni msimamizi wa hospitali? Jisajili kama Msimamizi",
        contact: "Wasiliana na msaada ikiwa una shida kufikia akaunti yako"
      }
    }
  };

  const t = content[currentLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Afya Kuu</h1>
                <p className="text-xs text-gray-600">Prime Health</p>
              </div>
            </Link>
            
            <button
              onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'sw' : 'en')}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {currentLanguage === 'en' ? 'SW' : 'EN'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9m0 0V7m0 2h2m-2 0H10m8-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600 mb-4">{t.subtitle}</p>
            <p className="text-sm text-gray-500">{t.reasons[reason]}</p>
          </div>

          {/* Error Code */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-2xl font-bold text-gray-400 mr-2">404</span>
              <span className="text-sm text-gray-600">
                {currentLanguage === 'en' ? 'Page Not Found' : 'Ukurasa Haujapatikana'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <Link
              href="/assessment"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {t.actions.login}
            </Link>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/"
                className="bg-white text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200 text-center"
              >
                {t.actions.home}
              </Link>
              <button
                onClick={() => window.history.back()}
                className="bg-white text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                {t.actions.back}
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.help.title}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• {t.help.doctor}</p>
              <p>• {t.help.admin}</p>
              <p>• {t.help.contact}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              {currentLanguage === 'en' 
                ? 'If you believe this is an error, please contact support.' 
                : 'Ikiwa unaamini hii ni kosa, tafadhali wasiliana na msaada.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
