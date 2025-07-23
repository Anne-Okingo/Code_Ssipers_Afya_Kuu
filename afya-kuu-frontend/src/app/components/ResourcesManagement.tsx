'use client';

import { useState, useEffect } from 'react';
import {
  getAllResources,
  getAllResourceGroups,
  addResource,
  addResourceGroup,
  searchResources,
  getResourcesByCategory,
  incrementDownloadCount,
  formatFileSize,
  useResourcesSync,
  getResourceStats,
  type ResourceItem,
  type ResourceGroup
} from '../services/resourcesService';

interface ResourcesManagementProps {
  language: 'en' | 'sw';
  userRole: 'doctor' | 'admin';
  userId: string;
  userName: string;
}

export default function ResourcesManagement({ 
  language, 
  userRole, 
  userId, 
  userName 
}: ResourcesManagementProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'groups' | 'upload' | 'stats'>('browse');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [groups, setGroups] = useState<ResourceGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const content = {
    en: {
      title: 'Resources Management',
      subtitle: 'Educational materials, guidelines, and training resources',
      tabs: {
        browse: 'Browse Resources',
        groups: 'Resource Groups',
        upload: 'Upload Resource',
        stats: 'Statistics'
      },
      search: 'Search resources...',
      categories: {
        all: 'All Categories',
        educational: 'Educational',
        guidelines: 'Guidelines',
        forms: 'Forms',
        training: 'Training',
        research: 'Research',
        policies: 'Policies'
      },
      types: {
        document: 'Document',
        video: 'Video',
        image: 'Image',
        link: 'Link',
        presentation: 'Presentation'
      },
      actions: {
        download: 'Download',
        view: 'View',
        upload: 'Upload New',
        createGroup: 'Create Group'
      },
      upload: {
        title: 'Upload New Resource',
        resourceTitle: 'Resource Title',
        description: 'Description',
        category: 'Category',
        type: 'Type',
        file: 'Select File',
        tags: 'Tags (comma separated)',
        language: 'Language',
        isPublic: 'Make Public',
        submit: 'Upload Resource',
        cancel: 'Cancel'
      },
      group: {
        title: 'Create Resource Group',
        name: 'Group Name',
        description: 'Description',
        selectResources: 'Select Resources',
        submit: 'Create Group',
        cancel: 'Cancel'
      }
    },
    sw: {
      title: 'Usimamizi wa Rasilimali',
      subtitle: 'Nyenzo za kielimu, miongozo, na rasilimali za mafunzo',
      tabs: {
        browse: 'Vinjari Rasilimali',
        groups: 'Makundi ya Rasilimali',
        upload: 'Pakia Rasilimali',
        stats: 'Takwimu'
      },
      search: 'Tafuta rasilimali...',
      categories: {
        all: 'Aina Zote',
        educational: 'Kielimu',
        guidelines: 'Miongozo',
        forms: 'Fomu',
        training: 'Mafunzo',
        research: 'Utafiti',
        policies: 'Sera'
      },
      types: {
        document: 'Hati',
        video: 'Video',
        image: 'Picha',
        link: 'Kiungo',
        presentation: 'Uwasilishaji'
      },
      actions: {
        download: 'Pakua',
        view: 'Ona',
        upload: 'Pakia Mpya',
        createGroup: 'Unda Kundi'
      },
      upload: {
        title: 'Pakia Rasilimali Mpya',
        resourceTitle: 'Jina la Rasilimali',
        description: 'Maelezo',
        category: 'Aina',
        type: 'Aina',
        file: 'Chagua Faili',
        tags: 'Lebo (tenganisha kwa koma)',
        language: 'Lugha',
        isPublic: 'Fanya Umma',
        submit: 'Pakia Rasilimali',
        cancel: 'Ghairi'
      },
      group: {
        title: 'Unda Kundi la Rasilimali',
        name: 'Jina la Kundi',
        description: 'Maelezo',
        selectResources: 'Chagua Rasilimali',
        submit: 'Unda Kundi',
        cancel: 'Ghairi'
      }
    }
  };

  const t = content[language];

  // Load resources and set up real-time sync
  useEffect(() => {
    loadData();
    
    const cleanup = useResourcesSync(() => {
      loadData();
    });
    
    return cleanup;
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const allResources = getAllResources();
      const allGroups = getAllResourceGroups();
      setResources(allResources);
      setGroups(allGroups);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter resources based on search and category
  const filteredResources = searchQuery 
    ? searchResources(searchQuery, selectedCategory === 'all' ? undefined : selectedCategory)
    : selectedCategory === 'all' 
      ? resources.filter(r => r.status === 'active')
      : getResourcesByCategory(selectedCategory);

  const handleDownload = (resource: ResourceItem) => {
    // Simulate file download
    incrementDownloadCount(resource.id);
    
    // In a real implementation, you would handle actual file download here
    const link = document.createElement('a');
    link.href = resource.fileUrl || '#';
    link.download = resource.fileName || resource.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reload data to reflect updated download count
    loadData();
  };

  const handleUploadResource = (formData: any) => {
    try {
      const newResourceId = addResource({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        fileName: formData.fileName,
        fileSize: formData.fileSize,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()),
        uploadedBy: userName,
        uploadedByRole: userRole,
        isPublic: formData.isPublic,
        language: formData.language,
        status: 'active'
      });
      
      setShowUploadModal(false);
      loadData();
      alert(language === 'en' ? 'Resource uploaded successfully!' : 'Rasilimali imepakiwa kwa ufanisi!');
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert(language === 'en' ? 'Failed to upload resource' : 'Imeshindwa kupakia rasilimali');
    }
  };

  const handleCreateGroup = (formData: any) => {
    try {
      const newGroupId = addResourceGroup({
        name: formData.name,
        description: formData.description,
        resources: formData.selectedResources,
        createdBy: userName,
        createdByRole: userRole,
        isPublic: formData.isPublic
      });
      
      setShowGroupModal(false);
      loadData();
      alert(language === 'en' ? 'Resource group created successfully!' : 'Kundi la rasilimali limeundwa kwa ufanisi!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert(language === 'en' ? 'Failed to create group' : 'Imeshindwa kuunda kundi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {Object.entries(t.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Browse Resources Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(t.categories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t.actions.upload}</span>
                </button>
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resource.category === 'educational' ? 'bg-blue-100 text-blue-800' :
                        resource.category === 'guidelines' ? 'bg-green-100 text-green-800' :
                        resource.category === 'training' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.categories[resource.category as keyof typeof t.categories]}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{t.types[resource.type as keyof typeof t.types]}</span>
                      {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>{resource.uploadedBy}</span>
                      <span>{resource.downloadCount} downloads</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        {t.actions.download}
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        {t.actions.view}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {language === 'en' ? 'No resources found' : 'Hakuna rasilimali zilizopatikana'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resource Groups Tab */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'en' ? 'Resource Groups' : 'Makundi ya Rasilimali'}
                </h3>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t.actions.createGroup}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{group.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{group.createdBy}</span>
                      <span>{group.resources.length} resources</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <ResourcesStats language={language} />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadResourceModal
          language={language}
          onSubmit={handleUploadResource}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <CreateGroupModal
          language={language}
          resources={resources}
          onSubmit={handleCreateGroup}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </div>
  );
}

// Statistics Component
function ResourcesStats({ language }: { language: 'en' | 'sw' }) {
  const stats = getResourceStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900">
          {language === 'en' ? 'Total Resources' : 'Jumla ya Rasilimali'}
        </h4>
        <p className="text-2xl font-bold text-blue-600">{stats.totalResources}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-900">
          {language === 'en' ? 'Resource Groups' : 'Makundi ya Rasilimali'}
        </h4>
        <p className="text-2xl font-bold text-green-600">{stats.totalGroups}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-900">
          {language === 'en' ? 'Total Downloads' : 'Jumla ya Upakuzi'}
        </h4>
        <p className="text-2xl font-bold text-purple-600">{stats.totalDownloads}</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-semibold text-orange-900">
          {language === 'en' ? 'Categories' : 'Aina'}
        </h4>
        <p className="text-2xl font-bold text-orange-600">{Object.keys(stats.categoryCounts).length}</p>
      </div>
    </div>
  );
}

// Upload Modal Component (placeholder)
function UploadResourceModal({ language, onSubmit, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'en' ? 'Upload Resource' : 'Pakia Rasilimali'}
        </h3>
        <p className="text-gray-600 mb-4">
          {language === 'en' ? 'Upload functionality will be implemented here' : 'Utendaji wa upakiaji utatekelezwa hapa'}
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
            {language === 'en' ? 'Cancel' : 'Ghairi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Group Modal Component (placeholder)
function CreateGroupModal({ language, resources, onSubmit, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'en' ? 'Create Group' : 'Unda Kundi'}
        </h3>
        <p className="text-gray-600 mb-4">
          {language === 'en' ? 'Group creation functionality will be implemented here' : 'Utendaji wa kuunda kundi utatekelezwa hapa'}
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
            {language === 'en' ? 'Cancel' : 'Ghairi'}
          </button>
        </div>
      </div>
    </div>
  );
}
