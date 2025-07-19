'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from './components/Navigation';
import { useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  const content = {
    en: {
      title: "Afya Kuu",
      subtitle: "Prime Health",
      tagline: "AI-Powered Cervical Cancer Risk Assessment Platform",
      description: "Empowering healthcare practitioners with intelligent risk assessment tools for early detection and prevention of cervical cancer.",
      nav: {
        home: "Home",
        howItWorks: "How It Works",
        startAssessment: "Start Assessment"
      },
      hero: {
        title: "Early Detection Saves Lives",
        subtitle: "Professional cervical cancer risk assessment platform designed for healthcare practitioners",
        cta: "Start Assessment",
        learnMore: "Learn More"
      },
      sections: {
        overview: "Understanding Cervical Cancer",
        symptoms: "Signs & Symptoms",
        prevention: "Prevention & Screening",
        statistics: "Key Statistics"
      }
    },
    sw: {
      title: "Afya Kuu",
      subtitle: "Afya Bora",
      tagline: "Jukwaa la Tathmini ya Hatari ya Saratani ya Mlango wa Kizazi",
      description: "Kuwawezesha wataalamu wa afya kwa zana za akili za tathmini ya hatari kwa utambuzi wa mapema na kuzuia saratani ya mlango wa kizazi.",
      nav: {
        home: "Nyumbani",
        howItWorks: "Jinsi Inavyofanya Kazi",
        startAssessment: "Anza Tathmini"
      },
      hero: {
        title: "Utambuzi wa Mapema Huokoa Maisha",
        subtitle: "Jukwaa la kitaalamu la tathmini ya hatari ya saratani ya mlango wa kizazi lililotengenezwa kwa wataalamu wa afya",
        cta: "Anza Tathmini",
        learnMore: "Jifunze Zaidi"
      },
      sections: {
        overview: "Kuelewa Saratani ya Mlango wa Kizazi",
        symptoms: "Dalili na Ishara",
        prevention: "Kuzuia na Uchunguzi",
        statistics: "Takwimu Muhimu"
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
        currentPage="home"
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {t.hero.title}
          </h1>
          <p className={`text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              href="/assessment"
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t.hero.cta}
            </Link>
            <button className={`border-2 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
              isDarkMode
                ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
                : 'border-pink-600 text-pink-600 hover:bg-pink-50'
            }`}>
              {t.hero.learnMore}
            </button>
          </div>
        </div>
      </section>

      {/* Educational Content Sections */}
      <section className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Overview Section */}
          <div className="mb-12 sm:mb-16">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{t.sections.overview}</h2>
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              <div className="order-2 lg:order-1">
                <h3 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {language === 'en' ? 'What is Cervical Cancer?' : 'Saratani ya Mlango wa Kizazi ni Nini?'}
                </h3>
                <p className={`mb-4 text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {language === 'en'
                    ? 'Cervical cancer occurs in the cells of the cervix — the lower part of the uterus that connects to the vagina. It is primarily caused by persistent infection with high-risk types of human papillomavirus (HPV).'
                    : 'Saratani ya mlango wa kizazi hutokea katika seli za mlango wa kizazi — sehemu ya chini ya kizazi inayounganisha na uke. Husababishwa hasa na maambukizi ya kudumu ya aina za hatari za virusi vya papilloma vya binadamu (HPV).'
                  }
                </p>
                <h4 className={`text-base sm:text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {language === 'en' ? 'Main Causes:' : 'Sababu Kuu:'}
                </h4>
                <ul className={`space-y-2 text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <li>• {language === 'en' ? 'HPV infection (types 16, 18, 31, 33, 45, 52, 58)' : 'Maambukizi ya HPV (aina 16, 18, 31, 33, 45, 52, 58)'}</li>
                  <li>• {language === 'en' ? 'Multiple sexual partners' : 'Washirika wengi wa kijinsia'}</li>
                  <li>• {language === 'en' ? 'Early sexual activity' : 'Shughuli za kijinsia za mapema'}</li>
                  <li>• {language === 'en' ? 'Weakened immune system' : 'Mfumo wa kinga uliodhoofika'}</li>
                  <li>• {language === 'en' ? 'Smoking' : 'Uvutaji sigara'}</li>
                </ul>
              </div>
              <div className={`order-1 lg:order-2 p-4 sm:p-6 rounded-xl shadow-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-600/30'
                  : 'bg-gradient-to-br from-pink-100 to-purple-100'
              }`}>
                <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {language === 'en' ? 'Risk Factors' : 'Mambo ya Hatari'}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span className={`text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{language === 'en' ? 'Age 25-65 years' : 'Umri wa miaka 25-65'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span className={`text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{language === 'en' ? 'History of STIs' : 'Historia ya magonjwa ya zinaa'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span className={`text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{language === 'en' ? 'Long-term contraceptive use' : 'Matumizi ya muda mrefu ya kizuizi cha uzazi'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span className={`text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{language === 'en' ? 'Family history' : 'Historia ya familia'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">{t.sections.symptoms}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Early Symptoms */}
              <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4">
                  {language === 'en' ? 'Early Signs' : 'Dalili za Mapema'}
                </h3>
                <ul className="text-green-700 space-y-2 text-sm sm:text-base">
                  <li>• {language === 'en' ? 'Unusual vaginal bleeding' : 'Kutokwa damu kwa kawaida kutoka ukeni'}</li>
                  <li>• {language === 'en' ? 'Bleeding between periods' : 'Kutokwa damu kati ya hedhi'}</li>
                  <li>• {language === 'en' ? 'Bleeding after intercourse' : 'Kutokwa damu baada ya tendo la ndoa'}</li>
                  <li>• {language === 'en' ? 'Unusual vaginal discharge' : 'Kutokwa kwa kawaida kutoka ukeni'}</li>
                </ul>
              </div>

              {/* Advanced Symptoms */}
              <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-yellow-200">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3 sm:mb-4">
                  {language === 'en' ? 'Advanced Signs' : 'Dalili za Kiwango cha Juu'}
                </h3>
                <ul className="text-yellow-700 space-y-2 text-sm sm:text-base">
                  <li>• {language === 'en' ? 'Pelvic pain' : 'Maumivu ya kiuno'}</li>
                  <li>• {language === 'en' ? 'Pain during urination' : 'Maumivu wakati wa kukojoa'}</li>
                  <li>• {language === 'en' ? 'Heavy menstrual bleeding' : 'Kutokwa damu nyingi wakati wa hedhi'}</li>
                  <li>• {language === 'en' ? 'Leg swelling' : 'Kuvimba kwa miguu'}</li>
                </ul>
              </div>

              {/* Danger Signs */}
              <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200 sm:col-span-2 lg:col-span-1">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-3 sm:mb-4">
                  {language === 'en' ? '🚨 Danger Signs' : '🚨 Dalili za Hatari'}
                </h3>
                <ul className="text-red-700 space-y-2 text-sm sm:text-base">
                  <li>• {language === 'en' ? 'Severe pelvic pain' : 'Maumivu makali ya kiuno'}</li>
                  <li>• {language === 'en' ? 'Heavy bleeding' : 'Kutokwa damu nyingi'}</li>
                  <li>• {language === 'en' ? 'Difficulty urinating' : 'Ugumu wa kukojoa'}</li>
                  <li>• {language === 'en' ? 'Unexplained weight loss' : 'Kupungua uzito bila sababu'}</li>
                </ul>
                <p className="text-red-800 font-semibold mt-3 sm:mt-4 text-xs sm:text-sm">
                  {language === 'en' ? 'Seek immediate medical attention!' : 'Tafuta msaada wa matibabu mara moja!'}
                </p>
              </div>
            </div>
          </div>

          {/* Prevention Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.sections.prevention}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vaccination */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">
                  💉 {language === 'en' ? 'HPV Vaccination' : 'Chanjo ya HPV'}
                </h3>
                <p className="text-blue-700 mb-4">
                  {language === 'en'
                    ? 'HPV vaccines protect against the most common cancer-causing types of HPV. Most effective when given before exposure to HPV.'
                    : 'Chanjo za HPV zinakinga dhidi ya aina za kawaida za HPV zinazosababisha saratani. Ni bora zaidi zinapotolewa kabla ya kuambukizwa HPV.'
                  }
                </p>
                <ul className="text-blue-700 space-y-2">
                  <li>• {language === 'en' ? 'Recommended age: 9-14 years' : 'Umri unaopendekezwa: miaka 9-14'}</li>
                  <li>• {language === 'en' ? 'Can be given up to age 26' : 'Inaweza kutolewa hadi umri wa miaka 26'}</li>
                  <li>• {language === 'en' ? '2-3 doses depending on age' : 'Kipimo 2-3 kulingana na umri'}</li>
                </ul>
              </div>

              {/* Screening */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">
                  🔬 {language === 'en' ? 'Regular Screening' : 'Uchunguzi wa Kawaida'}
                </h3>
                <p className="text-purple-700 mb-4">
                  {language === 'en'
                    ? 'Regular screening can detect precancerous changes before they become cancer. Early detection saves lives.'
                    : 'Uchunguzi wa kawaida unaweza kutambua mabadiliko ya kabla ya saratani kabla hayajawa saratani. Utambuzi wa mapema huokoa maisha.'
                  }
                </p>
                <ul className="text-purple-700 space-y-2">
                  <li>• {language === 'en' ? 'Pap smear: Every 3 years (21-65)' : 'Uchunguzi wa Pap: Kila miaka 3 (21-65)'}</li>
                  <li>• {language === 'en' ? 'HPV test: Every 5 years (30-65)' : 'Kipimo cha HPV: Kila miaka 5 (30-65)'}</li>
                  <li>• {language === 'en' ? 'Co-testing: Every 5 years' : 'Uchunguzi wa pamoja: Kila miaka 5'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">{t.sections.statistics}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-pink-600 mb-1 sm:mb-2">604K</div>
                <p className="text-gray-700 text-xs sm:text-sm leading-tight">{language === 'en' ? 'New cases globally (2020)' : 'Visa vipya duniani (2020)'}</p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">342K</div>
                <p className="text-gray-700 text-xs sm:text-sm leading-tight">{language === 'en' ? 'Deaths globally (2020)' : 'Vifo duniani (2020)'}</p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">90%</div>
                <p className="text-gray-700 text-xs sm:text-sm leading-tight">{language === 'en' ? 'Preventable with screening' : 'Inaweza kuzuiliwa kwa uchunguzi'}</p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">99%</div>
                <p className="text-gray-700 text-xs sm:text-sm leading-tight">{language === 'en' ? 'Caused by HPV infection' : 'Husababishwa na maambukizi ya HPV'}</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'en' ? 'Ready to Make a Difference?' : 'Uko Tayari Kufanya Tofauti?'}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {language === 'en'
                ? 'Join healthcare professionals using AI-powered risk assessment for better patient outcomes.'
                : 'Jiunge na wataalamu wa afya wanaotumia tathmini ya hatari inayoendeshwa na AI kwa matokeo bora ya wagonjwa.'
              }
            </p>
            <Link
              href="/assessment"
              className="bg-white text-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              {language === 'en' ? 'Start Assessment Now' : 'Anza Tathmini Sasa'}
            </Link>
          </div>
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
                  <h3 className="text-xl font-bold">{t.title}</h3>
                  <p className="text-sm text-gray-400">{t.subtitle}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
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
