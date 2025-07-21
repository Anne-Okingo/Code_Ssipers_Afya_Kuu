'use client';

import { useState, useEffect } from 'react';
import { 
  getAllFeedback,
  getUserFeedback,
  submitFeedback,
  voteFeedback,
  getFeedbackStats,
  getTopVotedFeedback,
  getRecentFeedback,
  initializeSampleFeedback,
  type FeedbackItem,
  type FeedbackStats
} from '../services/feedbackService';

interface FeedbackSystemProps {
  language: 'en' | 'sw';
  userId: string;
  userRole: 'doctor' | 'admin';
  userName: string;
}

export default function FeedbackSystem({ language, userId, userRole, userName }: FeedbackSystemProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'view' | 'stats'>('submit');
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMyFeedbackOnly, setShowMyFeedbackOnly] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: 'general' as FeedbackItem['category'],
    title: '',
    description: '',
    priority: 'medium' as FeedbackItem['priority']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const content = {
    en: {
      title: 'Feedback System',
      subtitle: 'Help us improve Afya Kuu platform',
      tabs: {
        submit: 'Submit Feedback',
        view: 'View Feedback',
        stats: 'Statistics'
      },
      form: {
        category: 'Category',
        title: 'Title',
        description: 'Description',
        priority: 'Priority',
        submit: 'Submit Feedback',
        submitting: 'Submitting...',
        success: 'Feedback submitted successfully!',
        titlePlaceholder: 'Brief title for your feedback',
        descriptionPlaceholder: 'Detailed description of your feedback, suggestion, or issue'
      },
      categories: {
        feature_request: 'Feature Request',
        bug_report: 'Bug Report',
        improvement: 'Improvement',
        general: 'General',
        inventory: 'Inventory',
        ui_ux: 'UI/UX'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },
      status: {
        submitted: 'Submitted',
        under_review: 'Under Review',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        rejected: 'Rejected'
      },
      filters: {
        all: 'All Feedback',
        myFeedback: 'My Feedback Only',
        topVoted: 'Top Voted',
        recent: 'Recent'
      },
      stats: {
        totalFeedback: 'Total Feedback',
        resolvedThisMonth: 'Resolved This Month',
        averageResponseTime: 'Avg Response Time',
        byCategory: 'By Category',
        byStatus: 'By Status',
        byPriority: 'By Priority'
      },
      actions: {
        vote: 'Vote',
        voted: 'Voted',
        viewDetails: 'View Details'
      },
      noFeedback: 'No feedback items found',
      loading: 'Loading feedback...'
    },
    sw: {
      title: 'Mfumo wa Maoni',
      subtitle: 'Tusaidie kuboresha jukwaa la Afya Kuu',
      tabs: {
        submit: 'Tuma Maoni',
        view: 'Ona Maoni',
        stats: 'Takwimu'
      },
      form: {
        category: 'Aina',
        title: 'Kichwa',
        description: 'Maelezo',
        priority: 'Kipaumbele',
        submit: 'Tuma Maoni',
        submitting: 'Inatuma...',
        success: 'Maoni yametumwa kwa ufanisi!',
        titlePlaceholder: 'Kichwa kifupi cha maoni yako',
        descriptionPlaceholder: 'Maelezo kamili ya maoni, pendekezo, au tatizo lako'
      },
      categories: {
        feature_request: 'Ombi la Kipengele',
        bug_report: 'Ripoti ya Hitilafu',
        improvement: 'Uboreshaji',
        general: 'Jumla',
        inventory: 'Hifadhi',
        ui_ux: 'Muonekano/Matumizi'
      },
      priorities: {
        low: 'Chini',
        medium: 'Kati',
        high: 'Juu',
        critical: 'Muhimu Sana'
      },
      status: {
        submitted: 'Yametumwa',
        under_review: 'Yanakaguliwa',
        in_progress: 'Yanaendelea',
        resolved: 'Yametatuliwa',
        rejected: 'Yamekataliwa'
      },
      filters: {
        all: 'Maoni Yote',
        myFeedback: 'Maoni Yangu Tu',
        topVoted: 'Yenye Kura Nyingi',
        recent: 'Ya Hivi Karibuni'
      },
      stats: {
        totalFeedback: 'Jumla ya Maoni',
        resolvedThisMonth: 'Yaliyotatuliwa Mwezi Huu',
        averageResponseTime: 'Muda wa Wastani wa Majibu',
        byCategory: 'Kwa Aina',
        byStatus: 'Kwa Hali',
        byPriority: 'Kwa Kipaumbele'
      },
      actions: {
        vote: 'Piga Kura',
        voted: 'Umepiga Kura',
        viewDetails: 'Ona Maelezo'
      },
      noFeedback: 'Hakuna maoni yaliyopatikana',
      loading: 'Inapakia maoni...'
    }
  };

  const t = content[language];

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    setIsLoading(true);
    try {
      // Initialize sample data if needed
      initializeSampleFeedback();
      
      const allFeedback = getAllFeedback();
      const feedbackStats = getFeedbackStats();
      
      setFeedback(allFeedback);
      setStats(feedbackStats);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      const success = submitFeedback({
        userId,
        userRole,
        userName,
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        attachments: []
      });

      if (success) {
        setSubmitSuccess(true);
        setFormData({
          category: 'general',
          title: '',
          description: '',
          priority: 'medium'
        });
        
        // Reload feedback data
        await loadFeedbackData();
        
        // Hide success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = (feedbackId: string) => {
    voteFeedback(feedbackId, userId);
    loadFeedbackData(); // Reload to update vote counts
  };

  const getStatusColor = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: FeedbackItem['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredFeedback = showMyFeedbackOnly 
    ? feedback.filter(item => item.userId === userId)
    : feedback;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-KE' : 'sw-KE');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['submit', 'view', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.tabs[tab]}
            </button>
          ))}
        </nav>
      </div>

      {/* Submit Feedback Tab */}
      {activeTab === 'submit' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {t.form.success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.form.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as FeedbackItem['category']})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(t.categories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.form.priority}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as FeedbackItem['priority']})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(t.priorities).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.form.title}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t.form.titlePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.form.description}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t.form.descriptionPlaceholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t.form.submitting : t.form.submit}
            </button>
          </form>
        </div>
      )}

      {/* View Feedback Tab */}
      {activeTab === 'view' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showMyFeedbackOnly}
                  onChange={(e) => setShowMyFeedbackOnly(e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.filters.myFeedback}
                </span>
              </label>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t.noFeedback}
              </div>
            ) : (
              filteredFeedback.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.userName}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {t.status[item.status]}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                          {t.priorities[item.priority]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(item.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                          item.votedBy.includes(userId)
                            ? 'bg-pink-100 text-pink-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{item.votes}</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      t.categories[item.category] ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {t.categories[item.category]}
                    </span>
                    
                    {item.adminResponse && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Admin responded
                      </div>
                    )}
                  </div>
                  
                  {item.adminResponse && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        Admin Response:
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {item.adminResponse}
                      </p>
                      {item.adminResponseDate && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {formatDate(item.adminResponseDate)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFeedback}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.totalFeedback}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.resolvedThisMonth}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.resolvedThisMonth}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageResponseTime > 0 ? `${Math.round(stats.averageResponseTime)} days` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.averageResponseTime}</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.stats.byCategory}
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t.categories[category as keyof typeof t.categories] || category}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.stats.byStatus}
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t.status[status as keyof typeof t.status] || status}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
