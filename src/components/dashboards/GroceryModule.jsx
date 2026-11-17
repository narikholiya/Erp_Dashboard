import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive, ArrowDownToLine, ArrowUpFromLine, Boxes, CalendarDays, Download,
  Edit3, Eye, FileWarning, PackagePlus, Plus, Search, ShieldAlert,
  SlidersHorizontal, Trash2, TrendingDown, X
} from 'lucide-react';
import { INITIAL_GROCERY_ITEMS } from '../../data/initialData';
import { StatusBadge } from '../common/StatusBadge';

const STORAGE_KEY = 'nexus-erp-grocery-v1';
const PAGE_SIZE = 8;
const today = () => new Date().toISOString().slice(0, 10);
const makeId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const makeInitialState = () => {
  const products = INITIAL_GROCERY_ITEMS.map((item, index) => ({
    id: item.id,
    sku: `GRC-${String(index + 1).padStart(4, '0')}`,
    barcode: `890100000${String(index + 1).padStart(4, '0')}`,
    name: item.name,
    description: '',
    category: index < 2 ? 'Oils & Grocery' : index === 3 ? 'Dairy' : 'Grains & Staples',
    subcategory: '',
    brand: '',
    manufacturer: '',
    unit: item.unit,
    purchasePrice: 10,
    sellingPrice: 15,
    minStock: 30,
    maxStock: 500,
    reorderLevel: 50,
    supplier: index === 1 ? 'Deccan Agro Foods' : 'Fresh Supply Co.',
    warehouse: item.warehouse,
    location: 'Aisle A · Rack 02 · Bin 01',
    condition: 'Good',
    archived: false,
    createdAt: item.arrivalDate
  }));
  const batches = INITIAL_GROCERY_ITEMS.map((item) => ({
    id: makeId('BAT'), productId: item.id, lot: item.batch, quantity: item.qty,
    reserved: 0, manufacturedAt: item.arrivalDate, receivedAt: item.arrivalDate,
    expiryDate: item.expiryDate, quarantined: item.status.includes('Critical'),
    disposed: 0
  }));
  return {
    products, batches, movements: [], incidents: [], recommendations: [], activities: [],
    expirySettings: { nearExpiryDays: 30, attentionDays: 90 },
    shelfStock: {},
    backlog: [
      { id: 'BK-108', order: 'Prime Mart Grocery Order', productId: 'GROC-102', quantity: 24, status: 'Picking', due: today() },
      { id: 'BK-109', order: 'Metro Cold Storage Replenishment', productId: 'GROC-103', quantity: 40, status: 'Awaiting pick', due: today() }
    ]
  };
};

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return makeInitialState();
    const parsed = JSON.parse(saved);
    if (parsed?.products && parsed?.batches) return { ...makeInitialState(), ...parsed };
  } catch (error) {
    console.warn('Could not load saved grocery data.', error);
  }
  return makeInitialState();
};

const dayDiff = (date) => Math.ceil((new Date(`${date}T23:59:59`).getTime() - Date.now()) / 86400000);
const currency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const emptyProduct = () => ({ sku: '', barcode: '', name: '', description: '', category: 'Grains & Staples', subcategory: '', brand: '', manufacturer: '', unit: 'kg', purchasePrice: 0, sellingPrice: 0, minStock: 0, maxStock: 1000, reorderLevel: 0, supplier: '', warehouse: '', location: '', condition: 'Good', batchNumber: '', openingStock: 0, manufacturedAt: today(), expiryDate: '' });

function Modal({ title, close, children }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 className="font-bold text-slate-900">{title}</h2><button onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></header>
      <div className="p-5">{children}</div>
    </section>
  </div>;
}

function Field({ label, children, className = '' }) {
  return <label className={`block space-y-1.5 ${className}`}><span className="text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

export const GroceryModule = ({ searchQuery = '' }) => {
  const [data, setData] = useState(loadState);
  const [section, setSection] = useState('Inventory');
  const [query, setQuery] = useState(searchQuery);
  const [category, setCategory] = useState('All categories');
  const [warehouse, setWarehouse] = useState('All warehouses');
  const [expiryFilter, setExpiryFilter] = useState('All expiry');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [productForm, setProductForm] = useState(emptyProduct());
  const [movementForm, setMovementForm] = useState({ productId: '', batchId: '', type: 'Inward', quantity: '', reference: '', notes: '' });
  const [backlogForm, setBacklogForm] = useState({ order: '', productId: '', quantity: '', due: today() });
  const [incidentStatus, setIncidentStatus] = useState('All');
  const [stalePeriod, setStalePeriod] = useState(30);
  const [staleCategory, setStaleCategory] = useState('All categories');
  const [staleWarehouse, setStaleWarehouse] = useState('All warehouses');
  const [staleSupplier, setStaleSupplier] = useState('All suppliers');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3200); return () => clearTimeout(timer); }, [notice]);

  const products = useMemo(() => data.products.map((product) => {
    const lots = data.batches.filter((batch) => batch.productId === product.id);
    const total = lots.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0);
    const reserved = lots.reduce((sum, batch) => sum + Number(batch.reserved || 0), 0);
    const available = lots.reduce((sum, batch) => sum + Math.max(0, Number(batch.quantity || 0) - Number(batch.reserved || 0)), 0);
    const liveLots = lots.filter((batch) => !batch.quarantined && dayDiff(batch.expiryDate) >= 0).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
    const nextExpiry = liveLots[0];
    return { ...product, lots, total, reserved, available, nextExpiry, value: total * Number(product.purchasePrice || 0), lastMovement: data.movements.find((move) => move.productId === product.id)?.date || product.createdAt };
  }), [data]);

  const activeProducts = products.filter((product) => !product.archived);
  const batchCount = data.batches.length;
  const lowStock = activeProducts.filter((product) => product.available > 0 && product.available <= Number(product.reorderLevel || 0));
  const outOfStock = activeProducts.filter((product) => product.available <= 0);
  const expiredBatches = data.batches.filter((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) < 0);
  const nearExpiryDays = Number(data.expirySettings?.nearExpiryDays || 30);
  const attentionDays = Number(data.expirySettings?.attentionDays || 90);
  const nearExpiryBatches = data.batches.filter((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) >= 0 && dayDiff(batch.expiryDate) <= nearExpiryDays);
  const staleProducts = activeProducts.filter((product) => product.total > 0 && Math.floor((Date.now() - new Date(`${product.lastMovement}T00:00:00`).getTime()) / 86400000) >= 30);
  const todaysMoves = data.movements.filter((move) => move.date === today());
  const inwardToday = todaysMoves.filter((move) => move.type === 'Inward' || move.type === 'Return').reduce((sum, move) => sum + move.quantity, 0);
  const outwardToday = todaysMoves.filter((move) => move.type === 'Outward').reduce((sum, move) => sum + move.quantity, 0);
  const totalStock = activeProducts.reduce((sum, product) => sum + product.total, 0);
  const availableStock = activeProducts.reduce((sum, product) => sum + product.available, 0);
  const reservedStock = activeProducts.reduce((sum, product) => sum + product.reserved, 0);
  const valuation = activeProducts.reduce((sum, product) => sum + product.value, 0);
  const nearExpiryValue = data.batches.filter((batch) => dayDiff(batch.expiryDate) <= nearExpiryDays).reduce((sum, batch) => {
    const product = products.find((item) => item.id === batch.productId);
    return sum + (product ? batch.quantity * Number(product.purchasePrice || 0) : 0);
  }, 0);

  const filteredProducts = activeProducts.filter((product) => {
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [product.name, product.sku, product.barcode, product.category, product.supplier, product.lots.map((batch) => batch.lot).join(' ')].join(' ').toLowerCase().includes(term);
    const matchesCategory = category === 'All categories' || product.category === category;
    const matchesWarehouse = warehouse === 'All warehouses' || product.warehouse === warehouse;
    const expires = product.nextExpiry ? dayDiff(product.nextExpiry.expiryDate) : Infinity;
    const matchesExpiry = expiryFilter === 'All expiry' || (expiryFilter === 'Near expiry' && expires >= 0 && expires <= nearExpiryDays) || (expiryFilter === 'Expired' && product.lots.some((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) < 0));
    return matchesQuery && matchesCategory && matchesWarehouse && matchesExpiry;
  });
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = [...new Set(activeProducts.map((product) => product.category))];
  const warehouses = [...new Set(activeProducts.map((product) => product.warehouse).filter(Boolean))];
  const suppliersList = [...new Set(activeProducts.map((product) => product.supplier).filter(Boolean))];
  const filteredStaleProducts = staleProducts.filter((product) => {
    const days = Math.floor((Date.now() - new Date(`${product.lastMovement}T00:00:00`).getTime()) / 86400000);
    return days >= stalePeriod && (staleCategory === 'All categories' || product.category === staleCategory) && (staleWarehouse === 'All warehouses' || product.warehouse === staleWarehouse) && (staleSupplier === 'All suppliers' || product.supplier === staleSupplier);
  });

  const updateData = (updater) => setData((previous) => typeof updater === 'function' ? updater(previous) : updater);
  const notify = (message) => setNotice(message);
  const addActivity = (title, type = 'Product') => ({ id: makeId('ACT'), title, type, date: new Date().toISOString(), user: 'Current User' });
  const getProduct = (id) => data.products.find((product) => product.id === id);

  const saveProduct = (event) => {
    event.preventDefault();
    const sku = productForm.sku.trim().toUpperCase();
    if (!productForm.name.trim() || !sku || !productForm.warehouse.trim()) return notify('Name, SKU and warehouse are required.');
    if (Number(productForm.purchasePrice) < 0 || Number(productForm.sellingPrice) < 0 || Number(productForm.reorderLevel) < 0) return notify('Prices and stock thresholds cannot be negative.');
    const duplicate = data.products.some((product) => product.sku.toLowerCase() === sku.toLowerCase() && product.id !== editing);
    if (duplicate) return notify('SKU must be unique.');
    const barcode = productForm.barcode.trim();
    const duplicateBarcode = barcode && data.products.some((product) => product.barcode === barcode && product.id !== editing);
    if (duplicateBarcode) return notify('Barcode must be unique.');
    if (Number(productForm.maxStock) < Number(productForm.minStock)) return notify('Maximum stock must be at least the minimum stock.');
    if (!editing && productForm.expiryDate && productForm.manufacturedAt && productForm.expiryDate < productForm.manufacturedAt) return notify('Expiry date cannot be before the manufacturing date.');
    const existing = data.products.find((product) => product.id === editing);
    const { batchNumber, openingStock, manufacturedAt, expiryDate, ...productFields } = productForm;
    const product = { ...productFields, id: existing?.id || makeId('GRC'), sku, purchasePrice: Number(productForm.purchasePrice), sellingPrice: Number(productForm.sellingPrice), reorderLevel: Number(productForm.reorderLevel), minStock: Number(productForm.minStock), maxStock: Number(productForm.maxStock), barcode, createdAt: existing?.createdAt || today() };
    const initialBatch = !existing ? { id: makeId('BAT'), productId: product.id, lot: batchNumber.trim() || makeId('LOT'), quantity: Number(openingStock || 0), reserved: 0, manufacturedAt: manufacturedAt || today(), receivedAt: today(), expiryDate: expiryDate || '2099-12-31', quarantined: false, disposed: 0 } : null;
    updateData((previous) => ({ ...previous, products: existing ? previous.products.map((item) => item.id === existing.id ? product : item) : [product, ...previous.products], batches: initialBatch ? [initialBatch, ...previous.batches] : previous.batches, activities: [addActivity(`${existing ? 'Updated' : 'Added'} product ${product.name}`), ...previous.activities] }));
    setModal(null); setEditing(null); setProductForm(emptyProduct()); notify(existing ? 'Product updated.' : 'Product added.');
  };

  const createMovement = (event) => {
    event.preventDefault();
    const amount = Number(movementForm.quantity);
    const product = getProduct(movementForm.productId);
    const batch = data.batches.find((item) => item.id === movementForm.batchId && item.productId === movementForm.productId);
    if (!product || !batch) return notify('Select a product and its batch.');
    if (!Number.isFinite(amount) || amount <= 0) return notify('Enter a quantity greater than zero.');
    if (batch.quarantined || dayDiff(batch.expiryDate) < 0) return notify('Expired or quarantined stock cannot be issued.');
    const addIncident = (type, reason, risk = 'High') => {
      const incident = { id: makeId('INC'), type, productId: product.id, sku: product.sku, productName: product.name, warehouse: product.warehouse, date: new Date().toISOString(), before: batch.quantity, after: batch.quantity, difference: 0, requested: amount, risk, reason, status: 'Pending', notes: '' };
      updateData((previous) => ({ ...previous, incidents: [incident, ...previous.incidents], activities: [addActivity(`${type} flagged for ${product.name}`, 'Security'), ...previous.activities] }));
    };
    if (['Outward', 'Reservation'].includes(movementForm.type) && amount > batch.quantity - batch.reserved) {
      addIncident('Negative stock attempt', `Requested ${amount}; only ${batch.quantity - batch.reserved} units were available in batch ${batch.lot}.`);
      return notify('Insufficient stock. Attempt was added to security review.');
    }
    if (movementForm.type === 'Release reservation' && amount > batch.reserved) return notify('Release quantity exceeds the batch reservation.');
    if (['Stock adjustment', 'Damaged'].includes(movementForm.type) && amount > batch.quantity - batch.reserved) return notify('Cannot adjust below reserved stock.');
    const duplicate = movementForm.reference.trim() && data.movements.some((move) => move.reference === movementForm.reference.trim() && move.productId === product.id && move.type === movementForm.type && move.quantity === amount);
    if (duplicate) {
      addIncident('Possible duplicate transaction', `A ${movementForm.type} for ${amount} units with reference ${movementForm.reference.trim()} is already in the ledger.`);
      return notify('Possible duplicate blocked and flagged for review.');
    }
    const before = batch.quantity;
    const delta = movementForm.type === 'Inward' || movementForm.type === 'Return' ? amount : ['Outward', 'Stock adjustment', 'Damaged'].includes(movementForm.type) ? -amount : 0;
    const movement = { id: makeId('MOV'), productId: product.id, sku: product.sku, productName: product.name, batchId: batch.id, lot: batch.lot, warehouse: product.warehouse, type: movementForm.type, quantity: amount, before, after: before + delta, date: today(), reference: movementForm.reference.trim() || 'Manual entry', notes: movementForm.notes.trim(), user: 'Current User' };
    const recentAdjustments = data.movements.filter((move) => move.productId === product.id && move.type === 'Stock adjustment' && (Date.now() - new Date(move.date).getTime()) < 86400000).length;
    const incident = (recentAdjustments >= 2 && movementForm.type === 'Stock adjustment') || movementForm.type === 'Stock adjustment' || (movementForm.type === 'Outward' && amount >= Math.max(50, product.reorderLevel * 2)) ? { id: makeId('INC'), type: recentAdjustments >= 2 && movementForm.type === 'Stock adjustment' ? 'Repeated stock adjustment' : movementForm.type === 'Stock adjustment' ? 'Stock adjustment' : 'Large stock issue', productId: product.id, sku: product.sku, productName: product.name, warehouse: product.warehouse, date: new Date().toISOString(), before, after: before + delta, difference: delta, risk: recentAdjustments >= 2 && movementForm.type === 'Stock adjustment' ? 'High' : movementForm.type === 'Stock adjustment' ? 'Medium' : 'High', reason: recentAdjustments >= 2 && movementForm.type === 'Stock adjustment' ? 'Multiple adjustments for this product were recorded in 24 hours.' : movementForm.type === 'Stock adjustment' ? 'Manual stock adjustment requires review.' : 'Issue quantity exceeded the unusual movement threshold.', status: 'Pending', notes: '' } : null;
    updateData((previous) => ({
      ...previous,
      batches: previous.batches.map((item) => item.id !== batch.id ? item : { ...item, quantity: Math.max(0, item.quantity + delta), reserved: movementForm.type === 'Reservation' ? item.reserved + amount : movementForm.type === 'Release reservation' ? item.reserved - amount : item.reserved }),
      movements: [movement, ...previous.movements],
      incidents: incident ? [incident, ...previous.incidents] : previous.incidents,
      activities: [addActivity(`${movement.type}: ${amount} ${product.unit} · ${product.name}`, movement.type), ...previous.activities]
    }));
    setModal(null); setMovementForm({ productId: '', batchId: '', type: 'Inward', quantity: '', reference: '', notes: '' }); notify('Stock movement recorded in the ledger.');
  };

  const openProductForm = (product = null) => {
    setEditing(product?.id || null);
    setProductForm(product ? { ...emptyProduct(), ...product } : emptyProduct());
    setModal('product');
  };

  const openMovementForm = (type = 'Inward', productId = '', quantity = '') => {
    const firstProduct = productId || activeProducts[0]?.id || '';
    const firstBatch = data.batches.filter((batch) => batch.productId === firstProduct && !batch.quarantined && dayDiff(batch.expiryDate) >= 0).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
    setMovementForm({ productId: firstProduct, batchId: firstBatch?.id || '', type, quantity, reference: '', notes: '' });
    setModal('movement');
  };

  const addBacklogTask = (event) => {
    event.preventDefault();
    const product = getProduct(backlogForm.productId);
    const quantity = Number(backlogForm.quantity);
    if (!product || !backlogForm.order.trim() || quantity <= 0) return notify('Enter an order, product and valid quantity.');
    const task = { id: makeId('BK'), order: backlogForm.order.trim(), productId: product.id, quantity, due: backlogForm.due, status: 'Awaiting pick' };
    updateData((previous) => ({ ...previous, backlog: [task, ...previous.backlog], activities: [addActivity(`Added picking task ${task.id}`, 'Backlog'), ...previous.activities] }));
    setModal(null); setBacklogForm({ order: '', productId: '', quantity: '', due: today() }); notify('Picking task added to backlog.');
  };

  const replenishShelf = (product) => {
    const current = Number(data.shelfStock?.[product.id] || 0);
    const bulkAvailable = Math.max(0, product.available - current);
    if (!bulkAvailable) return notify('No unallocated stock is available for shelf replenishment.');
    const answer = window.prompt(`Shelf quantity for ${product.name} (up to ${bulkAvailable} ${product.unit}):`, String(Math.min(10, bulkAvailable)));
    if (answer === null) return;
    const amount = Number(answer);
    if (!Number.isFinite(amount) || amount <= 0 || amount > bulkAvailable) return notify('Enter a quantity within the available bulk stock.');
    const move = { id: makeId('MOV'), productId: product.id, sku: product.sku, productName: product.name, batchId: '', lot: 'Shelf transfer', warehouse: product.warehouse, type: 'Shelf transfer', quantity: amount, before: product.total, after: product.total, date: today(), reference: 'Bulk to shelf', notes: product.location, user: 'Current User' };
    updateData((previous) => ({ ...previous, shelfStock: { ...previous.shelfStock, [product.id]: current + amount }, movements: [move, ...previous.movements], activities: [addActivity(`Replenished ${amount} ${product.unit} to shelf · ${product.name}`, 'Shelf'), ...previous.activities] }));
    notify('Shelf replenishment recorded. Total warehouse stock is unchanged.');
  };

  const auditShelf = (product) => {
    const current = Number(data.shelfStock?.[product.id] || 0);
    const answer = window.prompt(`Enter physical shelf count for ${product.name}:`, String(current));
    if (answer === null) return;
    const counted = Number(answer);
    if (!Number.isFinite(counted) || counted < 0 || counted > product.total) return notify('Count must be between zero and total product stock.');
    const difference = counted - current;
    const incident = difference ? { id: makeId('INC'), type: 'Shelf stock mismatch', productId: product.id, sku: product.sku, productName: product.name, warehouse: product.warehouse, date: new Date().toISOString(), before: current, after: counted, difference, risk: Math.abs(difference) > 10 ? 'High' : 'Medium', reason: 'Physical shelf count did not match the recorded shelf quantity.', status: 'Pending', notes: 'Detected during shelf audit.' } : null;
    updateData((previous) => ({ ...previous, shelfStock: { ...previous.shelfStock, [product.id]: counted }, incidents: incident ? [incident, ...previous.incidents] : previous.incidents, activities: [addActivity(`Shelf count recorded for ${product.name}: ${counted}`, 'Shelf audit'), ...previous.activities] }));
    notify(difference ? 'Shelf count saved and mismatch sent to security review.' : 'Shelf count matches the recorded quantity.');
  };

  const updateBacklogStatus = (taskId, status) => updateData((previous) => ({ ...previous, backlog: previous.backlog.map((task) => task.id === taskId ? { ...task, status } : task), activities: [addActivity(`Backlog ${taskId} moved to ${status}`, 'Backlog'), ...previous.activities] }));

  const archiveProduct = (product) => {
    if (!window.confirm(`Archive ${product.name}? Stock history will be retained.`)) return;
    updateData((previous) => ({ ...previous, products: previous.products.map((item) => item.id === product.id ? { ...item, archived: true } : item), activities: [addActivity(`Archived ${product.name}`, 'Archive'), ...previous.activities] }));
    notify('Product archived. Movement history is retained.');
  };

  const setIncident = (id, status) => updateData((previous) => ({ ...previous, incidents: previous.incidents.map((incident) => incident.id === id ? { ...incident, status, notes: incident.notes || `Status changed to ${status}.` } : incident), activities: [addActivity(`Incident ${id} marked ${status}`, 'Security'), ...previous.activities] }));
  const saveRecommendation = (product, action) => {
    updateData((previous) => ({ ...previous, recommendations: [{ id: makeId('REC'), productId: product.id, productName: product.name, action, date: today(), status: 'Open' }, ...previous.recommendations], activities: [addActivity(`${action} recommendation created for ${product.name}`, 'Recommendation'), ...previous.activities] }));
    notify(`${action} recommendation created.`);
  };

  const downloadCsv = (rows, filename) => {
    if (!rows.length) return notify('No records to export.');
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => `"${String(row[column] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
    notify('CSV report downloaded.');
  };

  const tabs = [
    ['Inventory', 'Inventory', Boxes], ['Suspicious Activity', 'Security', ShieldAlert],
    ['Backlog', 'Backlog', ArrowDownToLine], ['Stale Item', 'Stale', TrendingDown],
    ['Item Expiration', 'Expiry', CalendarDays], ['Shelf Item', 'Shelf', Archive],
    ['Product Expiry', 'Product Expiry', FileWarning]
  ];
  const metricCards = [
    ['Total SKUs', new Set(activeProducts.map((item) => item.sku)).size, `${activeProducts.length} active products`, 'slate'],
    ['Stock quantity', totalStock.toLocaleString(), `${batchCount} tracked batches`, 'blue'],
    ['Inventory value', currency(valuation), 'At purchase cost', 'violet'],
    ['Available stock', availableStock.toLocaleString(), 'Net of reservations', 'green'],
    ['Reserved stock', reservedStock.toLocaleString(), 'Allocated to orders', 'blue'],
    ['Low stock items', lowStock.length, 'At or below reorder level', 'amber'],
    ['Out of stock', outOfStock.length, 'No available quantity', 'rose'],
    ['Near expiry', nearExpiryBatches.length, `${currency(nearExpiryValue)} at risk`, 'orange'],
    ['Expired batches', expiredBatches.length, 'Dispatch blocked', 'rose'],
    ['Stale items', staleProducts.length, 'No movement for 30+ days', 'amber'],
    ['Incidents pending', data.incidents.filter((item) => item.status === 'Pending' || item.status === 'Under Investigation').length, 'For manager review', 'rose'],
    ['Today inward / outward', `${inwardToday} / ${outwardToday}`, 'Units received / issued', 'green']
  ];

  const sectionIntro = {
    Inventory: 'Product catalogue, stock position and batch traceability.',
    Movements: 'Every stock change is listed in the movement ledger.', Expiry: 'Batch-led expiry monitoring and FEFO picking guidance.',
    Stale: 'Identify stock without movement and record a follow-up recommendation.', Security: 'Review unusual stock operations and keep an investigation trail.',
    Backlog: 'Pick, pack and dispatch work waiting in the warehouse.', Shelf: 'Shelf locations, capacity and replenishment from bulk stock.',
    'Product Expiry': 'Expiry risk, quarantined value and the next batches to review.'
  };

  return <div className="space-y-5">
    {notice && <div role="status" className="fixed right-5 top-20 z-[80] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{notice}</div>}
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><Boxes className="h-5 w-5 text-orange-600"/><h2 className="text-xl font-bold tracking-tight text-slate-900">Grocery warehouse</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">LOCAL DATA</span></div><p className="mt-1 text-sm text-slate-500">{sectionIntro[section]}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => downloadCsv(filteredProducts.map(({ lots, nextExpiry, ...product }) => product), 'grocery-inventory.csv')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download size={15}/> Export CSV</button><button onClick={() => openMovementForm('Inward')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowDownToLine size={15}/> Receive stock</button><button onClick={() => openProductForm()} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700"><Plus size={15}/> Add product</button></div></div>

    <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5">{tabs.map(([label, value, Icon]) => <button key={value} onClick={() => { setSection(value); setPage(1); }} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${section === value ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon size={15}/>{label}{value === 'Security' && data.incidents.some((item) => item.status === 'Pending') ? <i className="h-1.5 w-1.5 rounded-full bg-rose-500"/> : null}</button>)}</div>

    {section === 'Overview' && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map(([label, value, note, tone]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><span className={`h-2 w-2 rounded-full ${tone === 'rose' ? 'bg-rose-500' : tone === 'amber' || tone === 'orange' ? 'bg-amber-500' : tone === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`}/></div><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></div>)}</div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Stock movement · last 7 days</h3><p className="mt-1 text-xs text-slate-500">Recorded grocery inward and outward quantities</p></div><button onClick={() => setSection('Movements')} className="text-xs font-semibold text-orange-700">View ledger →</button></div>
          <div className="mt-5 flex h-36 items-end gap-3 border-b border-slate-100 px-2">{Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = date.toISOString().slice(0, 10); const incoming = data.movements.filter((move) => move.date === key && (move.type === 'Inward' || move.type === 'Return')).reduce((sum, move) => sum + move.quantity, 0); const outgoing = data.movements.filter((move) => move.date === key && move.type === 'Outward').reduce((sum, move) => sum + move.quantity, 0); const max = Math.max(1, ...data.movements.map((move) => move.quantity)); return <div key={key} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className="flex h-[82%] w-full items-end justify-center gap-1"><div title={`Inward ${incoming}`} className="w-3 rounded-t bg-emerald-400" style={{ height: `${incoming ? Math.max(8, incoming / max * 100) : 3}%` }}/><div title={`Outward ${outgoing}`} className="w-3 rounded-t bg-orange-400" style={{ height: `${outgoing ? Math.max(8, outgoing / max * 100) : 3}%` }}/></div><span className="pb-2 text-[10px] text-slate-400">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span></div>; })}</div>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400"/>Inward</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-orange-400"/>Outward</span></div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Needs attention</h3><p className="mt-1 text-xs text-slate-500">Replenishment and expiry worklist</p></div><SlidersHorizontal className="h-4 w-4 text-slate-400"/></div><div className="mt-3 divide-y divide-slate-100">{[...lowStock.slice(0, 3).map((item) => ({ label: item.name, detail: `${item.available} ${item.unit} · reorder at ${item.reorderLevel}`, type: 'Low stock', onClick: () => { setSection('Products'); setQuery(item.sku); } })), ...nearExpiryBatches.slice(0, 3).map((batch) => ({ label: getProduct(batch.productId)?.name || 'Product', detail: `Lot ${batch.lot} · ${dayDiff(batch.expiryDate)} days remaining`, type: 'Expiry', onClick: () => setSection('Expiry') }))].slice(0, 5).map((item, index) => <button key={`${item.label}-${index}`} onClick={item.onClick} className="flex w-full items-center justify-between gap-2 py-3 text-left"><span className="min-w-0"><b className="block truncate text-xs text-slate-800">{item.label}</b><small className="mt-1 block text-[10px] text-slate-400">{item.detail}</small></span><span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">{item.type}</span></button>)}{!lowStock.length && !nearExpiryBatches.length && <p className="py-8 text-center text-xs text-slate-400">No urgent grocery alerts.</p>}</div></section>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">Inventory value by category</h3><p className="mt-1 text-xs text-slate-500">Value at purchase price · {currency(valuation)} total</p><div className="mt-4 space-y-3">{categories.map((item) => { const value = activeProducts.filter((product) => product.category === item).reduce((sum, product) => sum + product.value, 0); const share = valuation ? value / valuation * 100 : 0; return <div key={item}><div className="mb-1 flex justify-between text-[11px]"><span className="font-medium text-slate-700">{item}</span><span className="text-slate-500">{currency(value)} · {share.toFixed(0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${share}%` }}/></div></div>; })}{!categories.length && <p className="text-xs text-slate-400">No product categories yet.</p>}</div></section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">Expiry profile</h3><p className="mt-1 text-xs text-slate-500">Batch quantities grouped by time to expiry</p><div className="mt-4 space-y-3">{[['Safe · 90+ days', data.batches.filter((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) > 90), 'bg-emerald-500'], ['Attention · 31–90 days', data.batches.filter((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) >= 31 && dayDiff(batch.expiryDate) <= 90), 'bg-blue-500'], ['Near expiry · 1–30 days', data.batches.filter((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) >= 1 && dayDiff(batch.expiryDate) <= 30), 'bg-amber-500'], ['Expiring today / expired', data.batches.filter((batch) => batch.quantity > 0 && dayDiff(batch.expiryDate) <= 0), 'bg-rose-500']].map(([label, batches, color]) => <div key={label}><div className="mb-1 flex justify-between text-[11px]"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{batches.reduce((sum, batch) => sum + batch.quantity, 0)} units · {batches.length} lots</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${batchCount ? Math.max(batches.length ? 4 : 0, batches.length / batchCount * 100) : 0}%` }}/></div></div>)}</div><button onClick={() => setSection('Expiry')} className="mt-4 text-xs font-semibold text-orange-700">Review batches →</button></section>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-bold text-slate-900">Recent stock transactions</h3><button onClick={() => setSection('Movements')} className="text-xs font-semibold text-orange-700">Open ledger →</button></div><MovementTable movements={data.movements.slice(0, 5)} onOpenProduct={(id) => { setSelected(getProduct(id)); setModal('detail'); }}/></section>
    </>}

    {section === 'Inventory' && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Active SKUs',activeProducts.length,`${batchCount} tracked lots`],['Available / reserved',`${availableStock} / ${reservedStock}`,'Units'],['Low / out of stock',`${lowStock.length} / ${outOfStock.length}`,'Items'],['Near expiry / expired',`${nearExpiryBatches.length} / ${expiredBatches.length}`,'Batches']].map(([label,value,note]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></article>)}</div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid gap-2 border-b border-slate-100 p-3 md:grid-cols-4"><label className="relative md:col-span-2"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name, SKU, barcode, batch..." className={`${inputClass} pl-9`}/></label><select className={inputClass} value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select className={inputClass} value={warehouse} onChange={(event) => { setWarehouse(event.target.value); setPage(1); }}><option>All warehouses</option>{warehouses.map((item) => <option key={item}>{item}</option>)}</select><select className={`${inputClass} md:col-span-4`} value={expiryFilter} onChange={(event) => { setExpiryFilter(event.target.value); setPage(1); }}><option>All expiry</option><option>Near expiry</option><option>Expired</option></select></div><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-bold">Grocery product inventory</h3><button onClick={() => setSection('Movements')} className="text-xs font-semibold text-orange-700">Stock movement ledger →</button></div><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Product / SKU','Category · Supplier','Warehouse · Location','On hand','Reserved','Available','Next expiry','Value','Actions'].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleProducts.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-3 py-3"><button onClick={() => { setSelected(item); setModal('detail'); }} className="text-left"><b className="block text-slate-800">{item.name}</b><span className="mt-1 block font-mono text-[10px] text-slate-400">{item.sku} · {item.barcode || 'No barcode'}</span></button></td><td className="px-3 py-3"><span className="block text-slate-700">{item.category}</span><span className="mt-1 block text-[10px] text-slate-400">{item.supplier || 'No supplier'}</span></td><td className="px-3 py-3"><span className="block text-slate-700">{item.warehouse}</span><span className="mt-1 block text-[10px] text-slate-400">{item.location || 'Unassigned'}</span></td><td className="px-3 py-3 font-semibold text-slate-800">{item.total} {item.unit}</td><td className="px-3 py-3 text-slate-600">{item.reserved}</td><td className="px-3 py-3"><span className={item.available <= item.reorderLevel ? 'font-bold text-amber-700' : 'text-slate-700'}>{item.available}</span></td><td className="px-3 py-3">{item.nextExpiry ? <span className={dayDiff(item.nextExpiry.expiryDate) <= 30 ? 'font-semibold text-rose-600' : 'text-slate-600'}>{item.nextExpiry.expiryDate}</span> : '—'}</td><td className="px-3 py-3 font-semibold">{currency(item.value)}</td><td className="px-3 py-3"><div className="flex gap-1"><button title="View" onClick={() => { setSelected(item); setModal('detail'); }} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Eye size={14}/></button><button title="Edit" onClick={() => openProductForm(item)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Edit3 size={14}/></button><button title="Stock inward/outward" onClick={() => openMovementForm('Inward', item.id)} className="rounded p-1.5 text-orange-700 hover:bg-orange-50"><PackagePlus size={14}/></button><button title="Archive" onClick={() => archiveProduct(item)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Archive size={14}/></button></div></td></tr>)}</tbody></table>{!visibleProducts.length && <div className="p-10 text-center text-sm text-slate-400">No products match these filters.</div>}</div><Pagination page={page} pages={pageCount} count={filteredProducts.length} onChange={setPage}/></section>
    </>}

    {section === 'Movements' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4"><div><h3 className="text-sm font-bold">Stock movement ledger</h3><p className="mt-1 text-xs text-slate-500">No stock balance change is made without a ledger entry.</p></div><div className="flex gap-2"><button onClick={() => openMovementForm('Outward')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Issue stock</button><button onClick={() => openMovementForm('Inward')} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700">Receive stock</button></div></div><MovementTable movements={data.movements} onOpenProduct={(id) => { setSelected(getProduct(id)); setModal('detail'); }}/><Pagination page={page} pages={Math.max(1, Math.ceil(data.movements.length / PAGE_SIZE))} count={data.movements.length} onChange={setPage}/></section>}

    {section === 'Expiry' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h3 className="text-sm font-bold">Batch expiry control</h3><p className="mt-1 text-xs text-slate-500">Expired and quarantined lots are blocked from dispatch.</p></div><div className="flex flex-wrap items-end gap-2"><Field label="Near expiry (days)"><input type="number" min="1" value={nearExpiryDays} onChange={(event) => updateData((previous) => ({ ...previous, expirySettings: { ...previous.expirySettings, nearExpiryDays: Math.max(1, Number(event.target.value)) } }))} className="w-24 rounded-lg border border-slate-200 px-2 py-2 text-xs"/></Field><Field label="Attention (days)"><input type="number" min={nearExpiryDays + 1} value={attentionDays} onChange={(event) => updateData((previous) => ({ ...previous, expirySettings: { nearExpiryDays, attentionDays: Math.max(nearExpiryDays + 1, Number(event.target.value)) } }))} className="w-24 rounded-lg border border-slate-200 px-2 py-2 text-xs"/></Field><button onClick={() => downloadCsv(data.batches.map((batch) => ({ ...batch, product: getProduct(batch.productId)?.name, sku: getProduct(batch.productId)?.sku, daysRemaining: dayDiff(batch.expiryDate), expiryStatus: expiryStatus(batch.expiryDate, nearExpiryDays, attentionDays) })), 'grocery-expiry-report.csv')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"><Download size={14} className="mr-1 inline"/>Expiry CSV</button></div></div><ExpiryTable batches={data.batches} products={products} nearExpiryDays={nearExpiryDays} attentionDays={attentionDays} onQuarantine={(batch) => updateData((previous) => ({ ...previous, batches: previous.batches.map((item) => item.id === batch.id ? { ...item, quarantined: !item.quarantined } : item), activities: [addActivity(`${batch.quarantined ? 'Released quarantine for' : 'Quarantined'} lot ${batch.lot}`, 'Expiry'), ...previous.activities] }))}/></section>}

    {section === 'Stale' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h3 className="text-sm font-bold">Stale & slow-moving inventory</h3><p className="mt-1 text-xs text-slate-500">Find stock with no movement for the selected aging period.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><select value={stalePeriod} onChange={(event) => setStalePeriod(Number(event.target.value))} className={inputClass}>{[30,60,90,180].map((days) => <option key={days} value={days}>{days}+ days idle</option>)}</select><select value={staleCategory} onChange={(event) => setStaleCategory(event.target.value)} className={inputClass}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={staleWarehouse} onChange={(event) => setStaleWarehouse(event.target.value)} className={inputClass}><option>All warehouses</option>{warehouses.map((item) => <option key={item}>{item}</option>)}</select><select value={staleSupplier} onChange={(event) => setStaleSupplier(event.target.value)} className={inputClass}><option>All suppliers</option>{suppliersList.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Product','Category','Warehouse','Quantity','Last movement','Days idle','Stock value','Recommendations'].map((item) => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredStaleProducts.map((item) => { const days = Math.floor((Date.now() - new Date(`${item.lastMovement}T00:00:00`).getTime()) / 86400000); return <tr key={item.id}><td className="px-3 py-3 font-semibold">{item.name}<span className="block font-mono text-[10px] text-slate-400">{item.sku}</span></td><td className="px-3 py-3">{item.category}</td><td className="px-3 py-3">{item.warehouse}</td><td className="px-3 py-3">{item.total} {item.unit}</td><td className="px-3 py-3">{item.lastMovement}</td><td className="px-3 py-3 font-semibold text-amber-700">{days} days</td><td className="px-3 py-3">{currency(item.value)}</td><td className="px-3 py-3"><div className="flex flex-wrap gap-1">{['Discount','Return','Transfer','Clearance'].map((action) => <button key={action} onClick={() => saveRecommendation(item, action)} className="rounded-md border border-slate-200 px-1.5 py-1 text-[9px] hover:border-orange-300 hover:text-orange-700">{action}</button>)}</div></td></tr>; })}</tbody></table>{!filteredStaleProducts.length && <div className="p-10 text-center text-sm text-slate-400">No stale stock matches these filters.</div>}</div><div className="border-t border-slate-100 p-4"><h4 className="mb-2 text-xs font-bold">Open recommendations ({data.recommendations.filter((item) => item.status === 'Open').length})</h4><div className="flex flex-wrap gap-2">{data.recommendations.slice(0, 8).map((item) => <span key={item.id} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600">{item.action} · {item.productName} · {item.status}</span>)}</div></div></section>}

    {section === 'Backlog' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h3 className="text-sm font-bold">Picking & dispatch backlog</h3><p className="mt-1 text-xs text-slate-500">Track open grocery fulfilment work. Stock is issued only when the movement is posted.</p></div><button onClick={() => { setBacklogForm({ order: '', productId: activeProducts[0]?.id || '', quantity: '', due: today() }); setModal('backlog'); }} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white"><Plus size={14} className="mr-1 inline"/>Add pick task</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Task','Order / destination','Product','Quantity','Due date','Workflow','Action'].map((item) => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.backlog.map((task) => { const product = getProduct(task.productId); return <tr key={task.id}><td className="px-3 py-3 font-mono font-bold text-slate-700">{task.id}</td><td className="px-3 py-3">{task.order}</td><td className="px-3 py-3 font-medium">{product?.name || 'Archived product'}</td><td className="px-3 py-3">{task.quantity} {product?.unit}</td><td className="px-3 py-3">{task.due}</td><td className="px-3 py-3"><select value={task.status} onChange={(event) => updateBacklogStatus(task.id, event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]">{['Awaiting pick','Picking','Packed','Ready to dispatch','Dispatched','On hold'].map((status) => <option key={status}>{status}</option>)}</select></td><td className="px-3 py-3"><button disabled={!product || ['Dispatched','On hold'].includes(task.status)} onClick={() => openMovementForm('Outward', task.productId, task.quantity)} className="rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-semibold hover:bg-slate-50 disabled:opacity-40">Issue stock</button></td></tr>; })}</tbody></table>{!data.backlog.length && <div className="p-10 text-center text-sm text-slate-400">No pending warehouse tasks.</div>}</div></section>}

    {section === 'Shelf' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h3 className="text-sm font-bold">Shelf locations & replenishment</h3><p className="mt-1 text-xs text-slate-500">Shelf stock is tracked as an allocation within total stock; replenishment does not double-count inventory.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Product','Warehouse','Aisle / rack / bin','Shelf stock','Bulk available','Shelf capacity','Actions'].map((item) => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{activeProducts.map((product) => { const shelfQty = Number(data.shelfStock?.[product.id] || 0); const location = product.location || 'Unassigned'; const capacity = Number(product.maxStock || 0); return <tr key={product.id}><td className="px-3 py-3 font-semibold">{product.name}<span className="block font-mono text-[10px] text-slate-400">{product.sku}</span></td><td className="px-3 py-3">{product.warehouse}</td><td className="px-3 py-3">{location}</td><td className="px-3 py-3 font-semibold">{shelfQty} {product.unit}</td><td className="px-3 py-3">{Math.max(0, product.available - shelfQty)} {product.unit}</td><td className="px-3 py-3">{capacity ? `${shelfQty} / ${capacity}` : 'Not set'}</td><td className="px-3 py-3"><div className="flex gap-2"><button onClick={() => replenishShelf(product)} className="rounded-md border border-orange-200 px-2 py-1.5 text-[10px] font-semibold text-orange-700 hover:bg-orange-50">Replenish</button><button onClick={() => auditShelf(product)} className="rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-semibold hover:bg-slate-50">Shelf count</button></div></td></tr>; })}</tbody></table>{!activeProducts.length && <div className="p-10 text-center text-sm text-slate-400">Add products to configure shelf locations.</div>}</div></section>}

    {section === 'Product Expiry' && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Expired stock',expiredBatches.reduce((sum, batch) => sum + batch.quantity, 0),'bg-rose-50 text-rose-700'],['Near-expiry stock',nearExpiryBatches.reduce((sum, batch) => sum + batch.quantity, 0),'bg-amber-50 text-amber-700'],['Expiry value at risk',currency(nearExpiryValue),'bg-orange-50 text-orange-700'],['Quarantined lots',data.batches.filter((batch) => batch.quarantined).length,'bg-slate-100 text-slate-700']].map(([label,value,tone]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-900">{value}</p><span className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${tone}`}>Batch-based</span></article>)}</div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h3 className="text-sm font-bold">Product expiry control center</h3><p className="mt-1 text-xs text-slate-500">Upcoming batches, expiry risk and quarantine status.</p></div><button onClick={() => setSection('Expiry')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Open item expiration list →</button></div><div className="divide-y divide-slate-100">{data.batches.slice().sort((a,b) => a.expiryDate.localeCompare(b.expiryDate)).slice(0,8).map((batch) => { const product = getProduct(batch.productId); if (!product) return null; const days = dayDiff(batch.expiryDate); return <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><b className="block text-xs text-slate-800">{product.name}</b><span className="mt-1 block text-[10px] text-slate-400">{product.sku} · Lot {batch.lot} · {product.warehouse}</span></div><div className="flex items-center gap-3"><span className="text-xs text-slate-600">{batch.quantity} {product.unit}</span><span className="text-[10px] text-slate-500">{batch.expiryDate}</span><StatusBadge status={batch.quarantined ? 'Quarantined' : expiryStatus(batch.expiryDate, nearExpiryDays, attentionDays)}/></div></div>; })}{!data.batches.length && <div className="p-10 text-center text-sm text-slate-400">No batch expiry data.</div>}</div></section></div>}

    {section === 'Security' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h3 className="text-sm font-bold">Suspicious activity review</h3><p className="mt-1 text-xs text-slate-500">Generated for adjustments and unusually large stock issues.</p></div><select value={incidentStatus} onChange={(event) => setIncidentStatus(event.target.value)} className={`${inputClass} max-w-52`}><option>All</option>{['Pending','Under Investigation','Confirmed','False Positive','Resolved'].map((item) => <option key={item}>{item}</option>)}</select></div><div className="divide-y divide-slate-100">{data.incidents.filter((incident) => incidentStatus === 'All' || incident.status === incidentStatus).map((incident) => <article key={incident.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><b className="text-xs text-slate-800">{incident.type}</b><StatusBadge status={incident.risk}/><StatusBadge status={incident.status}/><code className="text-[10px] text-slate-400">{incident.id}</code></div><p className="mt-2 text-xs text-slate-600">{incident.reason}</p><p className="mt-1 text-[10px] text-slate-400">{incident.productName} ({incident.sku}) · {incident.warehouse} · {new Date(incident.date).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-400">Stock {incident.before} → {incident.after} ({incident.difference > 0 ? '+' : ''}{incident.difference}) · {incident.notes}</p></div><div className="flex flex-wrap items-center gap-1">{['Under Investigation','Confirmed','False Positive','Resolved'].map((status) => <button key={status} onClick={() => setIncident(incident.id, status)} className="rounded-md border border-slate-200 px-2 py-1.5 text-[9px] hover:bg-slate-50">{status}</button>)}</div></article>)}{!data.incidents.length && <div className="p-10 text-center text-sm text-slate-400"><ShieldAlert className="mx-auto mb-2 h-6 w-6"/>No suspicious activity currently recorded.</div>}</div></section>}

    {modal === 'backlog' && <Modal title="Add warehouse pick task" close={() => setModal(null)}><form onSubmit={addBacklogTask} className="space-y-3"><Field label="Order / destination"><input required value={backlogForm.order} onChange={(event) => setBacklogForm((form) => ({ ...form, order: event.target.value }))} className={inputClass}/></Field><Field label="Product"><select required value={backlogForm.productId} onChange={(event) => setBacklogForm((form) => ({ ...form, productId: event.target.value }))} className={inputClass}><option value="">Select product</option>{activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Quantity"><input required type="number" min="1" step="1" value={backlogForm.quantity} onChange={(event) => setBacklogForm((form) => ({ ...form, quantity: event.target.value }))} className={inputClass}/></Field><Field label="Due date"><input required type="date" value={backlogForm.due} onChange={(event) => setBacklogForm((form) => ({ ...form, due: event.target.value }))} className={inputClass}/></Field></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold">Cancel</button><button className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white">Add task</button></div></form></Modal>}

    {modal === 'product' && <Modal title={editing ? 'Edit grocery product' : 'Add grocery product'} close={() => setModal(null)}><form onSubmit={saveProduct} className="grid gap-3 sm:grid-cols-2">{[['Product name','name','text'],['SKU','sku','text'],['Barcode','barcode','text'],['Category','category','text'],['Subcategory','subcategory','text'],['Brand','brand','text'],['Manufacturer','manufacturer','text'],['Supplier','supplier','text'],['Warehouse','warehouse','text'],['Storage location','location','text'],['Purchase price','purchasePrice','number'],['Selling price','sellingPrice','number'],['Minimum stock','minStock','number'],['Maximum stock','maxStock','number'],['Reorder level','reorderLevel','number'],...(!editing ? [['Batch / lot number','batchNumber','text'],['Opening stock','openingStock','number'],['Manufacturing date','manufacturedAt','date'],['Expiry date','expiryDate','date']] : [])].map(([label,key,type]) => <Field key={key} label={label}><input required={['name','sku','warehouse'].includes(key)} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} type={type} value={productForm[key]} onChange={(event) => setProductForm((form) => ({ ...form, [key]: event.target.value }))} className={inputClass}/></Field>)}<Field label="Unit of measure"><select value={productForm.unit} onChange={(event) => setProductForm((form) => ({ ...form, unit: event.target.value }))} className={inputClass}>{['kg','gram','litre','ml','packet','box','piece','Drums','Cans (15L)','Bags (50kg)','Cartons'].map((unit) => <option key={unit}>{unit}</option>)}</select></Field><Field label="Condition"><select value={productForm.condition} onChange={(event) => setProductForm((form) => ({ ...form, condition: event.target.value }))} className={inputClass}>{['Good','Damaged','Quarantined'].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Description" className="sm:col-span-2"><textarea value={productForm.description} onChange={(event) => setProductForm((form) => ({ ...form, description: event.target.value }))} rows={2} className={inputClass}/></Field><div className="flex justify-end gap-2 pt-2 sm:col-span-2"><button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold">Cancel</button><button className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white">Save product</button></div></form></Modal>}

    {modal === 'movement' && <Modal title="Record stock movement" close={() => setModal(null)}><form onSubmit={createMovement} className="grid gap-3 sm:grid-cols-2"><Field label="Movement type"><select value={movementForm.type} onChange={(event) => setMovementForm((form) => ({ ...form, type: event.target.value }))} className={inputClass}>{['Inward','Outward','Stock adjustment','Reservation','Release reservation','Return','Damaged'].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Product"><select required value={movementForm.productId} onChange={(event) => { const productId = event.target.value; const batch = data.batches.find((item) => item.productId === productId && !item.quarantined && dayDiff(item.expiryDate) >= 0); setMovementForm((form) => ({ ...form, productId, batchId: batch?.id || '' })); }} className={inputClass}><option value="">Select product</option>{activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}</select></Field><Field label="Batch / lot"><select required value={movementForm.batchId} onChange={(event) => setMovementForm((form) => ({ ...form, batchId: event.target.value }))} className={inputClass}><option value="">Select a valid batch</option>{data.batches.filter((batch) => batch.productId === movementForm.productId && !batch.quarantined && dayDiff(batch.expiryDate) >= 0).map((batch) => <option key={batch.id} value={batch.id}>{batch.lot} · {batch.quantity} in stock · exp {batch.expiryDate}</option>)}</select></Field><Field label="Quantity"><input required min="0.001" step="any" type="number" value={movementForm.quantity} onChange={(event) => setMovementForm((form) => ({ ...form, quantity: event.target.value }))} className={inputClass}/></Field><Field label="Reference"><input value={movementForm.reference} onChange={(event) => setMovementForm((form) => ({ ...form, reference: event.target.value }))} placeholder="GRN / order / adjustment ref" className={inputClass}/></Field><Field label="Notes" className="sm:col-span-2"><textarea rows={2} value={movementForm.notes} onChange={(event) => setMovementForm((form) => ({ ...form, notes: event.target.value }))} className={inputClass}/></Field><div className="flex justify-end gap-2 pt-2 sm:col-span-2"><button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold">Cancel</button><button className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white">Post movement</button></div></form></Modal>}

    {modal === 'detail' && selected && <Modal title="Product details" close={() => setModal(null)}><div className="space-y-4"><div><h3 className="text-lg font-bold text-slate-900">{selected.name}</h3><p className="mt-1 text-xs text-slate-500">{selected.sku} · {selected.barcode || 'Barcode not set'} · {selected.category}</p></div><div className="grid gap-3 sm:grid-cols-3">{[['On hand',`${selected.total} ${selected.unit}`],['Reserved',selected.reserved],['Available',selected.available],['Value',currency(selected.value)],['Supplier',selected.supplier || '—'],['Warehouse',selected.warehouse],['Storage',selected.location || '—'],['Condition',selected.condition || 'Good'],['Last movement',selected.lastMovement]].map(([label,value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><small className="text-[10px] text-slate-400">{label}</small><p className="mt-1 text-xs font-semibold text-slate-800">{value}</p></div>)}</div><h4 className="text-xs font-bold">Batches (FEFO order)</h4><div className="divide-y divide-slate-100 rounded-lg border border-slate-100">{selected.lots.slice().sort((a,b) => a.expiryDate.localeCompare(b.expiryDate)).map((batch) => <div key={batch.id} className="flex flex-wrap justify-between gap-2 p-3 text-xs"><span>{batch.lot} · {batch.quantity} {selected.unit}</span><span>Expires {batch.expiryDate} · {expiryStatus(batch.expiryDate)}</span></div>)}</div><button onClick={() => openMovementForm('Inward', selected.id)} className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white">Record stock movement</button></div></Modal>}
  </div>;
};

function expiryStatus(date, nearExpiryDays = 30, attentionDays = 90) {
  const days = dayDiff(date);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expiring today';
  if (days <= nearExpiryDays) return 'Near expiry';
  if (days <= attentionDays) return 'Attention';
  return 'Safe';
}

function MovementTable({ movements, onOpenProduct }) {
  if (!movements.length) return <div className="p-10 text-center text-sm text-slate-400">No stock movements yet. Receive stock or issue an order to start the ledger.</div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Date','Product','Type','Batch','Quantity','Before → after','Reference','User'].map((item) => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{movements.map((move) => <tr key={move.id}><td className="px-3 py-3 text-slate-500">{move.date}</td><td className="px-3 py-3"><button onClick={() => onOpenProduct(move.productId)} className="text-left font-semibold text-slate-800 hover:text-orange-700">{move.productName}<span className="mt-1 block font-mono text-[10px] text-slate-400">{move.sku}</span></button></td><td className="px-3 py-3"><StatusBadge status={move.type}/></td><td className="px-3 py-3 font-mono text-slate-600">{move.lot}</td><td className="px-3 py-3 font-bold">{move.quantity}</td><td className="px-3 py-3">{move.before} → {move.after}</td><td className="px-3 py-3">{move.reference}</td><td className="px-3 py-3">{move.user}</td></tr>)}</tbody></table></div>;
}

function ExpiryTable({ batches, products, nearExpiryDays, attentionDays, onQuarantine }) {
  const ordered = batches.slice().sort((a,b) => a.expiryDate.localeCompare(b.expiryDate));
  if (!ordered.length) return <div className="p-10 text-center text-sm text-slate-400">No batches are being tracked.</div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{['Product / SKU','Batch','Mfg date','Expiry date','Days left','Quantity','Value','Status','Action'].map((item) => <th key={item} className="px-3 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{ordered.map((batch) => { const product = products.find((item) => item.id === batch.productId); if (!product) return null; const days = dayDiff(batch.expiryDate); const status = batch.quarantined ? 'Quarantined' : expiryStatus(batch.expiryDate, nearExpiryDays, attentionDays); return <tr key={batch.id} className={days < 0 ? 'bg-rose-50/40' : ''}><td className="px-3 py-3 font-semibold">{product.name}<span className="block font-mono text-[10px] text-slate-400">{product.sku}</span></td><td className="px-3 py-3 font-mono">{batch.lot}</td><td className="px-3 py-3">{batch.manufacturedAt || '—'}</td><td className="px-3 py-3">{batch.expiryDate}</td><td className={`px-3 py-3 font-semibold ${days <= nearExpiryDays ? 'text-rose-600' : 'text-slate-700'}`}>{days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`}</td><td className="px-3 py-3">{batch.quantity} {product.unit}</td><td className="px-3 py-3">{currency(batch.quantity * product.purchasePrice)}</td><td className="px-3 py-3"><StatusBadge status={status}/></td><td className="px-3 py-3"><button onClick={() => onQuarantine(batch)} className="rounded-md border border-slate-200 px-2 py-1 text-[10px]">{batch.quarantined ? 'Release hold' : 'Quarantine'}</button></td></tr>; })}</tbody></table></div>;
}

function Pagination({ page, pages, count, onChange }) {
  return <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><span>{count} records · page {page} of {pages}</span><div className="flex gap-1"><button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => onChange(page + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div></div>;
}
