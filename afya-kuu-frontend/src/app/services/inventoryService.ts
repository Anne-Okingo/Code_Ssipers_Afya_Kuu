// Inventory Management Service for Afya Kuu Platform
'use client';

// Real-time sync configuration
const SYNC_INTERVAL = 5000; // 5 seconds
const STORAGE_KEY = 'afya_kuu_inventory';
const SYNC_EVENT = 'inventory_updated';

// Custom event for real-time sync
class InventoryEventEmitter {
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

export const inventoryEmitter = new InventoryEventEmitter();

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medical_supplies' | 'equipment' | 'medications' | 'consumables' | 'laboratory';
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number; // In KES
  supplier: string;
  expiryDate?: string;
  batchNumber?: string;
  description: string;
  lastUpdated: string;
  updatedBy: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  location: string; // Storage location
  unit: string; // pieces, boxes, vials, etc.
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
  cost?: number;
}

// Kenyan Medical Supply Prices (Based on KEMSA and MOH Guidelines)
export const KENYAN_MEDICAL_SUPPLIES: Partial<InventoryItem>[] = [
  // Cervical Cancer Screening Supplies
  {
    name: 'Acetic Acid 5% Solution',
    category: 'medical_supplies',
    unitPrice: 150, // KES per 100ml bottle
    supplier: 'KEMSA',
    description: 'For VIA screening procedures',
    unit: 'bottles',
    minimumStock: 10,
    maximumStock: 50,
    location: 'Screening Room Cabinet A'
  },
  {
    name: 'Lugols Iodine Solution',
    category: 'medical_supplies',
    unitPrice: 200, // KES per 100ml bottle
    supplier: 'KEMSA',
    description: 'For VILI screening procedures',
    unit: 'bottles',
    minimumStock: 5,
    maximumStock: 30,
    location: 'Screening Room Cabinet A'
  },
  {
    name: 'Disposable Speculums',
    category: 'medical_supplies',
    unitPrice: 25, // KES per piece
    supplier: 'Medisel Kenya',
    description: 'Single-use plastic speculums for examinations',
    unit: 'pieces',
    minimumStock: 100,
    maximumStock: 500,
    location: 'Examination Room Storage'
  },
  {
    name: 'Cervical Cytology Brushes',
    category: 'medical_supplies',
    unitPrice: 80, // KES per piece
    supplier: 'Cytobrush Kenya',
    description: 'For Pap smear sample collection',
    unit: 'pieces',
    minimumStock: 50,
    maximumStock: 200,
    location: 'Laboratory Storage'
  },
  {
    name: 'Glass Slides (Pre-coated)',
    category: 'laboratory',
    unitPrice: 15, // KES per slide
    supplier: 'Lab Supplies Kenya',
    description: 'For cytology sample preparation',
    unit: 'pieces',
    minimumStock: 200,
    maximumStock: 1000,
    location: 'Laboratory Storage'
  },
  {
    name: 'Fixative Solution (95% Ethanol)',
    category: 'laboratory',
    unitPrice: 300, // KES per 500ml bottle
    supplier: 'KEMSA',
    description: 'For preserving cytology samples',
    unit: 'bottles',
    minimumStock: 5,
    maximumStock: 20,
    location: 'Laboratory Chemical Storage'
  },
  // HPV Testing Supplies
  {
    name: 'HPV DNA Test Kits',
    category: 'laboratory',
    unitPrice: 2500, // KES per test kit
    supplier: 'Roche Diagnostics Kenya',
    description: 'High-risk HPV DNA detection kits',
    unit: 'kits',
    minimumStock: 20,
    maximumStock: 100,
    location: 'Laboratory Refrigerator'
  },
  {
    name: 'Sample Collection Tubes',
    category: 'laboratory',
    unitPrice: 35, // KES per tube
    supplier: 'BD Kenya',
    description: 'Sterile tubes for sample collection',
    unit: 'pieces',
    minimumStock: 100,
    maximumStock: 500,
    location: 'Laboratory Storage'
  },
  // General Medical Supplies
  {
    name: 'Disposable Gloves (Nitrile)',
    category: 'medical_supplies',
    unitPrice: 12, // KES per pair
    supplier: 'Medplus Kenya',
    description: 'Powder-free nitrile examination gloves',
    unit: 'pairs',
    minimumStock: 500,
    maximumStock: 2000,
    location: 'General Storage'
  },
  {
    name: 'Surgical Masks',
    category: 'medical_supplies',
    unitPrice: 8, // KES per piece
    supplier: 'Safety First Kenya',
    description: '3-ply disposable surgical masks',
    unit: 'pieces',
    minimumStock: 200,
    maximumStock: 1000,
    location: 'General Storage'
  },
  {
    name: 'Hand Sanitizer (500ml)',
    category: 'medical_supplies',
    unitPrice: 250, // KES per bottle
    supplier: 'Dettol Kenya',
    description: '70% alcohol-based hand sanitizer',
    unit: 'bottles',
    minimumStock: 10,
    maximumStock: 50,
    location: 'Reception & Examination Rooms'
  },
  {
    name: 'Examination Couch Paper',
    category: 'consumables',
    unitPrice: 800, // KES per roll
    supplier: 'Medline Kenya',
    description: 'Disposable examination table covering',
    unit: 'rolls',
    minimumStock: 5,
    maximumStock: 20,
    location: 'Examination Room Storage'
  }
];

// Real-time inventory management functions
export function getAllInventoryItems(): InventoryItem[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Initialize with sample data
    const initialInventory = initializeInventory();
    saveInventoryToStorage(initialInventory);
    return initialInventory;
  }

  return JSON.parse(stored);
}

export function saveInventoryToStorage(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Emit event for real-time sync
  inventoryEmitter.emit(SYNC_EVENT, items);
}

export function updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): boolean {
  try {
    const items = getAllInventoryItems();
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) return false;

    items[itemIndex] = {
      ...items[itemIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    // Update stock status
    items[itemIndex].status = determineStockStatus(items[itemIndex]);

    saveInventoryToStorage(items);
    return true;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return false;
  }
}

export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>): string {
  try {
    const items = getAllInventoryItems();

    const newItem: InventoryItem = {
      ...item,
      id: generateInventoryId(),
      lastUpdated: new Date().toISOString(),
      status: determineStockStatus(item as InventoryItem)
    };

    items.push(newItem);
    saveInventoryToStorage(items);

    return newItem.id;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw new Error('Failed to add inventory item');
  }
}

export function deleteInventoryItem(itemId: string): boolean {
  try {
    const items = getAllInventoryItems();
    const filteredItems = items.filter(item => item.id !== itemId);

    if (filteredItems.length === items.length) return false;

    saveInventoryToStorage(filteredItems);
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
}

export function recordStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): string {
  try {
    const movements = getAllStockMovements();

    const newMovement: StockMovement = {
      ...movement,
      id: generateMovementId(),
      timestamp: new Date().toISOString()
    };

    movements.push(newMovement);
    localStorage.setItem('afya_kuu_stock_movements', JSON.stringify(movements));

    // Update inventory item stock
    if (movement.type === 'in') {
      updateInventoryStock(movement.itemId, movement.quantity);
    } else if (movement.type === 'out' || movement.type === 'expired' || movement.type === 'damaged') {
      updateInventoryStock(movement.itemId, -movement.quantity);
    }

    return newMovement.id;
  } catch (error) {
    console.error('Error recording stock movement:', error);
    throw new Error('Failed to record stock movement');
  }
}

export function getAllStockMovements(): StockMovement[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('afya_kuu_stock_movements');
  return stored ? JSON.parse(stored) : [];
}

export function getStockMovementsByItem(itemId: string): StockMovement[] {
  return getAllStockMovements().filter(movement => movement.itemId === itemId);
}

export function updateInventoryStock(itemId: string, quantityChange: number): boolean {
  const items = getAllInventoryItems();
  const itemIndex = items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) return false;

  const newStock = Math.max(0, items[itemIndex].currentStock + quantityChange);

  return updateInventoryItem(itemId, {
    currentStock: newStock,
    status: determineStockStatus({ ...items[itemIndex], currentStock: newStock })
  });
}

// Helper functions
function determineStockStatus(item: InventoryItem): InventoryItem['status'] {
  if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
    return 'expired';
  }

  if (item.currentStock === 0) {
    return 'out_of_stock';
  }

  if (item.currentStock <= item.minimumStock) {
    return 'low_stock';
  }

  return 'in_stock';
}

function generateInventoryId(): string {
  return 'INV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateMovementId(): string {
  return 'MOV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initializeInventory(): InventoryItem[] {
  return KENYAN_MEDICAL_SUPPLIES.map((supply, index) => ({
    id: generateInventoryId(),
    name: supply.name!,
    category: supply.category!,
    currentStock: Math.floor(Math.random() * 100) + 20, // Random stock between 20-120
    minimumStock: supply.minimumStock!,
    maximumStock: supply.maximumStock!,
    unitPrice: supply.unitPrice!,
    supplier: supply.supplier!,
    description: supply.description!,
    unit: supply.unit!,
    location: supply.location!,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System',
    status: 'in_stock' as const,
    expiryDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString() // 1 year from now
  }));
}

// Real-time sync utilities
export function subscribeToInventoryUpdates(callback: (items: InventoryItem[]) => void): () => void {
  inventoryEmitter.on(SYNC_EVENT, callback);

  // Return unsubscribe function
  return () => {
    inventoryEmitter.off(SYNC_EVENT, callback);
  };
}

export function getInventoryByCategory(category: InventoryItem['category']): InventoryItem[] {
  return getAllInventoryItems().filter(item => item.category === category);
}

export function getLowStockItems(): InventoryItem[] {
  return getAllInventoryItems().filter(item =>
    item.status === 'low_stock' || item.status === 'out_of_stock'
  );
}

export function getExpiredItems(): InventoryItem[] {
  return getAllInventoryItems().filter(item => item.status === 'expired');
}

export function getInventoryValue(): number {
  return getAllInventoryItems().reduce((total, item) =>
    total + (item.currentStock * item.unitPrice), 0
  );
}

export function searchInventory(query: string): InventoryItem[] {
  const items = getAllInventoryItems();
  const lowercaseQuery = query.toLowerCase();

  return items.filter(item =>
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.supplier.toLowerCase().includes(lowercaseQuery) ||
    item.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function getInventoryAlerts(): {
  lowStock: InventoryItem[];
  outOfStock: InventoryItem[];
  expired: InventoryItem[];
  expiringSoon: InventoryItem[];
} {
  const items = getAllInventoryItems();
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

  return {
    lowStock: items.filter(item => item.status === 'low_stock'),
    outOfStock: items.filter(item => item.status === 'out_of_stock'),
    expired: items.filter(item => item.status === 'expired'),
    expiringSoon: items.filter(item =>
      item.expiryDate &&
      new Date(item.expiryDate) > now &&
      new Date(item.expiryDate) <= thirtyDaysFromNow
    )
  };
}

// Format currency for Kenyan Shillings
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// Export for use in components
export function useInventorySync() {
  if (typeof window === 'undefined') return { items: [], subscribe: () => () => {} };

  return {
    items: getAllInventoryItems(),
    subscribe: subscribeToInventoryUpdates,
    updateItem: updateInventoryItem,
    addItem: addInventoryItem,
    deleteItem: deleteInventoryItem,
    recordMovement: recordStockMovement,
    getAlerts: getInventoryAlerts,
    searchItems: searchInventory
  };
}

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
