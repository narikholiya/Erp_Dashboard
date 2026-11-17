import React, { useState } from 'react';
import {
  Search,
  Bell,
  Mail,
  Plus,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const Header = () => {
  const {
    activeRole,
    setActiveRole,
    searchQuery,
    setSearchQuery,
    selectedDateRange,
    setSelectedDateRange,
    setActiveModal,
    setActiveTab,
    setWarehouseSubTab,
    setSystemView,
    brightIdeaAlerts,
    groceryItems,
    suspiciousActivities
  } = useERP();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false);

  const roles = [
    { id: 'admin', name: 'Admin Master', badge: 'Full Control', desc: 'Can see & manage all modules' },
    { id: 'warehouse', name: 'Warehouse Team', badge: 'Alert-Based', desc: 'Grocery, Raw Material & Alert tools' },
    { id: 'inventory', name: 'Inventory Specialist', badge: 'Stock Only', desc: 'Reconciliation, Ledgers & Batches' },
    { id: 'buying-selling', name: 'Buying & Selling Lead', badge: 'Trade / POS', desc: 'Procurement, Sales & POS' },
    { id: 'accounts', name: 'Accounts Controller', badge: 'Finance', desc: 'GL, P&L, Invoices & Banking' },
  ];

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[0];

  // Critical alerts count
  const criticalGrocery = groceryItems.filter(g => g.status.includes('Critical') || g.daysLeft <= 5);
  const totalNotifications = criticalGrocery.length + suspiciousActivities.length + brightIdeaAlerts.length;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Global Search (Matches Image 3) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, invoices, warehouses, suppliers, batch numbers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Filter */}
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Quarter</option>
        </select>
      </div>

      {/* Right Controls: Role Switcher, Quick Action, Alerts, User Profile */}
      <div className="flex items-center gap-3">
        {/* Role Perspective Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-slate-900 font-bold">{currentRoleObj.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Simulate Role Perspective</p>
                <p className="text-[11px] text-slate-400">Preview what each department sees</p>
              </div>
              <div className="mt-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRole(r.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      activeRole === r.id
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{r.desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {r.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm shadow-brand-500/30 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden md:inline">New Action</span>
          </button>

          {showQuickActionMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Operations
              </div>
              <button
                onClick={() => {
                  setActiveModal('new-stock-entry');
                  setShowQuickActionMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-brand-500" />
                <span>New Stock Entry</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('new-po');
                  setShowQuickActionMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Create Purchase Order</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('new-sales');
                  setShowQuickActionMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Create Sales Order</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('new-raw-material');
                  setShowQuickActionMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Add Raw Material Import</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('pos-checkout');
                  setShowQuickActionMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-xl flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Open POS Terminal</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications & Alert Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="w-9 h-9 rounded-xl border border-slate-200/90 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Operational Alerts</span>
                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                  {totalNotifications} Active
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2 mt-2">
                {criticalGrocery.map((g) => (
                  <button key={g.id} onClick={() => { setActiveTab('warehouse'); setWarehouseSubTab('grocery'); setSystemView(''); setShowNotificationMenu(false); }} className="block w-full p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-left text-xs hover:bg-rose-100">
                    <div className="flex items-center justify-between font-bold text-rose-800">
                      <span>{g.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                        Expires in {g.daysLeft}d
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Batch: {g.batch} • {g.warehouse} ({g.qty} {g.unit})
                    </p>
                  </button>
                ))}
                {suspiciousActivities.map((sa) => (
                  <button key={sa.id} onClick={() => { setActiveTab('warehouse'); setWarehouseSubTab('grocery'); setSystemView(''); setShowNotificationMenu(false); }} className="block w-full p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-left text-xs hover:bg-amber-100">
                    <div className="flex items-center gap-1 font-bold text-amber-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>{sa.warehouse}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">{sa.description}</p>
                    <span className="text-[10px] text-amber-600 block mt-1">{sa.time}</span>
                  </button>
                ))}
                {brightIdeaAlerts.map((alert) => (
                  <button key={alert.id} onClick={() => { setActiveTab('warehouse'); setWarehouseSubTab('bright-ideas'); setSystemView(''); setShowNotificationMenu(false); }} className="block w-full rounded-xl border border-orange-100 bg-orange-50/70 p-2.5 text-left text-xs hover:bg-orange-100">
                    <div className="flex items-center justify-between font-bold text-orange-900"><span>{alert.productName}</span><span className="rounded bg-orange-200 px-1.5 py-0.5 text-[10px]">{alert.alertLevel}</span></div>
                    <p className="mt-0.5 text-[11px] text-orange-800">{alert.currentQty} {alert.unit} available · reorder at {alert.minQty} · {alert.region}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile matching Image 3: "Humayun - Sales Admin" */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-brand-500/30">
              HA
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Humayun Ahmed</p>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentRoleObj.name}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
