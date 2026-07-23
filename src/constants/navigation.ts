import { NavItem } from '../types';

export const NAVIGATION_MENU: NavItem[] = [
  { title: 'Dashboard', href: 'dashboard', icon: 'TrendingUp' },
  {
    title: 'Executive BI & Analytics',
    href: 'bi',
    icon: 'TrendingUp',
    requiredRoles: ['Super Administrator', 'Administrator', 'Finance Manager', 'Sales Manager', 'Director'],
    children: [
      { title: 'Sales BI', href: 'bi/sales', icon: 'Layers' },
      { title: 'Inventory Analytics', href: 'bi/inventory', icon: 'Layers' },
      { title: 'Finance Analytics', href: 'bi/finance', icon: 'Layers' }
    ]
  },
  {
    title: 'Master Data',
    href: 'masters',
    icon: 'Users2',
    requiredRoles: ['Super Administrator', 'Administrator', 'Director'],
    children: [
      { title: 'Companies', href: 'masters/companies', icon: 'Layers' },
      { title: 'Branches', href: 'masters/branches', icon: 'Layers' },
      { title: 'Departments', href: 'masters/departments', icon: 'Layers' },
      { title: 'Designations', href: 'masters/designations', icon: 'Layers' },
      { title: 'Employees', href: 'masters/employees', icon: 'Layers' },
      { title: 'Customers', href: 'masters/customers', icon: 'Layers' },
      { title: 'Suppliers', href: 'masters/suppliers', icon: 'Layers' },
      { title: 'Product Categories', href: 'masters/categories', icon: 'Layers' },
      { title: 'Brands', href: 'masters/brands', icon: 'Layers' },
      { title: 'Products', href: 'masters/products', icon: 'Layers' },
      { title: 'Units', href: 'masters/units', icon: 'Layers' },
      { title: 'Warehouses', href: 'masters/warehouses', icon: 'Layers' }
    ]
  },
  { 
    title: 'Pricing & Promotions', 
    href: 'pricing', 
    icon: 'Tag',
    requiredRoles: ['Super Administrator', 'Administrator', 'Sales Manager', 'Director']
  },
  {
    title: 'Procurement',
    href: 'procurement',
    icon: 'ShoppingCart',
    requiredRoles: ['Super Administrator', 'Administrator', 'Procurement Manager', 'Finance Manager', 'Director'],
    children: [
      { title: 'Purchase Requisition', href: 'procurement/requisition', icon: 'Layers' },
      { title: 'RFQ', href: 'procurement/rfq', icon: 'Layers' },
      { title: 'Supplier Quotations', href: 'procurement/quotations', icon: 'Layers' },
      { title: 'Purchase Orders', href: 'procurement/orders', icon: 'Layers' },
      { title: 'Goods Receipt Notes', href: 'procurement/grn', icon: 'Layers' }
    ]
  },
  {
    title: 'Warehouse',
    href: 'warehouse',
    icon: 'Compass',
    requiredRoles: ['Super Administrator', 'Administrator', 'Warehouse Manager', 'Director'],
    children: [
      { title: 'Receiving', href: 'warehouse/receiving', icon: 'Layers' },
      { title: 'Put Away', href: 'warehouse/putaway', icon: 'Layers' },
      { title: 'Picking', href: 'warehouse/picking', icon: 'Layers' },
      { title: 'Packing', href: 'warehouse/packing', icon: 'Layers' },
      { title: 'Dispatch', href: 'warehouse/dispatch', icon: 'Layers' },
      { title: 'Stock Transfers', href: 'warehouse/transfers', icon: 'Layers' }
    ]
  },
  {
    title: 'Inventory',
    href: 'inventory',
    icon: 'Package',
    requiredRoles: ['Super Administrator', 'Administrator', 'Inventory Controller', 'Warehouse Manager', 'Director'],
    children: [
      { title: 'Stock', href: 'inventory/stock', icon: 'Layers' },
      { title: 'Batch & Expiry', href: 'inventory/expiry', icon: 'Layers' },
      { title: 'Stock Adjustments', href: 'inventory/adjustments', icon: 'Layers' },
      { title: 'Cycle Count', href: 'inventory/cycle-count', icon: 'Layers' }
    ]
  },
  {
    title: 'Sales Force Automation',
    href: 'sfa',
    icon: 'MapPin',
    requiredRoles: ['Super Administrator', 'Administrator', 'Sales Manager', 'Sales Representative', 'Director'],
    children: [
      { title: 'Beat Planning', href: 'sfa/beat-planning', icon: 'Layers' },
      { title: 'Customer Visits', href: 'sfa/visits', icon: 'Layers' },
      { title: 'Collections', href: 'sfa/collections', icon: 'Layers' }
    ]
  },
  {
    title: 'Sales',
    href: 'sales',
    icon: 'FileSpreadsheet',
    requiredRoles: ['Super Administrator', 'Administrator', 'Sales Manager', 'Finance Manager', 'Director'],
    children: [
      { title: 'Quotations', href: 'sales/quotations', icon: 'Layers' },
      { title: 'Sales Orders', href: 'sales/orders', icon: 'Layers' },
      { title: 'Delivery Notes', href: 'sales/delivery-notes', icon: 'Layers' },
      { title: 'Sales Invoices', href: 'sales/invoices', icon: 'Layers' }
    ]
  },
  { 
    title: 'Returns', 
    href: 'returns', 
    icon: 'Undo2',
    requiredRoles: ['Super Administrator', 'Administrator', 'Sales Manager', 'Accountant', 'Director']
  },
  {
    title: 'Finance',
    href: 'finance',
    icon: 'DollarSign',
    requiredRoles: ['Super Administrator', 'Administrator', 'Finance Manager', 'Accountant', 'Director'],
    children: [
      { title: 'Accounts Payable', href: 'finance/payable', icon: 'Layers' },
      { title: 'Accounts Receivable', href: 'finance/receivable', icon: 'Layers' },
      { title: 'General Ledger', href: 'finance/ledger', icon: 'Layers' }
    ]
  },
  {
    title: 'Human Resources (HRMS)',
    href: 'hrms',
    icon: 'Users2',
    requiredRoles: ['Super Administrator', 'Administrator', 'Director'],
    children: [
      { title: 'Employee Directory', href: 'hrms/employees', icon: 'Layers' },
      { title: 'Attendance', href: 'hrms/attendance', icon: 'Layers' },
      { title: 'Leave Requests', href: 'hrms/leaves', icon: 'Layers' }
    ]
  },
  {
    title: 'CRM & Customer Service',
    href: 'crm',
    icon: 'MessageSquare',
    requiredRoles: ['Super Administrator', 'Administrator', 'Sales Manager', 'Sales Representative', 'Director'],
    children: [
      { title: 'Customer 360', href: 'crm/customers', icon: 'Layers' },
      { title: 'Complaints', href: 'crm/complaints', icon: 'Layers' },
      { title: 'Service Tickets', href: 'crm/tickets', icon: 'Layers' }
    ]
  },
  {
    title: 'Logistics & Delivery',
    href: 'logistics',
    icon: 'Truck',
    requiredRoles: ['Super Administrator', 'Administrator', 'Warehouse Manager', 'Sales Manager', 'Director'],
    children: [
      { title: 'Fleet Vehicles', href: 'logistics/vehicles', icon: 'Layers' },
      { title: 'Routes & Stops', href: 'logistics/routes', icon: 'Layers' },
      { title: 'Proof of Delivery', href: 'logistics/pod', icon: 'Layers' }
    ]
  },
  { 
    title: 'Reports', 
    href: 'reports', 
    icon: 'BarChart3',
    requiredRoles: ['Super Administrator', 'Administrator', 'Finance Manager', 'Sales Manager', 'Director']
  },
  { 
    title: 'Administration & Security', 
    href: 'admin', 
    icon: 'Settings',
    requiredRoles: ['Super Administrator', 'Administrator'],
    children: [
      { title: 'Security Center (IAM)', href: 'admin/security-center', icon: 'Layers' },
      { title: 'Auth & Biometric Policies', href: 'admin/security-center/authentication', icon: 'Layers' },
      { title: 'Device Security Policies', href: 'admin/security-center/device-policy', icon: 'Layers' },
      { title: 'Password & Session Rules', href: 'admin/security-center/password-policy', icon: 'Layers' },
      { title: 'Role Security Profiles', href: 'admin/security-center/security-profiles', icon: 'Layers' },
      { title: 'Employee Overrides', href: 'admin/security-center/employee-overrides', icon: 'Layers' }
    ]
  }
];
