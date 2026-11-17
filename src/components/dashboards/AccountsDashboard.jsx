import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, Banknote, BookOpen, BriefcaseBusiness, Building2,
  CalendarDays, Check, ChevronDown, CircleDollarSign, Download, FileText,
  Landmark, ListTree, Plus, ReceiptText, Search, Settings2, ShieldCheck,
  WalletCards, X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const STORE_KEY = 'proto1-accounts-workspace-v1';
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
const today = () => new Date().toISOString().slice(0, 10);
const id = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
const blankForm = { invoiceId: '', amount: '', direction: 'Receipt', method: 'Bank transfer', date: today(), reference: '' };
const defaultAccounts = [
  { code: '1000', name: 'Assets', type: 'Asset', balance: 3840200, children: [
    { code: '1100', name: 'Current assets', type: 'Asset', balance: 2845900, children: [
      { code: '1110', name: 'Bank accounts', type: 'Asset', balance: 1240000 },
      { code: '1120', name: 'Accounts receivable', type: 'Asset', balance: 612400 },
      { code: '1130', name: 'Inventory', type: 'Asset', balance: 993500 }
    ] }, { code: '1200', name: 'Fixed assets', type: 'Asset', balance: 994300 }
  ] },
  { code: '2000', name: 'Liabilities', type: 'Liability', balance: 1420000, children: [
    { code: '2100', name: 'Accounts payable', type: 'Liability', balance: 840000 },
    { code: '2200', name: 'Duties & taxes payable', type: 'Liability', balance: 180000 },
    { code: '2300', name: 'Term loans', type: 'Liability', balance: 400000 }
  ] },
  { code: '3000', name: 'Income', type: 'Income', balance: 4120500, children: [
    { code: '3100', name: 'Domestic sales revenue', type: 'Income', balance: 3420500 },
    { code: '3200', name: 'Export sales revenue', type: 'Income', balance: 700000 }
  ] },
  { code: '4000', name: 'Expenses', type: 'Expense', balance: 2750000, children: [
    { code: '4100', name: 'Cost of goods sold', type: 'Expense', balance: 2100000 },
    { code: '4200', name: 'Warehouse & freight', type: 'Expense', balance: 380000 },
    { code: '4300', name: 'Administrative expenses', type: 'Expense', balance: 270000 }
  ] }
];

const readSaved = (initial) => {
  try { return { ...initial, ...(JSON.parse(localStorage.getItem(STORE_KEY)) || {}) }; }
  catch { return initial; }
};

function Field({ label, children }) { return <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

function Table({ columns, rows, empty = 'No records found.' }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? rows : <tr><td colSpan={columns.length} className="p-8 text-center text-sm text-slate-400">{empty}</td></tr>}</tbody></table></div>;
}

export const AccountsDashboard = () => {
  const { chartOfAccounts: contextAccounts, journalEntries: contextJournals, salesOrders, purchaseOrders } = useERP();
  const [view, setView] = useState('Overview');
  const [transactionView, setTransactionView] = useState('Sales Invoice');
  const [reportView, setReportView] = useState('General Ledger');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState(blankForm);
  const [journalForm, setJournalForm] = useState({ date: today(), reference: '', debitAccount: '1110', creditAccount: '3100', amount: '', memo: '' });
  const [bankForm, setBankForm] = useState({ date: today(), account: 'HDFC Current Account', type: 'Deposit', amount: '', reference: '', memo: '' });
  const [taxForm, setTaxForm] = useState({ gst: 18, tds: 2, taxPeriod: 'Monthly' });
  const [budgetForm, setBudgetForm] = useState({ name: 'Warehouse & freight', amount: 500000, period: 'Monthly' });
  const [setupForm, setSetupForm] = useState({ company: 'Proto1 ERP', currency: 'INR (₹)', financialYear: 'April – March', taxId: '' });
  const [saved, setSaved] = useState(() => readSaved({ payments: [], journals: [], bankTransactions: [], budgets: [{ name: 'Warehouse & freight', amount: 500000, actual: 380000 }, { name: 'Administrative expenses', amount: 350000, actual: 270000 }, { name: 'Inventory purchases', amount: 1200000, actual: 840000 }] }));
  const accounts = contextAccounts?.length ? contextAccounts : defaultAccounts;
  const journals = [...saved.journals, ...contextJournals].sort((a, b) => b.date.localeCompare(a.date));

  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); }, [saved]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer); }, [toast]);

  const sales = useMemo(() => salesOrders.map((order) => ({ id: order.id, date: order.date, name: order.customer, amount: Number(order.totalAmount || 0), status: order.invoiceStatus || 'Pending', type: 'Sales Invoice' })), [salesOrders]);
  const purchases = useMemo(() => purchaseOrders.map((order) => ({ id: order.id, date: order.date, name: order.supplier, amount: Number(order.totalAmount || 0), status: order.paymentStatus || 'Unpaid', type: 'Purchase Invoice' })), [purchaseOrders]);
  const paymentsByInvoice = (invoiceId) => saved.payments.filter((payment) => payment.invoiceId === invoiceId).reduce((sum, payment) => sum + Number(payment.amount), 0);
  const receivables = sales.reduce((sum, invoice) => sum + Math.max(0, invoice.amount - paymentsByInvoice(invoice.id)), 0);
  const payables = purchases.reduce((sum, invoice) => sum + Math.max(0, invoice.amount - paymentsByInvoice(invoice.id)), 0);
  const revenue = sales.reduce((sum, invoice) => sum + invoice.amount, 0);
  const expenses = purchases.reduce((sum, invoice) => sum + invoice.amount, 0);
  const bankBalance = 1240000 + saved.bankTransactions.reduce((sum, transaction) => sum + (transaction.type === 'Deposit' ? transaction.amount : -transaction.amount), 0);

  const notify = (message) => setToast(message);
  const persist = (change) => setSaved((state) => ({ ...state, ...change }));
  const nav = [
    ['Overview', Landmark], ['Chart of Accounts', ListTree], ['Transactions', ReceiptText],
    ['Reports', FileText], ['Banking', WalletCards], ['Taxes', ShieldCheck], ['Budgeting', BriefcaseBusiness], ['Setup', Settings2]
  ];
  const subViews = ['Sales Invoice', 'Purchase Invoice', 'Payment Entry', 'Journal Entry'];
  const reports = ['General Ledger', 'Trial Balance', 'Profit & Loss', 'Balance Sheet', 'Cash Flow', 'Consolidated Report', 'Profitability Analysis', 'Accounts Receivable', 'Accounts Payable'];

  const savePayment = (event) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    const invoice = [...sales, ...purchases].find((item) => item.id === paymentForm.invoiceId);
    if (!invoice || !Number.isFinite(amount) || amount <= 0) return notify('Select an invoice and enter a valid amount.');
    const outstanding = invoice.amount - paymentsByInvoice(invoice.id);
    if (amount > outstanding) return notify(`Payment exceeds the outstanding amount of ${money(outstanding)}.`);
    const payment = { ...paymentForm, id: `PAY-${Date.now()}`, amount, invoiceName: invoice.name, direction: invoice.type === 'Sales Invoice' ? 'Receipt' : 'Payment' };
    persist({ payments: [payment, ...saved.payments] });
    setShowPayment(false); setPaymentForm(blankForm); notify('Payment entry recorded.');
  };

  const saveJournal = (event) => {
    event.preventDefault();
    const amount = Number(journalForm.amount);
    if (!amount || amount <= 0 || journalForm.debitAccount === journalForm.creditAccount) return notify('Enter a positive amount and choose different debit and credit accounts.');
    const entry = { id: `JV-${Date.now()}`, date: journalForm.date, debitAccount: journalForm.debitAccount, creditAccount: journalForm.creditAccount, amount, remarks: journalForm.memo || 'Manual journal entry', reference: journalForm.reference, approvedBy: 'Draft' };
    persist({ journals: [entry, ...saved.journals] }); setJournalForm({ ...journalForm, reference: '', amount: '', memo: '' }); notify('Balanced journal entry saved.');
  };

  const saveBankTransaction = (event) => {
    event.preventDefault();
    const amount = Number(bankForm.amount);
    if (!amount || amount <= 0) return notify('Enter a valid transaction amount.');
    const transaction = { ...bankForm, id: `BNK-${Date.now()}`, amount };
    persist({ bankTransactions: [transaction, ...saved.bankTransactions] }); setBankForm({ ...bankForm, amount: '', reference: '', memo: '' }); notify('Bank transaction recorded.');
  };

  const addBudget = (event) => {
    event.preventDefault();
    const amount = Number(budgetForm.amount);
    if (!budgetForm.name.trim() || amount <= 0) return notify('Enter a budget name and positive amount.');
    persist({ budgets: [{ ...budgetForm, amount, actual: 0 }, ...saved.budgets] }); notify('Budget line added.');
  };

  const exportCsv = (filename, rows) => {
    if (!rows.length) return notify('No rows available to export.');
    const columns = Object.keys(rows[0]);
    const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => `"${String(row[column] ?? '').replaceAll('"','""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); notify('CSV report downloaded.');
  };

  const invoiceRows = (items) => items.filter((item) => `${item.id} ${item.name} ${item.status}`.toLowerCase().includes(search.toLowerCase())).map((item) => {
    const paid = paymentsByInvoice(item.id); const due = Math.max(0, item.amount - paid);
    return <tr key={item.id}><td className="px-4 py-3 font-mono font-semibold text-slate-700">{item.id}</td><td className="px-4 py-3">{item.date}</td><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3 text-right">{money(item.amount)}</td><td className="px-4 py-3 text-right text-emerald-700">{money(paid)}</td><td className="px-4 py-3 text-right font-semibold">{money(due)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${due ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{due ? 'Due' : 'Paid'}</span></td></tr>;
  });

  const reportRows = reportView === 'Accounts Receivable' ? sales.map((item) => ({ Invoice: item.id, Customer: item.name, Date: item.date, Amount: item.amount, Paid: paymentsByInvoice(item.id), Outstanding: Math.max(0, item.amount - paymentsByInvoice(item.id)) }))
    : reportView === 'Accounts Payable' ? purchases.map((item) => ({ Invoice: item.id, Supplier: item.name, Date: item.date, Amount: item.amount, Paid: paymentsByInvoice(item.id), Outstanding: Math.max(0, item.amount - paymentsByInvoice(item.id)) }))
    : journals.map((item) => ({ Date: item.date, Reference: item.reference || item.id, Debit: item.debitAccount, Credit: item.creditAccount, Amount: item.amount }));

  return <section className="space-y-5">
    {toast && <div role="status" className="fixed right-5 top-20 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><Landmark className="h-5 w-5 text-orange-600"/><h1 className="text-2xl font-bold tracking-tight text-slate-900">Accounts</h1><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Finance workspace</span></div><p className="mt-1 text-sm text-slate-500">Invoices, payments, ledgers and financial reporting in one place.</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={15}/><span>FY 2026–27</span><button onClick={() => exportCsv('accounts-ledger.csv', reportRows)} className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"><Download size={14}/> Export</button></div></header>

    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5" aria-label="Accounts sections">{nav.map(([label, Icon]) => <button key={label} onClick={() => setView(label)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${view === label ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon size={15}/>{label}</button>)}</nav>

    {view === 'Overview' && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
        ['Accounts receivable', money(receivables), `${sales.length} sales invoices`, 'text-blue-700'],
        ['Accounts payable', money(payables), `${purchases.length} purchase invoices`, 'text-violet-700'],
        ['Revenue', money(revenue), 'From current sales orders', 'text-emerald-700'],
        ['Bank balance', money(bankBalance), `${saved.bankTransactions.length} new entries`, 'text-slate-900']
      ].map(([label, value, note, color]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></article>)}</div>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]"><section className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-bold">Recent invoices</h2><p className="mt-1 text-xs text-slate-400">Latest sales and purchase activity</p></div><button onClick={() => { setView('Transactions'); setTransactionView('Sales Invoice'); }} className="text-xs font-semibold text-orange-700">Open invoices →</button></div><Table columns={['Invoice','Customer / Supplier','Date','Amount','Type']} rows={[...sales.slice(0,3).map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono">{item.id}</td><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3">{item.date}</td><td className="px-4 py-3">{money(item.amount)}</td><td className="px-4 py-3">Sales</td></tr>), ...purchases.slice(0,2).map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono">{item.id}</td><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3">{item.date}</td><td className="px-4 py-3">{money(item.amount)}</td><td className="px-4 py-3">Purchase</td></tr>)]}/></section>
      <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Quick actions</h2><p className="mt-1 text-xs text-slate-400">Common daily accounting tasks</p></div><CircleDollarSign className="h-5 w-5 text-orange-500"/></div><div className="mt-4 grid gap-2">{[['Record payment', 'Transactions', 'Payment Entry', ArrowDownLeft], ['Create journal entry','Transactions','Journal Entry',BookOpen], ['Review receivables','Reports','Accounts Receivable',ArrowUpRight], ['Open chart of accounts','Chart of Accounts','',ListTree]].map(([label, viewName, sub, Icon]) => <button key={label} onClick={() => { setView(viewName); if (sub) setTransactionView(sub); }} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3 text-left text-xs font-semibold text-slate-700 hover:border-orange-200 hover:bg-orange-50/40"><span className="flex items-center gap-2"><Icon size={15} className="text-slate-400"/>{label}</span><ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-300"/></button>)}</div></section></div>
      <section className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-bold">Recent journal entries</h2><p className="mt-1 text-xs text-slate-400">Balanced debit and credit activity</p></div><button onClick={() => { setView('Transactions'); setTransactionView('Journal Entry'); }} className="text-xs font-semibold text-orange-700">Open journal →</button></div><Table columns={['Reference','Date','Debit account','Credit account','Amount','Memo']} rows={journals.slice(0,5).map((entry) => <tr key={entry.id}><td className="px-4 py-3 font-mono">{entry.id}</td><td className="px-4 py-3">{entry.date}</td><td className="px-4 py-3">{entry.debitAccount}</td><td className="px-4 py-3">{entry.creditAccount}</td><td className="px-4 py-3 font-semibold">{money(entry.amount)}</td><td className="px-4 py-3 text-slate-500">{entry.remarks || entry.memo}</td></tr>)}/></section>
    </>}

    {view === 'Chart of Accounts' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="text-sm font-bold">Chart of accounts</h2><p className="mt-1 text-xs text-slate-500">Account code, account group and current balance</p></div><button onClick={() => notify('New account setup is available from Setup.')} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white"><Plus size={14} className="mr-1 inline"/> Add account</button></div><div className="divide-y divide-slate-100">{accounts.map((account) => <AccountNode key={account.code} account={account}/>)}</div></section>}

    {view === 'Transactions' && <div className="space-y-4"><div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">{subViews.map((item) => <button key={item} onClick={() => setTransactionView(item)} className={`shrink-0 rounded-md px-3 py-2 text-xs font-semibold ${transactionView === item ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{item}</button>)}</div>
      {['Sales Invoice','Purchase Invoice'].includes(transactionView) && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4"><div><h2 className="text-sm font-bold">{transactionView} register</h2><p className="mt-1 text-xs text-slate-500">Sourced from the shared {transactionView === 'Sales Invoice' ? 'sales orders' : 'purchase orders'} list</p></div><div className="flex gap-2"><label className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoices" className="rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-xs"/></label><button onClick={() => { setPaymentForm({ ...blankForm, direction: transactionView === 'Sales Invoice' ? 'Receipt' : 'Payment' }); setShowPayment(true); }} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white"><Plus size={14} className="mr-1 inline"/>Payment entry</button></div></div><Table columns={['Invoice','Date','Customer / supplier','Total','Paid','Outstanding','Status']} rows={invoiceRows(transactionView === 'Sales Invoice' ? sales : purchases)}/></section>}
      {transactionView === 'Payment Entry' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="text-sm font-bold">Payment entries</h2><p className="mt-1 text-xs text-slate-500">Customer receipts and supplier payments</p></div><button onClick={() => { setPaymentForm(blankForm); setShowPayment(true); }} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white"><Plus size={14} className="mr-1 inline"/>Record payment</button></div><Table columns={['Reference','Date','Invoice','Customer / supplier','Direction','Method','Amount']} rows={saved.payments.map((payment) => <tr key={payment.id}><td className="px-4 py-3 font-mono">{payment.id}</td><td className="px-4 py-3">{payment.date}</td><td className="px-4 py-3">{payment.invoiceId}</td><td className="px-4 py-3">{payment.invoiceName}</td><td className="px-4 py-3">{payment.direction}</td><td className="px-4 py-3">{payment.method}</td><td className="px-4 py-3 font-semibold">{money(payment.amount)}</td></tr>)}/></section>}
      {transactionView === 'Journal Entry' && <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]"><section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold">New journal entry</h2><p className="mt-1 text-xs text-slate-500">Each entry must balance debit and credit.</p><form onSubmit={saveJournal} className="mt-4 space-y-3"><Field label="Entry date"><input type="date" required value={journalForm.date} onChange={(event) => setJournalForm({ ...journalForm, date: event.target.value })} className={input}/></Field><Field label="Reference"><input value={journalForm.reference} onChange={(event) => setJournalForm({ ...journalForm, reference: event.target.value })} placeholder="JV reference" className={input}/></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Debit account"><select value={journalForm.debitAccount} onChange={(event) => setJournalForm({ ...journalForm, debitAccount: event.target.value })} className={input}><AccountOptions accounts={accounts}/></select></Field><Field label="Credit account"><select value={journalForm.creditAccount} onChange={(event) => setJournalForm({ ...journalForm, creditAccount: event.target.value })} className={input}><AccountOptions accounts={accounts}/></select></Field></div><Field label="Amount"><input required min="0.01" step="0.01" type="number" value={journalForm.amount} onChange={(event) => setJournalForm({ ...journalForm, amount: event.target.value })} className={input}/></Field><Field label="Memo"><input value={journalForm.memo} onChange={(event) => setJournalForm({ ...journalForm, memo: event.target.value })} className={input}/></Field><button className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white">Save balanced entry</button></form></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h2 className="text-sm font-bold">Journal register</h2></div><Table columns={['Date','Ref','Debit','Credit','Amount']} rows={journals.map((entry) => <tr key={entry.id}><td className="px-4 py-3">{entry.date}</td><td className="px-4 py-3 font-mono">{entry.id}</td><td className="px-4 py-3">{entry.debitAccount}</td><td className="px-4 py-3">{entry.creditAccount}</td><td className="px-4 py-3 font-semibold">{money(entry.amount)}</td></tr>)}/></section></div>}
    </div>}

    {view === 'Reports' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h2 className="text-sm font-bold">Financial reports</h2><p className="mt-1 text-xs text-slate-500">Choose a report to review balances and activity</p></div><select value={reportView} onChange={(event) => setReportView(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">{reports.map((report) => <option key={report}>{report}</option>)}</select><button onClick={() => exportCsv(`${reportView.toLowerCase().replaceAll(' ','-')}.csv`, reportRows)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"><Download size={14} className="mr-1 inline"/>Download CSV</button></div><ReportContent report={reportView} accounts={accounts} revenue={revenue} expenses={expenses} receivables={receivables} payables={payables} bankBalance={bankBalance} rows={reportRows}/></section>}

    {view === 'Banking' && <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]"><section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Bank accounts</h2><p className="mt-1 text-xs text-slate-500">Operating accounts</p></div><Building2 className="h-5 w-5 text-blue-500"/></div><div className="mt-4 rounded-xl bg-slate-900 p-4 text-white"><p className="text-xs text-slate-300">HDFC Current Account · •••• 4208</p><p className="mt-2 text-2xl font-bold">{money(bankBalance)}</p><p className="mt-1 text-[10px] text-slate-300">Available balance · INR</p></div><form onSubmit={saveBankTransaction} className="mt-5 space-y-3"><h3 className="text-xs font-bold">Record bank transaction</h3><div className="grid grid-cols-2 gap-3"><Field label="Date"><input type="date" value={bankForm.date} onChange={(event) => setBankForm({ ...bankForm, date: event.target.value })} className={input}/></Field><Field label="Type"><select value={bankForm.type} onChange={(event) => setBankForm({ ...bankForm, type: event.target.value })} className={input}><option>Deposit</option><option>Withdrawal</option></select></Field></div><Field label="Amount"><input required type="number" min="0.01" step="0.01" value={bankForm.amount} onChange={(event) => setBankForm({ ...bankForm, amount: event.target.value })} className={input}/></Field><Field label="Reference / note"><input value={bankForm.reference} onChange={(event) => setBankForm({ ...bankForm, reference: event.target.value })} className={input}/></Field><button className="w-full rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white">Save transaction</button></form></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h2 className="text-sm font-bold">Bank transaction register</h2></div><Table columns={['Date','Account','Type','Reference','Amount']} rows={saved.bankTransactions.map((transaction) => <tr key={transaction.id}><td className="px-4 py-3">{transaction.date}</td><td className="px-4 py-3">{transaction.account}</td><td className="px-4 py-3">{transaction.type}</td><td className="px-4 py-3">{transaction.reference || transaction.memo}</td><td className="px-4 py-3 font-semibold">{money(transaction.amount)}</td></tr>)}/></section></div>}

    {view === 'Taxes' && <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold">Tax setup</h2><p className="mt-1 text-xs text-slate-500">Set default tax rates and return cycle.</p><form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); persist({ taxSettings: taxForm }); notify('Tax settings saved.'); }}><Field label="GST rate (%)"><input type="number" min="0" max="100" step="0.1" value={taxForm.gst} onChange={(event) => setTaxForm({ ...taxForm, gst: event.target.value })} className={input}/></Field><Field label="TDS default (%)"><input type="number" min="0" max="100" step="0.1" value={taxForm.tds} onChange={(event) => setTaxForm({ ...taxForm, tds: event.target.value })} className={input}/></Field><Field label="Filing period"><select value={taxForm.taxPeriod} onChange={(event) => setTaxForm({ ...taxForm, taxPeriod: event.target.value })} className={input}><option>Monthly</option><option>Quarterly</option></select></Field><button className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white">Save tax settings</button></form></article><article className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold">Tax summary</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Output tax estimate</p><strong className="mt-2 block text-xl">{money(revenue * Number(taxForm.gst || 0) / 100)}</strong><small className="text-[10px] text-slate-400">Based on recorded sales × {taxForm.gst}%</small></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Input purchases</p><strong className="mt-2 block text-xl">{money(expenses)}</strong><small className="text-[10px] text-slate-400">Current purchase order total</small></div></div><p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">Tax figures are planning estimates from this browser's ERP data.</p></article></section>}

    {view === 'Budgeting' && <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]"><section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold">Add budget line</h2><form onSubmit={addBudget} className="mt-4 space-y-3"><Field label="Category"><input value={budgetForm.name} onChange={(event) => setBudgetForm({ ...budgetForm, name: event.target.value })} className={input}/></Field><Field label="Budget amount"><input type="number" min="1" value={budgetForm.amount} onChange={(event) => setBudgetForm({ ...budgetForm, amount: event.target.value })} className={input}/></Field><Field label="Period"><select value={budgetForm.period} onChange={(event) => setBudgetForm({ ...budgetForm, period: event.target.value })} className={input}><option>Monthly</option><option>Quarterly</option><option>Annual</option></select></Field><button className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white">Add budget</button></form></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h2 className="text-sm font-bold">Budget vs actual</h2></div><div className="divide-y divide-slate-100">{saved.budgets.map((budget, index) => { const variance = Number(budget.amount) - Number(budget.actual); const percent = budget.amount ? Math.min(100, budget.actual / budget.amount * 100) : 0; return <div key={`${budget.name}-${index}`} className="p-4"><div className="flex items-center justify-between"><div><b className="text-xs">{budget.name}</b><p className="mt-1 text-[10px] text-slate-400">{budget.period || 'Monthly'}</p></div><span className="text-xs font-semibold">{money(budget.actual)} / {money(budget.amount)}</span></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${percent >= 100 ? 'bg-rose-500' : 'bg-orange-500'}`} style={{ width: `${percent}%` }}/></div><p className="mt-2 text-[10px] text-slate-500">{variance >= 0 ? `${money(variance)} remaining` : `${money(Math.abs(variance))} over budget`}</p></div>; })}</div></section></div>}

    {view === 'Setup' && <section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-orange-600"/><h2 className="text-sm font-bold">Accounts setup</h2></div><p className="mt-1 text-xs text-slate-500">Company and accounting preferences for this local workspace.</p><form onSubmit={(event) => { event.preventDefault(); persist({ companySettings: setupForm }); notify('Accounting setup saved.'); }} className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Company name"><input value={setupForm.company} onChange={(event) => setSetupForm({ ...setupForm, company: event.target.value })} className={input}/></Field><Field label="Reporting currency"><select value={setupForm.currency} onChange={(event) => setSetupForm({ ...setupForm, currency: event.target.value })} className={input}><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></Field><Field label="Financial year"><select value={setupForm.financialYear} onChange={(event) => setSetupForm({ ...setupForm, financialYear: event.target.value })} className={input}><option>April – March</option><option>January – December</option></select></Field><Field label="GST / Tax ID"><input value={setupForm.taxId} onChange={(event) => setSetupForm({ ...setupForm, taxId: event.target.value })} className={input}/></Field><button className="w-fit rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white sm:col-span-2">Save preferences</button></form></section>}

    {showPayment && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && setShowPayment(false)}><section className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="text-sm font-bold">New payment entry</h2><p className="mt-1 text-xs text-slate-500">Receipt from customer or payment to supplier</p></div><button onClick={() => setShowPayment(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17}/></button></div><form onSubmit={savePayment} className="space-y-3 p-5"><Field label="Invoice"><select required value={paymentForm.invoiceId} onChange={(event) => setPaymentForm({ ...paymentForm, invoiceId: event.target.value })} className={input}><option value="">Select invoice</option>{[...sales,...purchases].map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.id} · {invoice.name} · {money(invoice.amount - paymentsByInvoice(invoice.id))} due</option>)}</select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Payment date"><input required type="date" value={paymentForm.date} onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })} className={input}/></Field><Field label="Amount"><input required type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} className={input}/></Field></div><Field label="Payment method"><select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className={input}>{['Bank transfer','UPI','Cash','Card','Cheque'].map((method) => <option key={method}>{method}</option>)}</select></Field><Field label="Reference"><input value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} className={input}/></Field><button className="w-full rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white">Save payment</button></form></section></div>}
  </section>;
};

function AccountNode({ account, level = 0 }) {
  const [open, setOpen] = useState(level < 1);
  const children = account.children || [];
  return <><button onClick={() => children.length && setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50" style={{ paddingLeft: `${16 + level * 24}px` }}><span className="flex items-center gap-2"><ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? '' : '-rotate-90'}`}/><code className="text-[10px] font-semibold text-slate-400">{account.code}</code><span className="text-xs font-semibold text-slate-700">{account.name}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{account.type || 'Account'}</span></span><strong className="text-xs text-slate-800">{typeof account.balance === 'number' ? money(account.balance) : account.balance}</strong></button>{open && children.map((child) => <AccountNode key={child.code} account={child} level={level + 1}/>)}</>;
}

function AccountOptions({ accounts }) {
  const flat = [];
  const walk = (list) => list.forEach((account) => { flat.push(account); if (account.children) walk(account.children); });
  walk(accounts);
  return flat.map((account) => <option key={account.code} value={account.code}>{account.code} · {account.name}</option>);
}

function ReportContent({ report, accounts, revenue, expenses, receivables, payables, bankBalance, rows }) {
  if (report === 'Trial Balance') return <Table columns={['Account code','Account','Type','Debit balance','Credit balance']} rows={accounts.map((account) => <tr key={account.code}><td className="px-4 py-3 font-mono">{account.code}</td><td className="px-4 py-3 font-medium">{account.name}</td><td className="px-4 py-3">{account.type || 'Group'}</td><td className="px-4 py-3 text-right">{['Asset','Expense'].includes(account.type) ? money(account.balance) : '—'}</td><td className="px-4 py-3 text-right">{['Liability','Income'].includes(account.type) ? money(account.balance) : '—'}</td></tr>)}/>;
  if (report === 'Profit & Loss') return <ReportSummary rows={[["Revenue", money(revenue)], ["Purchases / direct costs", money(expenses)], ["Gross result", money(revenue - expenses)]]}/>;
  if (report === 'Balance Sheet') return <ReportSummary rows={[["Current assets", money(2845900)], ["Fixed assets", money(994300)], ["Total liabilities", money(1420000)], ["Net assets", money(3840200 - 1420000)]]}/>;
  if (report === 'Cash Flow') return <ReportSummary rows={[["Opening cash balance", money(1240000)], ["Bank deposits", money(bankBalance - 1240000 > 0 ? bankBalance - 1240000 : 0)], ["Bank withdrawals", money(bankBalance - 1240000 < 0 ? 1240000 - bankBalance : 0)], ["Closing cash balance", money(bankBalance)]]}/>;
  if (report === 'Consolidated Report') return <ReportSummary rows={[["Sales revenue", money(revenue)], ["Purchase commitments", money(expenses)], ["Receivables", money(receivables)], ["Payables", money(payables)], ["Cash at bank", money(bankBalance)]]}/>;
  if (report === 'Profitability Analysis') return <ReportSummary rows={[["Sales value", money(revenue)], ["Purchase value", money(expenses)], ["Gross margin", `${revenue ? ((revenue - expenses) / revenue * 100).toFixed(1) : '0.0'}%`], ["Gross profit", money(revenue - expenses)]]}/>;
  return <Table columns={report === 'Accounts Receivable' ? ['Invoice','Customer','Date','Amount','Paid','Outstanding'] : report === 'Accounts Payable' ? ['Invoice','Supplier','Date','Amount','Paid','Outstanding'] : ['Date','Reference','Debit','Credit','Amount']} rows={rows.map((row, index) => <tr key={`${row.Invoice || row.Reference}-${index}`}>{Object.values(row).map((value, cell) => <td key={cell} className="px-4 py-3">{typeof value === 'number' && cell > 2 ? money(value) : value}</td>)}</tr>)}/>;
}

function ReportSummary({ rows }) { return <div className="grid gap-3 p-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-900">{value}</p></div>)}</div>; }
