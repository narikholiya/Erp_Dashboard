import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_WAREHOUSES,
  INITIAL_GROCERY_ITEMS,
  INITIAL_SUSPICIOUS_ACTIVITIES,
  INITIAL_BRIGHT_IDEAS_ALERTS,
  INITIAL_RAW_MATERIAL_IMPORTS,
  INITIAL_RAW_MATERIAL_EXPORTS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES_ORDERS,
  INITIAL_POS_INVOICES,
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_RECENT_ACTIVITIES
} from '../data/initialData';

const ERPContext = createContext();

const usePersistedState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(`proto1-erp:${key}`);
      return saved === null ? initialValue : JSON.parse(saved);
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(`proto1-erp:${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Could not save ${key} in this browser`, error);
    }
  }, [key, value]);
  return [value, setValue];
};

export const ERPProvider = ({ children }) => {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState('admin'); // 'admin', 'warehouse', 'inventory', 'buying-selling', 'accounts'
  const [activeRole, setActiveRole] = useState('admin'); // 'admin', 'warehouse', 'inventory', 'buying-selling', 'accounts'
  const [warehouseSubTab, setWarehouseSubTab] = useState('grocery'); // 'grocery', 'bright-ideas', 'raw-materials'
  const [buyingSellingSubTab, setBuyingSellingSubTab] = useState('buying'); // 'buying', 'selling', 'pos'

  // Global Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');

  // Core ERP Data Collections
  const [warehouses, setWarehouses] = usePersistedState('warehouses', INITIAL_WAREHOUSES);
  const [groceryItems, setGroceryItems] = usePersistedState('grocery-items', INITIAL_GROCERY_ITEMS);
  const [suspiciousActivities, setSuspiciousActivities] = usePersistedState('suspicious-activities', INITIAL_SUSPICIOUS_ACTIVITIES);
  const [brightIdeaAlerts, setBrightIdeaAlerts] = usePersistedState('bright-idea-alerts', INITIAL_BRIGHT_IDEAS_ALERTS);
  const [rawMaterialImports, setRawMaterialImports] = usePersistedState('raw-material-imports', INITIAL_RAW_MATERIAL_IMPORTS);
  const [rawMaterialExports, setRawMaterialExports] = usePersistedState('raw-material-exports', INITIAL_RAW_MATERIAL_EXPORTS);
  const [inventoryItems, setInventoryItems] = usePersistedState('inventory-items', INITIAL_INVENTORY_ITEMS);
  const [inventoryMovements, setInventoryMovements] = usePersistedState('inventory-movements', []);
  const [suppliers, setSuppliers] = usePersistedState('suppliers', INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = usePersistedState('purchase-orders', INITIAL_PURCHASE_ORDERS);
  const [customers, setCustomers] = usePersistedState('customers', INITIAL_CUSTOMERS);
  const [salesOrders, setSalesOrders] = usePersistedState('sales-orders', INITIAL_SALES_ORDERS);
  const [posInvoices, setPosInvoices] = usePersistedState('pos-invoices', INITIAL_POS_INVOICES);
  const [journalEntries, setJournalEntries] = usePersistedState('journal-entries', INITIAL_JOURNAL_ENTRIES);
  const [recentActivities, setRecentActivities] = usePersistedState('recent-activities', INITIAL_RECENT_ACTIVITIES);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'new-po', 'new-sales', 'new-stock-entry', 'new-raw-material', 'pos-checkout'
  const [systemView, setSystemView] = useState('');

  // Quick Action Handlers
  const handleRoleChange = (role) => {
    setSystemView('');
    setActiveRole(role);
    if (role === 'admin') setActiveTab('admin');
    else if (role === 'warehouse') setActiveTab('warehouse');
    else if (role === 'inventory') setActiveTab('inventory');
    else if (role === 'buying-selling') setActiveTab('buying-selling');
    else if (role === 'accounts') setActiveTab('accounts');
  };

  const addPurchaseOrder = (newPO) => {
    const po = {
      id: `PO-2026-${String(purchaseOrders.length + 84).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved',
      paymentStatus: 'Unpaid',
      ...newPO
    };
    setPurchaseOrders([po, ...purchaseOrders]);
    addRecentActivity({
      id: Date.now(),
      title: `New PO Created: ${po.id} for $${po.totalAmount.toLocaleString()}`,
      user: 'Procurement Specialist',
      time: 'Just now',
      tag: 'Purchase',
      type: 'po'
    });
    setActiveModal(null);
  };

  const addSalesOrder = (newSO) => {
    const so = {
      id: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      invoiceStatus: 'Invoiced',
      ...newSO
    };
    setSalesOrders([so, ...salesOrders]);
    addRecentActivity({
      id: Date.now(),
      title: `Sales Order ${so.id} created for ${so.customer}`,
      user: 'Sales Admin',
      time: 'Just now',
      tag: 'Sales',
      type: 'sales'
    });
    setActiveModal(null);
  };

  const addStockEntry = (entry) => {
    const itemIndex = inventoryItems.findIndex(i => i.id === entry.itemId);
    const quantity = Number(entry.qty);
    if (itemIndex < 0 || !Number.isFinite(quantity) || quantity <= 0) return false;
    const item = inventoryItems[itemIndex];
    const change = entry.type === 'Inbound' ? quantity : -quantity;
    const available = Number(item.inStock || 0) - Number(item.reserved || 0);
    if (change < 0 && quantity > available) return false;
    const updated = [...inventoryItems];
    updated[itemIndex] = {
      ...item,
      inStock: Number(item.inStock || 0) + change,
      available: available + change,
      status: available + change <= Number(item.reorderPoint || 0) ? 'Low Stock' : 'In Stock'
    };
    setInventoryItems(updated);
    setInventoryMovements((previous) => [{
      id: `STK-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemId: entry.itemId,
      itemName: item.name,
      itemCode: item.code || '',
      type: entry.type === 'Inbound' ? 'Stock In' : entry.type === 'Outbound' ? 'Stock Out' : 'Transfer',
      quantity: Number(entry.qty),
      warehouse: entry.warehouse || inventoryItems[itemIndex]?.warehouse || '',
      reference: entry.batchNo || 'Manual stock voucher',
      notes: entry.notes || ''
    }, ...previous]);
    addRecentActivity({
      id: Date.now(),
      title: `Stock Entry (${entry.type}) ${entry.qty} units processed`,
      user: 'Warehouse Lead',
      time: 'Just now',
      tag: 'Stock',
      type: 'stock'
    });
    setActiveModal(null);
    return true;
  };

  const addInventoryItem = (item) => {
    const newItem = { id: `ITM-${Date.now()}`, reserved: 0, ...item };
    setInventoryItems((previous) => [newItem, ...previous]);
    setRecentActivities((previous) => [{ id: Date.now(), title: `Inventory item created: ${newItem.name}`, user: 'Inventory Manager', time: 'Just now', tag: 'Inventory', type: 'item' }, ...previous.slice(0, 9)]);
  };

  const postStockReconciliation = (counts) => {
    const movements = [];
    const updatedItems = inventoryItems.map((item) => {
      if (counts[item.id] === undefined) return item;
      const physical = Number(counts[item.id]);
      if (!Number.isFinite(physical) || physical < 0) return item;
      const variance = physical - Number(item.inStock || 0);
      if (!variance) return item;
      movements.push({ id: `REC-${Date.now()}-${item.id}`, date: new Date().toISOString().split('T')[0], itemId: item.id, itemName: item.name, itemCode: item.code, type: 'Reconciliation', quantity: Math.abs(variance), variance, warehouse: item.warehouse, reference: 'Stock reconciliation', notes: `System ${item.inStock}; physical ${physical}` });
      return { ...item, inStock: physical, available: Math.max(0, physical - Number(item.reserved || 0)), status: physical <= Number(item.reorderPoint || 0) ? 'Low Stock' : 'In Stock' };
    });
    setInventoryItems(updatedItems);
    if (movements.length) {
      setInventoryMovements((previous) => [...movements, ...previous]);
      setRecentActivities((previous) => [{ id: Date.now(), title: `Stock reconciliation posted for ${movements.length} items`, user: 'Inventory Manager', time: 'Just now', tag: 'Reconciliation', type: 'stock' }, ...previous.slice(0, 9)]);
    }
    return movements.length;
  };

  const addRawMaterial = (raw) => {
    const newEntry = {
      id: `RM-IMP-${Math.floor(2000 + Math.random() * 900)}`,
      dayOfArrival: new Date().toISOString().split('T')[0],
      expiryDate: raw.expiryDate || '',
      shelfLife: raw.shelfLife || '',
      customsStatus: 'Cleared',
      inspectionStatus: 'Passed',
      ...raw
    };
    setRawMaterialImports([newEntry, ...rawMaterialImports]);
    addRecentActivity({
      id: Date.now(),
      title: `Raw Material Received: ${newEntry.product} (${newEntry.quantity})`,
      user: 'Port Silo Manager',
      time: 'Just now',
      tag: 'Raw Material',
      type: 'raw'
    });
    setActiveModal(null);
  };

  const addPOSSale = (sale) => {
    const inv = {
      id: `POS-INV-${Math.floor(10000 + Math.random() * 90000)}`,
      cashier: 'Active POS User',
      time: 'Just now',
      ...sale
    };
    setPosInvoices([inv, ...posInvoices]);
    addRecentActivity({
      id: Date.now(),
      title: `POS Receipt ${inv.id}: $${inv.total.toFixed(2)} (${inv.paymentMethod})`,
      user: 'Retail Cashier',
      time: 'Just now',
      tag: 'POS',
      type: 'pos'
    });
    setActiveModal(null);
  };

  const dismissAlert = (alertId) => {
    setBrightIdeaAlerts(brightIdeaAlerts.filter(a => a.id !== alertId));
  };

  const addRecentActivity = (activity) => {
    setRecentActivities(prev => [activity, ...prev.slice(0, 9)]);
  };

  return (
    <ERPContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeRole,
        setActiveRole: handleRoleChange,
        warehouseSubTab,
        setWarehouseSubTab,
        buyingSellingSubTab,
        setBuyingSellingSubTab,
        searchQuery,
        setSearchQuery,
        selectedDateRange,
        setSelectedDateRange,
        warehouses,
        groceryItems,
        suspiciousActivities,
        brightIdeaAlerts,
        rawMaterialImports,
        rawMaterialExports,
        inventoryItems,
        inventoryMovements,
        suppliers,
        purchaseOrders,
        customers,
        salesOrders,
        posInvoices,
        journalEntries,
        recentActivities,
        chartOfAccounts: INITIAL_CHART_OF_ACCOUNTS,
        activeModal,
        setActiveModal,
        systemView,
        setSystemView,
        addPurchaseOrder,
        addSalesOrder,
        addStockEntry,
        addInventoryItem,
        postStockReconciliation,
        addRawMaterial,
        addPOSSale,
        dismissAlert
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => useContext(ERPContext);
