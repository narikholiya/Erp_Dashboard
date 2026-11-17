import React, { useState } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  Receipt,
  Users,
  Building2,
  Plus,
  ArrowRight,
  Sparkles,
  CreditCard,
  FileText,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';

export const BuyingSellingDashboard = () => {
  const {
    buyingSellingSubTab,
    setBuyingSellingSubTab,
    suppliers,
    purchaseOrders,
    customers,
    salesOrders,
    posInvoices,
    setActiveModal,
    setActiveTab,
    searchQuery
  } = useERP();

  const [activeBuyingFilter, setActiveBuyingFilter] = useState('All');
  const [activeSellingFilter, setActiveSellingFilter] = useState('All');

  // Filter Purchase Orders
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          po.items.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeBuyingFilter === 'All') return matchesSearch;
    return matchesSearch && po.status === activeBuyingFilter;
  });

  // Filter Sales Orders
  const filteredSOs = salesOrders.filter(so => {
    const matchesSearch = so.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          so.customer.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeSellingFilter === 'All') return matchesSearch;
    return matchesSearch && so.status === activeSellingFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Unified Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Buying & Selling Integrated Center</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Procurement + Commercial Sales + POS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete supply-chain lifecycle: RFQ ➔ Purchase Orders ➔ Delivery Notes ➔ Sales Invoices ➔ Counter POS.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setBuyingSellingSubTab('buying')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              buyingSellingSubTab === 'buying'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buying (Procurement)
          </button>
          <button
            onClick={() => setBuyingSellingSubTab('selling')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              buyingSellingSubTab === 'selling'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selling (Commercial)
          </button>
          <button
            onClick={() => setBuyingSellingSubTab('pos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              buyingSellingSubTab === 'pos'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            POS Retail Terminal
          </button>
        </div>
      </div>

      {/* TAB 1: BUYING (Procurement, Suppliers, RFQ, POs, Receipts, AP) */}
      {buyingSellingSubTab === 'buying' && (
        <div className="space-y-6">
          {/* Buying Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Active Suppliers</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{suppliers.length} Approved Vendors</h3>
              <p className="text-[11px] text-slate-400 mt-1">Global & domestic agro/tech vendors</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Open Purchase Orders</span>
              <h3 className="text-xl font-bold text-blue-600 mt-1">
                ${purchaseOrders.reduce((a, c) => a + c.totalAmount, 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">{purchaseOrders.length} active purchase contracts</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Accounts Payable (AP)</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">$840,000 Due</h3>
              <p className="text-[11px] text-slate-400 mt-1">Synced with Accounts Ledger</p>
            </div>
          </div>

          {/* Purchase Orders Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Purchase Orders (PO) Register</h3>
                <p className="text-xs text-slate-500">Procurement requisitions, approvals & receipt status</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('new-po')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue New PO</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3.5">PO Number</th>
                    <th className="p-3.5">Supplier / Vendor</th>
                    <th className="p-3.5">Items Ordered</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Expected Delivery</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                    <th className="p-3.5">PO Status</th>
                    <th className="p-3.5">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-600">{po.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{po.supplier}</td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate">{po.items}</td>
                      <td className="p-3.5 text-slate-500">{po.date}</td>
                      <td className="p-3.5 text-slate-500">{po.expectedDate}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">${po.totalAmount.toLocaleString()}</td>
                      <td className="p-3.5">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={po.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suppliers Directory */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Approved Suppliers & Price Lists</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suppliers.map((sup) => (
                <div key={sup.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sup.id} • {sup.region}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{sup.name}</h4>
                  <p className="text-[11px] text-slate-500">{sup.category}</p>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-600">{sup.rating} ★ Rating</span>
                    <span className="font-bold text-slate-800">{sup.totalSpend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SELLING (Commercial, Customers, Quotations, Sales Orders, Delivery Notes, AR) */}
      {buyingSellingSubTab === 'selling' && (
        <div className="space-y-6">
          {/* Selling Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Total B2B Customers</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{customers.length} Enterprise Clients</h3>
              <p className="text-[11px] text-slate-400 mt-1">Active trading accounts</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Gross Sales Value</span>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">
                ${salesOrders.reduce((a, c) => a + c.totalAmount, 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Dispatched & Confirmed Orders</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Accounts Receivable (AR)</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">$612,400</h3>
              <p className="text-[11px] text-slate-400 mt-1">Outstanding customer balance</p>
            </div>
          </div>

          {/* Sales Orders Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales Orders & Delivery Notes</h3>
                <p className="text-xs text-slate-500">Customer dispatches and commercial invoice processing</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('new-sales')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Sales Order</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Order Date</th>
                    <th className="p-3.5">Fulfillment Warehouse</th>
                    <th className="p-3.5 text-right">Order Amount</th>
                    <th className="p-3.5">Fulfillment Status</th>
                    <th className="p-3.5">Invoice Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSOs.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-emerald-600">{so.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{so.customer}</td>
                      <td className="p-3.5 text-slate-500">{so.date}</td>
                      <td className="p-3.5 text-slate-600">{so.warehouse}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">${so.totalAmount.toLocaleString()}</td>
                      <td className="p-3.5">
                        <StatusBadge status={so.status} />
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={so.invoiceStatus} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setActiveTab('accounts')}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          View In GL ➔
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

      {/* TAB 3: POS TERMINAL & INVOICES (Point of Sale from whiteboard) */}
      {buyingSellingSubTab === 'pos' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Retail Point-of-Sale (POS) Logs</h3>
              </div>
              <p className="text-xs text-slate-500">Fast checkout invoices generated at warehouse retail counters</p>
            </div>

            <button
              onClick={() => setActiveModal('pos-checkout')}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch POS Billing Terminal</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5">Cashier</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-center">Items Count</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                  <th className="p-3.5 text-right">Tax (8%)</th>
                  <th className="p-3.5 text-right">Total Paid</th>
                  <th className="p-3.5">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{inv.id}</td>
                    <td className="p-3.5 font-medium text-slate-700">{inv.cashier}</td>
                    <td className="p-3.5 text-slate-500">{inv.time}</td>
                    <td className="p-3.5 text-center font-bold text-slate-700">{inv.itemsCount}</td>
                    <td className="p-3.5 text-right text-slate-600">${inv.subtotal.toFixed(2)}</td>
                    <td className="p-3.5 text-right text-slate-500">${inv.tax.toFixed(2)}</td>
                    <td className="p-3.5 text-right font-extrabold text-brand-600">${inv.total.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
