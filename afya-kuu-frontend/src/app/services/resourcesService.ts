// Resources Management Service for Afya Kuu Platform
'use client';

// Real-time sync configuration
const RESOURCES_SYNC_EVENT = 'resources_updated';
const RESOURCES_STORAGE_KEY = 'afya_kuu_resources';

// Custom event emitter for real-time resources sync
class ResourcesEventEmitter {
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

export const resourcesEmitter = new ResourcesEventEmitter();

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: 'educational' | 'guidelines' | 'forms' | 'training' | 'research' | 'policies';
  type: 'document' | 'video' | 'image' | 'link' | 'presentation';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number; // in bytes
  downloadCount: number;
  uploadedBy: string;
  uploadedByRole: 'doctor' | 'admin';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublic: boolean;
  language: 'en' | 'sw' | 'both';
  status: 'active' | 'archived' | 'pending_review';
}

export interface ResourceGroup {
  id: string;
  name: string;
  description: string;
  resources: string[]; // Resource IDs
  createdBy: string;
  createdByRole: 'doctor' | 'admin';
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

// Sample resources data
const SAMPLE_RESOURCES: ResourceItem[] = [
  {
    id: 'res_001',
    title: 'Cervical Cancer Screening Guidelines 2024',
    description: 'Updated WHO guidelines for cervical cancer screening in Kenya',
    category: 'guidelines',
    type: 'document',
    fileName: 'cervical_screening_guidelines_2024.pdf',
    fileSize: 2048000, // 2MB
    downloadCount: 45,
    uploadedBy: 'Dr. Sarah Mwangi',
    uploadedByRole: 'doctor',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    tags: ['screening', 'guidelines', 'WHO', 'Kenya'],
    isPublic: true,
    language: 'both',
    status: 'active'
  },
  {
    id: 'res_002',
    title: 'Patient Education: HPV Vaccination',
    description: 'Educational material about HPV vaccination for patients',
    category: 'educational',
    type: 'presentation',
    fileName: 'hpv_vaccination_education.pptx',
    fileSize: 5120000, // 5MB
    downloadCount: 78,
    uploadedBy: 'Admin User',
    uploadedByRole: 'admin',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    tags: ['HPV', 'vaccination', 'patient education'],
    isPublic: true,
    language: 'both',
    status: 'active'
  },
  {
    id: 'res_003',
    title: 'Colposcopy Training Video',
    description: 'Step-by-step colposcopy procedure training video',
    category: 'training',
    type: 'video',
    fileName: 'colposcopy_training.mp4',
    fileSize: 15360000, // 15MB
    downloadCount: 23,
    uploadedBy: 'Dr. James Kiprotich',
    uploadedByRole: 'doctor',
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
    tags: ['colposcopy', 'training', 'procedure'],
    isPublic: true,
    language: 'en',
    status: 'active'
  },
  {
    id: 'res_004',
    title: 'Patient Consent Forms',
    description: 'Standard consent forms for cervical cancer screening procedures',
    category: 'forms',
    type: 'document',
    fileName: 'consent_forms_package.zip',
    fileSize: 1024000, // 1MB
    downloadCount: 156,
    uploadedBy: 'Admin User',
    uploadedByRole: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
    tags: ['consent', 'forms', 'legal'],
    isPublic: true,
    language: 'both',
    status: 'active'
  }
];

const SAMPLE_GROUPS: ResourceGroup[] = [
  {
    id: 'group_001',
    name: 'Screening Protocols',
    description: 'Complete set of cervical cancer screening protocols and guidelines',
    resources: ['res_001', 'res_004'],
    createdBy: 'Dr. Sarah Mwangi',
    createdByRole: 'doctor',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    isPublic: true
  },
  {
    id: 'group_002',
    name: 'Patient Education Materials',
    description: 'Educational resources for patient awareness and education',
    resources: ['res_002'],
    createdBy: 'Admin User',
    createdByRole: 'admin',
    createdAt: '2024-01-10T15:00:00Z',
    updatedAt: '2024-01-10T15:00:00Z',
    isPublic: true
  }
];

// Initialize resources if not exists
function initializeResources(): void {
  if (typeof window === 'undefined') return;
  
  const existingResources = localStorage.getItem(RESOURCES_STORAGE_KEY);
  if (!existingResources) {
    const initialData = {
      resources: SAMPLE_RESOURCES,
      groups: SAMPLE_GROUPS
    };
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(initialData));
  }
}

// Get all resources
export function getAllResources(): ResourceItem[] {
  if (typeof window === 'undefined') return [];
  
  initializeResources();
  const data = JSON.parse(localStorage.getItem(RESOURCES_STORAGE_KEY) || '{"resources": [], "groups": []}');
  return data.resources || [];
}

// Get all resource groups
export function getAllResourceGroups(): ResourceGroup[] {
  if (typeof window === 'undefined') return [];
  
  initializeResources();
  const data = JSON.parse(localStorage.getItem(RESOURCES_STORAGE_KEY) || '{"resources": [], "groups": []}');
  return data.groups || [];
}

// Add new resource
export function addResource(resource: Omit<ResourceItem, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>): string {
  const resources = getAllResources();
  const groups = getAllResourceGroups();
  
  const newResource: ResourceItem = {
    ...resource,
    id: generateResourceId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    downloadCount: 0
  };
  
  resources.push(newResource);
  
  const data = { resources, groups };
  localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(data));
  
  // Emit real-time update
  resourcesEmitter.emit(RESOURCES_SYNC_EVENT, { type: 'resource_added', resource: newResource });
  
  return newResource.id;
}

// Add new resource group
export function addResourceGroup(group: Omit<ResourceGroup, 'id' | 'createdAt' | 'updatedAt'>): string {
  const resources = getAllResources();
  const groups = getAllResourceGroups();
  
  const newGroup: ResourceGroup = {
    ...group,
    id: generateGroupId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  groups.push(newGroup);
  
  const data = { resources, groups };
  localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(data));
  
  // Emit real-time update
  resourcesEmitter.emit(RESOURCES_SYNC_EVENT, { type: 'group_added', group: newGroup });
  
  return newGroup.id;
}

// Update resource download count
export function incrementDownloadCount(resourceId: string): void {
  const resources = getAllResources();
  const groups = getAllResourceGroups();
  
  const resourceIndex = resources.findIndex(r => r.id === resourceId);
  if (resourceIndex !== -1) {
    resources[resourceIndex].downloadCount += 1;
    resources[resourceIndex].updatedAt = new Date().toISOString();
    
    const data = { resources, groups };
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(data));
    
    // Emit real-time update
    resourcesEmitter.emit(RESOURCES_SYNC_EVENT, { type: 'download_updated', resourceId });
  }
}

// Search resources
export function searchResources(query: string, category?: string): ResourceItem[] {
  const resources = getAllResources();
  const searchTerm = query.toLowerCase();
  
  return resources.filter(resource => {
    const matchesQuery = resource.title.toLowerCase().includes(searchTerm) ||
                        resource.description.toLowerCase().includes(searchTerm) ||
                        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    
    const matchesCategory = !category || category === 'all' || resource.category === category;
    
    return matchesQuery && matchesCategory && resource.status === 'active';
  });
}

// Get resources by category
export function getResourcesByCategory(category: string): ResourceItem[] {
  const resources = getAllResources();
  return resources.filter(r => r.category === category && r.status === 'active');
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate unique IDs
function generateResourceId(): string {
  return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateGroupId(): string {
  return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Real-time sync hook
export function useResourcesSync(callback: Function) {
  if (typeof window === 'undefined') return;
  
  resourcesEmitter.on(RESOURCES_SYNC_EVENT, callback);
  
  return () => {
    resourcesEmitter.off(RESOURCES_SYNC_EVENT, callback);
  };
}

// Get resource statistics
export function getResourceStats() {
  const resources = getAllResources();
  const groups = getAllResourceGroups();
  
  return {
    totalResources: resources.length,
    totalGroups: groups.length,
    totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0),
    categoryCounts: resources.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    typeCounts: resources.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}
