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

// Compatibility aliases for existing components
export const getInventoryItems = getAllInventoryItems;
export const searchInventoryItems = searchInventory;
export const getLowStockAlerts = getLowStockItems;

// Additional functions needed by components
export function getInventoryStats() {
  const items = getAllInventoryItems();
  const alerts = getInventoryAlerts();

  return {
    totalItems: items.length,
    totalValue: getInventoryValue(),
    lowStockItems: alerts.lowStock.length,
    outOfStockItems: alerts.outOfStock.length,
    expiredItems: alerts.expired.length,
    categoryCounts: items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

export function initializeSampleInventory() {
  // This function is called automatically by getAllInventoryItems
  // when no inventory exists, so we don't need to do anything here
  return getAllInventoryItems();
}

// Interface for compatibility
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  categoryCounts: Record<string, number>;
}
