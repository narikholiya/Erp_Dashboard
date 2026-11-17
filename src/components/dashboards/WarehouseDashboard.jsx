import React, { useState } from 'react';
import {
  Warehouse,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Wheat,
  Plus,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle,
  Truck,
  Ship,
  Sparkles,
  Layers,
  Calendar,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { GroceryModule } from './GroceryModule';

export const WarehouseDashboard = () => {
  const {
    warehouseSubTab,
    setWarehouseSubTab,
    setActiveTab,
    warehouses,
    inventoryItems,
    groceryItems,
    suspiciousActivities,
    brightIdeaAlerts,
    rawMaterialImports,
    rawMaterialExports,
    setActiveModal,
    dismissAlert,
    searchQuery
  } = useERP();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const furnitureItems = inventoryItems.filter((item) => /furniture/i.test(item.category || '') || /\b(chair|desk|table|sofa|cabinet)\b/i.test(item.name || ''));
  const homeDecorItems = inventoryItems.filter((item) => /home.?decor|decor/i.test(`${item.category || ''} ${item.subcategory || ''}`) || /\b(vase|lamp|wall art|decor)\b/i.test(item.name || ''));
  const [brightIdeaQuery, setBrightIdeaQuery] = useState('');
  const [brightIdeaRegion, setBrightIdeaRegion] = useState('All source regions');

  // Filter grocery items
  const filteredGrocery = groceryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategoryFilter === 'All') return matchesSearch;
    if (activeCategoryFilter === 'Expiring') return matchesSearch && item.daysLeft <= 15;
    if (activeCategoryFilter === 'Stale') return matchesSearch && item.status.includes('Stale');
    return matchesSearch;
  });

  const lowQuantityAlerts = brightIdeaAlerts
    .map((alert) => {
      const minQty = Number(alert.minQty || 0);
      const currentQty = Number(alert.currentQty || 0);
      const coverage = minQty > 0 ? currentQty / minQty : 1;
      const level = currentQty <= 0 ? 'Out of stock' : coverage <= 0.25 ? 'Critical' : coverage <= 0.5 ? 'High' : 'Low';
      return { ...alert, minQty, currentQty, coverage, level, deficit: Math.max(0, minQty - currentQty) };
    })
    .filter((alert) => alert.minQty > 0 && alert.currentQty <= alert.minQty)
    .filter((alert) => brightIdeaRegion === 'All source regions' || alert.region === brightIdeaRegion)
    .filter((alert) => `${alert.productName} ${alert.supplierName} ${alert.region}`.toLowerCase().includes(brightIdeaQuery.toLowerCase()))
    .sort((a, b) => a.coverage - b.coverage);

  return (
    <div className="space-y-6">
      {/* Warehouse Header & Direct Integrated Link to Inventory */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-orange-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Warehouse</h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Choose a category to view its records and operational fields.
          </p>
        </div>

        {/* Integrated Navigation: Warehouse to Inventory Link */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-all group"
          >
            <span>Open Inventory & Stock Ledger</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" />
          </button>
          <button
            onClick={() => setActiveModal('new-stock-entry')}
            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stock Entry Voucher</span>
          </button>
        </div>
      </div>

      {/* Category-specific records appear after selecting one of the three tabs. */}
      <div className="hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{wh.id} â€¢ {wh.region}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{wh.name}</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                wh.alerts > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {wh.alerts} Alerts
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Cap: <strong className="text-slate-800">{wh.capacity}</strong></span>
              <span className="text-slate-500">Stock: <strong className="text-slate-800">{wh.itemsCount.toLocaleString()}</strong></span>
              <span className="text-slate-400 font-medium">{wh.manager}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary warehouse categories */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <label htmlFor="warehouse-section" className="text-xs font-semibold text-slate-600">Warehouse section</label>
          <select id="warehouse-section" value={warehouseSubTab} onChange={(event) => setWarehouseSubTab(event.target.value)} className="min-w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
            <option value="grocery">Grocery ({groceryItems.length})</option>
            <option value="bright-ideas">Bright Idea ({brightIdeaAlerts.length})</option>
            <option value="raw-materials">Raw Material ({rawMaterialImports.length + rawMaterialExports.length})</option>
          </select>
        </div>
        {warehouseSubTab === 'grocery' && <GroceryModule searchQuery={searchQuery} />}

        {/* Legacy grocery markup kept inactive while the operational grocery module renders above. */}
        {false && warehouseSubTab === 'grocery' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Grocery Inventory & Expiration Matrix</h3>
                <p className="text-xs text-slate-500">Track Shelf life, stale items, and product expiry dates</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {['All', 'Expiring', 'Stale'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveCategoryFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      activeCategoryFilter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Grocery Data Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Batch / Lot #</th>
                    <th className="p-3.5">Warehouse Hub</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Arrival Date</th>
                    <th className="p-3.5">Expiry Date</th>
                    <th className="p-3.5">Shelf Life Remaining</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrocery.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {item.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{item.id}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{item.batch}</td>
                      <td className="p-3.5 text-slate-600">{item.warehouse}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{item.qty} {item.unit}</td>
                      <td className="p-3.5 text-slate-500">{item.arrivalDate}</td>
                      <td className="p-3.5 text-slate-500">{item.expiryDate}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${item.daysLeft <= 5 ? 'text-rose-600' : item.daysLeft <= 15 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {item.daysLeft} days
                          </span>
                          <span className="text-[10px] text-slate-400">({item.shelfLife})</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setActiveModal('new-stock-entry')}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Dispatch / Move
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Suspicious Activity & Warehouse Backlog Grid (From handwritten notes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              {/* Suspicious Activity Box */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Suspicious Activity (SA) Incident Log</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {suspiciousActivities.length} Under Review
                  </span>
                </div>
                <div className="space-y-2">
                  {suspiciousActivities.map((sa) => (
                    <div key={sa.id} className="bg-white p-3 rounded-lg border border-amber-200/80 text-xs shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{sa.warehouse}</span>
                        <span className="text-[10px] text-amber-600 font-semibold">{sa.time}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{sa.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Reported By: {sa.reportedBy}</span>
                        <span className="font-bold text-rose-600">Severity: {sa.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warehouse Backlog Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Warehouse Picking & Packing Backlog</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    3 Orders Queued
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Backlog #BK-108 - Prime Mart Grocery Order</p>
                      <p className="text-slate-400 text-[11px]">120 Cans Mustard Oil â€¢ Metro Cold Storage</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 font-bold rounded text-[10px]">
                      Awaiting Palletizing
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Backlog #BK-109 - Starlight Tech Delivery</p>
                      <p className="text-slate-400 text-[11px]">50x Laptops â€¢ Central Distribution Hub</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                      Staged at Dock #3
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Bright Ideas (Alert for low item based on quantity, supplier, region) */}
        {warehouseSubTab === 'bright-ideas' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">Bright Idea - Low quantity alerts</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alerts trigger when current stock reaches or falls below the product minimum quantity.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input value={brightIdeaQuery} onChange={(event) => setBrightIdeaQuery(event.target.value)} placeholder="Search product or supplier" className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400" />
                <select value={brightIdeaRegion} onChange={(event) => setBrightIdeaRegion(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                  <option>All source regions</option>
                  {[...new Set(brightIdeaAlerts.map((alert) => alert.region))].map((region) => <option key={region}>{region}</option>)}
                </select>
                <button onClick={() => setActiveModal('new-po')} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-bold text-white hover:bg-brand-600"><Plus className="h-3.5 w-3.5" />Create purchase order</button>
              </div>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3"><h3 className="text-sm font-bold text-slate-900">Furniture & home decor</h3><p className="mt-1 text-xs text-slate-500">Bright Idea products from the inventory catalogue.</p></div>
              <div className="grid gap-3 md:grid-cols-2">
                {[['Furniture', furnitureItems], ['Home Decor', homeDecorItems]].map(([title, items]) => <div key={title} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"><h4 className="text-xs font-bold text-slate-700">{title} <span className="font-normal text-slate-400">({items.length})</span></h4>{items.length ? <div className="mt-2 divide-y divide-slate-200">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="font-medium text-slate-800">{item.name}</span><span className="shrink-0 text-slate-500">{item.available ?? item.inStock ?? 0} in stock</span></div>)}</div> : <p className="mt-2 text-xs text-slate-500">No {title.toLowerCase()} products in the catalogue yet.</p>}</div>)}
              </div>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowQuantityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{alert.id} Â· Source region: {alert.region}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{alert.productName}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.level === 'Critical' || alert.level === 'Out of stock' ? 'bg-rose-100 text-rose-700' : alert.level === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.level} - {Math.round(alert.coverage * 100)}% of minimum
                    </span>
                  </div>

                  <div className="my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Current Qty</span>
                      <p className="font-extrabold text-rose-600">{alert.currentQty} {alert.unit}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Min Threshold</span>
                      <p className="font-extrabold text-slate-800">{alert.minQty} {alert.unit}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Deficit</span>
                      <p className="font-extrabold text-slate-800">{alert.deficit} {alert.unit}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong className="text-slate-800">Supplier Name:</strong> {alert.supplierName || 'Not assigned'}</p>
                    <p><strong className="text-slate-800">Supplier source region:</strong> {alert.region || 'Not assigned'}</p>
                    <p><strong className="text-slate-800">Recommended Action:</strong> {alert.suggestedAction}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => setActiveModal('new-po')}
                      className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs border border-brand-200 transition-colors"
                    >
                      Create Replenishment PO âž”
                    </button>
                  </div>
                </div>
              ))}
              {!lowQuantityAlerts.length && <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 md:col-span-2">No items are below minimum quantity.</p>}
            </div>
          </div>
        )}

        {/* Tab 3 Content: Raw Material (Unprocessed Food: Import & Export tracking) */}
        {warehouseSubTab === 'raw-materials' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Raw Material Management (Unprocessed Food)</h3>
                <p className="text-xs text-slate-500">
                  Track day of arrival, shelf life, quantities, import customs status, and export shipment details.
                </p>
              </div>
              <button
                onClick={() => setActiveModal('new-raw-material')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Import / Arrival</span>
              </button>
            </div>

            {/* Import Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1) Raw Material Imports & Gate In
                </h4>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                      <th className="p-3">Reference #</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Day of Arrival</th>
                      <th className="p-3">Expires</th>
                      <th className="p-3">Shelf Life</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Origin</th>
                      <th className="p-3">Customs Clearance</th>
                      <th className="p-3">Quality Inspection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rawMaterialImports.map((imp) => (
                      <tr key={imp.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-700">{imp.id}</td>
                        <td className="p-3 font-bold text-slate-900">{imp.product}</td>
                        <td className="p-3 text-slate-600 font-medium">{imp.dayOfArrival}</td>
                        <td className="p-3 font-semibold text-slate-700">{imp.expiryDate || 'â€”'}</td>
                        <td className="p-3 font-semibold text-slate-700">{imp.shelfLife || imp.expiryShelfLife || 'â€”'}</td>
                        <td className="p-3 font-extrabold text-slate-900">{imp.quantity}</td>
                        <td className="p-3 text-slate-500">{imp.origin}</td>
                        <td className="p-3">
                          <StatusBadge status={imp.customsStatus} />
                        </td>
                        <td className="p-3">
                          <StatusBadge status={imp.inspectionStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Ship className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2) Raw Material Exports & Dispatch
                </h4>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                      <th className="p-3">Dispatch ID</th>
                      <th className="p-3">Shipment Details</th>
                      <th className="p-3">Day Of Export</th>
                      <th className="p-3">Destination Port</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Carrier / Vessel</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rawMaterialExports.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-700">{exp.id}</td>
                        <td className="p-3 font-bold text-slate-900">{exp.shipmentDetails}</td>
                        <td className="p-3 text-slate-600 font-medium">{exp.dayOfExport}</td>
                        <td className="p-3 text-slate-700">{exp.destination}</td>
                        <td className="p-3 font-extrabold text-slate-900">{exp.quantity}</td>
                        <td className="p-3 text-slate-500">{exp.carrier}</td>
                        <td className="p-3">
                          <StatusBadge status={exp.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reports - Buying, Selling, Arrives summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-800">Raw Material Movement Report:</span>
                <span className="text-slate-500 ml-2">Arriving This Week: <strong>545 Tons</strong> | Committed for Export: <strong>232 Tons</strong></span>
              </div>
              <button
                onClick={() => setActiveTab('buying-selling')}
                className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View Buying & Selling Summary âž”</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


