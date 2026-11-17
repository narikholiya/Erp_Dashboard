import React, { useState } from 'react';
import { X, CreditCard, Banknote, QrCode, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const POSModal = () => {
  const { activeModal, setActiveModal, inventoryItems, addPOSSale } = useERP();

  const [cart, setCart] = useState([
    { item: inventoryItems[0], qty: 1 },
    { item: inventoryItems[1], qty: 2 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('Card');

  if (activeModal !== 'pos-checkout') return null;

  const addToCart = (item) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.unitPrice * curr.qty), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    addPOSSale({
      itemsCount: cart.reduce((acc, curr) => acc + curr.qty, 0),
      subtotal,
      tax,
      total,
      paymentMethod
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">POS Terminal Checkout (Fast Billing)</h3>
              <p className="text-xs text-slate-500">Retail Counter • Register #04 • Cashier: Active User</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two column POS Interface */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left: Product catalog selector */}
          <div className="col-span-7 p-4 border-r border-slate-200 overflow-y-auto bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Add Products</h4>
            <div className="grid grid-cols-2 gap-3">
              {inventoryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs hover:border-brand-500 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-extrabold text-slate-900">${item.unitPrice}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Stock: {item.inStock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart and Total calculation */}
          <div className="col-span-5 p-4 flex flex-col justify-between bg-white">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Cart</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Cart is empty. Click items on the left to add.</p>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex-1 mr-2">
                        <p className="font-bold text-slate-800 truncate">{c.item.name}</p>
                        <p className="text-[11px] text-slate-500">${c.item.unitPrice} × {c.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">${(c.item.unitPrice * c.qty).toFixed(2)}</span>
                        <button
                          onClick={() => removeFromCart(c.item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8% GST/VAT)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                  <span>Total Due</span>
                  <span className="text-brand-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1.5">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Card', icon: CreditCard },
                    { id: 'Cash', icon: Banknote },
                    { id: 'UPI', icon: QrCode },
                  ].map((method) => {
                    const MIcon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === method.id
                            ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <MIcon className="w-4 h-4" />
                        <span>{method.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Print Invoice & Complete (${total.toFixed(2)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
