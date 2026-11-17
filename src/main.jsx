import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ERPProvider, useERP } from './context/ERPContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { WarehouseDashboard } from './components/dashboards/WarehouseDashboard';
import { InventoryDashboard } from './components/dashboards/InventoryDashboard';
import { BuyingSellingDashboard } from './components/dashboards/BuyingSellingDashboard';
import { AccountsDashboard } from './components/dashboards/AccountsDashboard';
import { InventoryWorkspace } from './components/dashboards/InventoryWorkspace';
import { SystemWorkspace } from './components/dashboards/SystemWorkspace';
import './index.css';

function LegacyAccountsDashboard() {
  const { chartOfAccounts, journalEntries } = useERP();
  return <section className="space-y-5">
    <div><h1 className="text-2xl font-bold text-slate-900">Accounts & finance</h1><p className="mt-1 text-sm text-slate-500">Chart of accounts, journal entries and balances.</p></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-semibold">Chart of accounts</h2><div className="space-y-3">{chartOfAccounts.map(account => <div key={account.code} className="flex justify-between border-b border-slate-100 pb-3 text-sm"><span><b className="mr-2 text-slate-400">{account.code}</b>{account.name}</span><strong>{account.balance}</strong></div>)}</div></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-semibold">Recent journal entries</h2><div className="space-y-3">{journalEntries.map(entry => <div key={entry.id} className="border-b border-slate-100 pb-3 text-sm"><div className="flex justify-between"><strong>{entry.id}</strong><span>{entry.date}</span></div><p className="mt-1 text-slate-500">{entry.description || `${entry.debitAccount} â†’ ${entry.creditAccount}`}</p></div>)}</div></article>
    </div>
  </section>;
}

function AdminHome() {
  const { activeRole, systemView, setSystemView } = useERP();
  const roles = { admin: 'Admin Master', warehouse: 'Warehouse Team', inventory: 'Inventory Specialist', 'buying-selling': 'Buying & Selling Lead', accounts: 'Accounts Controller' };
  const roleName = roles[activeRole] || 'Admin Master';
  const visitKey = `proto1-erp:last-visit:${activeRole}`;
  const today = new Date().toLocaleDateString('en-CA');
  const [greeting] = useState(() => {
    const returningToday = localStorage.getItem(visitKey) === today;
    if (returningToday) return `Welcome back, ${roleName}`;
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeGreeting}, ${roleName}`;
  });
  useEffect(() => { localStorage.setItem(visitKey, today); }, [visitKey, today]);
  const reportsSelected = systemView === 'Executive Reports';
  return <div className="space-y-5">
    <section className="welcome-enter border-b border-slate-200 pb-4 pt-1">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">{greeting}</h1>
      <p className="mt-1 text-sm text-slate-500">Your daily overview across operations, inventory, and finance.</p>
    </section>
    <div role="tablist" aria-label="Home views" className="flex border-b border-slate-200">
      <button role="tab" aria-selected={!reportsSelected} onClick={() => setSystemView('')} className={`relative px-5 py-3 text-sm font-semibold transition-colors ${!reportsSelected ? 'text-slate-900 after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-orange-600' : 'text-slate-500 hover:text-slate-800'}`}>Overview</button>
      <button role="tab" aria-selected={reportsSelected} onClick={() => setSystemView('Executive Reports')} className={`relative px-5 py-3 text-sm font-semibold transition-colors ${reportsSelected ? 'text-slate-900 after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-orange-600' : 'text-slate-500 hover:text-slate-800'}`}>Reports</button>
    </div>
    {reportsSelected ? <SystemWorkspace /> : <AdminDashboard />}
  </div>;
}
function App() {
  const { activeTab, activeRole, systemView } = useERP();
  const screens = { admin: <AdminHome />, warehouse: <WarehouseDashboard />, inventory: <InventoryWorkspace />, 'buying-selling': <BuyingSellingDashboard />, accounts: <AccountsDashboard /> };
  return <div className="min-h-screen bg-slate-50 lg:flex"><Sidebar /><div className="min-w-0 flex-1"><Header /><main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{activeTab === 'admin' ? screens.admin : (systemView ? <SystemWorkspace /> : (screens[activeTab] || screens.admin))}<p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-400">Proto1 ERP Â· {activeRole === 'admin' ? 'All departments connected' : 'Module data is shared across departments'}</p></main></div></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><ERPProvider><App /></ERPProvider></React.StrictMode>);



