'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function HowItWorks() {
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  const content = {
    en: {
      title: "How It Works",
      subtitle: "A comprehensive guide for healthcare practitioners",
      nav: {
        home: "Home",
        howItWorks: "How It Works",
        startAssessment: "Start Assessment"
      },
      steps: [
        {
          title: "1. Sign Up & Verify",
          description: "Register as a licensed practitioner with your hospital details and license number. Our system verifies your credentials for security.",
          details: [
            "Provide hospital name and license number",
            "Create secure password",
            "Verify professional credentials",
            "Access granted within 24 hours"
          ]
        },
        {
          title: "2. Patient Assessment",
          description: "Input patient data through our intuitive interface. Use text or voice input for faster data entry.",
          details: [
            "Age, medical history, symptoms",
            "HPV status and screening history",
            "Risk factors and lifestyle information",
            "Voice-to-text capability available"
          ]
        },
        {
          title: "3. AI Risk Analysis",
          description: "Our advanced AI model analyzes the data and provides instant risk assessment with confidence scores.",
          details: [
            "Machine learning-powered analysis",
            "High/Low risk classification",
            "Confidence score provided",
            "Evidence-based recommendations"
          ]
        },
        {
          title: "4. Clinical Recommendations",
          description: "Receive detailed, evidence-based recommendations for patient care and follow-up actions.",
          details: [
            "Screening recommendations",
            "Follow-up timeline suggestions",
            "Referral guidelines",
            "Patient education materials"
          ]
        },
        {
          title: "5. Track & Confirm",
          description: "Submit actual diagnosis results to help improve the AI model accuracy over time.",
          details: [
            "Record actual test results",
            "Compare with AI predictions",
            "Provide feedback on accuracy",
            "Contribute to model improvement"
          ]
        }
      ],
      features: {
        title: "Platform Features",
        items: [
          {
            icon: "🏥",
            title: "Inventory Management",
            description: "Track cervical cancer test supplies and resources in real-time"
          },
          {
            icon: "📊",
            title: "Analytics Dashboard",
            description: "View patient statistics, assessment trends, and outcome reports"
          },
          {
            icon: "🔗",
            title: "Resource Links",
            description: "Direct access to specialists, medical camps, and support groups"
          },
          {
            icon: "💬",
            title: "Feedback System",
            description: "Provide platform feedback and improvement suggestions to admins"
          }
        ]
      }
    },
    sw: {
      title: "Jinsi Inavyofanya Kazi",
      subtitle: "Mwongozo wa kina kwa wataalamu wa afya",
      nav: {
        home: "Nyumbani",
        howItWorks: "Jinsi Inavyofanya Kazi",
        startAssessment: "Anza Tathmini"
      },
      steps: [
        {
          title: "1. Jisajili na Uthibitishe",
          description: "Jisajili kama mtaalamu aliye na leseni pamoja na maelezo ya hospitali yako na nambari ya leseni. Mfumo wetu unathibitisha utambulisho wako kwa usalama.",
          details: [
            "Toa jina la hospitali na nambari ya leseni",
            "Unda nywila salama",
            "Thibitisha utambulisho wa kitaalamu",
            "Ufikiaji utatolewa ndani ya masaa 24"
          ]
        },
        {
          title: "2. Tathmini ya Mgonjwa",
          description: "Ingiza data ya mgonjwa kupitia kiolesura chetu rahisi. Tumia maandishi au sauti kwa kuingiza data haraka.",
          details: [
            "Umri, historia ya matibabu, dalili",
            "Hali ya HPV na historia ya uchunguzi",
            "Mambo ya hatari na maelezo ya maisha",
            "Uwezo wa sauti-hadi-maandishi unapatikana"
          ]
        },
        {
          title: "3. Uchambuzi wa Hatari wa AI",
          description: "Mfumo wetu wa hali ya juu wa AI unachambua data na kutoa tathmini ya hatari ya papo hapo pamoja na alama za kujiamini.",
          details: [
            "Uchambuzi unaoendesha kujifunza kwa mashine",
            "Uainishaji wa hatari ya juu/chini",
            "Alama ya kujiamini inatolewa",
            "Mapendekezo yanayotegemea ushahidi"
          ]
        },
        {
          title: "4. Mapendekezo ya Kliniki",
          description: "Pokea mapendekezo ya kina, yanayotegemea ushahidi kwa huduma ya mgonjwa na hatua za kufuatilia.",
          details: [
            "Mapendekezo ya uchunguzi",
            "Mapendekezo ya ratiba ya kufuatilia",
            "Miongozo ya kurejea",
            "Nyenzo za elimu ya mgonjwa"
          ]
        },
        {
          title: "5. Fuatilia na Thibitisha",
          description: "Wasilisha matokeo halisi ya utambuzi ili kusaidia kuboresha usahihi wa mfumo wa AI kwa wakati.",
          details: [
            "Rekodi matokeo halisi ya kipimo",
            "Linganisha na utabiri wa AI",
            "Toa maoni kuhusu usahihi",
            "Changia katika kuboresha mfumo"
          ]
        }
      ],
      features: {
        title: "Vipengele vya Jukwaa",
        items: [
          {
            icon: "🏥",
            title: "Usimamizi wa Hesabu",
            description: "Fuatilia vifaa vya kipimo cha saratani ya mlango wa kizazi na rasilimali kwa wakati halisi"
          },
          {
            icon: "📊",
            title: "Dashibodi ya Uchambuzi",
            description: "Ona takwimu za wagonjwa, mienendo ya tathmini, na ripoti za matokeo"
          },
          {
            icon: "🔗",
            title: "Viungo vya Rasilimali",
            description: "Ufikiaji wa moja kwa moja kwa wataalamu, kambi za matibabu, na vikundi vya msaada"
          },
          {
            icon: "💬",
            title: "Mfumo wa Maoni",
            description: "Toa maoni ya jukwaa na mapendekezo ya kuboresha kwa wasimamizi"
          }
        ]
      }
    }
  };

  const t = content[language];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50'
    }`}>
      {/* Navigation */}
      <Navigation
        currentPage="howItWorks"
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {t.title}
          </h1>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {t.steps.map((step, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                {/* Content */}
                <div className="flex-1">
                  <h2 className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h2>
                  <p className={`text-lg mb-6 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Placeholder for Screenshot */}
                <div className="flex-1">
                  <div className={`rounded-xl p-8 h-80 flex items-center justify-center shadow-lg transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-600/30'
                      : 'bg-gradient-to-br from-pink-100 to-purple-100'
                  }`}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-2xl font-bold">{index + 1}</span>
                      </div>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {language === 'en' ? 'Screenshot Coming Soon' : 'Picha Inakuja Hivi Karibuni'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {language === 'en' ? 'Ready to Get Started?' : 'Uko Tayari Kuanza?'}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {language === 'en'
              ? 'Join healthcare professionals making a difference with AI-powered cervical cancer risk assessment.'
              : 'Jiunge na wataalamu wa afya wanaofanya tofauti kwa tathmini ya hatari ya saratani ya mlango wa kizazi inayoendeshwa na AI.'
            }
          </p>
          <Link
            href="/assessment"
            className="bg-white text-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            {language === 'en' ? 'Start Assessment' : 'Anza Tathmini'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Afya Kuu</h3>
                  <p className="text-sm text-gray-400">Prime Health</p>
                </div>
              </div>
              <p className="text-purple-100 mb-4">
                {language === 'en'
                  ? 'Empowering healthcare practitioners with AI-powered cervical cancer risk assessment for early detection and prevention.'
                  : 'Kuwawezesha wataalamu wa afya kwa tathmini ya hatari ya saratani ya mlango wa kizazi inayoendeshwa na AI kwa utambuzi wa mapema na kuzuia.'
                }
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{language === 'en' ? 'Quick Links' : 'Viungo vya Haraka'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">{t.nav.home}</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">{t.nav.howItWorks}</Link></li>
                <li><Link href="/assessment" className="hover:text-white transition-colors">{t.nav.startAssessment}</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{language === 'en' ? 'Resources' : 'Rasilimali'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{language === 'en' ? 'Research Papers' : 'Karatasi za Utafiti'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{language === 'en' ? 'Health Outreach' : 'Ufikishaji wa Afya'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{language === 'en' ? 'Medical Camps' : 'Kambi za Matibabu'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{language === 'en' ? 'Support Groups' : 'Vikundi vya Msaada'}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CodeSsipers. {language === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
