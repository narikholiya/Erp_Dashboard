import React, { useState } from 'react';
import {
  Boxes,
  Layers,
  FileCheck2,
  ListOrdered,
  Barcode,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle,
  AlertTriangle,
  History,
  QrCode,
  FileSpreadsheet,
  PackageCheck,
  ClipboardList
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';

export const InventoryDashboard = () => {
  const {
    inventoryItems,
    warehouses,
    setActiveModal,
    searchQuery,
    setSearchQuery
  } = useERP();

  const [activeSubView, setActiveSubView] = useState('items'); // 'items', 'reconciliation', 'tools', 'reports'
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Filter items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouseFilter === 'All' || item.warehouse === selectedWarehouseFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesWarehouse && matchesCategory;
  });

  // Categories list
  const categories = ['All', 'Electronics', 'Office Supplies', 'Raw Material', 'Grocery', 'Machinery', 'Accessories'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventory & Stock Operations</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Stock Balancing
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time stock ledger, physical-to-system reconciliation, pick lists, serial & batch bundles, and quality inspection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveSubView('reconciliation')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Stock Reconciliation</span>
          </button>
          <button
            onClick={() => setActiveModal('new-stock-entry')}
            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Stock Entry</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'items', label: 'Item Master & Stock Balance', icon: Boxes },
          { id: 'reconciliation', label: 'Stock Reconciliation', icon: FileCheck2 },
          { id: 'tools', label: 'Inventory Tools (Pick List, Landed Cost, QC)', icon: ClipboardList },
          { id: 'reports', label: 'Stock Reports & Ageing', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Item Master & Stock Balance */}
      {activeSubView === 'items' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategoryFilter === cat
                      ? 'bg-brand-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Warehouse:</span>
              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700"
              >
                <option value="All">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">SKU / Item Code</th>
                    <th className="p-3.5">Item Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Warehouse Location</th>
                    <th className="p-3.5 text-right">Physical Stock</th>
                    <th className="p-3.5 text-right">Reserved</th>
                    <th className="p-3.5 text-right">Available</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-right">Valuation</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">{item.code}</td>
                      <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{item.warehouse}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-800">{item.inStock}</td>
                      <td className="p-3.5 text-right text-slate-500">{item.reserved}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-600">{item.available}</td>
                      <td className="p-3.5 text-right font-medium text-slate-700">${item.unitPrice.toLocaleString()}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">${item.value.toLocaleString()}</td>
                      <td className="p-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setActiveModal('new-stock-entry')}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          Transfer / Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Stock Reconciliation */}
      {activeSubView === 'reconciliation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Reconciliation Sheet</h3>
              <p className="text-xs text-slate-500">
                Match physical warehouse count with system inventory records to spot shrinkage and discrepancies.
              </p>
            </div>
            <button className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs">
              Post Variance Adjustment
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Warehouse</th>
                  <th className="p-3 text-right">System Count</th>
                  <th className="p-3 text-right">Physical Count</th>
                  <th className="p-3 text-right">Variance</th>
                  <th className="p-3 text-right">Discrepancy Value</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold">SKU-GROC-OIL</td>
                  <td className="p-3 font-bold text-slate-800">Cold Pressed Mustard Oil 15L</td>
                  <td className="p-3 text-slate-600">Metro Cold Storage</td>
                  <td className="p-3 text-right font-bold text-slate-700">120</td>
                  <td className="p-3 text-right font-bold text-slate-900">108</td>
                  <td className="p-3 text-right font-bold text-rose-600">-12 Cans</td>
                  <td className="p-3 text-right font-bold text-rose-600">-$384.00</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Discrepancy Logged</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold">SKU-ELEC-5540</td>
                  <td className="p-3 font-bold text-slate-800">Dell Latitude 5540 Core i7</td>
                  <td className="p-3 text-slate-600">Central Distribution Hub</td>
                  <td className="p-3 text-right font-bold text-slate-700">340</td>
                  <td className="p-3 text-right font-bold text-slate-900">340</td>
                  <td className="p-3 text-right font-bold text-emerald-600">0</td>
                  <td className="p-3 text-right font-bold text-slate-400">$0.00</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Reconciled 100%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Operational Tools (From Whiteboard: Pick List, Landed Cost Voucher, Quality Inspection, Packing Slip, Serial & Batch) */}
      {activeSubView === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tool 1: Pick List & Packing Slip */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Pick List & Packing Slips</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Direct warehouse floor picking instructions grouped by optimal aisle path.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Pick List #PL-892 (For SO-9921)</p>
                  <p className="text-slate-400 text-[11px]">Central Hub • Aisle 4B, Bin 12 • 34 Units</p>
                </div>
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-bold rounded-lg border border-brand-200 text-[11px]">
                  Ready to Pick
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Packing Slip #PS-401 (For Dispatch)</p>
                  <p className="text-slate-400 text-[11px]">Barcode verified & Sealed • Weight: 42.5 kg</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[11px]">
                  Packed & Labelled
                </span>
              </div>
            </div>
          </div>

          {/* Tool 2: Serial & Batch Bundles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Serial & Batch Bundles</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Track individual Serial Numbers and Batch Bundles across receipt and dispatch.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Batch #BAT-2026-88</span>
                  <span className="text-slate-500 font-mono text-[11px]">45 Drums</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Alphonso Mango Pulp • Expiry: 20 Nov 2026</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Serial Bundle #SN-DELL-8800</span>
                  <span className="text-slate-500 font-mono text-[11px]">50 Serials</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Dell Latitude 5540 (Range: SN-00101 to SN-00150)</p>
              </div>
            </div>
          </div>

          {/* Tool 3: Quality Inspection (QC) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Quality Inspection Checklist</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Standard compliance criteria for incoming shipments before receiving into stock.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <span>Moisture Content Test (&lt;12% target)</span>
                <span className="font-bold">PASSED (10.4%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <span>Packaging Integrity & Seal Check</span>
                <span className="font-bold">PASSED</span>
              </div>
            </div>
          </div>

          {/* Tool 4: Landed Cost Voucher */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Landed Cost Voucher</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Allocate import duty, freight and insurance charges directly into inventory item valuation.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Base Purchase Value:</span>
                <span className="font-semibold text-slate-800">$96,000.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight & Maritime Customs:</span>
                <span className="font-semibold text-slate-800">+$6,400.00</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>True Landed Cost / Ton:</span>
                <span className="text-brand-600">$1,280.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Stock Reports & Ageing */}
      {activeSubView === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900">Stock Ageing & Velocity Analysis</h3>
          <p className="text-xs text-slate-500">
            Categorization of inventory holding days to identify dead stock and high-turnover items.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">0 - 30 Days (Fast Moving)</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">$1.42M</p>
              <span className="text-[10px] text-emerald-600 font-bold">52% of total stock</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">31 - 60 Days (Normal)</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">$890K</p>
              <span className="text-[10px] text-blue-600 font-bold">31% of total stock</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">61 - 90 Days (Slow Moving)</span>
              <p className="text-lg font-extrabold text-amber-600 mt-1">$360K</p>
              <span className="text-[10px] text-amber-600 font-bold">12% of total stock</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">90+ Days (Stale / Dead)</span>
              <p className="text-lg font-extrabold text-rose-600 mt-1">$175K</p>
              <span className="text-[10px] text-rose-600 font-bold">5% review needed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
