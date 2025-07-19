'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentPage?: string;
  language: 'en' | 'sw';
  onLanguageChange: (lang: 'en' | 'sw') => void;
}

export default function Navigation({ currentPage = '', language, onLanguageChange }: NavigationProps) {
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const content = {
    en: {
      nav: {
        home: "Home",
        howItWorks: "How It Works",
        startAssessment: "Start Assessment"
      }
    },
    sw: {
      nav: {
        home: "Nyumbani",
        howItWorks: "Jinsi Inavyofanya Kazi",
        startAssessment: "Anza Tathmini"
      }
    }
  };

  const t = content[language];

  const navItems = [
    { key: 'home', label: t.nav.home, href: '/' },
    { key: 'howItWorks', label: t.nav.howItWorks, href: '/how-it-works' },
    { key: 'startAssessment', label: t.nav.startAssessment, href: '/assessment', isPrimary: true }
  ];

  return (
    <nav className={`backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Afya Kuu</h1>
              <p className="text-xs text-gray-600">Prime Health</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`font-medium transition-colors ${
                  item.isPrimary
                    ? 'bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700'
                    : currentPage === item.key
                    ? 'text-pink-600'
                    : 'text-gray-700 hover:text-pink-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'sw' : 'en')}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {language === 'en' ? 'SW' : 'EN'}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.isPrimary
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : currentPage === item.key
                      ? 'text-pink-600 bg-pink-50'
                      : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
