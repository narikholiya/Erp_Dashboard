import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, ShieldCheck, Settings, FileSpreadsheet } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const panel = 'rounded-xl border border-slate-200 bg-white p-5';

export const SystemWorkspace = () => {
  const { systemView, setSystemView, setActiveTab, activeRole, setActiveRole, inventoryItems, purchaseOrders, salesOrders, warehouses } = useERP();
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('proto1-erp:system-settings')) || { company: 'Proto1 ERP', currency: 'INR (₹)', dateFormat: 'DD/MM/YYYY' }; }
    catch { return { company: 'Proto1 ERP', currency: 'INR (₹)', dateFormat: 'DD/MM/YYYY' }; }
  });
  const [saved, setSaved] = useState(false);
  useEffect(() => { localStorage.setItem('proto1-erp:system-settings', JSON.stringify(settings)); }, [settings]);

  const totalQty = inventoryItems.reduce((sum, item) => sum + Number(item.inStock || 0), 0);
  const valuation = inventoryItems.reduce((sum, item) => sum + Number(item.inStock || 0) * Number(item.unitPrice || 0), 0);
  const exportSummary = () => {
    const rows = [
      ['Metric', 'Value'], ['Products', inventoryItems.length], ['Warehouses', warehouses.length],
      ['Stock units', totalQty], ['Inventory value', valuation.toFixed(2)],
      ['Purchase orders', purchaseOrders.length], ['Sales orders', salesOrders.length]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'proto1-executive-report.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-5">
    <header className="flex items-start justify-between gap-3"><div><button onClick={() => setSystemView('')} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={14}/> Back to overview</button><h1 className="text-2xl font-bold text-slate-900">{systemView}</h1><p className="mt-1 text-sm text-slate-500">Workspace controls for this browser-based ERP.</p></div></header>

    {systemView === 'Executive Reports' && <section className={panel}><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Current operations summary</h2><p className="mt-1 text-xs text-slate-500">Calculated from the records currently stored in this browser.</p></div><button onClick={exportSummary} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"><Download size={14}/> Export CSV</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Products', inventoryItems.length], ['Warehouses', warehouses.length], ['Stock units', totalQty.toLocaleString()], ['Inventory value', `${settings.currency.startsWith('INR') ? '₹' : '$'}${valuation.toLocaleString(undefined, { maximumFractionDigits: 2 })}`], ['Purchase orders', purchaseOrders.length], ['Sales orders', salesOrders.length]].map(([label, value]) => <article key={label} className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-900">{value}</p></article>)}</div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => { setActiveTab('inventory'); setSystemView(''); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Open inventory reports</button><button onClick={() => { setActiveTab('accounts'); setSystemView(''); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Open accounts reports</button></div></section>}

    {systemView === 'Role Permissions' && <section className={panel}><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-orange-600"/><h2 className="font-semibold">Role preview</h2></div><p className="mt-1 text-xs text-slate-500">Select a role to preview its module workspace. This frontend role switch is for navigation only; it does not enforce server-side permissions.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{[['admin','Admin Master','All departments'],['warehouse','Warehouse Team','Warehouse workflows'],['inventory','Inventory Specialist','Stock operations'],['buying-selling','Buying & Selling Lead','Orders and POS'],['accounts','Accounts Controller','Finance workspace']].map(([id,name,description]) => <button key={id} onClick={() => { setActiveRole(id); setSystemView(''); }} className={`rounded-lg border p-4 text-left transition ${activeRole === id ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:bg-slate-50'}`}><strong className="block text-sm text-slate-800">{name}</strong><span className="mt-1 block text-xs text-slate-500">{description}</span></button>)}</div></section>}

    {systemView === 'System Settings' && <section className={`${panel} max-w-2xl`}><div className="flex items-center gap-2"><Settings size={18} className="text-orange-600"/><h2 className="font-semibold">Workspace preferences</h2></div><form onSubmit={(event) => { event.preventDefault(); setSaved(true); window.setTimeout(() => setSaved(false), 2200); }} className="mt-4 space-y-4"><label className="block text-xs font-semibold text-slate-700">Company name<input value={settings.company} onChange={(event) => setSettings({ ...settings, company: event.target.value })} className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" required/></label><label className="block text-xs font-semibold text-slate-700">Display currency<select value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value })} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></label><label className="block text-xs font-semibold text-slate-700">Date format<select value={settings.dateFormat} onChange={(event) => setSettings({ ...settings, dateFormat: event.target.value })} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></label><button className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white">{saved ? 'Preferences saved' : 'Save preferences'}</button><span className="ml-3 text-xs text-slate-500">Saved in this browser automatically.</span></form></section>}
  </div>;
};
