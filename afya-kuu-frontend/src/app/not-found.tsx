'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  const content = {
    en: {
      title: "Page Not Found",
      subtitle: "Sorry, we couldn't find the page you're looking for.",
      description: "The page you are trying to access is not available or has been moved. Please check the URL or navigate back to our homepage.",
      buttons: {
        home: "Go to Homepage",
        back: "Go Back"
      },
      availablePages: {
        title: "Available Pages:",
        pages: [
          { name: "Home", path: "/", description: "Main landing page with platform overview" },
          { name: "How It Works", path: "/how-it-works", description: "Learn about our risk assessment process" },
          { name: "Start Assessment", path: "/assessment", description: "Begin cervical cancer risk assessment or login" }
        ]
      },
      support: {
        title: "Need Help?",
        description: "If you believe this is an error, please contact our support team or try refreshing the page."
      }
    },
    sw: {
      title: "Ukurasa Haujapatikana",
      subtitle: "Samahani, hatukuweza kupata ukurasa unaoutafuta.",
      description: "Ukurasa unaojaribu kufikia haupatikani au umehamishwa. Tafadhali angalia URL au rudi kwenye ukurasa wetu wa nyumbani.",
      buttons: {
        home: "Nenda Nyumbani",
        back: "Rudi Nyuma"
      },
      availablePages: {
        title: "Kurasa Zinazopatikana:",
        pages: [
          { name: "Nyumbani", path: "/", description: "Ukurasa mkuu wa jukwaa" },
          { name: "Jinsi Inavyofanya Kazi", path: "/how-it-works", description: "Jifunze kuhusu mchakato wetu wa tathmini ya hatari" },
          { name: "Anza Tathmini", path: "/assessment", description: "Anza tathmini ya hatari au ingia" }
        ]
      },
      support: {
        title: "Unahitaji Msaada?",
        description: "Ikiwa unaamini hii ni kosa, tafadhali wasiliana na timu yetu ya msaada au jaribu kuonyesha upya ukurasa."
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.title}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            {t.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.buttons.back}
            </button>
          </div>
        </div>

        {/* Available Pages */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{t.availablePages.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {t.availablePages.pages.map((page, index) => (
              <Link
                key={index}
                href={page.path}
                className="block p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors group"
              >
                <h4 className="font-medium text-gray-900 group-hover:text-pink-600 mb-1">
                  {page.name}
                </h4>
                <p className="text-sm text-gray-600">{page.description}</p>
                <span className="text-xs text-gray-400 font-mono">{page.path}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{t.support.title}</h3>
          <p className="text-blue-700">{t.support.description}</p>
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
