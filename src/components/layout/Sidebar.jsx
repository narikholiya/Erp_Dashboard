import React from 'react';
import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  ShoppingCart,
  Landmark
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab, setSystemView, setBuyingSellingSubTab, buyingSellingSubTab } = useERP();
  const goTo = (tab, subTab = '') => {
    setActiveTab(tab);
    setSystemView('');
    if (subTab) setBuyingSellingSubTab(subTab);
  };
  const items = [
    { id: 'admin', name: 'Home', icon: LayoutDashboard },
    { id: 'warehouse', name: 'Warehouse', icon: Warehouse },
    { id: 'inventory', name: 'Inventory', icon: Boxes },
    { id: 'buying', name: 'Buying', icon: ShoppingCart, tab: 'buying-selling', subTab: 'buying' },
    { id: 'selling', name: 'Selling', icon: ShoppingCart, tab: 'buying-selling', subTab: 'selling' },
    { id: 'accounts', name: 'Accounts', icon: Landmark }
  ];  const navClass = (selected) => `flex min-h-[68px] w-full flex-col items-center justify-center gap-2 rounded-xl px-1.5 py-3 text-center transition-colors ${selected ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-orange-50 hover:text-orange-800'}`;

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-24 shrink-0 flex-col items-center overflow-y-auto border-r border-slate-200 bg-white">
      <div className="flex w-full justify-center border-b border-slate-200 py-5">
        <div aria-label="PROTO1 ERP" title="PROTO1 ERP" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm shadow-orange-900/15">
          <Boxes className="h-5 w-5 stroke-[2.2]" />
        </div>
      </div>
      <nav aria-label="Main navigation" className="flex w-full flex-col items-center gap-2 px-2 py-4">
        {items.map(({ id, name, icon: Icon, tab, subTab }) => {
          const selected = id === 'buying' || id === 'selling'
            ? activeTab === 'buying-selling' && buyingSellingSubTab === subTab
            : activeTab === id;
          return (
            <button key={id} onClick={() => goTo(tab || id, subTab)} aria-current={selected ? 'page' : undefined} title={name} className={navClass(selected)}>
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-semibold leading-tight">{name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};




