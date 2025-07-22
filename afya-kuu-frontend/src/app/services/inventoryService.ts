// Inventory Management Service for Afya Kuu Platform

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medical_equipment' | 'consumables' | 'medications' | 'test_kits';
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  expiryDate?: string;
  lastUpdated: string;
  addedBy: string; // Admin user ID
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  minimumThreshold: number;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoryCounts: Record<string, number>;
}

// Local storage keys
const INVENTORY_STORAGE_KEY = 'afya_kuu_inventory';
const INVENTORY_HISTORY_KEY = 'afya_kuu_inventory_history';

// Get all inventory items
export function getInventoryItems(): InventoryItem[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Add new inventory item (Admin only)
export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'totalCost' | 'status'>): boolean {
  try {
    const items = getInventoryItems();
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      lastUpdated: new Date().toISOString(),
      totalCost: item.quantity * item.unitCost,
      status: item.quantity <= item.minimumThreshold 
        ? (item.quantity === 0 ? 'out_of_stock' : 'low_stock')
        : 'in_stock'
    };
    
    items.push(newItem);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    
    // Log to history
    logInventoryAction('ADD', newItem, item.addedBy);
    
    return true;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    return false;
  }
}

// Update inventory item (Admin only)
export function updateInventoryItem(id: string, updates: Partial<InventoryItem>, updatedBy: string): boolean {
  try {
    const items = getInventoryItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return false;
    
    const updatedItem = {
      ...items[itemIndex],
      ...updates,
      lastUpdated: new Date().toISOString(),
      totalCost: (updates.quantity || items[itemIndex].quantity) * (updates.unitCost || items[itemIndex].unitCost)
    };
    
    // Update status based on quantity
    const quantity = updates.quantity || items[itemIndex].quantity;
    const threshold = updates.minimumThreshold || items[itemIndex].minimumThreshold;
    updatedItem.status = quantity <= threshold 
      ? (quantity === 0 ? 'out_of_stock' : 'low_stock')
      : 'in_stock';
    
    items[itemIndex] = updatedItem;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    
    // Log to history
    logInventoryAction('UPDATE', updatedItem, updatedBy);
    
    return true;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return false;
  }
}

// Delete inventory item (Admin only)
export function deleteInventoryItem(id: string, deletedBy: string): boolean {
  try {
    const items = getInventoryItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return false;
    
    const deletedItem = items[itemIndex];
    items.splice(itemIndex, 1);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    
    // Log to history
    logInventoryAction('DELETE', deletedItem, deletedBy);
    
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
}

// Get inventory statistics
export function getInventoryStats(): InventoryStats {
  const items = getInventoryItems();
  
  const stats: InventoryStats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.totalCost, 0),
    lowStockItems: items.filter(item => item.status === 'low_stock').length,
    outOfStockItems: items.filter(item => item.status === 'out_of_stock').length,
    categoryCounts: {}
  };
  
  // Count items by category
  items.forEach(item => {
    stats.categoryCounts[item.category] = (stats.categoryCounts[item.category] || 0) + 1;
  });
  
  return stats;
}

// Get items by category
export function getItemsByCategory(category: InventoryItem['category']): InventoryItem[] {
  return getInventoryItems().filter(item => item.category === category);
}

// Search inventory items
export function searchInventoryItems(query: string): InventoryItem[] {
  const items = getInventoryItems();
  const lowercaseQuery = query.toLowerCase();
  
  return items.filter(item =>
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.supplier.toLowerCase().includes(lowercaseQuery) ||
    item.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Get low stock alerts
export function getLowStockAlerts(): InventoryItem[] {
  return getInventoryItems().filter(item => 
    item.status === 'low_stock' || item.status === 'out_of_stock'
  );
}

// Helper functions
function generateId(): string {
  return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function logInventoryAction(action: 'ADD' | 'UPDATE' | 'DELETE', item: InventoryItem, userId: string) {
  try {
    const history = JSON.parse(localStorage.getItem(INVENTORY_HISTORY_KEY) || '[]');
    history.push({
      id: generateId(),
      action,
      itemId: item.id,
      itemName: item.name,
      userId,
      timestamp: new Date().toISOString(),
      details: action === 'DELETE' ? { deletedItem: item } : { updatedItem: item }
    });
    
    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    localStorage.setItem(INVENTORY_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error logging inventory action:', error);
  }
}

// Initialize with sample data if empty
export function initializeSampleInventory() {
  const items = getInventoryItems();
  if (items.length === 0) {
    const sampleItems: Omit<InventoryItem, 'id' | 'lastUpdated' | 'totalCost' | 'status'>[] = [
      {
        name: 'HPV Test Kits (careHPV)',
        category: 'test_kits',
        description: 'High-risk HPV DNA test kits for cervical cancer screening - MOH subsidized',
        quantity: 50,
        unitCost: 1200.00, // KES 1,200 per test (MOH/PEPFAR subsidized rate)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        expiryDate: '2025-12-31',
        addedBy: 'admin_001',
        minimumThreshold: 10
      },
      {
        name: 'Pap Smear Collection Kits',
        category: 'test_kits',
        description: 'Complete Pap smear collection and transport kits with cytology processing',
        quantity: 30,
        unitCost: 800.00, // KES 800 per test (public facility rate)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        expiryDate: '2025-06-30',
        addedBy: 'admin_001',
        minimumThreshold: 5
      },
      {
        name: 'Digital Colposcope',
        category: 'medical_equipment',
        description: 'Digital colposcope with camera for cervical examination and documentation',
        quantity: 2,
        unitCost: 450000.00, // KES 450,000 (MOH procurement rate for basic digital colposcope)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        addedBy: 'admin_001',
        minimumThreshold: 1
      },
      {
        name: 'VIA Test Kit (Acetic Acid)',
        category: 'test_kits',
        description: 'Visual Inspection with Acetic Acid - complete screening kit',
        quantity: 100,
        unitCost: 50.00, // KES 50 per VIA test (MOH standard rate)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        expiryDate: '2025-08-15',
        addedBy: 'admin_001',
        minimumThreshold: 20
      },
      {
        name: 'VILI Test Kit (Lugols Iodine)',
        category: 'test_kits',
        description: 'Visual Inspection with Lugols Iodine for enhanced cervical screening',
        quantity: 80,
        unitCost: 100.00, // KES 100 per VILI test (MOH standard rate)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        expiryDate: '2025-09-30',
        addedBy: 'admin_001',
        minimumThreshold: 15
      },
      {
        name: 'Cervical Biopsy Kit',
        category: 'test_kits',
        description: 'Complete cervical biopsy kit with forceps and specimen containers',
        quantity: 25,
        unitCost: 1000.00, // KES 1,000 per biopsy (public facility rate including histopathology)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        addedBy: 'admin_001',
        minimumThreshold: 5
      },
      {
        name: 'Disposable Speculums',
        category: 'consumables',
        description: 'Single-use plastic speculums for gynecological exams (pack of 50)',
        quantity: 100,
        unitCost: 15.00, // KES 15 per speculum (KEMSA rate)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        expiryDate: '2026-01-31',
        addedBy: 'admin_001',
        minimumThreshold: 20
      },
      {
        name: 'Examination Gloves (Nitrile)',
        category: 'consumables',
        description: 'Latex-free nitrile examination gloves (box of 100 pairs)',
        quantity: 50,
        unitCost: 400.00, // KES 400 per box (KEMSA procurement rate)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        expiryDate: '2026-03-31',
        addedBy: 'admin_001',
        minimumThreshold: 10
      },
      {
        name: 'Cryotherapy Equipment',
        category: 'medical_equipment',
        description: 'Cryotherapy unit for treating precancerous cervical lesions',
        quantity: 1,
        unitCost: 180000.00, // KES 180,000 (MOH procurement rate for basic cryotherapy unit)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        addedBy: 'admin_001',
        minimumThreshold: 1
      },
      {
        name: 'LEEP Equipment Set',
        category: 'medical_equipment',
        description: 'Loop Electrosurgical Excision Procedure equipment for cervical treatment',
        quantity: 1,
        unitCost: 350000.00, // KES 350,000 (MOH procurement rate for LEEP equipment)
        supplier: 'Kenya Medical Supplies Authority (KEMSA)',
        addedBy: 'admin_001',
        minimumThreshold: 1
      }
    ];

    sampleItems.forEach(item => addInventoryItem(item));
  }
}
