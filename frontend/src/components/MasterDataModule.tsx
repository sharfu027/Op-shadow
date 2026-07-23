import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Download,
  Upload,
  Settings2,
  Check,
  CheckSquare,
  Square,
  X,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Save,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Loader2,
  User,
  Tags,
  Building,
  Users2,
  Boxes,
  Truck,
  MapPin,
  ClipboardList
} from 'lucide-react';

import { 
  Product, 
  Category, 
  Brand, 
  Unit, 
  Warehouse, 
  Customer, 
  Supplier, 
  SalesRep 
} from '../types';

interface MasterDataModuleProps {
  module: string; // 'masters/products' | 'masters/categories' | 'masters/brands' | etc.
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function MasterDataModule({ module, onTriggerToast }: MasterDataModuleProps) {
  // Get neat display name for the current active sub-module
  const getModuleConfig = () => {
    switch (module) {
      case 'companies':
      case 'masters/companies':
        return { name: 'Companies', singular: 'Company', icon: Building };
      case 'branches':
      case 'masters/branches':
        return { name: 'Branches', singular: 'Branch', icon: Building };
      case 'departments':
      case 'masters/departments':
        return { name: 'Departments', singular: 'Department', icon: Building };
      case 'designations':
      case 'masters/designations':
        return { name: 'Designations', singular: 'Designation', icon: User };
      case 'employees':
      case 'masters/employees':
        return { name: 'Employees', singular: 'Employee', icon: User };
      case 'products':
      case 'masters/products':
        return { name: 'Products', singular: 'Product', icon: User };
      case 'categories':
      case 'masters/categories':
        return { name: 'Categories', singular: 'Category', icon: Tags };
      case 'brands':
      case 'masters/brands':
        return { name: 'Brands', singular: 'Brand', icon: ClipboardList };
      case 'units':
      case 'masters/units':
        return { name: 'Units of Measure', singular: 'Unit', icon: Tags };
      case 'warehouses':
      case 'masters/warehouses':
        return { name: 'Warehouses', singular: 'Warehouse', icon: Building };
      case 'customers':
      case 'masters/customers':
        return { name: 'Customers', singular: 'Customer', icon: Users2 };
      case 'suppliers':
      case 'masters/suppliers':
        return { name: 'Suppliers', singular: 'Supplier', icon: Truck };
      case 'reps':
      case 'masters/reps':
        return { name: 'Sales Representatives', singular: 'Sales Representative', icon: User };
      default:
        return { name: 'Master Registry', singular: 'Record', icon: Building };
    }
  };

  const config = getModuleConfig();

  // Simulated Global Database States
  const [dbProducts, setDbProducts] = useState<Product[]>([
    { id: '1', code: 'PROD-001', name: 'Premium Basmati Rice 5kg', category: 'Food & Grains', brand: 'India Gate', unit: 'Bag', price: 650, taxRate: 5, stockLevel: 1420, status: 'Active' },
    { id: '2', code: 'PROD-002', name: 'Refined Sunflower Oil 1L', category: 'Edible Oils', brand: 'Fortune', unit: 'Bottle', price: 145, taxRate: 5, stockLevel: 2800, status: 'Active' },
    { id: '3', code: 'PROD-003', name: 'Organic Turmeric Powder 200g', category: 'Spices', brand: 'Tata Sampann', unit: 'Packet', price: 65, taxRate: 5, stockLevel: 820, status: 'Active' },
    { id: '4', code: 'PROD-004', name: 'Ultra-Soft Bath Tissue 4-Rolls', category: 'Hygiene & Paper', brand: 'Origami', unit: 'Pack', price: 180, taxRate: 18, stockLevel: 320, status: 'Active' },
    { id: '5', code: 'PROD-005', name: 'Instant Coffee Classic 100g', category: 'Beverages', brand: 'Nescafe', unit: 'Jar', price: 320, taxRate: 18, stockLevel: 0, status: 'Inactive' },
    { id: '6', code: 'PROD-006', name: 'Multigrain Bread 400g', category: 'Bakery', brand: 'Harvest Gold', unit: 'Packet', price: 45, taxRate: 0, stockLevel: 150, status: 'Active' },
    { id: '7', code: 'PROD-007', name: 'Anti-Dandruff Shampoo 400ml', category: 'Personal Care', brand: 'Head & Shoulders', unit: 'Bottle', price: 290, taxRate: 18, stockLevel: 120, status: 'Active' }
  ]);

  const [dbCategories, setDbCategories] = useState<Category[]>([
    { id: '1', code: 'CAT-001', name: 'Food & Grains', description: 'Essential raw rice, wheat flour, and pulses.', productCount: 42, status: 'Active' },
    { id: '2', code: 'CAT-002', name: 'Edible Oils', description: 'Cooking oils, ghee, and vegetable fats.', productCount: 18, status: 'Active' },
    { id: '3', code: 'CAT-003', name: 'Spices', description: 'Whole spices, blends, and culinary herbs.', productCount: 35, status: 'Active' },
    { id: '4', code: 'CAT-004', name: 'Hygiene & Paper', description: 'Tissues, toilet paper, and cleaning rolls.', productCount: 14, status: 'Active' },
    { id: '5', code: 'CAT-005', name: 'Beverages', description: 'Teas, coffee pouches, and fizzy soft drinks.', productCount: 22, status: 'Active' },
    { id: '6', code: 'CAT-006', name: 'Personal Care', description: 'Soaps, skin lotions, and dental kits.', productCount: 48, status: 'Active' }
  ]);

  const [dbBrands, setDbBrands] = useState<Brand[]>([
    { id: '1', code: 'BRND-001', name: 'India Gate', origin: 'India', productCount: 12, status: 'Active' },
    { id: '2', code: 'BRND-002', name: 'Fortune', origin: 'India', productCount: 24, status: 'Active' },
    { id: '3', code: 'BRND-003', name: 'Tata Sampann', origin: 'India', productCount: 31, status: 'Active' },
    { id: '4', code: 'BRND-004', name: 'Origami', origin: 'Japan', productCount: 8, status: 'Active' },
    { id: '5', code: 'BRND-005', name: 'Nescafe', origin: 'Switzerland', productCount: 15, status: 'Active' },
    { id: '6', code: 'BRND-006', name: 'Head & Shoulders', origin: 'United States', productCount: 19, status: 'Active' }
  ]);

  const [dbUnits, setDbUnits] = useState<Unit[]>([
    { id: '1', code: 'UOM-KG', name: 'Kilograms', baseUnit: 'Gram', conversionFactor: 1000, status: 'Active' },
    { id: '2', code: 'UOM-BAG', name: 'Bag (5kg)', baseUnit: 'Kilogram', conversionFactor: 5, status: 'Active' },
    { id: '3', code: 'UOM-BTL', name: 'Bottle (1L)', baseUnit: 'Milliliter', conversionFactor: 1000, status: 'Active' },
    { id: '4', code: 'UOM-PKT', name: 'Packet', baseUnit: 'Piece', conversionFactor: 1, status: 'Active' },
    { id: '5', code: 'UOM-JAR', name: 'Jar', baseUnit: 'Piece', conversionFactor: 1, status: 'Active' },
    { id: '6', code: 'UOM-BOX', name: 'Carton Box', baseUnit: 'Piece', conversionFactor: 24, status: 'Active' }
  ]);

  const [dbWarehouses, setDbWarehouses] = useState<Warehouse[]>([
    { id: '1', code: 'WH-DEL-HQ', name: 'Delhi Central Depot', address: 'Plot 45, Okhla Industrial Area Phase III, Delhi', capacitySft: 150000, manager: 'Aman Deep', status: 'Active' },
    { id: '2', code: 'WH-MUM-W1', name: 'Mumbai West Logistics', address: 'Bldg 3A, JNPT Port Road, Nhava Sheva, Mumbai', capacitySft: 220000, manager: 'Rohan Joshi', status: 'Active' },
    { id: '3', code: 'WH-BLR-S2', name: 'Bengaluru South Facility', address: 'Zone C, Electronic City Phase II, Bengaluru', capacitySft: 120000, manager: 'Karthik Raja', status: 'Active' },
    { id: '4', code: 'WH-KOL-E1', name: 'Kolkata East Terminal', address: 'Salt Lake Sec V, Sector Extension, Kolkata', capacitySft: 95000, manager: 'Sudipto Sen', status: 'Inactive' }
  ]);

  const [dbCustomers, setDbCustomers] = useState<Customer[]>([
    { id: '1', code: 'CUST-201', name: 'Apex Retail Distributors', contact: '+91 98110 24512', email: 'billing@apexretail.com', balance: 425000, region: 'North', status: 'Active' },
    { id: '2', code: 'CUST-202', name: 'Kishore Kirana Supermart', contact: '+91 99334 12544', email: 'kishore@kiranamart.in', balance: 18000, region: 'North', status: 'Active' },
    { id: '3', code: 'CUST-203', name: 'Reliance FMCG Supply Chain', contact: '+91 98224 88710', email: 'repl.fmcg@reliance.com', balance: 1850000, region: 'National', status: 'Active' },
    { id: '4', code: 'CUST-204', name: 'Metro Cash & Carry Hub', contact: '+91 93110 54599', email: 'account.payables@metro.co.in', balance: 0, region: 'South', status: 'Active' },
    { id: '5', code: 'CUST-205', name: 'Nilgiris Hypermarket BLR', contact: '+91 80224 11520', email: 'nilgiris@fmcgretail.com', balance: -45000, region: 'South', status: 'Inactive' }
  ]);

  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([
    { id: '1', code: 'SUPP-301', name: 'Hindustan Unilever Limited', contact: '+91 22441 55620', email: 'b2b.support@hul.com', balance: 3450000, category: 'National Brand Packaged', status: 'Active' },
    { id: '2', code: 'SUPP-302', name: 'Britannia Industries Ltd', contact: '+91 80252 44120', email: 'sales.hq@britannia.co.in', balance: 1250000, category: 'Bakery & Biscuits', status: 'Active' },
    { id: '3', code: 'SUPP-303', name: 'ITC FMCG Foods Division', contact: '+91 33245 88963', email: 'itcfoods@itc.in', balance: 2200000, category: 'Diversified Foods', status: 'Active' },
    { id: '4', code: 'SUPP-304', name: 'Parle Agro Distributors', contact: '+91 22661 10045', email: 'distribution@parleagro.com', balance: 0, category: 'Beverages', status: 'Inactive' }
  ]);

  const [dbReps, setDbReps] = useState<SalesRep[]>([
    { id: '1', code: 'REP-401', name: 'Amit Sharma', contact: '+91 98101 24510', email: 'amit.sharma@ink-fmcg.com', region: 'Delhi NCR', target: 2500000, status: 'Active' },
    { id: '2', code: 'REP-402', name: 'Priya Patel', contact: '+91 91124 55612', email: 'priya.patel@ink-fmcg.com', region: 'Mumbai Metro', target: 3000000, status: 'Active' },
    { id: '3', code: 'REP-403', name: 'Rahul Krishnan', contact: '+91 94440 22119', email: 'rahul.k@ink-fmcg.com', region: 'Bengaluru Core', target: 2200000, status: 'Active' },
    { id: '4', code: 'REP-404', name: 'Vikram Singh', contact: '+91 99220 11456', email: 'vikram.singh@ink-fmcg.com', region: 'Punjab Rural', target: 1800000, status: 'Inactive' }
  ]);

  // System Simulation Overrides
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'empty' | 'error' | 'denied'>('normal');

  // UI Navigation states
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Table Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'tight'>('comfortable');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Column Visibility state
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    code: true,
    name: true,
    detail1: true, // category / origin / manager / region
    detail2: true, // brand / baseUnit / balance / target
    status: true,
    actions: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Modal placeholders for Import/Export
  const [importModal, setImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [autosaveMsg, setAutosaveMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form Field States
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDetail1, setFormDetail1] = useState(''); // Category / Description / Origin / Base Unit / Manager / Contact / Contact
  const [formDetail2, setFormDetail2] = useState(''); // Brand / Base Unit / Address / Email / Email / Target
  const [formNumeric1, setFormNumeric1] = useState<number>(0); // Price / ConversionFactor / CapacitySFT / Balance / Target / ProductCount
  const [formNumeric2, setFormNumeric2] = useState<number>(5); // Tax Rate / Stock Level / etc.
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachment, setAttachment] = useState<string | null>(null);

  // Security & Login Policies state for individual user/personnel configuration
  const [secAccountStatus, setSecAccountStatus] = useState<'Active' | 'Disabled'>('Active');
  const [secLockAccount, setSecLockAccount] = useState<boolean>(false);
  const [secForcePasswordReset, setSecForcePasswordReset] = useState<boolean>(false);
  const [secAllowMultipleDevices, setSecAllowMultipleDevices] = useState<boolean>(true);
  const [secMaxSessions, setSecMaxSessions] = useState<number>(3);
  const [secResetFaceToken, setSecResetFaceToken] = useState<boolean>(false);
  const [secResetDeviceToken, setSecResetDeviceToken] = useState<boolean>(false);

  const [secRequireFace, setSecRequireFace] = useState<boolean>(true);
  const [secRequireGps, setSecRequireGps] = useState<boolean>(false);
  const [secRequire2Fa, setSecRequire2Fa] = useState<boolean>(false);
  const [secRequireDeviceReg, setSecRequireDeviceReg] = useState<boolean>(true);
  const [secAllowUnknownDevice, setSecAllowUnknownDevice] = useState<boolean>(false);
  const [secOfficeHoursOnly, setSecOfficeHoursOnly] = useState<boolean>(false);
  const [secApprovedIpsOnly, setSecApprovedIpsOnly] = useState<boolean>(false);
  const [secAllowOffline, setSecAllowOffline] = useState<boolean>(false);

  const [secAutoAttendance, setSecAutoAttendance] = useState<boolean>(true);
  const [secFaceAttendance, setSecFaceAttendance] = useState<boolean>(true);
  const [secGpsAttendance, setSecGpsAttendance] = useState<boolean>(false);
  const [secRemoteAttendance, setSecRemoteAttendance] = useState<boolean>(true);
  const [secGpsRadius, setSecGpsRadius] = useState<number>(200);
  const [secRequireSelfie, setSecRequireSelfie] = useState<boolean>(false);

  // Clean form states upon switching sub-modules or modes
  useEffect(() => {
    setMode('list');
    setSelectedId(null);
    setSearchQuery('');
    setSelectedIds([]);
    setFormErrors({});
    setAttachment(null);
    setAutosaveMsg('');
  }, [module]);

  // Load selected record into form upon entering Edit/View mode
  const populateForm = (id: string) => {
    setFormErrors({});
    setAttachment(null);
    setAutosaveMsg('');
    switch (module) {
      case 'masters/products': {
        const x = dbProducts.find(p => p.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.category); setFormDetail2(x.brand);
          setFormNumeric1(x.price); setFormNumeric2(x.taxRate); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/categories': {
        const x = dbCategories.find(c => c.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.description); setFormDetail2('');
          setFormNumeric1(x.productCount); setFormNumeric2(0); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/brands': {
        const x = dbBrands.find(b => b.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.origin); setFormDetail2('');
          setFormNumeric1(x.productCount); setFormNumeric2(0); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/units': {
        const x = dbUnits.find(u => u.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.baseUnit); setFormDetail2('');
          setFormNumeric1(x.conversionFactor); setFormNumeric2(0); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/warehouses': {
        const x = dbWarehouses.find(w => w.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.manager); setFormDetail2(x.address);
          setFormNumeric1(x.capacitySft); setFormNumeric2(0); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/customers': {
        const x = dbCustomers.find(c => c.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.contact); setFormDetail2(x.email);
          setFormNumeric1(x.balance); setFormNumeric2(0); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/suppliers': {
        const x = dbSuppliers.find(s => s.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.contact); setFormDetail2(x.email);
          setFormNumeric1(x.balance); setFormNumeric2(0); setFormStatus(x.status);
        }
        break;
      }
      case 'masters/reps': {
        const x = dbReps.find(r => r.id === id);
        if (x) {
          setFormCode(x.code); setFormName(x.name); setFormDetail1(x.contact); setFormDetail2(x.email);
          setFormNumeric1(x.target); setFormNumeric2(0); setFormStatus(x.status);
          
          // Setup custom granular security default policies for high-density simulation
          setSecAccountStatus(x.status === 'Active' ? 'Active' : 'Disabled');
          setSecLockAccount(x.status === 'Inactive');
          setSecForcePasswordReset(false);
          setSecAllowMultipleDevices(x.id === '1' || x.id === '3');
          setSecMaxSessions(x.id === '1' ? 4 : 2);
          setSecResetFaceToken(false);
          setSecResetDeviceToken(false);
          
          setSecRequireFace(x.id !== '3');
          setSecRequireGps(x.id === '1' || x.id === '2');
          setSecRequire2Fa(x.id === '2');
          setSecRequireDeviceReg(x.id !== '3');
          setSecAllowUnknownDevice(x.id === '1' || x.id === '3');
          setSecOfficeHoursOnly(x.id === '2' || x.id === '4');
          setSecApprovedIpsOnly(false);
          setSecAllowOffline(x.id === '1');
          
          setSecAutoAttendance(x.id === '1' || x.id === '2');
          setSecFaceAttendance(x.id !== '3');
          setSecGpsAttendance(x.id === '1' || x.id === '2');
          setSecRemoteAttendance(x.id === '3');
          setSecGpsRadius(x.id === '2' ? 100 : 250);
          setSecRequireSelfie(x.id === '2');
        }
        break;
      }
    }
  };

  const handleFormChangeSim = () => {
    // Simulated autosave & draft save UI
    setAutosaveMsg('Draft saving...');
    setTimeout(() => {
      setAutosaveMsg('All edits saved to local cache draft');
    }, 800);
  };

  // Form Validation and submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formCode.trim()) errors.code = 'Registry code is required.';
    if (!formName.trim()) errors.name = 'Descriptive name is required.';
    if (module === 'masters/customers' || module === 'masters/suppliers' || module === 'masters/reps') {
      if (formDetail2 && !formDetail2.includes('@')) {
        errors.detail2 = 'Provide a valid corporate email.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      onTriggerToast('error', 'Form Validation Error', 'Please correct the highlighted fields.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const isNew = mode === 'create';

      if (module === 'masters/products') {
        if (isNew) {
          const created: Product = {
            id: String(dbProducts.length + 1),
            code: formCode, name: formName, category: formDetail1 || 'Other', brand: formDetail2 || 'Generic',
            unit: 'Bag', price: formNumeric1, taxRate: formNumeric2, stockLevel: 0, status: formStatus
          };
          setDbProducts([...dbProducts, created]);
        } else {
          setDbProducts(dbProducts.map(p => p.id === selectedId ? {
            ...p, code: formCode, name: formName, category: formDetail1, brand: formDetail2, price: formNumeric1, taxRate: formNumeric2, status: formStatus
          } : p));
        }
      } else if (module === 'masters/categories') {
        if (isNew) {
          const created: Category = {
            id: String(dbCategories.length + 1),
            code: formCode, name: formName, description: formDetail1, productCount: 0, status: formStatus
          };
          setDbCategories([...dbCategories, created]);
        } else {
          setDbCategories(dbCategories.map(c => c.id === selectedId ? {
            ...c, code: formCode, name: formName, description: formDetail1, status: formStatus
          } : c));
        }
      } else if (module === 'masters/brands') {
        if (isNew) {
          const created: Brand = {
            id: String(dbBrands.length + 1),
            code: formCode, name: formName, origin: formDetail1, productCount: 0, status: formStatus
          };
          setDbBrands([...dbBrands, created]);
        } else {
          setDbBrands(dbBrands.map(b => b.id === selectedId ? {
            ...b, code: formCode, name: formName, origin: formDetail1, status: formStatus
          } : b));
        }
      } else if (module === 'masters/units') {
        if (isNew) {
          const created: Unit = {
            id: String(dbUnits.length + 1),
            code: formCode, name: formName, baseUnit: formDetail1, conversionFactor: formNumeric1, status: formStatus
          };
          setDbUnits([...dbUnits, created]);
        } else {
          setDbUnits(dbUnits.map(u => u.id === selectedId ? {
            ...u, code: formCode, name: formName, baseUnit: formDetail1, conversionFactor: formNumeric1, status: formStatus
          } : u));
        }
      } else if (module === 'masters/warehouses') {
        if (isNew) {
          const created: Warehouse = {
            id: String(dbWarehouses.length + 1),
            code: formCode, name: formName, address: formDetail2, capacitySft: formNumeric1, manager: formDetail1, status: formStatus
          };
          setDbWarehouses([...dbWarehouses, created]);
        } else {
          setDbWarehouses(dbWarehouses.map(w => w.id === selectedId ? {
            ...w, code: formCode, name: formName, manager: formDetail1, address: formDetail2, capacitySft: formNumeric1, status: formStatus
          } : w));
        }
      } else if (module === 'masters/customers') {
        if (isNew) {
          const created: Customer = {
            id: String(dbCustomers.length + 1),
            code: formCode, name: formName, contact: formDetail1, email: formDetail2, balance: formNumeric1, region: 'National', status: formStatus
          };
          setDbCustomers([...dbCustomers, created]);
        } else {
          setDbCustomers(dbCustomers.map(c => c.id === selectedId ? {
            ...c, code: formCode, name: formName, contact: formDetail1, email: formDetail2, balance: formNumeric1, status: formStatus
          } : c));
        }
      } else if (module === 'masters/suppliers') {
        if (isNew) {
          const created: Supplier = {
            id: String(dbSuppliers.length + 1),
            code: formCode, name: formName, contact: formDetail1, email: formDetail2, balance: formNumeric1, category: 'Packaged Goods', status: formStatus
          };
          setDbSuppliers([...dbSuppliers, created]);
        } else {
          setDbSuppliers(dbSuppliers.map(s => s.id === selectedId ? {
            ...s, code: formCode, name: formName, contact: formDetail1, email: formDetail2, balance: formNumeric1, status: formStatus
          } : s));
        }
      } else if (module === 'masters/reps') {
        if (isNew) {
          const created: SalesRep = {
            id: String(dbReps.length + 1),
            code: formCode, name: formName, contact: formDetail1, email: formDetail2, region: 'National', target: formNumeric1, status: formStatus
          };
          setDbReps([...dbReps, created]);
        } else {
          setDbReps(dbReps.map(r => r.id === selectedId ? {
            ...r, code: formCode, name: formName, contact: formDetail1, email: formDetail2, target: formNumeric1, status: formStatus
          } : r));
        }
      }

      setIsSaving(false);
      onTriggerToast('success', `${config.singular} Saved`, `${formName} has been stored successfully.`);
      setMode('list');
      setSelectedId(null);
    }, 600);
  };

  // Raw array getter based on active module
  const getActiveArray = () => {
    switch (module) {
      case 'masters/products': return dbProducts;
      case 'masters/categories': return dbCategories;
      case 'masters/brands': return dbBrands;
      case 'masters/units': return dbUnits;
      case 'masters/warehouses': return dbWarehouses;
      case 'masters/customers': return dbCustomers;
      case 'masters/suppliers': return dbSuppliers;
      case 'masters/reps': return dbReps;
      default: return [];
    }
  };

  const getModuleHeaders = () => {
    switch (module) {
      case 'masters/products':
        return { detail1: 'Category', detail2: 'Brand', numeric1: 'Price (INR)', numeric2: 'Tax Rate' };
      case 'masters/categories':
        return { detail1: 'Description', detail2: '', numeric1: 'Products', numeric2: '' };
      case 'masters/brands':
        return { detail1: 'Origin Country', detail2: '', numeric1: 'Products', numeric2: '' };
      case 'masters/units':
        return { detail1: 'Base Unit', detail2: '', numeric1: 'Factor', numeric2: '' };
      case 'masters/warehouses':
        return { detail1: 'Manager', detail2: 'Address', numeric1: 'Capacity (SFT)', numeric2: '' };
      case 'masters/customers':
        return { detail1: 'Contact', detail2: 'Email Address', numeric1: 'Outstanding Balance', numeric2: '' };
      case 'masters/suppliers':
        return { detail1: 'Contact', detail2: 'Corporate Email', numeric1: 'Outstanding Pay', numeric2: '' };
      case 'masters/reps':
        return { detail1: 'Contact Phone', detail2: 'Email Address', numeric1: 'Monthly Target (INR)', numeric2: '' };
      default:
        return { detail1: 'Attribute 1', detail2: 'Attribute 2', numeric1: 'Value', numeric2: '' };
    }
  };

  const headers = getModuleHeaders();

  // Normalize data for unified display table
  const getNormalizedRows = () => {
    const arr = getActiveArray();
    return arr.map((item: any) => {
      let detail1 = '';
      let detail2 = '';
      let numericText = '';

      if (module === 'masters/products') {
        detail1 = item.category;
        detail2 = item.brand;
        numericText = `₹${item.price} (Tax ${item.taxRate}%)`;
      } else if (module === 'masters/categories') {
        detail1 = item.description;
        detail2 = '-';
        numericText = `${item.productCount} SKUs`;
      } else if (module === 'masters/brands') {
        detail1 = item.origin;
        detail2 = '-';
        numericText = `${item.productCount} SKUs`;
      } else if (module === 'masters/units') {
        detail1 = item.baseUnit;
        detail2 = '-';
        numericText = `Factor: x${item.conversionFactor}`;
      } else if (module === 'masters/warehouses') {
        detail1 = item.manager;
        detail2 = item.address;
        numericText = `${item.capacitySft?.toLocaleString()} SFT`;
      } else if (module === 'masters/customers' || module === 'masters/suppliers') {
        detail1 = item.contact;
        detail2 = item.email;
        numericText = item.balance < 0 ? `Credit: ₹${Math.abs(item.balance).toLocaleString()}` : `Debit: ₹${item.balance.toLocaleString()}`;
      } else if (module === 'masters/reps') {
        detail1 = item.contact;
        detail2 = item.email;
        numericText = `Target: ₹${item.target?.toLocaleString()}`;
      }

      return {
        id: item.id,
        code: item.code,
        name: item.name,
        detail1,
        detail2,
        numericText,
        status: item.status
      };
    });
  };

  const rows = getNormalizedRows();

  // Search & Filters applied
  const filteredRows = rows.filter(r => {
    const matchesSearch =
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.detail1.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    let valA = a[sortBy as keyof typeof a] || '';
    let valB = b[sortBy as keyof typeof b] || '';

    if (typeof valA === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB as string)
        : (valB as string).localeCompare(valA);
    }
    return 0;
  });

  // Pagination bounds
  const totalRows = sortedRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedRows = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedIds.length === paginatedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRows.map(r => r.id));
    }
  };

  // Actions
  const handleSingleDelete = (id: string, name: string) => {
    setDeleteId(id);
  };

  const confirmSingleDelete = () => {
    if (!deleteId) return;
    if (module === 'masters/products') setDbProducts(dbProducts.filter(p => p.id !== deleteId));
    else if (module === 'masters/categories') setDbCategories(dbCategories.filter(c => c.id !== deleteId));
    else if (module === 'masters/brands') setDbBrands(dbBrands.filter(b => b.id !== deleteId));
    else if (module === 'masters/units') setDbUnits(dbUnits.filter(u => u.id !== deleteId));
    else if (module === 'masters/warehouses') setDbWarehouses(dbWarehouses.filter(w => w.id !== deleteId));
    else if (module === 'masters/customers') setDbCustomers(dbCustomers.filter(c => c.id !== deleteId));
    else if (module === 'masters/suppliers') setDbSuppliers(dbSuppliers.filter(s => s.id !== deleteId));
    else if (module === 'masters/reps') setDbReps(dbReps.filter(r => r.id !== deleteId));

    onTriggerToast('success', 'Registry Deleted', 'The requested record was permanently dropped.');
    setDeleteId(null);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (module === 'masters/products') setDbProducts(dbProducts.filter(p => !selectedIds.includes(p.id)));
    else if (module === 'masters/categories') setDbCategories(dbCategories.filter(c => !selectedIds.includes(c.id)));
    else if (module === 'masters/brands') setDbBrands(dbBrands.filter(b => !selectedIds.includes(b.id)));
    else if (module === 'masters/units') setDbUnits(dbUnits.filter(u => !selectedIds.includes(u.id)));
    else if (module === 'masters/warehouses') setDbWarehouses(dbWarehouses.filter(w => !selectedIds.includes(w.id)));
    else if (module === 'masters/customers') setDbCustomers(dbCustomers.filter(c => !selectedIds.includes(c.id)));
    else if (module === 'masters/suppliers') setDbSuppliers(dbSuppliers.filter(s => !selectedIds.includes(s.id)));
    else if (module === 'masters/reps') setDbReps(dbReps.filter(r => !selectedIds.includes(r.id)));

    onTriggerToast('success', 'Bulk Operations Done', `Deleted ${selectedIds.length} records successfully.`);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headerRow = `ID,Code,Name,${headers.detail1},${headers.detail2},Value,Status\n`;
    const bodyRows = rows.map(r => `"${r.id}","${r.code}","${r.name}","${r.detail1}","${r.detail2}","${r.numericText}","${r.status}"`).join('\n');
    const blob = new Blob([headerRow + bodyRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INK-ERP-${config.name.replace(/\s+/g, '-')}-Export.csv`;
    a.click();
    onTriggerToast('success', 'Export Succeeded', 'CSV generated and downloaded to device.');
  };

  const handleImportCSV = () => {
    if (!importText.trim()) {
      onTriggerToast('error', 'Import Failed', 'CSV text area is empty.');
      return;
    }
    // Simple mock import parsing
    try {
      const lines = importText.split('\n').filter(l => l.trim());
      let parsedCount = 0;
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('code')) return; // skip header
        const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
        if (parts.length >= 2) {
          const mockCode = parts[0] || `IMP-${Math.floor(100+Math.random()*900)}`;
          const mockName = parts[1] || 'Imported Entry';
          if (module === 'masters/products') {
            setDbProducts(prev => [...prev, {
              id: String(prev.length + 1), code: mockCode, name: mockName, category: parts[2] || 'Imported', brand: parts[3] || 'Generic',
              unit: 'Bag', price: Number(parts[4]) || 100, taxRate: 5, stockLevel: 100, status: 'Active'
            }]);
          } else if (module === 'masters/categories') {
            setDbCategories(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, description: parts[2] || 'Imported via CSV', productCount: 0, status: 'Active' }]);
          } else if (module === 'masters/brands') {
            setDbBrands(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, origin: parts[2] || 'Global', productCount: 0, status: 'Active' }]);
          } else if (module === 'masters/units') {
            setDbUnits(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, baseUnit: parts[2] || 'Piece', conversionFactor: Number(parts[3]) || 1, status: 'Active' }]);
          } else if (module === 'masters/warehouses') {
            setDbWarehouses(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, manager: parts[2] || 'Unassigned', address: parts[3] || 'Facility Plot', capacitySft: Number(parts[4]) || 50000, status: 'Active' }]);
          } else if (module === 'masters/customers') {
            setDbCustomers(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, contact: parts[2] || '+91 99999 99999', email: parts[3] || 'contact@org.com', balance: Number(parts[4]) || 0, region: 'National', status: 'Active' }]);
          } else if (module === 'masters/suppliers') {
            setDbSuppliers(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, contact: parts[2] || '+91 99999 99999', email: parts[3] || 'vendor@org.com', balance: Number(parts[4]) || 0, category: 'Imported', status: 'Active' }]);
          } else if (module === 'masters/reps') {
            setDbReps(prev => [...prev, { id: String(prev.length + 1), code: mockCode, name: mockName, contact: parts[2] || '+91 99999 99999', email: parts[3] || 'rep@ink-fmcg.com', region: 'National', target: Number(parts[4]) || 1500000, status: 'Active' }]);
          }
          parsedCount++;
        }
      });
      onTriggerToast('success', 'Import Completed', `Processed ${parsedCount} CSV lines into active ERP cache.`);
      setImportModal(false);
      setImportText('');
    } catch (err) {
      onTriggerToast('error', 'Parse Error', 'Malformed CSV format provided.');
    }
  };

  // Drag and Drop simulation for file attachments
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachment(file.name);
      onTriggerToast('success', 'Attachment Linked', `"${file.name}" linked as supporting credential.`);
    }
  };

  // Helper Icon Component for each Module Header
  const ConfigIcon = config.icon;

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: HEADER & STATE SIMULATION ACCORDION */}
      <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-brand-primary rounded-lg flex items-center justify-center">
            <ConfigIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary">
              <span>Platform</span>
              <span>/</span>
              <span>Master Data</span>
              <span>/</span>
              <span className="text-brand-text-primary font-bold">{config.name}</span>
            </div>
            <h1 className="text-lg font-bold text-brand-text-primary tracking-tight mt-0.5">{config.name} Registry</h1>
          </div>
        </div>

        {/* State simulation switcher bar */}
        <div className="flex items-center gap-2 bg-brand-bg-secondary p-1 rounded border border-brand-border self-start md:self-auto">
          <span className="text-[10px] text-brand-text-secondary font-bold px-2 uppercase tracking-wider">Simulate State:</span>
          {(['normal', 'loading', 'empty', 'error', 'denied'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setSimulatedState(st);
                onTriggerToast('info', 'Simulation Status Changed', `Displaying ${st.toUpperCase()} state mock.`);
              }}
              className={`px-2 py-1 text-[9px] font-bold rounded capitalize cursor-pointer transition ${
                simulatedState === st ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* CORE DISPLAY WINDOW HANDLED ACCORDING TO SIMULATED STATE */}
      {simulatedState === 'loading' ? (
        <div className="bg-white p-24 border border-brand-border rounded-lg text-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
          <p className="text-xs text-brand-text-secondary font-medium">Fetching real-time organizational masters from PostgreSQL...</p>
        </div>
      ) : simulatedState === 'empty' ? (
        <div className="bg-white p-20 border border-brand-border rounded-lg text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
            <ClipboardList size={20} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-brand-text-primary">No Registered Records</h3>
            <p className="text-xs text-brand-text-secondary">
              There are currently no active data entries configured in this ERP region.
            </p>
          </div>
          <button
            onClick={() => {
              setSimulatedState('normal');
              setMode('create');
            }}
            className="px-3.5 py-2 bg-brand-primary text-white text-xs font-bold rounded hover:bg-blue-700 transition cursor-pointer"
          >
            Create Your First Record
          </button>
        </div>
      ) : simulatedState === 'error' ? (
        <div className="bg-white p-16 border border-brand-border rounded-lg text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mx-auto">
            <AlertCircle size={20} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-brand-text-primary">500 Database Connection Failed</h3>
            <p className="text-xs text-brand-text-secondary">
              Drizzle ORM was unable to establish a handshaking connection to PostgreSQL 17. Ensure the local container pool holds valid credentials.
            </p>
          </div>
          <button
            onClick={() => setSimulatedState('normal')}
            className="px-3.5 py-1.5 border border-brand-border hover:bg-brand-bg-secondary text-brand-text-primary text-xs font-bold rounded transition cursor-pointer"
          >
            Retry Connection Handshake
          </button>
        </div>
      ) : simulatedState === 'denied' ? (
        <div className="bg-white p-16 border border-brand-border rounded-lg text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mx-auto">
            <ShieldAlert size={20} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-brand-text-primary">403 Access Clearance Denied</h3>
            <p className="text-xs text-brand-text-secondary">
              Your security group level cannot read or write to this Master Registry node. Contact your Tenant Super Administrator to extend privileges.
            </p>
          </div>
          <button
            onClick={() => setSimulatedState('normal')}
            className="px-3.5 py-1.5 bg-brand-danger text-white text-xs font-bold rounded hover:bg-red-700 transition cursor-pointer"
          >
            Acknowledge policy
          </button>
        </div>
      ) : (
        /* NORMAL FLOW: LIST, CREATE, EDIT, VIEW */
        <div className="space-y-6">
          
          {/* LIST VIEW */}
          {mode === 'list' && (
            <div className="bg-white border border-brand-border rounded-lg shadow-sm-flat overflow-hidden flex flex-col">
              
              {/* TABLE ACTION CONTROLS BAR */}
              <div className="p-4 border-b border-brand-border bg-brand-bg-secondary/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
                
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:max-w-2xl">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-text-secondary" />
                    <input
                      type="text"
                      placeholder={`Search ${config.name.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-md focus:outline-none focus:border-brand-primary text-brand-text-primary"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-brand-text-secondary hover:text-brand-text-primary">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                    <span className="text-[10px] font-bold text-brand-text-secondary uppercase">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-xs bg-white border border-brand-border rounded px-2 py-1 focus:outline-none focus:border-brand-primary text-brand-text-primary font-medium"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>

                  {/* Density Toggle */}
                  <div className="flex items-center gap-1 border border-brand-border bg-white rounded p-0.5 text-[10px] font-bold text-brand-text-secondary">
                    <span className="px-1.5 text-[9px] uppercase tracking-wider text-brand-text-secondary">Density:</span>
                    <button onClick={() => setDensity('comfortable')} className={`px-2 py-0.5 rounded ${density === 'comfortable' ? 'bg-brand-primary text-white' : 'hover:text-brand-text-primary'}`}>Standard</button>
                    <button onClick={() => setDensity('compact')} className={`px-2 py-0.5 rounded ${density === 'compact' ? 'bg-brand-primary text-white' : 'hover:text-brand-text-primary'}`}>Compact</button>
                    <button onClick={() => setDensity('tight')} className={`px-2 py-0.5 rounded ${density === 'tight' ? 'bg-brand-primary text-white' : 'hover:text-brand-text-primary'}`}>Tight</button>
                  </div>
                </div>

                {/* Bulk Actions, Column Selection, Export, Add New Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-50 text-brand-danger hover:bg-red-100 border border-red-100 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition animate-pulse"
                    >
                      <Trash2 size={13} /> Bulk Delete ({selectedIds.length})
                    </button>
                  )}

                  {/* Column Visibility Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColMenu(!showColMenu)}
                      className="p-1.5 border border-brand-border bg-white text-brand-text-primary rounded hover:bg-brand-bg-secondary flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                      title="Hide/Show Columns"
                    >
                      <Settings2 size={13} />
                      <span className="hidden sm:inline">Columns</span>
                      <ChevronDown size={10} />
                    </button>
                    {showColMenu && (
                      <div className="absolute right-0 mt-1.5 bg-white border border-brand-border rounded-md shadow-lg p-2.5 z-40 w-48 space-y-1.5 text-xs text-brand-text-primary">
                        <p className="font-bold border-b pb-1 mb-1 text-[10px] uppercase text-brand-text-secondary">Column Visibility</p>
                        {Object.keys(columnVisibility).map(col => (
                          <label key={col} className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-brand-bg-secondary rounded px-1">
                            <input
                              type="checkbox"
                              checked={columnVisibility[col]}
                              onChange={() => setColumnVisibility(prev => ({ ...prev, [col]: !prev[col] }))}
                              className="rounded border-brand-border text-brand-primary"
                            />
                            <span className="capitalize font-medium">{col === 'detail1' ? headers.detail1 : col === 'detail2' ? headers.detail2 || 'Extended Detail' : col === 'numericText' ? 'Values' : col}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setImportModal(true)}
                    className="p-1.5 border border-brand-border bg-white text-brand-text-primary rounded hover:bg-brand-bg-secondary flex items-center gap-1 text-xs font-medium cursor-pointer"
                    title="Import via CSV template"
                  >
                    <Upload size={13} />
                    <span className="hidden sm:inline">Import</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="p-1.5 border border-brand-border bg-white text-brand-text-primary rounded hover:bg-brand-bg-secondary flex items-center gap-1 text-xs font-medium cursor-pointer"
                    title="Export to CSV"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  <button
                    onClick={() => {
                      setFormCode(`REG-${Math.floor(100+Math.random()*900)}`);
                      setFormName('');
                      setFormDetail1('');
                      setFormDetail2('');
                      setFormNumeric1(0);
                      setFormNumeric2(5);
                      setFormStatus('Active');
                      setFormErrors({});
                      setAttachment(null);
                      setAutosaveMsg('');
                      setMode('create');
                    }}
                    className="px-3 py-1.5 bg-brand-primary text-white hover:bg-blue-700 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm transition"
                  >
                    <Plus size={13} /> Add {config.singular}
                  </button>
                </div>
              </div>

              {/* TABLE CONTAINER WITH STICKY HEADERS */}
              <div className="overflow-x-auto min-h-[300px]">
                {paginatedRows.length === 0 ? (
                  <div className="p-16 text-center text-brand-text-secondary space-y-2">
                    <p className="font-bold text-xs text-brand-text-primary">No Matching Results Found</p>
                    <p className="text-[11px]">Adjust your search query or status filter to locate missing records.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                    <thead className="bg-brand-bg-secondary border-b border-brand-border sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                      <tr className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">
                          <button onClick={toggleAllSelection} className="cursor-pointer text-brand-text-secondary hover:text-brand-text-primary">
                            {selectedIds.length === paginatedRows.length ? <CheckSquare size={14} className="text-brand-primary" /> : <Square size={14} />}
                          </button>
                        </th>
                        {columnVisibility.code && (
                          <th className="p-3 w-32 cursor-pointer hover:bg-brand-bg-secondary transition" onClick={() => toggleSort('code')}>
                            <div className="flex items-center gap-1">
                              Code <ArrowUpDown size={11} />
                            </div>
                          </th>
                        )}
                        {columnVisibility.name && (
                          <th className="p-3 cursor-pointer hover:bg-brand-bg-secondary transition" onClick={() => toggleSort('name')}>
                            <div className="flex items-center gap-1">
                              Descriptive Name <ArrowUpDown size={11} />
                            </div>
                          </th>
                        )}
                        {columnVisibility.detail1 && (
                          <th className="p-3 w-48 cursor-pointer hover:bg-brand-bg-secondary transition" onClick={() => toggleSort('detail1')}>
                            <div className="flex items-center gap-1">
                              {headers.detail1} <ArrowUpDown size={11} />
                            </div>
                          </th>
                        )}
                        {columnVisibility.detail2 && headers.detail2 && (
                          <th className="p-3 w-48 text-left">
                            {headers.detail2}
                          </th>
                        )}
                        {columnVisibility.numericText && (
                          <th className="p-3 w-40 text-right font-medium">
                            Value Metrics
                          </th>
                        )}
                        {columnVisibility.status && (
                          <th className="p-3 w-28 text-center">
                            Status
                          </th>
                        )}
                        {columnVisibility.actions && (
                          <th className="p-3 w-28 text-center">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {paginatedRows.map((row) => {
                        const isRowSelected = selectedIds.includes(row.id);
                        const isCompact = density === 'compact';
                        const isTight = density === 'tight';
                        
                        // Vertical Padding class depending on selected density
                        const paddingClass = isTight ? 'py-1 px-3' : isCompact ? 'py-2 px-3' : 'py-3.5 px-3';

                        return (
                          <tr
                            key={row.id}
                            className={`hover:bg-brand-bg-secondary/40 transition text-xs ${
                              isRowSelected ? 'bg-blue-50/20' : ''
                            }`}
                          >
                            <td className={`${paddingClass} text-center`}>
                              <button onClick={() => toggleRowSelection(row.id)} className="cursor-pointer text-brand-text-secondary hover:text-brand-text-primary">
                                {isRowSelected ? <CheckSquare size={14} className="text-brand-primary" /> : <Square size={14} />}
                              </button>
                            </td>
                            {columnVisibility.code && (
                              <td className={`${paddingClass} font-mono font-bold text-brand-text-primary`}>
                                {row.code}
                              </td>
                            )}
                            {columnVisibility.name && (
                              <td className={`${paddingClass} font-semibold text-brand-text-primary truncate max-w-xs`} title={row.name}>
                                {row.name}
                              </td>
                            )}
                            {columnVisibility.detail1 && (
                              <td className={`${paddingClass} text-brand-text-secondary truncate max-w-[150px]`} title={row.detail1}>
                                {row.detail1}
                              </td>
                            )}
                            {columnVisibility.detail2 && headers.detail2 && (
                              <td className={`${paddingClass} text-brand-text-secondary truncate max-w-[150px]`} title={row.detail2}>
                                {row.detail2}
                              </td>
                            )}
                            {columnVisibility.numericText && (
                              <td className={`${paddingClass} text-right font-semibold text-brand-text-primary font-mono`}>
                                {row.numericText}
                              </td>
                            )}
                            {columnVisibility.status && (
                              <td className={`${paddingClass} text-center`}>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                                  row.status === 'Active'
                                    ? 'bg-green-50 text-brand-success border-green-200'
                                    : 'bg-gray-50 text-brand-text-secondary border-gray-200'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${row.status === 'Active' ? 'bg-brand-success' : 'bg-gray-400'}`} />
                                  {row.status}
                                </span>
                              </td>
                            )}
                            {columnVisibility.actions && (
                              <td className={`${paddingClass} text-center`}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedId(row.id);
                                      populateForm(row.id);
                                      setMode('view');
                                    }}
                                    className="p-1 text-brand-text-secondary hover:text-brand-primary hover:bg-blue-50 rounded cursor-pointer transition"
                                    title="View Ledger Details"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedId(row.id);
                                      populateForm(row.id);
                                      setMode('edit');
                                    }}
                                    className="p-1 text-brand-text-secondary hover:text-brand-warning hover:bg-amber-50 rounded cursor-pointer transition"
                                    title="Edit Record"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleSingleDelete(row.id, row.name)}
                                    className="p-1 text-brand-text-secondary hover:text-brand-danger hover:bg-red-50 rounded cursor-pointer transition"
                                    title="Delete Entry"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* TABLE FOOTER / PAGINATION CONTROL PANEL */}
              <div className="p-4 border-t border-brand-border bg-brand-bg-secondary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shrink-0 font-medium">
                <span className="text-brand-text-secondary">
                  Showing <strong className="text-brand-text-primary">{Math.min(totalRows, (currentPage - 1) * rowsPerPage + 1)}</strong> to <strong className="text-brand-text-primary">{Math.min(totalRows, currentPage * rowsPerPage)}</strong> of <strong className="text-brand-text-primary">{totalRows}</strong> records configured
                </span>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5 text-brand-text-secondary">
                    <span>Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white border border-brand-border rounded px-1.5 py-0.5 focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-brand-border rounded hover:bg-brand-bg-secondary disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <span className="text-brand-text-primary font-bold px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-brand-border rounded hover:bg-brand-bg-secondary disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW DETAILS MODE */}
          {mode === 'view' && selectedId && (
            <div className="bg-white border border-brand-border rounded-lg shadow-sm-flat p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <button
                    onClick={() => {
                      setMode('list');
                      setSelectedId(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline mb-2 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Return to List Ledger
                  </button>
                  <h2 className="text-lg font-bold text-brand-text-primary">{config.singular} Comprehensive Profile</h2>
                  <p className="text-xs text-brand-text-secondary">Audit Trail and Metadata specifications</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('edit')}
                    className="px-3.5 py-1.5 border border-brand-border text-brand-text-primary hover:bg-brand-bg-secondary font-bold text-xs rounded transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 size={13} /> Edit Specifications
                  </button>
                  <button
                    onClick={() => {
                      setMode('list');
                      setSelectedId(null);
                    }}
                    className="px-3.5 py-1.5 bg-brand-primary text-white hover:bg-blue-700 font-bold text-xs rounded transition cursor-pointer shadow-sm"
                  >
                    Done Reviewing
                  </button>
                </div>
              </div>

              {/* Detail fields Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-text-primary">
                
                <div className="space-y-4">
                  <div className="bg-brand-bg-secondary/40 p-4 rounded-md border space-y-2">
                    <p className="text-[10px] uppercase font-bold text-brand-text-secondary tracking-wider">Identity Code</p>
                    <p className="font-mono text-sm font-bold text-brand-primary">{formCode}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-brand-text-secondary text-[10px] uppercase tracking-wider block">Descriptive Label</span>
                    <span className="text-sm font-semibold">{formName}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-brand-text-secondary text-[10px] uppercase tracking-wider block">{headers.detail1}</span>
                    <span className="text-xs font-semibold text-brand-text-primary bg-blue-50 px-2 py-1 rounded inline-block">{formDetail1 || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-brand-bg-secondary/40 p-4 rounded-md border space-y-2">
                    <p className="text-[10px] uppercase font-bold text-brand-text-secondary tracking-wider">Operational Status</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                      formStatus === 'Active' ? 'bg-green-50 text-brand-success border-green-200' : 'bg-red-50 text-brand-danger border-red-200'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${formStatus === 'Active' ? 'bg-brand-success' : 'bg-brand-danger'}`} />
                      {formStatus}
                    </span>
                  </div>

                  {headers.detail2 && (
                    <div className="space-y-1">
                      <span className="font-bold text-brand-text-secondary text-[10px] uppercase tracking-wider block">{headers.detail2}</span>
                      <span className="text-xs font-medium text-brand-text-primary">{formDetail2 || 'Unconfigured'}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="font-bold text-brand-text-secondary text-[10px] uppercase tracking-wider block">{headers.numeric1}</span>
                    <span className="text-xs font-bold font-mono text-brand-text-primary">
                      {module === 'masters/products' ? `₹${formNumeric1.toLocaleString()}` : formNumeric1?.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* SECURITY & LOGIN POLICIES SECTION (REPS ONLY) */}
              {module === 'masters/reps' && (
                <div className="border-t pt-6 space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="p-1.5 bg-blue-50 text-brand-primary rounded-md">
                      <Sliders size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">Security & Login Policies</h3>
                      <p className="text-[11px] text-brand-text-secondary">Enterprise settings configured for this personnel account</p>
                    </div>
                  </div>

                  {/* Warning Messages Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {(secAccountStatus === 'Disabled' || secLockAccount) && (
                      <div className="p-3 bg-red-50 text-brand-danger border border-red-200 rounded-md flex gap-2 font-semibold">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <p>Account is currently disabled.</p>
                      </div>
                    )}
                    
                    {secRequireFace && (
                      <div className="p-3 bg-blue-50 text-brand-primary border border-blue-200 rounded-md flex gap-2 font-semibold">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                        <p>This user will be required to complete Face Verification before accessing the ERP.</p>
                      </div>
                    )}

                    {!secRequireGps && (
                      <div className="p-3 bg-amber-50 text-brand-warning border border-amber-200 rounded-md flex gap-2 font-semibold">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <p>GPS Verification is disabled for this user.</p>
                      </div>
                    )}

                    {(secAllowMultipleDevices || secAllowUnknownDevice) && (
                      <div className="p-3 bg-green-50 text-brand-success border border-green-200 rounded-md flex gap-2 font-semibold">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                        <p>This user can login from any approved device.</p>
                      </div>
                    )}
                  </div>

                  {/* Professional settings cards layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    
                    {/* Column 1: Account Settings */}
                    <div className="bg-brand-bg-secondary/25 border border-brand-border rounded-lg p-4 space-y-3.5">
                      <h4 className="font-bold text-brand-text-primary text-[11px] uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                        <User size={13} className="text-brand-text-secondary" /> Account settings
                      </h4>
                      
                      <div className="space-y-2.5 leading-relaxed">
                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Account Status</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${secAccountStatus === 'Active' ? 'bg-green-50 text-brand-success' : 'bg-red-50 text-brand-danger'}`}>
                            {secAccountStatus}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Lock State</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${secLockAccount ? 'bg-red-50 text-brand-danger' : 'bg-green-50 text-brand-success'}`}>
                            {secLockAccount ? 'Locked' : 'Unlocked'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Allow Multiple Devices</span>
                          <span className="font-bold text-brand-text-primary">{secAllowMultipleDevices ? 'Yes' : 'No'}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Max Concurrent Sessions</span>
                          <span className="font-mono font-bold text-brand-primary bg-blue-50 px-1.5 py-0.2 rounded border">{secMaxSessions} Sessions</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-brand-text-secondary">Device Registration</span>
                          <span className="font-semibold text-brand-text-primary">{secRequireDeviceReg ? 'Required' : 'Bypassed'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Login Security */}
                    <div className="bg-brand-bg-secondary/25 border border-brand-border rounded-lg p-4 space-y-3.5">
                      <h4 className="font-bold text-brand-text-primary text-[11px] uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                        <ShieldAlert size={13} className="text-brand-text-secondary" /> Login Security
                      </h4>

                      <div className="space-y-2.5 leading-relaxed">
                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Require Face Check</span>
                          <span className={`font-bold ${secRequireFace ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>{secRequireFace ? 'Enforced' : 'Disabled'}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Require GPS Fence</span>
                          <span className={`font-bold ${secRequireGps ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>{secRequireGps ? 'Enforced' : 'Disabled'}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">2-Factor Auth (Future)</span>
                          <span className="text-[10px] bg-gray-100 text-brand-text-secondary px-1.5 py-0.2 rounded border font-semibold">Planned</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Allow Unknown Devices</span>
                          <span className="font-semibold text-brand-text-primary">{secAllowUnknownDevice ? 'Yes (BYOD)' : 'No (White-only)'}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-brand-text-secondary">Office Hours Constraint</span>
                          <span className="font-semibold text-brand-text-primary">{secOfficeHoursOnly ? 'Active (09:00 - 18:00)' : 'Unrestricted'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Attendance Parameters */}
                    <div className="bg-brand-bg-secondary/25 border border-brand-border rounded-lg p-4 space-y-3.5">
                      <h4 className="font-bold text-brand-text-primary text-[11px] uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-brand-text-secondary" /> Attendance settings
                      </h4>

                      <div className="space-y-2.5 leading-relaxed">
                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Auto Mark on Login</span>
                          <span className="font-bold text-brand-text-primary">{secAutoAttendance ? 'Yes' : 'No'}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Face Check on Clock-in</span>
                          <span className="font-semibold text-brand-text-primary">{secFaceAttendance ? 'Enforced' : 'Skipped'}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">GPS Check on Clock-in</span>
                          <span className="font-semibold text-brand-text-primary">{secGpsAttendance ? 'Enforced' : 'Skipped'}</span>
                        </div>

                        <div className="flex justify-between items-center pb-1 border-b border-brand-border/40">
                          <span className="text-brand-text-secondary">Allowed GPS Radius</span>
                          <span className="font-mono font-bold text-brand-primary">{secGpsRadius} Meters</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-brand-text-secondary">Require Selfie</span>
                          <span className="font-bold text-brand-text-primary">{secRequireSelfie ? 'Enforced' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Extra Simulated System Audit Log metadata */}
              <div className="border-t pt-4 text-[10px] text-brand-text-secondary font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-bg-secondary/20 p-3 rounded">
                <div>
                  <p>ROW ID: {selectedId}</p>
                  <p>DB TABLE: T_FMCG_{config.name.toUpperCase().replace(/\s+/g, '_')}</p>
                </div>
                <div className="sm:text-right">
                  <p>LAST SYNCED: 2026-07-21 02:44</p>
                  <p>SIGNATURE: C# EF Core 9 / Postgres 17</p>
                </div>
              </div>

            </div>
          )}

          {/* CREATE & EDIT MODE (FORM WITH VALIDATION) */}
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={handleSave} className="bg-white border border-brand-border rounded-lg shadow-sm-flat p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setSelectedId(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline mb-2 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Back to List Ledger
                  </button>
                  <h2 className="text-lg font-bold text-brand-text-primary">
                    {mode === 'create' ? 'Register New' : 'Configure Existing'} {config.singular}
                  </h2>
                  <p className="text-xs text-brand-text-secondary">Input official credentials and metadata parameters.</p>
                </div>

                <div className="flex items-center gap-3">
                  {autosaveMsg && (
                    <span className="text-[10px] text-brand-text-secondary font-mono bg-gray-50 border px-2 py-1 rounded animate-fade-in flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin text-brand-primary" /> {autosaveMsg}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setSelectedId(null);
                    }}
                    className="px-3.5 py-1.5 border border-brand-border text-brand-text-primary hover:bg-brand-bg-secondary font-bold text-xs rounded transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-brand-primary text-white hover:bg-blue-700 font-bold text-xs rounded transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {mode === 'create' ? 'Create Record' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Form Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Left Side */}
                <div className="space-y-4">
                  
                  {/* Registry Code (Read-Only on Edit, editable on creation) */}
                  <div className="space-y-1">
                    <label className="block font-bold text-brand-text-primary">
                      Registry Code <span className="text-brand-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={mode === 'edit'}
                      value={formCode}
                      onChange={(e) => { setFormCode(e.target.value); handleFormChangeSim(); }}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary ${
                        formErrors.code ? 'border-brand-danger' : 'border-brand-border'
                      } ${mode === 'edit' ? 'bg-gray-100/60 text-brand-text-secondary font-mono cursor-not-allowed' : ''}`}
                      placeholder={`e.g. ${config.singular.toUpperCase().slice(0,3)}-101`}
                    />
                    {formErrors.code && <span className="text-[10px] text-brand-danger font-bold block">{formErrors.code}</span>}
                    <p className="text-[10px] text-brand-text-secondary">Standard unique system indicator mapped in Postgres primary keys.</p>
                  </div>

                  {/* Descriptive Name */}
                  <div className="space-y-1">
                    <label className="block font-bold text-brand-text-primary">
                      Descriptive {config.singular} Name <span className="text-brand-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => { setFormName(e.target.value); handleFormChangeSim(); }}
                      className={`w-full p-2 border rounded-md focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary ${
                        formErrors.name ? 'border-brand-danger' : 'border-brand-border'
                      }`}
                      placeholder={`e.g. Official ${config.singular}`}
                    />
                    {formErrors.name && <span className="text-[10px] text-brand-danger font-bold block">{formErrors.name}</span>}
                  </div>

                  {/* Status Toggle Selector */}
                  <div className="space-y-1">
                    <label className="block font-bold text-brand-text-primary">Active Status Option</label>
                    <select
                      value={formStatus}
                      onChange={(e) => { setFormStatus(e.target.value as any); handleFormChangeSim(); }}
                      className="w-full p-2 border border-brand-border rounded-md focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary font-medium"
                    >
                      <option value="Active">Active (Available across all sales pipelines)</option>
                      <option value="Inactive">Inactive (Suspended from standard ledgers)</option>
                    </select>
                  </div>

                </div>

                {/* Right Side */}
                <div className="space-y-4">
                  
                  {/* Detail field 1 */}
                  <div className="space-y-1">
                    <label className="block font-bold text-brand-text-primary">{headers.detail1}</label>
                    <input
                      type="text"
                      value={formDetail1}
                      onChange={(e) => { setFormDetail1(e.target.value); handleFormChangeSim(); }}
                      className="w-full p-2 border border-brand-border rounded-md focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary"
                      placeholder={`Provide ${headers.detail1.toLowerCase()}`}
                    />
                    <p className="text-[10px] text-brand-text-secondary">Provides metadata sorting capabilities inside grids.</p>
                  </div>

                  {/* Detail field 2 (Only if applicable) */}
                  {headers.detail2 && (
                    <div className="space-y-1">
                      <label className="block font-bold text-brand-text-primary">
                        {headers.detail2}
                        {module === 'masters/customers' || module === 'masters/suppliers' || module === 'masters/reps' ? <span className="text-brand-danger"> *</span> : ''}
                      </label>
                      <input
                        type={module.includes('customers') || module.includes('suppliers') || module.includes('reps') ? 'email' : 'text'}
                        value={formDetail2}
                        onChange={(e) => { setFormDetail2(e.target.value); handleFormChangeSim(); }}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary ${
                          formErrors.detail2 ? 'border-brand-danger' : 'border-brand-border'
                        }`}
                        placeholder={`Provide ${headers.detail2.toLowerCase()}`}
                      />
                      {formErrors.detail2 && <span className="text-[10px] text-brand-danger font-bold block">{formErrors.detail2}</span>}
                    </div>
                  )}

                  {/* Value / Balance / Target Numeric Field */}
                  <div className="space-y-1">
                    <label className="block font-bold text-brand-text-primary">{headers.numeric1}</label>
                    <input
                      type="number"
                      value={formNumeric1}
                      onChange={(e) => { setFormNumeric1(Number(e.target.value)); handleFormChangeSim(); }}
                      className="w-full p-2 border border-brand-border rounded-md focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary font-mono font-semibold"
                    />
                  </div>

                  {/* Drag & Drop File Upload attachment container */}
                  <div className="space-y-1">
                    <label className="block font-bold text-brand-text-primary">Supporting Attachment (Audit Credential)</label>
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-brand-border rounded-md p-4 bg-brand-bg-secondary/40 text-center hover:bg-brand-bg-secondary transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <Paperclip size={18} className="text-brand-text-secondary" />
                      {attachment ? (
                        <p className="text-[11px] text-brand-success font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> {attachment}
                        </p>
                      ) : (
                        <div>
                          <p className="text-[11px] text-brand-text-primary font-semibold">Drag & drop files here, or click to choose</p>
                          <p className="text-[9px] text-brand-text-secondary">PDF, PNG, CSV up to 10MB verified by security scan</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* SECURITY & LOGIN POLICIES FORM SECTION (REPS ONLY) */}
              {module === 'masters/reps' && (
                <div className="border-t pt-6 space-y-6">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="p-1.5 bg-blue-50 text-brand-primary rounded-md">
                      <Sliders size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">Security & Login Policies</h3>
                      <p className="text-[11px] text-brand-text-secondary">Granular security configurations for this representative account</p>
                    </div>
                  </div>

                  {/* Real-time policy warning banners based on selected state variables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {(secAccountStatus === 'Disabled' || secLockAccount) && (
                      <div className="p-3 bg-red-50 text-brand-danger border border-red-100 rounded-md flex gap-2 font-semibold">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <p>Account is currently disabled.</p>
                      </div>
                    )}

                    {secRequireFace && (
                      <div className="p-3 bg-blue-50 text-brand-primary border border-blue-100 rounded-md flex gap-2 font-semibold">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                        <p>This user will be required to complete Face Verification before accessing the ERP.</p>
                      </div>
                    )}

                    {!secRequireGps && (
                      <div className="p-3 bg-amber-50 text-brand-warning border border-amber-100 rounded-md flex gap-2 font-semibold">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <p>GPS Verification is disabled for this user.</p>
                      </div>
                    )}

                    {(secAllowMultipleDevices || secAllowUnknownDevice) && (
                      <div className="p-3 bg-green-50 text-brand-success border border-green-100 rounded-md flex gap-2 font-semibold">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                        <p>This user can login from any approved device.</p>
                      </div>
                    )}
                  </div>

                  {/* Interactive settings cards layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-brand-text-primary">
                    
                    {/* Card 1: Account Control & Password Operations */}
                    <div className="bg-white border border-brand-border rounded-lg p-5 space-y-4">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-brand-text-primary border-b pb-2 flex items-center gap-1.5">
                        <User size={13} className="text-brand-text-secondary" /> Account & Credentials
                      </h4>

                      <div className="space-y-4">
                        {/* Status Select Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-brand-text-secondary">Account Login Status</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = secAccountStatus === 'Active' ? 'Disabled' : 'Active';
                              setSecAccountStatus(nextStatus);
                              onTriggerToast('warning', 'Login Status Toggled', `Account set to: ${nextStatus}`);
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded border cursor-pointer transition ${
                              secAccountStatus === 'Active' 
                                ? 'bg-green-50 text-brand-success border-green-200 hover:bg-green-100' 
                                : 'bg-red-50 text-brand-danger border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {secAccountStatus === 'Active' ? '● ACTIVE' : '✖ DISABLED'}
                          </button>
                        </div>

                        {/* Lock State Toggle */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-brand-text-secondary">Administrative Lockout</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSecLockAccount(!secLockAccount);
                              onTriggerToast('info', secLockAccount ? 'Account Unlocked' : 'Account Locked', 'Lock state was toggled in form cache.');
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded border cursor-pointer transition ${
                              !secLockAccount 
                                ? 'bg-green-50 text-brand-success border-green-200 hover:bg-green-100' 
                                : 'bg-red-50 text-brand-danger border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {!secLockAccount ? 'UNLOCKED' : 'LOCKED'}
                          </button>
                        </div>

                        {/* Max sessions select */}
                        <div className="space-y-1.5 border-t pt-3">
                          <label className="block font-medium text-brand-text-secondary">Max Concurrent Sessions</label>
                          <select
                            value={secMaxSessions}
                            onChange={(e) => setSecMaxSessions(Number(e.target.value))}
                            className="w-full p-2 border border-brand-border rounded-md bg-white text-brand-text-primary focus:outline-none"
                          >
                            <option value={1}>1 Session (Strict Device Lockout)</option>
                            <option value={2}>2 Sessions (Tablet + Workstation)</option>
                            <option value={3}>3 Sessions (Standard Depot Allowances)</option>
                            <option value={5}>5 Sessions (Enterprise Override)</option>
                          </select>
                        </div>

                        {/* Hard resets block */}
                        <div className="border-t pt-3 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSecForcePasswordReset(!secForcePasswordReset);
                              onTriggerToast('info', 'Credential Pipeline Primed', 'User will be forced to change password upon next authorization.');
                            }}
                            className={`w-full py-1.5 px-3 border rounded text-[10px] font-bold cursor-pointer transition text-left flex items-center justify-between ${
                              secForcePasswordReset 
                                ? 'bg-blue-50 text-brand-primary border-blue-200' 
                                : 'bg-gray-50 text-brand-text-primary border-brand-border hover:bg-gray-100'
                            }`}
                          >
                            <span>Force Password Reset on Login</span>
                            <span>{secForcePasswordReset ? 'PRIMED' : 'OFF'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSecResetFaceToken(true);
                              onTriggerToast('success', 'Face Token Invalidated', 'Facial signature cache dropped. System will request new enrollment scan on next login attempt.');
                              setTimeout(() => setSecResetFaceToken(false), 3000);
                            }}
                            className="w-full py-1.5 px-3 bg-red-50/50 hover:bg-red-50 text-brand-danger border border-red-200 rounded text-[10px] font-bold cursor-pointer transition text-left flex items-center justify-between"
                          >
                            <span>Reset Registered Biometric Face Token</span>
                            <span className="font-mono">{secResetFaceToken ? 'RESETTING...' : 'RESET'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSecResetDeviceToken(true);
                              onTriggerToast('success', 'Device Registry Invalidation', 'Mobile UUID signature cleared from DB ledger.');
                              setTimeout(() => setSecResetDeviceToken(false), 3000);
                            }}
                            className="w-full py-1.5 px-3 bg-red-50/50 hover:bg-red-50 text-brand-danger border border-red-200 rounded text-[10px] font-bold cursor-pointer transition text-left flex items-center justify-between"
                          >
                            <span>Reset Device Hardware MAC Token</span>
                            <span className="font-mono">{secResetDeviceToken ? 'RESETTING...' : 'RESET'}</span>
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Card 2: Biometric & Security Policies */}
                    <div className="bg-white border border-brand-border rounded-lg p-5 space-y-4">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-brand-text-primary border-b pb-2 flex items-center gap-1.5">
                        <ShieldAlert size={13} className="text-brand-text-secondary" /> Authentication Rules
                      </h4>

                      <div className="space-y-3.5">
                        {/* Require Face */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Require Face Recognition</span>
                            <span className="text-[10px] text-brand-text-secondary block">Require biometric camera scan on main entry.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecRequireFace(!secRequireFace)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secRequireFace ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secRequireFace ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Require GPS */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Require GPS Verification</span>
                            <span className="text-[10px] text-brand-text-secondary block">Block session if geocoordinates fail depot fence rules.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecRequireGps(!secRequireGps)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secRequireGps ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secRequireGps ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Allow multiple devices */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Allow Multiple Devices</span>
                            <span className="text-[10px] text-brand-text-secondary block">Let user authorize work from several handpieces.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecAllowMultipleDevices(!secAllowMultipleDevices)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secAllowMultipleDevices ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secAllowMultipleDevices ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Allow Unknown Device (BYOD) */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Allow Unknown Devices (BYOD)</span>
                            <span className="text-[10px] text-brand-text-secondary block">Bypasses MAC whitelist for self onboarding.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecAllowUnknownDevice(!secAllowUnknownDevice)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secAllowUnknownDevice ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secAllowUnknownDevice ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Office hours only */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Office Hours Only (09:00 - 18:00)</span>
                            <span className="text-[10px] text-brand-text-secondary block">Force lockout during night hours.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecOfficeHoursOnly(!secOfficeHoursOnly)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secOfficeHoursOnly ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secOfficeHoursOnly ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Card 3: Attendance Verification Rules */}
                    <div className="bg-white border border-brand-border rounded-lg p-5 space-y-4">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-brand-text-primary border-b pb-2 flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-brand-text-secondary" /> Attendance Rules
                      </h4>

                      <div className="space-y-3.5">
                        {/* Auto-Mark Attendance on Login */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Auto Mark on Login</span>
                            <span className="text-[10px] text-brand-text-secondary block">Sync HRMS clock-in directly upon auth portal.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecAutoAttendance(!secAutoAttendance)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secAutoAttendance ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secAutoAttendance ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Face Check on Attendance */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Require Face for Attendance</span>
                            <span className="text-[10px] text-brand-text-secondary block">Selfie capture verify during HRMS sync.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecFaceAttendance(!secFaceAttendance)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secFaceAttendance ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secFaceAttendance ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* GPS Check on Attendance */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Require GPS for Attendance</span>
                            <span className="text-[10px] text-brand-text-secondary block">Verify coordinates when marking in/out.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecGpsAttendance(!secGpsAttendance)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secGpsAttendance ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secGpsAttendance ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* GPS Allowed Radius Slider */}
                        <div className="space-y-1.5 border-t pt-3">
                          <div className="flex justify-between items-center text-[10px] font-bold text-brand-text-secondary uppercase">
                            <span>GPS Geofence Radius</span>
                            <span className="font-mono text-brand-primary bg-blue-50 px-1.5 py-0.2 rounded border">{secGpsRadius}m</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={500}
                            step={50}
                            value={secGpsRadius}
                            onChange={(e) => setSecGpsRadius(Number(e.target.value))}
                            className="w-full accent-brand-primary"
                          />
                        </div>

                        {/* Require Selfie */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5 pr-3">
                            <span className="font-bold block">Require Selfie Photo Verification</span>
                            <span className="text-[10px] text-brand-text-secondary block">Attach real-time selfie on attendance record.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecRequireSelfie(!secRequireSelfie)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition shrink-0 cursor-pointer ${
                              secRequireSelfie ? 'bg-brand-primary' : 'bg-gray-200'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition transform ${secRequireSelfie ? 'translate-x-4.5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

            </form>
          )}

        </div>
      )}

      {/* MODAL 1: IMPORT VIA CSV CODES */}
      {importModal && (
        <div className="fixed inset-0 bg-brand-text-primary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-brand-border rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-brand-text-primary flex items-center gap-1.5">
                <Upload size={16} className="text-brand-primary" /> Import CSV Registry Templates
              </h3>
              <button onClick={() => setImportModal(false)} className="text-brand-text-secondary hover:text-brand-text-primary cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-brand-text-secondary leading-normal">
                Paste raw comma-separated values conforming to our ERP schema database columns.
              </p>
              <div className="bg-brand-bg-secondary p-2 rounded text-[10px] font-mono text-brand-text-secondary border leading-relaxed">
                <p className="font-bold text-brand-text-primary">Template Headers Schema:</p>
                <p>Code,Name,DetailAttribute1,DetailAttribute2,ValueMetrics</p>
                <p className="font-bold text-brand-text-primary mt-1">Example Rows:</p>
                <p>IMP-09A,Organic Millet Flour,Flours,HUL,450</p>
                <p>IMP-09B,Double Chocolate Bar,Confectionery,Britannia,25</p>
              </div>
            </div>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-2.5 border border-brand-border rounded font-mono text-xs focus:outline-none focus:border-brand-primary bg-white text-brand-text-primary"
              placeholder="Paste comma-separated rows here..."
            />

            <div className="flex gap-2 justify-end text-xs">
              <button
                onClick={() => setImportModal(false)}
                className="px-3 py-1.5 border border-brand-border rounded hover:bg-brand-bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                className="px-4 py-1.5 bg-brand-primary text-white hover:bg-blue-700 font-bold rounded cursor-pointer shadow-sm"
              >
                Verify & Load Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SINGLE RECORD DROP MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-brand-text-primary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-brand-border rounded-lg shadow-xl w-full max-w-sm p-5 space-y-4 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mx-auto animate-bounce">
              <Trash2 size={20} />
            </div>

            <div>
              <h3 className="font-bold text-brand-text-primary text-sm">Drop Registry Permanently?</h3>
              <p className="text-xs text-brand-text-secondary mt-1">
                This action is irreversible. It will drop this entry from active relational tables instantly.
              </p>
            </div>

            <div className="flex gap-2 justify-center text-xs pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-1.5 border border-brand-border rounded hover:bg-brand-bg-secondary cursor-pointer"
              >
                No, Retain Entry
              </button>
              <button
                onClick={confirmSingleDelete}
                className="px-4 py-1.5 bg-brand-danger text-white hover:bg-red-700 font-bold rounded cursor-pointer shadow-sm"
              >
                Yes, Drop Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
