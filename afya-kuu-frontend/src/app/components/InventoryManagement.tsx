'use client';

import { useState, useEffect } from 'react';
import { 
  getInventoryItems, 
  getInventoryStats, 
  searchInventoryItems,
  getLowStockAlerts,
  initializeSampleInventory,
  type InventoryItem,
  type InventoryStats
} from '../services/inventoryService';

interface InventoryManagementProps {
  language: 'en' | 'sw';
  userRole: 'doctor' | 'admin';
}

export default function InventoryManagement({ language, userRole }: InventoryManagementProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const content = {
    en: {
      title: 'Inventory Management',
      subtitle: 'Medical supplies and equipment tracking',
      search: 'Search inventory...',
      categories: {
        all: 'All Categories',
        medical_equipment: 'Medical Equipment',
        consumables: 'Consumables',
        medications: 'Medications',
        test_kits: 'Test Kits'
      },
      filters: {
        lowStock: 'Show Low Stock Only',
        all: 'Show All Items'
      },
      stats: {
        totalItems: 'Total Items',
        totalValue: 'Total Value',
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock'
      },
      table: {
        name: 'Item Name',
        category: 'Category',
        quantity: 'Quantity',
        unitCost: 'Unit Cost',
        totalCost: 'Total Cost',
        supplier: 'Supplier',
        status: 'Status',
        expiry: 'Expiry Date',
        lastUpdated: 'Last Updated'
      },
      status: {
        in_stock: 'In Stock',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock'
      },
      alerts: {
        lowStockTitle: 'Low Stock Alerts',
        noLowStock: 'All items are well stocked',
        itemsNeedRestock: 'items need restocking'
      },
      noResults: 'No items found matching your criteria',
      loading: 'Loading inventory...'
    },
    sw: {
      title: 'Usimamizi wa Hifadhi',
      subtitle: 'Ufuatiliaji wa vifaa na dawa za matibabu',
      search: 'Tafuta katika hifadhi...',
      categories: {
        all: 'Aina Zote',
        medical_equipment: 'Vifaa vya Matibabu',
        consumables: 'Vitu vya Matumizi',
        medications: 'Dawa',
        test_kits: 'Vifaa vya Upimaji'
      },
      filters: {
        lowStock: 'Onyesha Hifadhi Ndogo Tu',
        all: 'Onyesha Vitu Vyote'
      },
      stats: {
        totalItems: 'Jumla ya Vitu',
        totalValue: 'Thamani Jumla',
        lowStock: 'Hifadhi Ndogo',
        outOfStock: 'Hifadhi Imeisha'
      },
      table: {
        name: 'Jina la Kitu',
        category: 'Aina',
        quantity: 'Idadi',
        unitCost: 'Bei ya Kipande',
        totalCost: 'Bei Jumla',
        supplier: 'Msambazaji',
        status: 'Hali',
        expiry: 'Tarehe ya Mwisho',
        lastUpdated: 'Ilisasishwa Mwisho'
      },
      status: {
        in_stock: 'Ipo Hifadhini',
        low_stock: 'Hifadhi Ndogo',
        out_of_stock: 'Hifadhi Imeisha'
      },
      alerts: {
        lowStockTitle: 'Tahadhari za Hifadhi Ndogo',
        noLowStock: 'Vitu vyote vipo vizuri hifadhini',
        itemsNeedRestock: 'vitu vinahitaji kuongezwa'
      },
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
      // Initialize sample data if needed
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

  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query) &&
          !item.description.toLowerCase().includes(query) &&
          !item.supplier.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Low stock filter
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-KE' : 'sw-KE');
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const lowStockAlerts = getLowStockAlerts();

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

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            {t.alerts.lowStockTitle}
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            {lowStockAlerts.length} {t.alerts.itemsNeedRestock}
          </p>
          <div className="mt-2 space-y-1">
            {lowStockAlerts.slice(0, 3).map(item => (
              <div key={item.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                • {item.name} ({item.quantity} remaining)
              </div>
            ))}
            {lowStockAlerts.length > 3 && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                ...and {lowStockAlerts.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
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

          {/* Low Stock Filter */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t.filters.lowStock}
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
                  {t.table.supplier}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t.table.status}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {t.status[item.status]}
                      </span>
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
