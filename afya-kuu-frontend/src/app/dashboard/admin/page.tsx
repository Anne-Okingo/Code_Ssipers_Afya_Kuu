'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import AdminInventoryManagement from '../../components/AdminInventoryManagement';
import ResourcesManagement from '../../components/ResourcesManagement';
import PatientRecords from '../../components/PatientRecords';
import FeedbackSystem from '../../components/FeedbackSystem';

type AdminView = 'overview' | 'inventory' | 'patients' | 'resources' | 'reports' | 'feedback';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [currentView, setCurrentView] = useState<AdminView>('overview');

  const content = {
    en: {
      title: "Admin Dashboard",
      subtitle: "Hospital Management & Analytics",
      nav: {
        overview: "Overview",
        inventory: "Inventory Management",
        patients: "Patient Records",
        resources: "Resources",
        reports: "Reports & Analytics",
        feedback: "Feedback",
        logout: "Logout"
      },
      overview: {
        title: "Hospital Overview",
        stats: [
          { label: "Total Assessments", value: "1,247", change: "+12%" },
          { label: "Active Doctors", value: "23", change: "+2" },
          { label: "High Risk Cases", value: "89", change: "-5%" },
          { label: "Inventory Items", value: "156", change: "+8" }
        ]
      },
      inventory: {
        title: "Inventory Management",
        items: [
          { name: "Pap Smear Kits", current: 45, minimum: 20, status: "In Stock", lastUpdated: "2024-01-15" },
          { name: "HPV Test Kits", current: 12, minimum: 25, status: "Low Stock", lastUpdated: "2024-01-14" },
          { name: "Colposcopy Supplies", current: 8, minimum: 15, status: "Critical", lastUpdated: "2024-01-13" },
          { name: "Biopsy Equipment", current: 23, minimum: 10, status: "In Stock", lastUpdated: "2024-01-15" }
        ],
        actions: {
          addStock: "Add Stock",
          updateMinimum: "Update Minimum",
          orderSupplies: "Order Supplies"
        }
      },
      resources: {
        title: "Resource Management",
        categories: [
          {
            title: "Medical Camps",
            items: [
              "Nairobi General Hospital - March 15, 2024",
              "Kenyatta Hospital - March 22, 2024",
              "Moi Teaching Hospital - April 5, 2024"
            ]
          },
          {
            title: "Support Groups",
            items: [
              "Cervical Cancer Survivors - Every Tuesday",
              "Family Support Group - Every Thursday",
              "Healthcare Workers Support - Monthly"
            ]
          },
          {
            title: "Specialist Referrals",
            items: [
              "Dr. Sarah Kimani - Oncologist",
              "Dr. James Mwangi - Gynecologist",
              "Dr. Mary Wanjiku - Pathologist"
            ]
          }
        ]
      },
      reports: {
        title: "Reports & Analytics",
        metrics: [
          { title: "Assessment Accuracy", value: "94.2%", trend: "up" },
          { title: "Early Detection Rate", value: "78%", trend: "up" },
          { title: "Patient Follow-up", value: "85%", trend: "down" },
          { title: "Resource Utilization", value: "92%", trend: "up" }
        ]
      }
    },
    sw: {
      title: "Dashibodi ya Msimamizi",
      subtitle: "Usimamizi wa Hospitali na Uchambuzi",
      nav: {
        overview: "Muhtasari",
        inventory: "Usimamizi wa Hesabu",
        patients: "Rekodi za Wagonjwa",
        resources: "Rasilimali",
        reports: "Ripoti na Uchambuzi",
        feedback: "Maoni",
        logout: "Toka"
      },
      overview: {
        title: "Muhtasari wa Hospitali",
        stats: [
          { label: "Tathmini Jumla", value: "1,247", change: "+12%" },
          { label: "Madaktari Hai", value: "23", change: "+2" },
          { label: "Visa vya Hatari ya Juu", value: "89", change: "-5%" },
          { label: "Vitu vya Hesabu", value: "156", change: "+8" }
        ]
      },
      inventory: {
        title: "Usimamizi wa Hesabu",
        items: [
          { name: "Vifaa vya Pap Smear", current: 45, minimum: 20, status: "Ipo Hifadhini", lastUpdated: "2024-01-15" },
          { name: "Vifaa vya Kipimo cha HPV", current: 12, minimum: 25, status: "Hesabu Ndogo", lastUpdated: "2024-01-14" },
          { name: "Vifaa vya Colposcopy", current: 8, minimum: 15, status: "Hatari", lastUpdated: "2024-01-13" },
          { name: "Vifaa vya Biopsy", current: 23, minimum: 10, status: "Ipo Hifadhini", lastUpdated: "2024-01-15" }
        ],
        actions: {
          addStock: "Ongeza Hesabu",
          updateMinimum: "Sasisha Kiwango cha Chini",
          orderSupplies: "Agiza Vifaa"
        }
      },
      resources: {
        title: "Usimamizi wa Rasilimali",
        categories: [
          {
            title: "Kambi za Matibabu",
            items: [
              "Hospitali Kuu ya Nairobi - Machi 15, 2024",
              "Hospitali ya Kenyatta - Machi 22, 2024",
              "Hospitali ya Mafunzo ya Moi - Aprili 5, 2024"
            ]
          },
          {
            title: "Vikundi vya Msaada",
            items: [
              "Waliopona Saratani ya Mlango wa Kizazi - Kila Jumanne",
              "Kikundi cha Msaada wa Familia - Kila Alhamisi",
              "Msaada wa Wafanyakazi wa Afya - Kila Mwezi"
            ]
          },
          {
            title: "Kurejea kwa Wataalamu",
            items: [
              "Dk. Sarah Kimani - Mtaalamu wa Saratani",
              "Dk. James Mwangi - Mtaalamu wa Wanawake",
              "Dk. Mary Wanjiku - Mtaalamu wa Pathology"
            ]
          }
        ]
      },
      reports: {
        title: "Ripoti na Uchambuzi",
        metrics: [
          { title: "Usahihi wa Tathmini", value: "94.2%", trend: "up" },
          { title: "Kiwango cha Utambuzi wa Mapema", value: "78%", trend: "up" },
          { title: "Kufuatilia Wagonjwa", value: "85%", trend: "down" },
          { title: "Matumizi ya Rasilimali", value: "92%", trend: "up" }
        ]
      }
    }
  };

  const t = content[language];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock':
      case 'ipo hifadhini':
        return 'text-green-600 bg-green-100';
      case 'low stock':
      case 'hesabu ndogo':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'hatari':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ProtectedRoute requiredUserType="admin">
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Afya Kuu</h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Prime Health</p>
              </div>
            </div>

            {/* User Info & Controls */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {language === 'en' ? 'SW' : 'EN'}
              </button>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Admin - {user?.profileName || 'User'}
              </div>
              <button
                onClick={logout}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                {t.nav.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className={`rounded-lg shadow-sm p-4 transition-colors duration-200 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{t.title}</h2>
              <ul className="space-y-2">
                {Object.entries(t.nav).slice(0, -1).map(([key, label]) => (
                  <li key={key}>
                    <button
                      onClick={() => setCurrentView(key as AdminView)}
                      className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                        currentView === key
                          ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview */}
            {currentView === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.overview.title}</h2>
                
                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {t.overview.stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                      <div className={`text-xs font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'en' ? 'Recent Activity' : 'Shughuli za Hivi Karibuni'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {language === 'en' ? 'Dr. Jane Smith completed 5 assessments' : 'Dk. Jane Smith alikamilisha tathmini 5'}
                      </span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {language === 'en' ? 'HPV Test Kits running low' : 'Vifaa vya Kipimo cha HPV vinapungua'}
                      </span>
                      <span className="text-xs text-gray-500">4 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {language === 'en' ? 'New medical camp scheduled' : 'Kambi mpya ya matibabu imepangwa'}
                      </span>
                      <span className="text-xs text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Management */}
            {currentView === 'inventory' && (
              <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <AdminInventoryManagement
                  language={language}
                />
              </div>
            )}

            {/* Patient Records */}
            {currentView === 'patients' && (
              <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <PatientRecords
                  language={language}
                  doctorId="admin_view_all"
                />
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    {language === 'en' ? 'Admin Patient Overview' : 'Muhtasari wa Wagonjwa wa Msimamizi'}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    {language === 'en'
                      ? 'View all patient records across the facility. Monitor assessment trends, risk distributions, and follow-up compliance.'
                      : 'Ona rekodi zote za wagonjwa katika kituo. Fuatilia mielekeo ya tathmini, usambazaji wa hatari, na kufuata maagizo.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Resources */}
            {currentView === 'resources' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <ResourcesManagement
                  language={language}
                  userRole="admin"
                  userId={user?.id || 'admin_001'}
                  userName={user?.profileName || user?.email || 'Admin'}
                />
              </div>
            )}

            {/* Reports */}
            {currentView === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.reports.title}</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {t.reports.metrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                          <div className="text-sm text-gray-600">{metric.title}</div>
                        </div>
                        <div className={`text-2xl ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          {metric.trend === 'up' ? '↗' : '↘'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'en' ? 'Monthly Assessment Trends' : 'Mienendo ya Tathmini ya Kila Mwezi'}
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600">
                      {language === 'en' ? 'Chart visualization will be implemented here' : 'Mchoro wa kuonyesha utatekelezwa hapa'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            {currentView === 'feedback' && (
              <div className={`rounded-2xl shadow-2xl p-8 transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <FeedbackSystem
                  language={language}
                  userId={user?.id || 'admin_001'}
                  userRole="admin"
                  userName={user?.email || 'Admin'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
