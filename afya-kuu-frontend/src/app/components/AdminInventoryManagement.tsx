'use client';

import { useState, useEffect } from 'react';
import { 
  getInventoryItems, 
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats, 
  searchInventoryItems,
  getLowStockAlerts,
  initializeSampleInventory,
  type InventoryItem,
  type InventoryStats
} from '../services/inventoryService';

interface AdminInventoryManagementProps {
  language: 'en' | 'sw';
}

export default function AdminInventoryManagement({ language }: AdminInventoryManagementProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'medical_equipment' as InventoryItem['category'],
    description: '',
    quantity: 0,
    unitCost: 0,
    supplier: '',
    expiryDate: '',
    minimumThreshold: 0
  });

  const content = {
    en: {
      title: 'Admin Inventory Management',
      subtitle: 'Manage medical supplies, equipment, and costs',
      addNew: 'Add New Item',
      search: 'Search inventory...',
      categories: {
        all: 'All Categories',
        medical_equipment: 'Medical Equipment',
        consumables: 'Consumables',
        medications: 'Medications',
        test_kits: 'Test Kits'
      },
      form: {
        title: 'Add New Inventory Item',
        editTitle: 'Edit Inventory Item',
        name: 'Item Name',
        category: 'Category',
        description: 'Description',
        quantity: 'Quantity',
        unitCost: 'Unit Cost (KES)',
        totalCost: 'Total Cost',
        supplier: 'Supplier',
        expiryDate: 'Expiry Date',
        minimumThreshold: 'Minimum Threshold',
        save: 'Save Item',
        cancel: 'Cancel',
        update: 'Update Item',
        namePlaceholder: 'Enter item name',
        descriptionPlaceholder: 'Enter item description',
        supplierPlaceholder: 'Enter supplier name'
      },
      table: {
        name: 'Item Name',
        category: 'Category',
        quantity: 'Quantity',
        unitCost: 'Unit Cost',
        totalCost: 'Total Cost',
        supplier: 'Supplier',
        status: 'Status',
        actions: 'Actions'
      },
      actions: {
        edit: 'Edit',
        delete: 'Delete',
        view: 'View Details'
      },
      status: {
        in_stock: 'In Stock',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock'
      },
      stats: {
        totalItems: 'Total Items',
        totalValue: 'Total Value',
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock'
      },
      alerts: {
        lowStockTitle: 'Low Stock Alerts',
        itemsNeedRestock: 'items need restocking'
      },
      confirmDelete: 'Are you sure you want to delete this item?',
      noResults: 'No items found matching your criteria',
      loading: 'Loading inventory...'
    },
    sw: {
      title: 'Usimamizi wa Hifadhi wa Msimamizi',
      subtitle: 'Simamia vifaa vya matibabu, vifaa, na gharama',
      addNew: 'Ongeza Kitu Kipya',
      search: 'Tafuta katika hifadhi...',
      categories: {
        all: 'Aina Zote',
        medical_equipment: 'Vifaa vya Matibabu',
        consumables: 'Vitu vya Matumizi',
        medications: 'Dawa',
        test_kits: 'Vifaa vya Upimaji'
      },
      form: {
        title: 'Ongeza Kitu Kipya cha Hifadhi',
        editTitle: 'Hariri Kitu cha Hifadhi',
        name: 'Jina la Kitu',
        category: 'Aina',
        description: 'Maelezo',
        quantity: 'Idadi',
        unitCost: 'Bei ya Kipande (KES)',
        totalCost: 'Bei Jumla',
        supplier: 'Msambazaji',
        expiryDate: 'Tarehe ya Mwisho',
        minimumThreshold: 'Kiwango cha Chini',
        save: 'Hifadhi Kitu',
        cancel: 'Ghairi',
        update: 'Sasisha Kitu',
        namePlaceholder: 'Ingiza jina la kitu',
        descriptionPlaceholder: 'Ingiza maelezo ya kitu',
        supplierPlaceholder: 'Ingiza jina la msambazaji'
      },
      table: {
        name: 'Jina la Kitu',
        category: 'Aina',
        quantity: 'Idadi',
        unitCost: 'Bei ya Kipande',
        totalCost: 'Bei Jumla',
        supplier: 'Msambazaji',
        status: 'Hali',
        actions: 'Vitendo'
      },
      actions: {
        edit: 'Hariri',
        delete: 'Futa',
        view: 'Ona Maelezo'
      },
      status: {
        in_stock: 'Ipo Hifadhini',
        low_stock: 'Hifadhi Ndogo',
        out_of_stock: 'Hifadhi Imeisha'
      },
      stats: {
        totalItems: 'Jumla ya Vitu',
        totalValue: 'Thamani Jumla',
        lowStock: 'Hifadhi Ndogo',
        outOfStock: 'Hifadhi Imeisha'
      },
      alerts: {
        lowStockTitle: 'Tahadhari za Hifadhi Ndogo',
        itemsNeedRestock: 'vitu vinahitaji kuongezwa'
      },
      confirmDelete: 'Una uhakika unataka kufuta kitu hiki?',
      noResults: 'Hakuna vitu vilivyopatikana kulingana na vigezo vyako',
      loading: 'Inapakia hifadhi...'
    }
  };

  const t = content[language];

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      initializeSampleInventory();
      const inventoryItems = getInventoryItems();
      const inventoryStats = getInventoryStats();
      
      setItems(inventoryItems);
      setStats(inventoryStats);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        const success = updateInventoryItem(editingItem.id, {
          ...formData,
          totalCost: formData.quantity * formData.unitCost
        }, 'admin_001');
        
        if (success) {
          setEditingItem(null);
          resetForm();
          await loadInventoryData();
        }
      } else {
        // Add new item
        const success = addInventoryItem({
          ...formData,
          addedBy: 'admin_001'
        });
        
        if (success) {
          resetForm();
          setShowAddForm(false);
          await loadInventoryData();
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unitCost: item.unitCost,
      supplier: item.supplier,
      expiryDate: item.expiryDate || '',
      minimumThreshold: item.minimumThreshold
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      const success = deleteInventoryItem(id, 'admin_001');
      if (success) {
        await loadInventoryData();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'medical_equipment',
      description: '',
      quantity: 0,
      unitCost: 0,
      supplier: '',
      expiryDate: '',
      minimumThreshold: 0
    });
    setEditingItem(null);
  };

  const filteredItems = items.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query) &&
          !item.description.toLowerCase().includes(query) &&
          !item.supplier.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    if (showLowStockOnly && item.status === 'in_stock') {
      return false;
    }

    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
        >
          {t.addNew}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.totalItems}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.totalValue}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.lowStock}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{t.stats.outOfStock}</div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? t.form.editTitle : t.form.title}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.name}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t.form.namePlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.category}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as InventoryItem['category']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(t.categories).filter(([key]) => key !== 'all').map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.form.description}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t.form.descriptionPlaceholder}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.quantity}
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.unitCost}
                    </label>
                    <input
                      type="number"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.totalCost}
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(formData.quantity * formData.unitCost)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.supplier}
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      placeholder={t.form.supplierPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.form.minimumThreshold}
                    </label>
                    <input
                      type="number"
                      value={formData.minimumThreshold}
                      onChange={(e) => setFormData({...formData, minimumThreshold: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.form.expiryDate}
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t.form.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                  >
                    {editingItem ? t.form.update : t.form.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(t.categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Low Stock Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.name}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.category}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.quantity}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.unitCost}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.totalCost}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t.noResults}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {t.categories[item.category as keyof typeof t.categories]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(item.totalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {t.status[item.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t.actions.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t.actions.delete}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
