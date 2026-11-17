// ERP Initial Data Structure mirroring reference whiteboard, notebook, and UI mockups

export const INITIAL_WAREHOUSES = [
  { id: 'WH-01', name: 'Central Distribution Hub', region: 'North', capacity: '88%', manager: 'Rajesh Sharma', itemsCount: 4250, alerts: 3 },
  { id: 'WH-02', name: 'Metro Cold Storage & Grocery Depot', region: 'West', capacity: '72%', manager: 'Priya Verma', itemsCount: 3100, alerts: 5 },
  { id: 'WH-03', name: 'Raw Material Port Silo', region: 'South', capacity: '91%', manager: 'Karan Mehra', itemsCount: 2800, alerts: 2 },
  { id: 'WH-04', name: 'Eastern Fulfillment Center', region: 'East', capacity: '64%', manager: 'Ananya Sen', itemsCount: 2390, alerts: 1 },
];

export const INITIAL_GROCERY_ITEMS = [
  { id: 'GROC-101', name: 'Alphonso Mango Pulp (Bulk Drums)', batch: 'BAT-2026-88', arrivalDate: '2026-10-15', expiryDate: '2026-11-20', daysLeft: 4, shelfLife: '30 days', qty: 45, unit: 'Drums', warehouse: 'Metro Cold Storage', status: 'Expiring Soon' },
  { id: 'GROC-102', name: 'Organic Cold Pressed Mustard Oil', batch: 'BAT-2026-12', arrivalDate: '2026-09-01', expiryDate: '2026-11-28', daysLeft: 12, shelfLife: '90 days', qty: 120, unit: 'Cans (15L)', warehouse: 'Metro Cold Storage', status: 'Warning' },
  { id: 'GROC-103', name: 'Whole Wheat Flour (Grade A)', batch: 'BAT-2026-44', arrivalDate: '2026-10-01', expiryDate: '2026-12-15', daysLeft: 29, shelfLife: '75 days', qty: 350, unit: 'Bags (50kg)', warehouse: 'Central Distribution Hub', status: 'Good' },
  { id: 'GROC-104', name: 'Dairy Pasteurized Butter', batch: 'BAT-2026-09', arrivalDate: '2026-11-01', expiryDate: '2026-11-18', daysLeft: 2, shelfLife: '20 days', qty: 25, unit: 'Boxes', warehouse: 'Metro Cold Storage', status: 'Critical Stale' },
  { id: 'GROC-105', name: 'Refined Sunflower Seed Oil', batch: 'BAT-2026-55', arrivalDate: '2026-10-10', expiryDate: '2027-04-10', daysLeft: 145, shelfLife: '180 days', qty: 500, unit: 'Cartons', warehouse: 'Eastern Fulfillment Center', status: 'Good' }
];

export const INITIAL_SUSPICIOUS_ACTIVITIES = [
  { id: 'SA-901', time: 'Today 04:30 AM', warehouse: 'Metro Cold Storage', description: 'Stock mismatch: 12 Drums Alphonso Mango Pulp removed without system Pick List', reportedBy: 'Gate Guard RFID Scan', severity: 'High' },
  { id: 'SA-902', time: 'Yesterday 11:15 PM', warehouse: 'Central Distribution Hub', description: 'Manual stock reduction adjustment (-40 Bags Wheat) outside shift hours', reportedBy: 'Audit Bot', severity: 'Critical' },
  { id: 'SA-903', time: '14 Nov 2026', warehouse: 'Raw Material Port Silo', description: 'Sensor breach: Cold storage door left ajar for >45 mins (Humidity spike)', reportedBy: 'IoT Environmental Sensor', severity: 'Medium' }
];

export const INITIAL_BRIGHT_IDEAS_ALERTS = [
  { id: 'BIA-01', productName: 'Raw Cocoa Beans (Grade 1)', supplierName: 'AgroGlobal Exotics Ltd', region: 'South', currentQty: 18, minQty: 100, unit: 'Tons', alertLevel: 'Critical', suggestedAction: 'Auto-draft PO for 150 Tons' },
  { id: 'BIA-02', productName: 'Grade A Packaging Corrugated Boxes', supplierName: 'Apex Carton Works', region: 'North', currentQty: 320, minQty: 1500, unit: 'Units', alertLevel: 'High', suggestedAction: 'Request quotation from backup vendor' },
  { id: 'BIA-03', productName: 'Refined Sugar (Bulk Sacks)', supplierName: 'Deccan Sugars Coop', region: 'West', currentQty: 45, minQty: 200, unit: 'Bags', alertLevel: 'Critical', suggestedAction: 'Trigger emergency stock transfer from Eastern Hub' },
  { id: 'BIA-04', productName: 'Sodium Benzoate (Food Preservative)', supplierName: 'ChemFine Biotech', region: 'East', currentQty: 12, minQty: 50, unit: 'Kg', alertLevel: 'Medium', suggestedAction: 'Review monthly forecast before ordering' }
];

export const INITIAL_RAW_MATERIAL_IMPORTS = [
  { id: 'RM-IMP-2041', product: 'Unprocessed Organic Wheat', dayOfArrival: '2026-11-12', expiryDate: '2027-05-11', shelfLife: '180 days', quantity: '450 Metric Tons', batch: 'RM-WHT-09', origin: 'Australia', customsStatus: 'Cleared', inspectionStatus: 'Passed' },
  { id: 'RM-IMP-2042', product: 'Raw Cocoa Beans (Unroasted)', dayOfArrival: '2026-11-14', expiryDate: '2027-11-09', shelfLife: '360 days', quantity: '80 Metric Tons', batch: 'RM-COA-22', origin: 'Ghana', customsStatus: 'Under Quarantine Inspection', inspectionStatus: 'Pending' },
  { id: 'RM-IMP-2043', product: 'Fresh Dairy Farm Milk (Raw)', dayOfArrival: '2026-11-16', expiryDate: '2026-11-20', shelfLife: '4 days', quantity: '15,000 Liters', batch: 'RM-MLK-71', origin: 'Domestic Co-op', customsStatus: 'Direct Gate In', inspectionStatus: 'Passed' }
];

export const INITIAL_RAW_MATERIAL_EXPORTS = [
  { id: 'RM-EXP-801', shipmentDetails: 'Container #MSKU-98721 - Processed Soya Meal', dayOfExport: '2026-11-15', destination: 'Rotterdam, Netherlands', quantity: '220 Metric Tons', carrier: 'Maersk Line', status: 'Sailed' },
  { id: 'RM-EXP-802', shipmentDetails: 'Air Cargo #EK-772 - Premium Cardamom & Spices', dayOfExport: '2026-11-17', destination: 'Dubai, UAE', quantity: '12 Metric Tons', carrier: 'Emirates SkyCargo', status: 'Ready for Loading' }
];

export const INITIAL_INVENTORY_ITEMS = [
  { id: 'ITM-001', code: 'SKU-ELEC-5540', name: 'Dell Latitude 5540 Core i7 Laptop', category: 'Electronics', warehouse: 'Central Distribution Hub', inStock: 340, reserved: 25, available: 315, reorderPoint: 50, unitPrice: 1150, value: 391000, status: 'In Stock' },
  { id: 'ITM-002', code: 'SKU-OFF-8821', name: 'Ergonomic Executive Mesh Chair', category: 'Office Supplies', warehouse: 'Eastern Fulfillment Center', inStock: 120, reserved: 15, available: 105, reorderPoint: 40, unitPrice: 220, value: 26400, status: 'In Stock' },
  { id: 'ITM-003', code: 'SKU-RAW-WHT', name: 'Unprocessed Wheat Grain Grade A', category: 'Raw Material', warehouse: 'Raw Material Port Silo', inStock: 4500, reserved: 1200, available: 3300, reorderPoint: 1000, unitPrice: 0.35, value: 157500, status: 'In Stock' },
  { id: 'ITM-004', code: 'SKU-GROC-OIL', name: 'Cold Pressed Mustard Oil 15L', category: 'Grocery', warehouse: 'Metro Cold Storage', inStock: 120, reserved: 90, available: 30, reorderPoint: 100, unitPrice: 32, value: 3840, status: 'Low Stock' },
  { id: 'ITM-005', code: 'SKU-MACH-99', name: 'Automatic Bottling & Capping Unit', category: 'Machinery', warehouse: 'Central Distribution Hub', inStock: 6, reserved: 1, available: 5, reorderPoint: 2, unitPrice: 24500, value: 147000, status: 'In Stock' },
  { id: 'ITM-006', code: 'SKU-ACC-019', name: 'Industrial RFID Barcode Scanners', category: 'Accessories', warehouse: 'Eastern Fulfillment Center', inStock: 48, reserved: 30, available: 18, reorderPoint: 30, unitPrice: 180, value: 8640, status: 'Low Stock' }
];

export const INITIAL_SUPPLIERS = [
  { id: 'SUP-01', name: 'AgroGlobal Exotics Ltd', category: 'Raw Materials', region: 'South', rating: 4.8, openPOs: 2, totalSpend: '$420,000' },
  { id: 'SUP-02', name: 'Apex Carton & Packaging', category: 'Packaging', region: 'North', rating: 4.5, openPOs: 1, totalSpend: '$85,000' },
  { id: 'SUP-03', name: 'Dell Technologies Enterprise', category: 'Electronics', region: 'West', rating: 4.9, openPOs: 3, totalSpend: '$890,000' },
  { id: 'SUP-04', name: 'Deccan Sugars & Grains Co-op', category: 'Grocery & Agro', region: 'West', rating: 4.2, openPOs: 1, totalSpend: '$210,000' }
];

export const INITIAL_PURCHASE_ORDERS = [
  { id: 'PO-2026-081', supplier: 'Dell Technologies Enterprise', date: '2026-11-14', items: '50x Dell Latitude 5540', totalAmount: 57500, status: 'Approved', expectedDate: '2026-11-20', paymentStatus: 'Unpaid' },
  { id: 'PO-2026-082', supplier: 'AgroGlobal Exotics Ltd', date: '2026-11-15', items: '80 Tons Raw Cocoa Beans', totalAmount: 96000, status: 'In Transit', expectedDate: '2026-11-18', paymentStatus: 'Partial' },
  { id: 'PO-2026-083', supplier: 'Apex Carton & Packaging', date: '2026-11-16', items: '1500 Corrugated Boxes', totalAmount: 4500, status: 'Pending Approval', expectedDate: '2026-11-24', paymentStatus: 'Unpaid' }
];

export const INITIAL_CUSTOMERS = [
  { id: 'CUST-101', name: 'Starlight Tech Solutions Inc', contactPerson: 'Michael Chang', creditLimit: '$150,000', balanceDue: '$24,500', region: 'North' },
  { id: 'CUST-102', name: 'Zenith Logistics & Retail', contactPerson: 'Sara Khan', creditLimit: '$200,000', balanceDue: '$86,000', region: 'West' },
  { id: 'CUST-103', name: 'Prime Mart Supermarket Chain', contactPerson: 'Arun Patel', creditLimit: '$300,000', balanceDue: '$42,100', region: 'South' }
];

export const INITIAL_SALES_ORDERS = [
  { id: 'SO-9921', customer: 'Starlight Tech Solutions Inc', date: '2026-11-15', totalAmount: 34500, status: 'Dispatched', warehouse: 'Central Distribution Hub', invoiceStatus: 'Invoiced' },
  { id: 'SO-9922', customer: 'Prime Mart Supermarket Chain', date: '2026-11-16', totalAmount: 18200, status: 'Processing', warehouse: 'Metro Cold Storage', invoiceStatus: 'Pending' },
  { id: 'SO-9923', customer: 'Zenith Logistics & Retail', date: '2026-11-16', totalAmount: 52000, status: 'Confirmed', warehouse: 'Eastern Fulfillment Center', invoiceStatus: 'Draft' }
];

export const INITIAL_POS_INVOICES = [
  { id: 'POS-INV-10041', cashier: 'Alex Rivera', time: '18:45 Today', itemsCount: 4, subtotal: 340.00, tax: 27.20, total: 367.20, paymentMethod: 'Card' },
  { id: 'POS-INV-10042', cashier: 'Alex Rivera', time: '19:12 Today', itemsCount: 1, subtotal: 1150.00, tax: 92.00, total: 1242.00, paymentMethod: 'Cash' },
  { id: 'POS-INV-10043', cashier: 'Sara Vance', time: '20:05 Today', itemsCount: 7, subtotal: 620.00, tax: 49.60, total: 669.60, paymentMethod: 'UPI / Digital' }
];

export const INITIAL_CHART_OF_ACCOUNTS = [
  { code: '1000', name: 'Application of Funds (Assets)', type: 'Root', balance: '$3,840,200', children: [
    { code: '1100', name: 'Current Assets', balance: '$2,845,900', children: [
      { code: '1110', name: 'Bank Accounts (HDFC / Citi)', balance: '$1,240,000' },
      { code: '1120', name: 'Accounts Receivable', balance: '$612,400' },
      { code: '1130', name: 'Stock-in-Hand (Inventory)', balance: '$993,500' }
    ]},
    { code: '1200', name: 'Fixed Assets (Machinery & Buildings)', balance: '$994,300' }
  ]},
  { code: '2000', name: 'Source of Funds (Liabilities)', type: 'Root', balance: '$1,420,000', children: [
    { code: '2100', name: 'Current Liabilities (Accounts Payable)', balance: '$840,000' },
    { code: '2200', name: 'Duties & Taxes Payable (GST / VAT)', balance: '$180,000' },
    { code: '2300', name: 'Term Loans', balance: '$400,000' }
  ]},
  { code: '3000', name: 'Income (Revenue)', type: 'Root', balance: '$4,120,500', children: [
    { code: '3100', name: 'Domestic Sales Revenue', balance: '$3,420,500' },
    { code: '3200', name: 'Export Sales Revenue', balance: '$700,000' }
  ]},
  { code: '4000', name: 'Expenses', type: 'Root', balance: '$2,750,000', children: [
    { code: '4100', name: 'Cost of Goods Sold (COGS)', balance: '$2,100,000' },
    { code: '4200', name: 'Warehouse & Freight Logistics', balance: '$380,000' },
    { code: '4300', name: 'Administrative & Operating Expenses', balance: '$270,000' }
  ]}
];

export const INITIAL_JOURNAL_ENTRIES = [
  { id: 'JV-2026-401', date: '2026-11-16', debitAccount: '1110 - Bank Account', creditAccount: '1120 - Accounts Receivable', amount: 34500, remarks: 'Payment received from Starlight Tech Solutions', approvedBy: 'Finance Head' },
  { id: 'JV-2026-402', date: '2026-11-15', debitAccount: '2100 - Accounts Payable', creditAccount: '1110 - Bank Account', amount: 57500, remarks: 'PO-2026-081 settlement to Dell Technologies', approvedBy: 'Finance Head' },
  { id: 'JV-2026-403', date: '2026-11-14', debitAccount: '4200 - Warehouse Freight', creditAccount: '1110 - Bank Account', amount: 4800, remarks: 'Container port handling & logistics fees', approvedBy: 'Auditor' }
];

export const INITIAL_RECENT_ACTIVITIES = [
  { id: 1, title: 'Dell Latitude 5540 Laptop Added', user: 'John Smith', time: '5 minutes ago', tag: 'Inventory', type: 'item' },
  { id: 2, title: 'Stock Updated +120 Units (Mustard Oil)', user: 'Metro WH Cold Storage', time: '18 minutes ago', tag: 'Stock', type: 'stock' },
  { id: 3, title: 'PO-20458 approved for $57,500', user: 'Humayun (Sales Admin)', time: '42 minutes ago', tag: 'Purchase', type: 'po' },
  { id: 4, title: 'Warehouse Transfer: Warehouse A ➔ Warehouse C', user: 'Auto Dispatcher', time: '1 hour ago', tag: 'Transfer', type: 'transfer' },
  { id: 5, title: 'Raw Material Import: 450T Organic Wheat Inspected', user: 'Port Inspector', time: '2 hours ago', tag: 'Raw Material', type: 'inspection' }
];
