import React, { useState } from 'react';
import { Boxes, Warehouse, ShoppingCart, Landmark, Wheat, Sparkles, AlertTriangle, PackageCheck } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const departments = ['All', 'Warehouse', 'Inventory', 'Buying & Selling', 'Accounts'];
const warehouseViews = ['Overview', 'Grocery', 'Bright Idea', 'Raw Material'];
const panel = 'rounded-xl border border-slate-200 bg-white p-4';

export const AdminDashboard = () => {
  const {
    setActiveTab, setWarehouseSubTab, warehouses, inventoryItems, groceryItems,
    brightIdeaAlerts, rawMaterialImports, rawMaterialExports, purchaseOrders, salesOrders, posInvoices, recentActivities
  } = useERP();
  const [department, setDepartment] = useState('All');
  const [warehouseView, setWarehouseView] = useState('Overview');
  const [selectedGroceryProduct, setSelectedGroceryProduct] = useState(null);
  const groceryQty = groceryItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const expiringGrocery = groceryItems.filter((item) => Number(item.daysLeft) <= 15);
  const todayInvoices = posInvoices.filter((invoice) => String(invoice.time || '').toLowerCase().includes('today'));
  const todayRevenue = todayInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + Number(item.inStock || 0) * Number(item.unitPrice || 0), 0);
  const totalStockUnits = inventoryItems.reduce((sum, item) => sum + Number(item.inStock || 0), 0);
  const lowStockItems = inventoryItems.filter((item) => Number(item.available ?? item.inStock ?? 0) <= Number(item.reorderPoint || 0));
  const inventoryCategories = Object.entries(inventoryItems.reduce((groups, item) => {
    const key = item.category || 'Uncategorized';
    groups[key] = (groups[key] || 0) + Number(item.inStock || 0) * Number(item.unitPrice || 0);
    return groups;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const maxWarehouseStock = Math.max(1, ...warehouses.map((item) => Number(item.itemsCount || 0)));

  const openDepartment = (name) => {
    setDepartment(name);
    if (name === 'Warehouse') setWarehouseView('Overview');
    if (name === 'Inventory') setActiveTab('inventory');
    if (name === 'Buying & Selling') setActiveTab('buying-selling');
    if (name === 'Accounts') setActiveTab('accounts');
  };
  const chooseWarehouseView = (view) => {
    setWarehouseView(view);
    setSelectedGroceryProduct(null);
    const tabMap = { Grocery: 'grocery', 'Bright Idea': 'bright-ideas', 'Raw Material': 'raw-materials' };
    if (tabMap[view]) setWarehouseSubTab(tabMap[view]);
  };
  const selectGrocery = () => {
    setDepartment('Warehouse');
    chooseWarehouseView('Grocery');
  };
  const summaryCards = [
    { label: 'Grocery stock', value: `${groceryQty.toLocaleString()} units`, detail: `${groceryItems.length} tracked products`, icon: PackageCheck, action: selectGrocery },
    { label: "Today's POS revenue", value: `$${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: `${todayInvoices.length} sales today`, icon: ShoppingCart, action: selectGrocery },
    { label: 'Grocery products', value: groceryItems.length, detail: `${groceryQty.toLocaleString()} units in stock`, icon: PackageCheck, action: selectGrocery },
    { label: 'Expiry attention', value: expiringGrocery.length, detail: 'Products expiring within 15 days', icon: AlertTriangle, action: selectGrocery }
  ];
  const categoryData = warehouseView === 'Grocery' ? groceryItems : warehouseView === 'Bright Idea' ? brightIdeaAlerts : [...rawMaterialImports, ...rawMaterialExports];

  return <div className="space-y-5">
    <section className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Business at a glance</h2><p className="mt-1 text-sm text-slate-500">A live view of your grocery network, sales, stock, and items needing attention.</p></div><span className="text-xs text-slate-500">Current ERP records</span></section>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{summaryCards.map(({ label, value, detail, icon: Icon, action }) => <button key={label} onClick={action} className={`${panel} text-left transition-colors hover:border-orange-300 hover:bg-orange-50/40`}><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-600">{label}</span><Icon className="h-4 w-4 text-orange-700"/></div><p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></button>)}</div>

    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-slate-900">Department overview</h3><p className="mt-1 text-xs text-slate-500">Choose an area to explore its details.</p></div><div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Department overview">{departments.map((item) => <button key={item} role="tab" aria-selected={department === item} onClick={() => openDepartment(item)} className={`rounded-md px-3 py-2 text-xs font-semibold ${department === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{item}</button>)}</div></div>

      {department === 'Warehouse' ? <div className="mt-5">
        <div className="flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="Warehouse categories">{warehouseViews.map((view) => <button key={view} role="tab" aria-selected={warehouseView === view} onClick={() => chooseWarehouseView(view)} className={`border-b-2 px-3 py-2.5 text-xs font-semibold ${warehouseView === view ? 'border-orange-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{view}</button>)}</div>
        {warehouseView === 'Overview' ? <div className="mt-4 grid gap-3 md:grid-cols-3">{[
          { title: 'Grocery', count: `${groceryItems.length} products · ${groceryQty.toLocaleString()} units`, note: `${expiringGrocery.length} expiring soon`, icon: PackageCheck, view: 'Grocery' },
          { title: 'Bright Idea', count: `${brightIdeaAlerts.length} alerts`, note: `${brightIdeaAlerts.filter((alert) => alert.alertLevel === 'Critical').length} critical replenishments`, icon: Sparkles, view: 'Bright Idea' },
          { title: 'Raw Material', count: `${rawMaterialImports.length} incoming lots`, note: `${rawMaterialExports.length} outgoing shipments`, icon: Wheat, view: 'Raw Material' }
        ].map(({ title, count, note, icon: Icon, view }) => <button key={title} onClick={() => chooseWarehouseView(view)} className="rounded-lg border border-slate-200 p-4 text-left hover:border-orange-300 hover:bg-orange-50/40"><div className="flex items-center gap-2 text-slate-800"><Icon className="h-4 w-4 text-orange-700"/><span className="text-sm font-semibold">{title}</span></div><p className="mt-3 text-lg font-semibold text-slate-900">{count}</p><p className="mt-1 text-xs text-slate-500">{note}</p></button>)}</div> : <div className="mt-4 space-y-4">
          {warehouseView === 'Grocery' && <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className={panel}><p className="text-xs text-slate-500">Products tracked</p><p className="mt-1 text-xl font-semibold">{groceryItems.length}</p></div>
              <div className={panel}><p className="text-xs text-slate-500">Available stock</p><p className="mt-1 text-xl font-semibold">{groceryQty.toLocaleString()} units</p></div>
              <div className={panel}><p className="text-xs text-slate-500">Today's POS revenue</p><p className="mt-1 text-xl font-semibold">${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className="mt-1 text-[11px] text-slate-500">{todayInvoices.length} invoices · {todayInvoices.reduce((sum, invoice) => sum + Number(invoice.itemsCount || 0), 0)} items sold</p></div>
              <div className={panel}><p className="text-xs text-slate-500">Products nearing expiry</p><p className="mt-1 text-xl font-semibold text-amber-700">{expiringGrocery.length}</p></div>
            </div>            <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-semibold text-slate-900">Grocery products</h4><p className="mt-1 text-xs text-slate-500">Select a product to view its batch, shelf life, and expiry details.</p></div><span className="text-xs text-slate-500">Product stock and expiry tracking</span></div>
          </>}
          {warehouseView === 'Bright Idea' && <div className="grid gap-3 sm:grid-cols-3"><div className={panel}><p className="text-xs text-slate-500">Open alerts</p><p className="mt-1 text-xl font-semibold">{brightIdeaAlerts.length}</p></div><div className={panel}><p className="text-xs text-slate-500">Critical</p><p className="mt-1 text-xl font-semibold text-rose-700">{brightIdeaAlerts.filter((alert) => alert.alertLevel === 'Critical').length}</p></div><div className={panel}><p className="text-xs text-slate-500">Regions affected</p><p className="mt-1 text-xl font-semibold">{new Set(brightIdeaAlerts.map((alert) => alert.region)).size}</p></div></div>}
          {warehouseView === 'Raw Material' && <div className="grid gap-3 sm:grid-cols-3"><div className={panel}><p className="text-xs text-slate-500">Incoming lots</p><p className="mt-1 text-xl font-semibold">{rawMaterialImports.length}</p></div><div className={panel}><p className="text-xs text-slate-500">Outgoing shipments</p><p className="mt-1 text-xl font-semibold">{rawMaterialExports.length}</p></div><div className={panel}><p className="text-xs text-slate-500">Needs inspection</p><p className="mt-1 text-xl font-semibold text-amber-700">{rawMaterialImports.filter((item) => item.inspectionStatus !== 'Passed').length}</p></div></div>}
          {warehouseView !== 'Grocery' && <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500">{(warehouseView === 'Bright Idea' ? ['Product', 'Supplier', 'Region', 'Current / minimum', 'Priority'] : ['Material / shipment', 'Reference', 'Quantity', 'Date', 'Status']).map((heading) => <th key={heading} className="px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody>{categoryData.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="px-3 py-3 font-semibold text-slate-800">{item.productName || item.product || item.shipmentDetails}</td><td className="px-3 py-3 text-slate-600">{warehouseView === 'Bright Idea' ? item.supplierName : item.batch || item.origin || item.destination}</td><td className="px-3 py-3 text-slate-700">{warehouseView === 'Bright Idea' ? `${item.currentQty} / ${item.minQty} ${item.unit}` : item.quantity}</td><td className="px-3 py-3 text-slate-600">{warehouseView === 'Bright Idea' ? item.region : item.dayOfArrival || item.dayOfExport}</td><td className="px-3 py-3 text-slate-600">{item.alertLevel || item.inspectionStatus || item.customsStatus || item.status}</td></tr>)}</tbody></table></div>}
          {warehouseView === 'Grocery' && <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500">{['Product', 'Batch', 'Stock', 'Shelf life', 'Expiry date', 'Status'].map((heading) => <th key={heading} className="px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody>{groceryItems.map((item) => <tr key={item.id} onClick={() => setSelectedGroceryProduct(selectedGroceryProduct?.id === item.id ? null : item)} className={`cursor-pointer border-b border-slate-100 last:border-0 hover:bg-orange-50/50 ${selectedGroceryProduct?.id === item.id ? 'bg-orange-50/60' : ''}`}><td className="px-3 py-3 font-semibold text-slate-800">{item.name}</td><td className="px-3 py-3 text-slate-600">{item.batch}</td><td className="px-3 py-3 text-slate-700">{item.qty} {item.unit}</td><td className="px-3 py-3 text-slate-600">{item.shelfLife}</td><td className="px-3 py-3 text-slate-600">{item.expiryDate} · {item.daysLeft} days</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.daysLeft <= 5 ? 'bg-rose-50 text-rose-700' : item.daysLeft <= 15 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{item.status}</span></td></tr>)}</tbody></table></div>}
          {warehouseView === 'Grocery' && selectedGroceryProduct && <section className="rounded-lg border border-orange-200 bg-orange-50/40 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-slate-900">{selectedGroceryProduct.name}</h4><p className="mt-1 text-xs text-slate-500">Product and expiry detail</p></div><button onClick={() => setSelectedGroceryProduct(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Close</button></div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Batch', selectedGroceryProduct.batch], ['Available stock', `${selectedGroceryProduct.qty} ${selectedGroceryProduct.unit}`], ['Shelf life', selectedGroceryProduct.shelfLife], ['Expiry date', selectedGroceryProduct.expiryDate], ['Days remaining', `${selectedGroceryProduct.daysLeft} days`], ['Supply warehouse', selectedGroceryProduct.warehouse], ['Arrival date', selectedGroceryProduct.arrivalDate], ['Status', selectedGroceryProduct.status]].map(([label, value]) => <div key={label} className="rounded-md bg-white px-3 py-2"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold text-slate-800">{value}</p></div>)}</div></section>}
        </div>}
      </div> : department === 'All' ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
        { title: 'Grocery stock', detail: `${groceryItems.length} tracked products · ${groceryQty.toLocaleString()} units in stock`, icon: Warehouse, target: 'Warehouse' },
        { title: 'Inventory', detail: `${inventoryItems.length} SKUs · ${inventoryItems.filter((item) => Number(item.available ?? item.inStock ?? 0) <= Number(item.reorderPoint || 0)).length} need attention`, icon: Boxes, target: 'Inventory' },
        { title: 'Buying & Selling', detail: `${purchaseOrders.length} purchase orders · ${salesOrders.length} sales orders`, icon: ShoppingCart, target: 'Buying & Selling' },
        { title: 'Accounts', detail: 'Finance and ledger workspace', icon: Landmark, target: 'Accounts' }
      ].map(({ title, detail, icon: Icon, target }) => <button key={title} onClick={() => target === 'Warehouse' ? selectGrocery() : openDepartment(target)} className="rounded-lg border border-slate-200 p-4 text-left hover:border-orange-300 hover:bg-orange-50/40"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon className="h-4 w-4 text-orange-700"/>{title}</div><p className="mt-2 text-xs leading-relaxed text-slate-500">{detail}</p></button>)}</div> : <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4"><p className="text-sm font-semibold text-slate-800">{department} snapshot</p><p className="mt-1 text-xs text-slate-500">Select this section to open its detailed workspace.</p><button onClick={() => setActiveTab(department === 'Inventory' ? 'inventory' : department === 'Accounts' ? 'accounts' : 'buying-selling')} className="mt-3 text-xs font-semibold text-orange-800">Open {department} workspace →</button></div>}
    </section>

    <section className="space-y-4 border-t border-slate-200 pt-5">
      <div><h2 className="text-base font-semibold text-slate-900">Operations details</h2><p className="mt-1 text-xs text-slate-500">The full organization-wide overview from your previous dashboard.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total products', inventoryItems.length.toLocaleString(), 'Tracked inventory items'],
          ['Warehouses', warehouses.length.toLocaleString(), 'Active locations'],
          ['Inventory value', `$${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Based on current stock'],
          ['Low stock & alerts', lowStockItems.length + brightIdeaAlerts.length + expiringGrocery.length, 'Items requiring attention']
        ].map(([label, value, note]) => <article key={label} className={panel}><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></article>)}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={panel}><div className="mb-4"><h3 className="text-sm font-semibold text-slate-900">Warehouse performance</h3><p className="mt-1 text-xs text-slate-500">Recorded stock volume by warehouse</p></div><div className="space-y-4">{warehouses.map((item) => <div key={item.id}><div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="font-medium text-slate-700">{item.name}</span><span className="shrink-0 text-slate-500">{Number(item.itemsCount || 0).toLocaleString()} items</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(3, Number(item.itemsCount || 0) / maxWarehouseStock * 100)}%` }}/></div></div>)}</div><button onClick={() => setActiveTab('warehouse')} className="mt-4 text-xs font-semibold text-orange-800">Open warehouse details →</button></section>

        <section className={panel}><div className="mb-4"><h3 className="text-sm font-semibold text-slate-900">Inventory by category</h3><p className="mt-1 text-xs text-slate-500">Current stock value by product category</p></div><div className="space-y-3">{inventoryCategories.map((item) => <div key={item.name}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-700">{item.name}</span><span className="font-medium text-slate-600">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{ width: `${totalInventoryValue ? Math.max(2, item.value / totalInventoryValue * 100) : 0}%` }}/></div></div>)}{!inventoryCategories.length && <p className="text-xs text-slate-400">No inventory categories available.</p>}</div></section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={panel}><div className="mb-4"><h3 className="text-sm font-semibold text-slate-900">Stock health</h3><p className="mt-1 text-xs text-slate-500">Availability and replenishment at a glance</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Total stock units</p><p className="mt-1 text-lg font-semibold text-slate-900">{totalStockUnits.toLocaleString()}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Available grocery stock</p><p className="mt-1 text-lg font-semibold text-slate-900">{groceryQty.toLocaleString()}</p></div><div className="rounded-lg bg-amber-50 p-3"><p className="text-xs text-amber-800">Low stock products</p><p className="mt-1 text-lg font-semibold text-amber-900">{lowStockItems.length}</p></div><div className="rounded-lg bg-rose-50 p-3"><p className="text-xs text-rose-700">Bright Idea alerts</p><p className="mt-1 text-lg font-semibold text-rose-800">{brightIdeaAlerts.length}</p></div></div><button onClick={() => setActiveTab('inventory')} className="mt-4 text-xs font-semibold text-orange-800">Open stock ledger →</button></section>

        <section className={panel}><div className="mb-3"><h3 className="text-sm font-semibold text-slate-900">Recent operational activity</h3><p className="mt-1 text-xs text-slate-500">Latest updates across departments</p></div><div className="divide-y divide-slate-100">{recentActivities.slice(0, 5).map((activity) => <div key={activity.id} className="flex items-start justify-between gap-3 py-3"><div><p className="text-xs font-medium text-slate-800">{activity.title}</p><p className="mt-1 text-[11px] text-slate-500">{activity.user} · {activity.tag}</p></div><span className="shrink-0 text-[10px] text-slate-400">{activity.time}</span></div>)}{!recentActivities.length && <p className="py-5 text-xs text-slate-400">No recent activity recorded.</p>}</div></section>
      </div>
    </section>  </div>;
};



