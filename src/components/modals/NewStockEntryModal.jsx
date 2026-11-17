import React, { useState } from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const NewStockEntryModal = () => {
  const { activeModal, setActiveModal, inventoryItems, warehouses, addStockEntry } = useERP();

  const [entryType, setEntryType] = useState('Inbound'); // 'Inbound', 'Outbound', 'Transfer'
  const [selectedItem, setSelectedItem] = useState(inventoryItems[0]?.id || '');
  const [targetWarehouse, setTargetWarehouse] = useState(warehouses[0]?.name || '');
  const [quantity, setQuantity] = useState(50);
  const [batchNo, setBatchNo] = useState(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('Standard restocking operation');

  if (activeModal !== 'new-stock-entry') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addStockEntry({
      itemId: selectedItem,
      type: entryType,
      qty: Number(quantity),
      warehouse: targetWarehouse,
      batchNo,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-600 flex items-center justify-center border border-orange-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">New Stock Entry Voucher</h3>
              <p className="text-xs text-slate-500">Material Receipt, Issue or Internal Transfer</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {['Inbound', 'Outbound', 'Transfer'].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setEntryType(type)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  entryType === type
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Item SKU</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name} (Current Stock: {item.inStock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Warehouse</label>
              <select
                value={targetWarehouse}
                onChange={(e) => setTargetWarehouse(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.name}>
                    {wh.name} ({wh.region})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Lot Number</label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/30 flex items-center gap-1.5 transition-colors"
            >
              <span>Submit Stock Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
