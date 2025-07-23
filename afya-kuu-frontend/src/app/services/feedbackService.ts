// Feedback Management Service for Afya Kuu Platform
'use client';

// Real-time sync configuration
const FEEDBACK_SYNC_EVENT = 'feedback_updated';
const FEEDBACK_STORAGE_KEY = 'afya_kuu_feedback';

// Custom event emitter for real-time feedback sync
class FeedbackEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export const feedbackEmitter = new FeedbackEventEmitter();

export interface FeedbackItem {
  id: string;
  userId: string;
  userRole: 'doctor' | 'admin';
  userName: string;
  category: 'feature_request' | 'bug_report' | 'improvement' | 'general' | 'inventory' | 'ui_ux';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  adminResponseDate?: string;
  adminResponseBy?: string;
  votes: number;
  votedBy: string[];
}

export interface FeedbackStats {
  totalFeedback: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  averageResponseTime: number;
  resolvedThisMonth: number;
}

// Local storage keys (already defined above)

// Get all feedback items
export function getAllFeedback(): FeedbackItem[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Get feedback by user
export function getUserFeedback(userId: string): FeedbackItem[] {
  return getAllFeedback().filter(feedback => feedback.userId === userId);
}

// Submit new feedback
export function submitFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'votes' | 'votedBy'>): boolean {
  try {
    const allFeedback = getAllFeedback();
    
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: generateId(),
      status: 'submitted',
      votes: 0,
      votedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allFeedback.push(newFeedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
    
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
}

// Update feedback status (Admin only)
export function updateFeedbackStatus(
  feedbackId: string, 
  status: FeedbackItem['status'], 
  adminResponse?: string, 
  adminId?: string
): boolean {
  try {
    const allFeedback = getAllFeedback();
    const feedbackIndex = allFeedback.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) return false;
    
    allFeedback[feedbackIndex] = {
      ...allFeedback[feedbackIndex],
      status,
      updatedAt: new Date().toISOString(),
      ...(adminResponse && {
        adminResponse,
        adminResponseDate: new Date().toISOString(),
        adminResponseBy: adminId
      })
    };
    
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
    return true;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return false;
  }
}

// Vote on feedback
export function voteFeedback(feedbackId: string, userId: string): boolean {
  try {
    const allFeedback = getAllFeedback();
    const feedbackIndex = allFeedback.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) return false;
    
    const feedback = allFeedback[feedbackIndex];
    
    // Check if user already voted
    if (feedback.votedBy.includes(userId)) {
      // Remove vote
      feedback.votes -= 1;
      feedback.votedBy = feedback.votedBy.filter(id => id !== userId);
    } else {
      // Add vote
      feedback.votes += 1;
      feedback.votedBy.push(userId);
    }
    
    feedback.updatedAt = new Date().toISOString();
    
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
    return true;
  } catch (error) {
    console.error('Error voting on feedback:', error);
    return false;
  }
}

// Get feedback by category
export function getFeedbackByCategory(category: FeedbackItem['category']): FeedbackItem[] {
  return getAllFeedback().filter(feedback => feedback.category === category);
}

// Get feedback by status
export function getFeedbackByStatus(status: FeedbackItem['status']): FeedbackItem[] {
  return getAllFeedback().filter(feedback => feedback.status === status);
}

// Search feedback
export function searchFeedback(query: string): FeedbackItem[] {
  const allFeedback = getAllFeedback();
  const lowercaseQuery = query.toLowerCase();
  
  return allFeedback.filter(feedback =>
    feedback.title.toLowerCase().includes(lowercaseQuery) ||
    feedback.description.toLowerCase().includes(lowercaseQuery) ||
    feedback.userName.toLowerCase().includes(lowercaseQuery) ||
    feedback.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Get feedback statistics
export function getFeedbackStats(): FeedbackStats {
  const allFeedback = getAllFeedback();
  
  const stats: FeedbackStats = {
    totalFeedback: allFeedback.length,
    byCategory: {},
    byStatus: {},
    byPriority: {},
    averageResponseTime: 0,
    resolvedThisMonth: 0
  };
  
  // Count by category
  allFeedback.forEach(feedback => {
    stats.byCategory[feedback.category] = (stats.byCategory[feedback.category] || 0) + 1;
    stats.byStatus[feedback.status] = (stats.byStatus[feedback.status] || 0) + 1;
    stats.byPriority[feedback.priority] = (stats.byPriority[feedback.priority] || 0) + 1;
  });
  
  // Calculate resolved this month
  const thisMonth = new Date();
  stats.resolvedThisMonth = allFeedback.filter(feedback => {
    if (feedback.status !== 'resolved') return false;
    const updatedDate = new Date(feedback.updatedAt);
    return updatedDate.getMonth() === thisMonth.getMonth() && 
           updatedDate.getFullYear() === thisMonth.getFullYear();
  }).length;
  
  // Calculate average response time (for resolved items with admin response)
  const resolvedWithResponse = allFeedback.filter(f => 
    f.status === 'resolved' && f.adminResponseDate
  );
  
  if (resolvedWithResponse.length > 0) {
    const totalResponseTime = resolvedWithResponse.reduce((sum, feedback) => {
      const created = new Date(feedback.createdAt);
      const responded = new Date(feedback.adminResponseDate!);
      return sum + (responded.getTime() - created.getTime());
    }, 0);
    
    stats.averageResponseTime = totalResponseTime / resolvedWithResponse.length / (1000 * 60 * 60 * 24); // Convert to days
  }
  
  return stats;
}

// Get top voted feedback
export function getTopVotedFeedback(limit: number = 10): FeedbackItem[] {
  return getAllFeedback()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);
}

// Get recent feedback
export function getRecentFeedback(limit: number = 10): FeedbackItem[] {
  return getAllFeedback()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// Helper function
function generateId(): string {
  return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize with sample feedback
export function initializeSampleFeedback() {
  const feedback = getAllFeedback();
  if (feedback.length === 0) {
    const sampleFeedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'votes' | 'votedBy'>[] = [
      {
        userId: 'doctor_001',
        userRole: 'doctor',
        userName: 'Dr. Sarah Mwangi',
        category: 'feature_request',
        title: 'Add Patient Photo Upload',
        description: 'It would be helpful to upload patient photos for better identification and record keeping. This would improve patient management and reduce mix-ups.',
        priority: 'medium',
        attachments: []
      },
      {
        userId: 'doctor_002',
        userRole: 'doctor',
        userName: 'Dr. James Kiprotich',
        category: 'improvement',
        title: 'Improve Voice Input Accuracy',
        description: 'The voice input feature sometimes misinterprets medical terms. Could we add a medical dictionary or improve the recognition for medical terminology?',
        priority: 'high',
        attachments: []
      },
      {
        userId: 'admin_001',
        userRole: 'admin',
        userName: 'Admin Mary',
        category: 'inventory',
        title: 'Bulk Import for Inventory',
        description: 'Need ability to import inventory items from Excel/CSV files instead of adding them one by one. This would save significant time during initial setup.',
        priority: 'medium',
        attachments: []
      },
      {
        userId: 'doctor_003',
        userRole: 'doctor',
        userName: 'Dr. Grace Wanjiru',
        category: 'ui_ux',
        title: 'Dark Mode for Assessment Forms',
        description: 'The assessment forms are quite bright in dark mode. Could we improve the contrast and make them more comfortable for extended use?',
        priority: 'low',
        attachments: []
      },
      {
        userId: 'doctor_001',
        userRole: 'doctor',
        userName: 'Dr. Sarah Mwangi',
        category: 'bug_report',
        title: 'Patient Records Not Saving',
        description: 'Sometimes patient records fail to save after completing an assessment. This happens about 1 in 10 times and is quite frustrating.',
        priority: 'critical',
        attachments: []
      }
    ];
    
    sampleFeedback.forEach(item => submitFeedback(item));
    
    // Add some admin responses to resolved items
    const allFeedback = getAllFeedback();
    if (allFeedback.length >= 2) {
      updateFeedbackStatus(
        allFeedback[3].id, 
        'resolved', 
        'Thank you for the feedback! We have improved the dark mode contrast in the latest update. The assessment forms now have better visibility in dark mode.',
        'admin_001'
      );
    }
  }
}
