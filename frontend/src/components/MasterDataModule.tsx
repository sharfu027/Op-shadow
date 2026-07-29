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
  ClipboardList,
  Calendar,
  DollarSign,
  Percent,
  Hash,
  Briefcase,
  Map,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
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
import * as masterDataService from '../services/masterDataService';

interface MasterDataModuleProps {
  module: string; // 'companies' | 'branches' | 'departments' | 'designations' | 'employees' | 'products' | 'categories' | 'brands' | 'units' | 'warehouses' | 'customers' | 'suppliers' | 'reps'
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function MasterDataModule({ module, onTriggerToast }: MasterDataModuleProps) {
  // Get neat display name and icon for the current active sub-module
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
        return { name: 'Designations', singular: 'Designation', icon: Briefcase };
      case 'employees':
      case 'masters/employees':
        return { name: 'Employees', singular: 'Employee', icon: User };
      case 'products':
      case 'masters/products':
        return { name: 'Products', singular: 'Product', icon: Boxes };
      case 'categories':
      case 'masters/categories':
        return { name: 'Categories', singular: 'Category', icon: Tags };
      case 'brands':
      case 'masters/brands':
        return { name: 'Brands', singular: 'Brand', icon: ClipboardList };
      case 'units':
      case 'masters/units':
        return { name: 'Units of Measure', singular: 'Unit of Measure', icon: Tags };
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

  // Master Data Database Mock & API State Repositories
  const [dbCompanies, setDbCompanies] = useState([
    { id: '1', code: 'CMP-001', legalName: 'INK FMCG India Private Limited', tradeName: 'INK Foods & Goods', gstin: '07AAAAA0000A1Z5', pan: 'AAAAA0000A', email: 'hq@ink-fmcg.com', phone: '+91 11 4500 8800', currency: 'INR', status: 'Active', addressLine1: 'Plot 101, Okhla Industrial Estate', city: 'New Delhi', state: 'Delhi', postalCode: '110020', country: 'India' },
    { id: '2', code: 'CMP-002', legalName: 'INK Global Exports LLC', tradeName: 'INK Overseas', gstin: '27BBBBB1111B1Z2', pan: 'BBBBB1111B', email: 'exports@ink-global.com', phone: '+91 22 6700 9900', currency: 'USD', status: 'Active', addressLine1: 'BKC Center, Bandra East', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India' }
  ]);

  const [dbBranches, setDbBranches] = useState([
    { id: '1', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'BR-DEL-HQ', name: 'Delhi Main Branch', gstin: '07AAAAA0000A1Z5', phone: '+91 11 4500 8801', email: 'delhi.branch@ink-fmcg.com', addressLine1: 'Okhla Phase III', city: 'New Delhi', state: 'Delhi', postalCode: '110020', country: 'India', isHeadquarters: true, status: 'Active' },
    { id: '2', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'BR-MUM-W', name: 'Mumbai West Depot', gstin: '27AAAAA0000A1Z2', phone: '+91 22 6700 9901', email: 'mumbai.branch@ink-fmcg.com', addressLine1: 'Andheri East Area', city: 'Mumbai', state: 'Maharashtra', postalCode: '400069', country: 'India', isHeadquarters: false, status: 'Active' }
  ]);

  const [dbDepartments, setDbDepartments] = useState([
    { id: '1', branchId: '1', branchName: 'Delhi Main Branch', code: 'DEP-SCM', name: 'Supply Chain & Logistics', description: 'Manages warehouse stocking and distribution routes.', status: 'Active' },
    { id: '2', branchId: '1', branchName: 'Delhi Main Branch', code: 'DEP-SLS', name: 'Field Sales & Distribution', description: 'Oversees trade marketing and key accounts.', status: 'Active' },
    { id: '3', branchId: '2', branchName: 'Mumbai West Depot', code: 'DEP-FIN', name: 'Finance & Accounts', description: 'Handles vendor payments and invoicing ledgers.', status: 'Active' }
  ]);

  const [dbDesignations, setDbDesignations] = useState([
    { id: '1', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'DSG-DIR', title: 'Managing Director', level: 1, approvalLimit: 5000000, status: 'Active' },
    { id: '2', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'DSG-RSM', title: 'Regional Sales Manager', level: 3, approvalLimit: 500000, status: 'Active' },
    { id: '3', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'DSG-SO', title: 'Sales Officer', level: 5, approvalLimit: 50000, status: 'Active' }
  ]);

  const [dbEmployees, setDbEmployees] = useState([
    { id: '1', companyId: '1', branchId: '1', departmentId: '2', designationId: '2', employeeCode: 'EMP-1001', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.k@ink-fmcg.com', phone: '+91 98100 12345', joiningDate: '2022-04-15', salary: 120000, status: 'Active' },
    { id: '2', companyId: '1', branchId: '2', departmentId: '3', designationId: '3', employeeCode: 'EMP-1002', firstName: 'Sunita', lastName: 'Sharma', email: 'sunita.s@ink-fmcg.com', phone: '+91 98200 54321', joiningDate: '2023-01-10', salary: 65000, status: 'Active' }
  ]);

  const [dbProducts, setDbProducts] = useState<Product[]>([
    { id: '1', code: 'PROD-001', name: 'Premium Basmati Rice 5kg', category: 'Food & Grains', brand: 'India Gate', unit: 'Bag', price: 650, taxRate: 5, stockLevel: 1420, status: 'Active' },
    { id: '2', code: 'PROD-002', name: 'Refined Sunflower Oil 1L', category: 'Edible Oils', brand: 'Fortune', unit: 'Bottle', price: 145, taxRate: 5, stockLevel: 2800, status: 'Active' },
    { id: '3', code: 'PROD-003', name: 'Organic Turmeric Powder 200g', category: 'Spices', brand: 'Tata Sampann', unit: 'Packet', price: 65, taxRate: 5, stockLevel: 820, status: 'Active' },
    { id: '4', code: 'PROD-004', name: 'Ultra-Soft Bath Tissue 4-Rolls', category: 'Hygiene & Paper', brand: 'Origami', unit: 'Pack', price: 180, taxRate: 18, stockLevel: 320, status: 'Active' },
    { id: '5', code: 'PROD-005', name: 'Instant Coffee Classic 100g', category: 'Beverages', brand: 'Nescafe', unit: 'Jar', price: 320, taxRate: 18, stockLevel: 0, status: 'Inactive' }
  ]);

  const [dbCategories, setDbCategories] = useState<Category[]>([
    { id: '1', code: 'CAT-001', name: 'Food & Grains', description: 'Essential raw rice, wheat flour, and pulses.', productCount: 42, status: 'Active' },
    { id: '2', code: 'CAT-002', name: 'Edible Oils', description: 'Cooking oils, ghee, and vegetable fats.', productCount: 18, status: 'Active' },
    { id: '3', code: 'CAT-003', name: 'Spices', description: 'Whole spices, blends, and culinary herbs.', productCount: 35, status: 'Active' },
    { id: '4', code: 'CAT-004', name: 'Hygiene & Paper', description: 'Tissues, toilet paper, and cleaning rolls.', productCount: 14, status: 'Active' }
  ]);

  const [dbBrands, setDbBrands] = useState<Brand[]>([
    { id: '1', code: 'BRND-001', name: 'India Gate', origin: 'India', productCount: 12, status: 'Active' },
    { id: '2', code: 'BRND-002', name: 'Fortune', origin: 'India', productCount: 24, status: 'Active' },
    { id: '3', code: 'BRND-003', name: 'Tata Sampann', origin: 'India', productCount: 31, status: 'Active' },
    { id: '4', code: 'BRND-004', name: 'Origami', origin: 'Japan', productCount: 8, status: 'Active' }
  ]);

  const [dbUnits, setDbUnits] = useState<Unit[]>([
    { id: '1', code: 'UOM-KG', name: 'Kilograms', baseUnit: 'Gram', conversionFactor: 1000, status: 'Active' },
    { id: '2', code: 'UOM-BAG', name: 'Bag (5kg)', baseUnit: 'Kilogram', conversionFactor: 5, status: 'Active' },
    { id: '3', code: 'UOM-BTL', name: 'Bottle (1L)', baseUnit: 'Milliliter', conversionFactor: 1000, status: 'Active' },
    { id: '4', code: 'UOM-PKT', name: 'Packet', baseUnit: 'Piece', conversionFactor: 1, status: 'Active' }
  ]);

  const [dbWarehouses, setDbWarehouses] = useState<Warehouse[]>([
    { id: '1', code: 'WH-DEL-HQ', name: 'Delhi Central Depot', address: 'Plot 45, Okhla Industrial Area Phase III, Delhi', capacitySft: 150000, manager: 'Aman Deep', status: 'Active' },
    { id: '2', code: 'WH-MUM-W1', name: 'Mumbai West Logistics', address: 'Bldg 3A, JNPT Port Road, Nhava Sheva, Mumbai', capacitySft: 220000, manager: 'Rohan Joshi', status: 'Active' }
  ]);

  const [dbCustomers, setDbCustomers] = useState<Customer[]>([
    { id: '1', code: 'CUST-201', name: 'Apex Retail Distributors', contact: '+91 98110 24512', email: 'billing@apexretail.com', balance: 425000, region: 'North', status: 'Active' },
    { id: '2', code: 'CUST-202', name: 'Kishore Kirana Supermart', contact: '+91 99334 12544', email: 'kishore@kiranamart.in', balance: 18000, region: 'North', status: 'Active' }
  ]);

  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([
    { id: '1', code: 'SUPP-301', name: 'Hindustan Unilever Limited', contact: '+91 22441 55620', email: 'b2b.support@hul.com', balance: 3450000, category: 'National Brand Packaged', status: 'Active' },
    { id: '2', code: 'SUPP-302', name: 'Britannia Industries Ltd', contact: '+91 80252 44120', email: 'sales.hq@britannia.co.in', balance: 1250000, category: 'Bakery & Biscuits', status: 'Active' }
  ]);

  const [dbReps, setDbReps] = useState<SalesRep[]>([
    { id: '1', code: 'REP-401', name: 'Amit Sharma', contact: '+91 98101 24510', email: 'amit.sharma@ink-fmcg.com', region: 'Delhi NCR', target: 2500000, status: 'Active' },
    { id: '2', code: 'REP-402', name: 'Priya Patel', contact: '+91 91124 55612', email: 'priya.patel@ink-fmcg.com', region: 'Mumbai Metro', target: 3000000, status: 'Active' }
  ]);

  // UI Navigation & State Control
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'empty' | 'error' | 'denied'>('normal');
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

  // Form Fields State for all 12 Enterprise Entities
  const [formCode, setFormCode] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autosaveMsg, setAutosaveMsg] = useState('');

  // 1. Company Specific
  const [compLegalName, setCompLegalName] = useState('');
  const [compTradeName, setCompTradeName] = useState('');
  const [compGstin, setCompGstin] = useState('');
  const [compPan, setCompPan] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compCurrency, setCompCurrency] = useState('INR');

  // Address (Shared across Company, Branch, Warehouse, Supplier, Customer)
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrCountry, setAddrCountry] = useState('India');

  // 2. Branch Specific
  const [branchCompanyId, setBranchCompanyId] = useState('1');
  const [branchName, setBranchName] = useState('');
  const [branchGstin, setBranchGstin] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchEmail, setBranchEmail] = useState('');
  const [branchIsHq, setBranchIsHq] = useState(false);

  // 3. Department Specific
  const [deptBranchId, setDeptBranchId] = useState('1');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // 4. Designation Specific
  const [desigCompanyId, setDesigCompanyId] = useState('1');
  const [desigTitle, setDesigTitle] = useState('');
  const [desigLevel, setDesigLevel] = useState<number>(1);
  const [desigApprovalLimit, setDesigApprovalLimit] = useState<number>(0);

  // 5. UOM Specific
  const [uomCompanyId, setUomCompanyId] = useState('1');
  const [uomName, setUomName] = useState('');
  const [uomBaseCode, setUomBaseCode] = useState('Piece');
  const [uomConversionFactor, setUomConversionFactor] = useState<number>(1);
  const [uomIsFractional, setUomIsFractional] = useState(false);

  // 6. Brand Specific
  const [brandCompanyId, setBrandCompanyId] = useState('1');
  const [brandName, setBrandName] = useState('');
  const [brandManufacturer, setBrandManufacturer] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('India');

  // 7. Category Specific
  const [catCompanyId, setCatCompanyId] = useState('1');
  const [catName, setCatName] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [catGstRate, setCatGstRate] = useState<number>(5);
  const [catHsnDefault, setCatHsnDefault] = useState('');

  // 8. Warehouse Specific
  const [whCompanyId, setWhCompanyId] = useState('1');
  const [whBranchId, setWhBranchId] = useState('1');
  const [whName, setWhName] = useState('');
  const [whType, setWhType] = useState('Central Depot');
  const [whCapacitySqFt, setWhCapacitySqFt] = useState<number>(50000);
  const [whTempControl, setWhTempControl] = useState(false);

  // 9. Product Specific
  const [prodCompanyId, setProdCompanyId] = useState('1');
  const [prodCategoryId, setProdCategoryId] = useState('1');
  const [prodBrandId, setProdBrandId] = useState('1');
  const [prodBaseUomId, setProdBaseUomId] = useState('1');
  const [prodName, setProdName] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodHsnCode, setProdHsnCode] = useState('1006.30');
  const [prodGstRate, setProdGstRate] = useState<number>(5);
  const [prodMrp, setProdMrp] = useState<number>(750);
  const [prodBasePrice, setProdBasePrice] = useState<number>(650);
  const [prodMinOrderQty, setProdMinOrderQty] = useState<number>(1);
  const [prodShelfLifeDays, setProdShelfLifeDays] = useState<number>(365);
  const [prodIsBatchTracked, setProdIsBatchTracked] = useState(true);

  // 10. Supplier Specific
  const [suppCompanyId, setSuppCompanyId] = useState('1');
  const [suppLegalName, setSuppLegalName] = useState('');
  const [suppTradeName, setSuppTradeName] = useState('');
  const [suppContactPerson, setSuppContactPerson] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppGstin, setSuppGstin] = useState('');
  const [suppPan, setSuppPan] = useState('');
  const [suppCreditLimit, setSuppCreditLimit] = useState<number>(100000);
  const [suppPaymentTermsDays, setSuppPaymentTermsDays] = useState<number>(30);

  // 11. Customer Specific
  const [custCompanyId, setCustCompanyId] = useState('1');
  const [custLegalName, setCustLegalName] = useState('');
  const [custType, setCustType] = useState('Retailer');
  const [custContactPerson, setCustContactPerson] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custPan, setCustPan] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState<number>(50000);
  const [custCreditDays, setCustCreditDays] = useState<number>(15);
  const [custSalesRouteId, setCustSalesRouteId] = useState('');

  // 12. Employee Specific
  const [empCompanyId, setEmpCompanyId] = useState('1');
  const [empBranchId, setEmpBranchId] = useState('1');
  const [empDepartmentId, setEmpDepartmentId] = useState('1');
  const [empDesignationId, setEmpDesignationId] = useState('1');
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empJoiningDate, setEmpJoiningDate] = useState('2026-01-01');
  const [empSalary, setEmpSalary] = useState<number>(45000);

  // Security Policies state for Representatives
  const [secAccountStatus, setSecAccountStatus] = useState<'Active' | 'Disabled'>('Active');
  const [secLockAccount, setSecLockAccount] = useState<boolean>(false);
  const [secRequireFace, setSecRequireFace] = useState<boolean>(true);
  const [secRequireGps, setSecRequireGps] = useState<boolean>(false);

  // Fetch real backend data on mount or module change
  useEffect(() => {
    setMode('list');
    setSelectedId(null);
    setSearchQuery('');
    setSelectedIds([]);
    setFormErrors({});
    setAttachment(null);
    setAutosaveMsg('');

    async function loadLiveData() {
      try {
        if (module === 'companies' || module === 'masters/companies') {
          const apiData = await masterDataService.fetchCompanies();
          if (apiData && apiData.length > 0) {
            setDbCompanies(apiData.map(c => ({
              id: c.id, code: c.code, legalName: c.legalName, tradeName: c.tradeName || c.legalName,
              gstin: c.taxRegistrationNumber || '', pan: c.panNumber || '', email: c.email, phone: c.phone, currency: c.currencyCode || 'INR', status: c.isActive ? 'Active' : 'Inactive',
              addressLine1: c.addressLine1 || '', city: c.city || '', state: c.state || '', postalCode: c.postalCode || '', country: c.country || 'India'
            })));
          }
        } else if (module === 'branches' || module === 'masters/branches') {
          const apiData = await masterDataService.fetchBranches();
          if (apiData && apiData.length > 0) {
            setDbBranches(apiData.map(b => ({
              id: b.id, companyId: b.companyId, companyName: b.companyName || 'Company', code: b.code, name: b.name,
              gstin: b.gstin || '', phone: b.phone || '', email: b.email || '', addressLine1: b.addressLine1 || '',
              city: b.city || '', state: b.state || '', postalCode: b.postalCode || '', country: b.country || 'India',
              isHeadquarters: b.isHeadquarters, status: b.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'departments' || module === 'masters/departments') {
          const apiData = await masterDataService.fetchDepartments();
          if (apiData && apiData.length > 0) {
            setDbDepartments(apiData.map(d => ({
              id: d.id, branchId: d.branchId, branchName: d.branchName || 'Branch', code: d.code, name: d.name,
              description: d.description || '', status: d.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'designations' || module === 'masters/designations') {
          const apiData = await masterDataService.fetchDesignations();
          if (apiData && apiData.length > 0) {
            setDbDesignations(apiData.map(d => ({
              id: d.id, companyId: d.companyId, companyName: d.companyName || 'Company', code: d.code, title: d.title,
              level: d.level, approvalLimit: d.approvalLimit || 0, status: d.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'employees' || module === 'masters/employees') {
          const apiData = await masterDataService.fetchEmployees();
          if (apiData && apiData.length > 0) {
            setDbEmployees(apiData.map(e => ({
              id: e.id, companyId: e.companyId, branchId: e.branchId, departmentId: e.departmentId, designationId: e.designationId,
              employeeCode: e.employeeCode, firstName: e.firstName, lastName: e.lastName, email: e.email, phone: e.phone,
              joiningDate: e.joiningDate.split('T')[0], salary: e.salary || 0, status: e.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'products' || module === 'masters/products') {
          const apiProducts = await masterDataService.fetchProducts();
          if (apiProducts && apiProducts.length > 0) {
            setDbProducts(apiProducts.map(p => ({
              id: p.id, code: p.code, name: p.name, category: p.categoryName || 'General', brand: p.brandName || 'Standard',
              unit: p.baseUomCode || 'Pcs', price: p.basePrice, taxRate: p.gstRatePercent, stockLevel: 100, status: p.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'categories' || module === 'masters/categories') {
          const apiCategories = await masterDataService.fetchCategories();
          if (apiCategories && apiCategories.length > 0) {
            setDbCategories(apiCategories.map(c => ({
              id: c.id, code: c.code, name: c.name, description: c.hsnCodeDefault || 'Category', productCount: 0, status: c.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'brands' || module === 'masters/brands') {
          const apiBrands = await masterDataService.fetchBrands();
          if (apiBrands && apiBrands.length > 0) {
            setDbBrands(apiBrands.map(b => ({
              id: b.id, code: b.code, name: b.name, origin: b.originCountry || 'India', productCount: 0, status: b.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'units' || module === 'masters/units') {
          const apiUnits = await masterDataService.fetchUnitsOfMeasure();
          if (apiUnits && apiUnits.length > 0) {
            setDbUnits(apiUnits.map(u => ({
              id: u.id, code: u.code, name: u.name, baseUnit: u.baseUnitCode, conversionFactor: u.conversionFactor, status: u.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'warehouses' || module === 'masters/warehouses') {
          const apiWarehouses = await masterDataService.fetchWarehouses();
          if (apiWarehouses && apiWarehouses.length > 0) {
            setDbWarehouses(apiWarehouses.map(w => ({
              id: w.id, code: w.code, name: w.name, address: `${w.addressLine1}, ${w.city}`, capacitySft: w.capacitySqFt || 50000, manager: w.warehouseType, status: w.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'customers' || module === 'masters/customers') {
          const apiCustomers = await masterDataService.fetchCustomers();
          if (apiCustomers && apiCustomers.length > 0) {
            setDbCustomers(apiCustomers.map(c => ({
              id: c.id, code: c.code, name: c.legalName, contact: c.phone, email: c.email, balance: c.creditLimit, region: c.state, status: c.isActive ? 'Active' : 'Inactive'
            })));
          }
        } else if (module === 'suppliers' || module === 'masters/suppliers') {
          const apiSuppliers = await masterDataService.fetchSuppliers();
          if (apiSuppliers && apiSuppliers.length > 0) {
            setDbSuppliers(apiSuppliers.map(s => ({
              id: s.id, code: s.code, name: s.legalName, contact: s.phone, email: s.email, balance: s.creditLimit || 0, category: s.tradeName || 'Vendor', status: s.isActive ? 'Active' : 'Inactive'
            })));
          }
        }
      } catch (err) {
        console.error('Failed loading live master data:', err);
      }
    }
    loadLiveData();
  }, [module]);

  // Load selected record into form upon entering Edit/View mode
  const populateForm = (id: string) => {
    setFormErrors({});
    setAttachment(null);
    setAutosaveMsg('');
    
    if (module === 'companies' || module === 'masters/companies') {
      const x = dbCompanies.find(c => c.id === id);
      if (x) {
        setFormCode(x.code); setCompLegalName(x.legalName); setCompTradeName(x.tradeName); setCompGstin(x.gstin);
        setCompPan(x.pan); setCompEmail(x.email); setCompPhone(x.phone); setCompCurrency(x.currency); setFormStatus(x.status as any);
        setAddrLine1(x.addressLine1); setAddrCity(x.city); setAddrState(x.state); setAddrPostalCode(x.postalCode); setAddrCountry(x.country);
      }
    } else if (module === 'branches' || module === 'masters/branches') {
      const x = dbBranches.find(b => b.id === id);
      if (x) {
        setFormCode(x.code); setBranchName(x.name); setBranchCompanyId(x.companyId); setBranchGstin(x.gstin); setBranchPhone(x.phone);
        setBranchEmail(x.email); setBranchIsHq(x.isHeadquarters); setFormStatus(x.status as any);
        setAddrLine1(x.addressLine1); setAddrCity(x.city); setAddrState(x.state); setAddrPostalCode(x.postalCode); setAddrCountry(x.country);
      }
    } else if (module === 'departments' || module === 'masters/departments') {
      const x = dbDepartments.find(d => d.id === id);
      if (x) {
        setFormCode(x.code); setDeptName(x.name); setDeptBranchId(x.branchId); setDeptDesc(x.description); setFormStatus(x.status as any);
      }
    } else if (module === 'designations' || module === 'masters/designations') {
      const x = dbDesignations.find(d => d.id === id);
      if (x) {
        setFormCode(x.code); setDesigTitle(x.title); setDesigCompanyId(x.companyId); setDesigLevel(x.level); setDesigApprovalLimit(x.approvalLimit); setFormStatus(x.status as any);
      }
    } else if (module === 'employees' || module === 'masters/employees') {
      const x = dbEmployees.find(e => e.id === id);
      if (x) {
        setFormCode(x.employeeCode); setEmpFirstName(x.firstName); setEmpLastName(x.lastName); setEmpEmail(x.email); setEmpPhone(x.phone);
        setEmpCompanyId(x.companyId); setEmpBranchId(x.branchId); setEmpDepartmentId(x.departmentId); setEmpDesignationId(x.designationId);
        setEmpJoiningDate(x.joiningDate); setEmpSalary(x.salary); setFormStatus(x.status as any);
      }
    } else if (module === 'products' || module === 'masters/products') {
      const x = dbProducts.find(p => p.id === id);
      if (x) {
        setFormCode(x.code); setProdName(x.name); setProdBasePrice(x.price); setProdGstRate(x.taxRate); setFormStatus(x.status as any);
      }
    } else if (module === 'categories' || module === 'masters/categories') {
      const x = dbCategories.find(c => c.id === id);
      if (x) {
        setFormCode(x.code); setCatName(x.name); setCatHsnDefault(x.description); setFormStatus(x.status as any);
      }
    } else if (module === 'brands' || module === 'masters/brands') {
      const x = dbBrands.find(b => b.id === id);
      if (x) {
        setFormCode(x.code); setBrandName(x.name); setBrandOrigin(x.origin); setFormStatus(x.status as any);
      }
    } else if (module === 'units' || module === 'masters/units') {
      const x = dbUnits.find(u => u.id === id);
      if (x) {
        setFormCode(x.code); setUomName(x.name); setUomBaseCode(x.baseUnit); setUomConversionFactor(x.conversionFactor); setFormStatus(x.status as any);
      }
    } else if (module === 'warehouses' || module === 'masters/warehouses') {
      const x = dbWarehouses.find(w => w.id === id);
      if (x) {
        setFormCode(x.code); setWhName(x.name); setWhCapacitySqFt(x.capacitySft); setWhType(x.manager); setFormStatus(x.status as any);
      }
    } else if (module === 'customers' || module === 'masters/customers') {
      const x = dbCustomers.find(c => c.id === id);
      if (x) {
        setFormCode(x.code); setCustLegalName(x.name); setCustPhone(x.contact); setCustEmail(x.email); setCustCreditLimit(x.balance); setFormStatus(x.status as any);
      }
    } else if (module === 'suppliers' || module === 'masters/suppliers') {
      const x = dbSuppliers.find(s => s.id === id);
      if (x) {
        setFormCode(x.code); setSuppLegalName(x.name); setSuppPhone(x.contact); setSuppEmail(x.email); setSuppCreditLimit(x.balance); setFormStatus(x.status as any);
      }
    }
  };

  // Dedicated Form Validation and Submission Logic
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formCode.trim()) errors.code = 'Code identifier is required.';

    if (module === 'companies' || module === 'masters/companies') {
      if (!compLegalName.trim()) errors.legalName = 'Legal Name is required.';
      if (compGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(compGstin)) {
        errors.gstin = 'Invalid GSTIN format (e.g. 07AAAAA0000A1Z5).';
      }
      if (compEmail && !compEmail.includes('@')) errors.email = 'Valid corporate email required.';
    } else if (module === 'branches' || module === 'masters/branches') {
      if (!branchName.trim()) errors.branchName = 'Branch Name is required.';
    } else if (module === 'departments' || module === 'masters/departments') {
      if (!deptName.trim()) errors.deptName = 'Department Name is required.';
    } else if (module === 'designations' || module === 'masters/designations') {
      if (!desigTitle.trim()) errors.desigTitle = 'Designation Title is required.';
    } else if (module === 'employees' || module === 'masters/employees') {
      if (!empFirstName.trim()) errors.empFirstName = 'First Name is required.';
      if (!empLastName.trim()) errors.empLastName = 'Last Name is required.';
      if (!empEmail.includes('@')) errors.empEmail = 'Valid email is required.';
    } else if (module === 'products' || module === 'masters/products') {
      if (!prodName.trim()) errors.prodName = 'Product Name is required.';
    } else if (module === 'categories' || module === 'masters/categories') {
      if (!catName.trim()) errors.catName = 'Category Name is required.';
    } else if (module === 'brands' || module === 'masters/brands') {
      if (!brandName.trim()) errors.brandName = 'Brand Name is required.';
    } else if (module === 'units' || module === 'masters/units') {
      if (!uomName.trim()) errors.uomName = 'Unit Name is required.';
    } else if (module === 'warehouses' || module === 'masters/warehouses') {
      if (!whName.trim()) errors.whName = 'Warehouse Name is required.';
    } else if (module === 'customers' || module === 'masters/customers') {
      if (!custLegalName.trim()) errors.custLegalName = 'Legal Name is required.';
    } else if (module === 'suppliers' || module === 'masters/suppliers') {
      if (!suppLegalName.trim()) errors.suppLegalName = 'Legal Name is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      onTriggerToast('error', 'Validation Error', 'Please check the highlighted form fields.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const isNew = mode === 'create';

      if (module === 'companies' || module === 'masters/companies') {
        if (isNew) {
          const item = {
            id: String(dbCompanies.length + 1), code: formCode, legalName: compLegalName, tradeName: compTradeName || compLegalName,
            gstin: compGstin, pan: compPan, email: compEmail, phone: compPhone, currency: compCurrency, status: formStatus,
            addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry
          };
          setDbCompanies([...dbCompanies, item]);
          masterDataService.createCompany({ code: formCode, legalName: compLegalName, tradeName: compTradeName, taxRegistrationNumber: compGstin, panNumber: compPan, email: compEmail, phone: compPhone, currencyCode: compCurrency, isActive: formStatus === 'Active', addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry });
        } else {
          setDbCompanies(dbCompanies.map(c => c.id === selectedId ? { ...c, code: formCode, legalName: compLegalName, tradeName: compTradeName, gstin: compGstin, pan: compPan, email: compEmail, phone: compPhone, currency: compCurrency, status: formStatus, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry } : c));
        }
      } else if (module === 'branches' || module === 'masters/branches') {
        const comp = dbCompanies.find(c => c.id === branchCompanyId)?.legalName || 'INK FMCG';
        if (isNew) {
          setDbBranches([...dbBranches, { id: String(dbBranches.length + 1), companyId: branchCompanyId, companyName: comp, code: formCode, name: branchName, gstin: branchGstin, phone: branchPhone, email: branchEmail, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry, isHeadquarters: branchIsHq, status: formStatus }]);
          masterDataService.createBranch({ companyId: branchCompanyId, code: formCode, name: branchName, gstin: branchGstin, phone: branchPhone, email: branchEmail, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry, isHeadquarters: branchIsHq, isActive: formStatus === 'Active' });
        } else {
          setDbBranches(dbBranches.map(b => b.id === selectedId ? { ...b, companyId: branchCompanyId, companyName: comp, code: formCode, name: branchName, gstin: branchGstin, phone: branchPhone, email: branchEmail, isHeadquarters: branchIsHq, status: formStatus } : b));
        }
      } else if (module === 'departments' || module === 'masters/departments') {
        const br = dbBranches.find(b => b.id === deptBranchId)?.name || 'Main Branch';
        if (isNew) {
          setDbDepartments([...dbDepartments, { id: String(dbDepartments.length + 1), branchId: deptBranchId, branchName: br, code: formCode, name: deptName, description: deptDesc, status: formStatus }]);
          masterDataService.createDepartment({ branchId: deptBranchId, code: formCode, name: deptName, description: deptDesc, isActive: formStatus === 'Active' });
        } else {
          setDbDepartments(dbDepartments.map(d => d.id === selectedId ? { ...d, branchId: deptBranchId, branchName: br, code: formCode, name: deptName, description: deptDesc, status: formStatus } : d));
        }
      } else if (module === 'designations' || module === 'masters/designations') {
        const comp = dbCompanies.find(c => c.id === desigCompanyId)?.legalName || 'INK FMCG';
        if (isNew) {
          setDbDesignations([...dbDesignations, { id: String(dbDesignations.length + 1), companyId: desigCompanyId, companyName: comp, code: formCode, title: desigTitle, level: desigLevel, approvalLimit: desigApprovalLimit, status: formStatus }]);
          masterDataService.createDesignation({ companyId: desigCompanyId, code: formCode, title: desigTitle, level: desigLevel, approvalLimit: desigApprovalLimit, isActive: formStatus === 'Active' });
        } else {
          setDbDesignations(dbDesignations.map(d => d.id === selectedId ? { ...d, companyId: desigCompanyId, companyName: comp, code: formCode, title: desigTitle, level: desigLevel, approvalLimit: desigApprovalLimit, status: formStatus } : d));
        }
      } else if (module === 'employees' || module === 'masters/employees') {
        if (isNew) {
          setDbEmployees([...dbEmployees, { id: String(dbEmployees.length + 1), companyId: empCompanyId, branchId: empBranchId, departmentId: empDepartmentId, designationId: empDesignationId, employeeCode: formCode, firstName: empFirstName, lastName: empLastName, email: empEmail, phone: empPhone, joiningDate: empJoiningDate, salary: empSalary, status: formStatus }]);
          masterDataService.createEmployee({ companyId: empCompanyId, branchId: empBranchId, departmentId: empDepartmentId, designationId: empDesignationId, employeeCode: formCode, firstName: empFirstName, lastName: empLastName, email: empEmail, phone: empPhone, joiningDate: empJoiningDate, salary: empSalary, isActive: formStatus === 'Active' });
        } else {
          setDbEmployees(dbEmployees.map(e => e.id === selectedId ? { ...e, companyId: empCompanyId, branchId: empBranchId, departmentId: empDepartmentId, designationId: empDesignationId, employeeCode: formCode, firstName: empFirstName, lastName: empLastName, email: empEmail, phone: empPhone, joiningDate: empJoiningDate, salary: empSalary, status: formStatus } : e));
        }
      } else if (module === 'products' || module === 'masters/products') {
        const catName = dbCategories.find(c => c.id === prodCategoryId)?.name || 'Food';
        const brandName = dbBrands.find(b => b.id === prodBrandId)?.name || 'Generic';
        const uomCode = dbUnits.find(u => u.id === prodBaseUomId)?.code || 'Bag';
        if (isNew) {
          setDbProducts([...dbProducts, { id: String(dbProducts.length + 1), code: formCode, name: prodName, category: catName, brand: brandName, unit: uomCode, price: prodBasePrice, taxRate: prodGstRate, stockLevel: 100, status: formStatus }]);
          masterDataService.createProduct({ companyId: prodCompanyId, categoryId: prodCategoryId, brandId: prodBrandId, baseUomId: prodBaseUomId, code: formCode, name: prodName, sku: formCode, barcode: prodBarcode, hsnCode: prodHsnCode, gstRatePercent: prodGstRate, mrp: prodMrp, basePrice: prodBasePrice, minOrderQty: prodMinOrderQty, shelfLifeDays: prodShelfLifeDays, isBatchTracked: prodIsBatchTracked, isActive: formStatus === 'Active' });
        } else {
          setDbProducts(dbProducts.map(p => p.id === selectedId ? { ...p, code: formCode, name: prodName, category: catName, brand: brandName, unit: uomCode, price: prodBasePrice, taxRate: prodGstRate, status: formStatus } : p));
        }
      } else if (module === 'categories' || module === 'masters/categories') {
        if (isNew) {
          setDbCategories([...dbCategories, { id: String(dbCategories.length + 1), code: formCode, name: catName, description: catHsnDefault, productCount: 0, status: formStatus }]);
          masterDataService.createCategory({ companyId: catCompanyId, code: formCode, name: catName, parentCategoryId: catParentId || undefined, gstTaxRatePercent: catGstRate, hsnCodeDefault: catHsnDefault, isActive: formStatus === 'Active' });
        } else {
          setDbCategories(dbCategories.map(c => c.id === selectedId ? { ...c, code: formCode, name: catName, description: catHsnDefault, status: formStatus } : c));
        }
      } else if (module === 'brands' || module === 'masters/brands') {
        if (isNew) {
          setDbBrands([...dbBrands, { id: String(dbBrands.length + 1), code: formCode, name: brandName, origin: brandOrigin, productCount: 0, status: formStatus }]);
          masterDataService.createBrand({ companyId: brandCompanyId, code: formCode, name: brandName, manufacturerName: brandManufacturer, originCountry: brandOrigin, isActive: formStatus === 'Active' });
        } else {
          setDbBrands(dbBrands.map(b => b.id === selectedId ? { ...b, code: formCode, name: brandName, origin: brandOrigin, status: formStatus } : b));
        }
      } else if (module === 'units' || module === 'masters/units') {
        if (isNew) {
          setDbUnits([...dbUnits, { id: String(dbUnits.length + 1), code: formCode, name: uomName, baseUnit: uomBaseCode, conversionFactor: uomConversionFactor, status: formStatus }]);
          masterDataService.createUnitOfMeasure({ companyId: uomCompanyId, code: formCode, name: uomName, baseUnitCode: uomBaseCode, conversionFactor: uomConversionFactor, isFractionalAllowed: uomIsFractional, isActive: formStatus === 'Active' });
        } else {
          setDbUnits(dbUnits.map(u => u.id === selectedId ? { ...u, code: formCode, name: uomName, baseUnit: uomBaseCode, conversionFactor: uomConversionFactor, status: formStatus } : u));
        }
      } else if (module === 'warehouses' || module === 'masters/warehouses') {
        if (isNew) {
          setDbWarehouses([...dbWarehouses, { id: String(dbWarehouses.length + 1), code: formCode, name: whName, address: `${addrLine1}, ${addrCity}`, capacitySft: whCapacitySqFt, manager: whType, status: formStatus }]);
          masterDataService.createWarehouse({ companyId: whCompanyId, branchId: whBranchId, code: formCode, name: whName, warehouseType: whType, capacitySqFt: whCapacitySqFt, isTemperatureControlled: whTempControl, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry, isActive: formStatus === 'Active' });
        } else {
          setDbWarehouses(dbWarehouses.map(w => w.id === selectedId ? { ...w, code: formCode, name: whName, manager: whType, capacitySft: whCapacitySqFt, status: formStatus } : w));
        }
      } else if (module === 'customers' || module === 'masters/customers') {
        if (isNew) {
          setDbCustomers([...dbCustomers, { id: String(dbCustomers.length + 1), code: formCode, name: custLegalName, contact: custPhone, email: custEmail, balance: custCreditLimit, region: addrState || 'National', status: formStatus }]);
          masterDataService.createCustomer({ companyId: custCompanyId, code: formCode, legalName: custLegalName, customerType: custType, email: custEmail, phone: custPhone, gstin: custGstin, pan: custPan, creditLimit: custCreditLimit, creditDays: custCreditDays, routeId: custSalesRouteId || undefined, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry, isActive: formStatus === 'Active' });
        } else {
          setDbCustomers(dbCustomers.map(c => c.id === selectedId ? { ...c, code: formCode, name: custLegalName, contact: custPhone, email: custEmail, balance: custCreditLimit, status: formStatus } : c));
        }
      } else if (module === 'suppliers' || module === 'masters/suppliers') {
        if (isNew) {
          setDbSuppliers([...dbSuppliers, { id: String(dbSuppliers.length + 1), code: formCode, name: suppLegalName, contact: suppPhone, email: suppEmail, balance: suppCreditLimit, category: suppTradeName || 'Packaged Goods', status: formStatus }]);
          masterDataService.createSupplier({ companyId: suppCompanyId, code: formCode, legalName: suppLegalName, tradeName: suppTradeName, email: suppEmail, phone: suppPhone, gstin: suppGstin, pan: suppPan, creditLimit: suppCreditLimit, paymentTermsDays: suppPaymentTermsDays, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry, isActive: formStatus === 'Active' });
        } else {
          setDbSuppliers(dbSuppliers.map(s => s.id === selectedId ? { ...s, code: formCode, name: suppLegalName, contact: suppPhone, email: suppEmail, balance: suppCreditLimit, status: formStatus } : s));
        }
      }

      setIsSaving(false);
      onTriggerToast('success', `${config.singular} Saved`, `Master record has been configured successfully.`);
      setMode('list');
      setSelectedId(null);
    }, 500);
  };

  // Helper for single record deletion
  const handleSingleDelete = (id: string, name: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    if (module === 'companies' || module === 'masters/companies') setDbCompanies(dbCompanies.filter(x => x.id !== deleteId));
    else if (module === 'branches' || module === 'masters/branches') setDbBranches(dbBranches.filter(x => x.id !== deleteId));
    else if (module === 'departments' || module === 'masters/departments') setDbDepartments(dbDepartments.filter(x => x.id !== deleteId));
    else if (module === 'designations' || module === 'masters/designations') setDbDesignations(dbDesignations.filter(x => x.id !== deleteId));
    else if (module === 'employees' || module === 'masters/employees') setDbEmployees(dbEmployees.filter(x => x.id !== deleteId));
    else if (module === 'products' || module === 'masters/products') setDbProducts(dbProducts.filter(x => x.id !== deleteId));
    else if (module === 'categories' || module === 'masters/categories') setDbCategories(dbCategories.filter(x => x.id !== deleteId));
    else if (module === 'brands' || module === 'masters/brands') setDbBrands(dbBrands.filter(x => x.id !== deleteId));
    else if (module === 'units' || module === 'masters/units') setDbUnits(dbUnits.filter(x => x.id !== deleteId));
    else if (module === 'warehouses' || module === 'masters/warehouses') setDbWarehouses(dbWarehouses.filter(x => x.id !== deleteId));
    else if (module === 'customers' || module === 'masters/customers') setDbCustomers(dbCustomers.filter(x => x.id !== deleteId));
    else if (module === 'suppliers' || module === 'masters/suppliers') setDbSuppliers(dbSuppliers.filter(x => x.id !== deleteId));

    onTriggerToast('info', 'Record Deleted', `Master record deactivated.`);
    setDeleteId(null);
  };

  // Active dataset getter
  const getActiveArray = () => {
    if (module === 'companies' || module === 'masters/companies') return dbCompanies.map(c => ({ id: c.id, code: c.code, name: c.legalName, detail1: c.gstin, detail2: c.city, numericText: c.currency, status: c.status }));
    if (module === 'branches' || module === 'masters/branches') return dbBranches.map(b => ({ id: b.id, code: b.code, name: b.name, detail1: b.companyName, detail2: b.city, numericText: b.isHeadquarters ? 'Headquarters' : 'Depot', status: b.status }));
    if (module === 'departments' || module === 'masters/departments') return dbDepartments.map(d => ({ id: d.id, code: d.code, name: d.name, detail1: d.branchName, detail2: d.description, numericText: 'Dept', status: d.status }));
    if (module === 'designations' || module === 'masters/designations') return dbDesignations.map(d => ({ id: d.id, code: d.code, name: d.title, detail1: d.companyName, detail2: `Level ${d.level}`, numericText: `Limit: ₹${d.approvalLimit.toLocaleString()}`, status: d.status }));
    if (module === 'employees' || module === 'masters/employees') return dbEmployees.map(e => ({ id: e.id, code: e.employeeCode, name: `${e.firstName} ${e.lastName}`, detail1: e.email, detail2: e.phone, numericText: `₹${e.salary.toLocaleString()}`, status: e.status }));
    if (module === 'products' || module === 'masters/products') return dbProducts.map(p => ({ id: p.id, code: p.code, name: p.name, detail1: p.category, detail2: p.brand, numericText: `₹${p.price}`, status: p.status }));
    if (module === 'categories' || module === 'masters/categories') return dbCategories.map(c => ({ id: c.id, code: c.code, name: c.name, detail1: c.description, detail2: '', numericText: `${c.productCount} SKUs`, status: c.status }));
    if (module === 'brands' || module === 'masters/brands') return dbBrands.map(b => ({ id: b.id, code: b.code, name: b.name, detail1: b.origin, detail2: '', numericText: `${b.productCount} SKUs`, status: b.status }));
    if (module === 'units' || module === 'masters/units') return dbUnits.map(u => ({ id: u.id, code: u.code, name: u.name, detail1: u.baseUnit, detail2: '', numericText: `Factor: ${u.conversionFactor}`, status: u.status }));
    if (module === 'warehouses' || module === 'masters/warehouses') return dbWarehouses.map(w => ({ id: w.id, code: w.code, name: w.name, detail1: w.manager, detail2: w.address, numericText: `${w.capacitySft.toLocaleString()} sq ft`, status: w.status }));
    if (module === 'customers' || module === 'masters/customers') return dbCustomers.map(c => ({ id: c.id, code: c.code, name: c.name, detail1: c.contact, detail2: c.email, numericText: `Limit: ₹${c.balance.toLocaleString()}`, status: c.status }));
    if (module === 'suppliers' || module === 'masters/suppliers') return dbSuppliers.map(s => ({ id: s.id, code: s.code, name: s.name, detail1: s.contact, detail2: s.email, numericText: `Limit: ₹${s.balance.toLocaleString()}`, status: s.status }));
    return dbReps.map(r => ({ id: r.id, code: r.code, name: r.name, detail1: r.contact, detail2: r.email, numericText: `Target: ₹${r.target.toLocaleString()}`, status: r.status }));
  };

  const rawRows = getActiveArray();
  const filteredRows = rawRows.filter(r => {
    const matchesSearch = r.code.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.detail1.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRows = filteredRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const ConfigIcon = config.icon;

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
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
              onClick={() => setSimulatedState(st)}
              className={`px-2 py-1 text-[9px] font-bold rounded capitalize cursor-pointer transition ${
                simulatedState === st ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* CORE DISPLAY WINDOW */}
      {simulatedState === 'loading' ? (
        <div className="bg-white p-24 border border-brand-border rounded-lg text-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
          <p className="text-xs text-brand-text-secondary font-medium">Fetching real-time organizational masters from PostgreSQL...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* LIST VIEW */}
          {mode === 'list' && (
            <div className="bg-white border border-brand-border rounded-lg shadow-sm-flat overflow-hidden flex flex-col">
              
              {/* TABLE ACTION CONTROLS BAR */}
              <div className="p-4 border-b border-brand-border bg-brand-bg-secondary/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
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
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  <button
                    onClick={() => {
                      setFormCode(`${config.singular.toUpperCase().slice(0,3)}-${Math.floor(100 + Math.random() * 900)}`);
                      setFormStatus('Active');
                      setFormErrors({});
                      setMode('create');
                    }}
                    className="px-3.5 py-1.5 bg-brand-primary text-white hover:bg-blue-700 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm transition"
                  >
                    <Plus size={13} /> Add New {config.singular}
                  </button>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead className="bg-brand-bg-secondary border-b border-brand-border sticky top-0 z-10">
                    <tr className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                      <th className="p-3 w-32">Code</th>
                      <th className="p-3">Primary Identifier / Name</th>
                      <th className="p-3 w-48">Primary Attribute</th>
                      <th className="p-3 w-48">Secondary Attribute</th>
                      <th className="p-3 w-40 text-right">Metrics / Limit</th>
                      <th className="p-3 w-28 text-center">Status</th>
                      <th className="p-3 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {paginatedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-brand-bg-secondary/40 transition text-xs">
                        <td className="p-3 font-mono font-bold text-brand-text-primary">{row.code}</td>
                        <td className="p-3 font-semibold text-brand-text-primary truncate">{row.name}</td>
                        <td className="p-3 text-brand-text-secondary truncate">{row.detail1}</td>
                        <td className="p-3 text-brand-text-secondary truncate">{row.detail2}</td>
                        <td className="p-3 text-right font-mono font-semibold">{row.numericText}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === 'Active' ? 'bg-green-50 text-brand-success border border-green-200' : 'bg-gray-50 text-brand-text-secondary border'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setSelectedId(row.id); populateForm(row.id); setMode('view'); }} className="p-1 text-brand-text-secondary hover:text-brand-primary rounded"><Eye size={13} /></button>
                            <button onClick={() => { setSelectedId(row.id); populateForm(row.id); setMode('edit'); }} className="p-1 text-brand-text-secondary hover:text-brand-primary rounded"><Edit2 size={13} /></button>
                            <button onClick={() => handleSingleDelete(row.id, row.name)} className="p-1 text-brand-text-secondary hover:text-brand-danger rounded"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-4 border-t border-brand-border bg-brand-bg-secondary/10 flex items-center justify-between text-xs">
                <span className="text-brand-text-secondary">Total {totalRows} records</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border rounded disabled:opacity-40"><ChevronLeft size={13} /></button>
                  <span className="font-bold px-2">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border rounded disabled:opacity-40"><ChevronRight size={13} /></button>
                </div>
              </div>

            </div>
          )}

          {/* CREATE & EDIT FORM MODE — TAILORED DEDICATED FORMS PER ENTITY */}
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={handleSave} className="bg-white border border-brand-border rounded-lg shadow-sm-flat p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <button
                    type="button"
                    onClick={() => { setMode('list'); setSelectedId(null); }}
                    className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline mb-2 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Back to Master Registry List
                  </button>
                  <h2 className="text-lg font-bold text-brand-text-primary">
                    {mode === 'create' ? 'Create New' : 'Edit'} {config.singular} Master Record
                  </h2>
                  <p className="text-xs text-brand-text-secondary">Configure specific business attributes in accordance with FMCG ERP Business Blueprint.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setMode('list'); setSelectedId(null); }}
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
                    {mode === 'create' ? 'Save New Record' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* DEDICATED FORM LAYOUTS FOR EVERY ENTITY */}
              
              {/* 1. COMPANY FORM */}
              {(module === 'companies' || module === 'masters/companies') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Company Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded text-brand-text-primary" placeholder="CMP-001" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Legal Entity Name <span className="text-red-500">*</span></label>
                      <input type="text" value={compLegalName} onChange={e => setCompLegalName(e.target.value)} className="w-full p-2 border rounded" placeholder="INK FMCG Private Limited" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Trade / Brand Name</label>
                      <input type="text" value={compTradeName} onChange={e => setCompTradeName(e.target.value)} className="w-full p-2 border rounded" placeholder="INK Foods" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">GSTIN (Tax ID)</label>
                      <input type="text" value={compGstin} onChange={e => setCompGstin(e.target.value)} className="w-full p-2 border rounded uppercase font-mono" placeholder="07AAAAA0000A1Z5" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">PAN Number</label>
                      <input type="text" value={compPan} onChange={e => setCompPan(e.target.value)} className="w-full p-2 border rounded uppercase font-mono" placeholder="AAAAA0000A" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Corporate Email</label>
                      <input type="email" value={compEmail} onChange={e => setCompEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="hq@ink-fmcg.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Phone Number</label>
                      <input type="text" value={compPhone} onChange={e => setCompPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="+91 11 4500 8800" />
                    </div>
                  </div>

                  <div className="p-4 bg-brand-bg-secondary/30 rounded-lg border space-y-3">
                    <h4 className="font-bold text-brand-text-primary flex items-center gap-1.5"><MapPin size={14} /> Registered Address & Base Currency</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="font-semibold text-brand-text-secondary">Address Line 1</label>
                        <input type="text" value={addrLine1} onChange={e => setAddrLine1(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Plot 101, Okhla Estate" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-brand-text-secondary">Base Currency</label>
                        <select value={compCurrency} onChange={e => setCompCurrency(e.target.value)} className="w-full p-2 border rounded bg-white font-bold">
                          <option value="INR">INR (₹ - Indian Rupee)</option>
                          <option value="USD">USD ($ - US Dollar)</option>
                          <option value="EUR">EUR (€ - Euro)</option>
                          <option value="AED">AED (Dirham)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><label className="font-semibold text-brand-text-secondary">City</label><input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="New Delhi" /></div>
                      <div><label className="font-semibold text-brand-text-secondary">State</label><input type="text" value={addrState} onChange={e => setAddrState(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Delhi" /></div>
                      <div><label className="font-semibold text-brand-text-secondary">Postal Code</label><input type="text" value={addrPostalCode} onChange={e => setAddrPostalCode(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="110020" /></div>
                      <div><label className="font-semibold text-brand-text-secondary">Country</label><input type="text" value={addrCountry} onChange={e => setAddrCountry(e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="India" /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. BRANCH FORM */}
              {(module === 'branches' || module === 'masters/branches') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Parent Company <span className="text-red-500">*</span></label>
                      <select value={branchCompanyId} onChange={e => setBranchCompanyId(e.target.value)} className="w-full p-2 border rounded bg-white font-semibold">
                        {dbCompanies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="BR-DEL-01" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch Name <span className="text-red-500">*</span></label>
                      <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} className="w-full p-2 border rounded" placeholder="Delhi Main Branch" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch GSTIN</label>
                      <input type="text" value={branchGstin} onChange={e => setBranchGstin(e.target.value)} className="w-full p-2 border rounded uppercase font-mono" placeholder="07AAAAA0000A1Z5" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch Phone</label>
                      <input type="text" value={branchPhone} onChange={e => setBranchPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="+91 11 4500 8801" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch Email</label>
                      <input type="email" value={branchEmail} onChange={e => setBranchEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="delhi@ink-fmcg.com" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded border border-blue-100">
                    <input type="checkbox" id="hqCheck" checked={branchIsHq} onChange={e => setBranchIsHq(e.target.checked)} className="w-4 h-4 text-brand-primary rounded" />
                    <label htmlFor="hqCheck" className="font-bold text-brand-text-primary cursor-pointer">Designate as Corporate Headquarters Branch</label>
                  </div>
                </div>
              )}

              {/* 3. DEPARTMENT FORM */}
              {(module === 'departments' || module === 'masters/departments') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Parent Branch <span className="text-red-500">*</span></label>
                      <select value={deptBranchId} onChange={e => setDeptBranchId(e.target.value)} className="w-full p-2 border rounded bg-white font-semibold">
                        {dbBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Department Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="DEP-SCM" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Department Name <span className="text-red-500">*</span></label>
                      <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)} className="w-full p-2 border rounded" placeholder="Supply Chain & Logistics" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-brand-text-primary">Description & Operational Mandate</label>
                    <textarea rows={3} value={deptDesc} onChange={e => setDeptDesc(e.target.value)} className="w-full p-2 border rounded" placeholder="Oversees raw material procurement, warehouse inventory, and trade routes." />
                  </div>
                </div>
              )}

              {/* 4. DESIGNATION FORM */}
              {(module === 'designations' || module === 'masters/designations') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Company <span className="text-red-500">*</span></label>
                      <select value={desigCompanyId} onChange={e => setDesigCompanyId(e.target.value)} className="w-full p-2 border rounded bg-white font-semibold">
                        {dbCompanies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Designation Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="DSG-RSM" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Designation Title <span className="text-red-500">*</span></label>
                      <input type="text" value={desigTitle} onChange={e => setDesigTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="Regional Sales Manager" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Hierarchy Level (1 = Executive, 10 = Entry)</label>
                      <input type="number" min={1} max={20} value={desigLevel} onChange={e => setDesigLevel(Number(e.target.value))} className="w-full p-2 border rounded font-mono font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Financial Approval Limit (₹)</label>
                      <input type="number" value={desigApprovalLimit} onChange={e => setDesigApprovalLimit(Number(e.target.value))} className="w-full p-2 border rounded font-mono font-bold text-brand-primary" placeholder="500000" />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. UOM FORM */}
              {(module === 'units' || module === 'masters/units') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Company</label>
                      <select value={uomCompanyId} onChange={e => setUomCompanyId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbCompanies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">UOM Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="UOM-KG" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Unit Name <span className="text-red-500">*</span></label>
                      <input type="text" value={uomName} onChange={e => setUomName(e.target.value)} className="w-full p-2 border rounded" placeholder="Kilograms" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Base Unit Reference Code</label>
                      <input type="text" value={uomBaseCode} onChange={e => setUomBaseCode(e.target.value)} className="w-full p-2 border rounded" placeholder="Gram" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Conversion Factor to Base Unit</label>
                      <input type="number" step="0.0001" value={uomConversionFactor} onChange={e => setUomConversionFactor(Number(e.target.value))} className="w-full p-2 border rounded font-mono" placeholder="1000" />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input type="checkbox" id="fracCheck" checked={uomIsFractional} onChange={e => setUomIsFractional(e.target.checked)} className="w-4 h-4 text-brand-primary rounded" />
                      <label htmlFor="fracCheck" className="font-bold text-brand-text-primary cursor-pointer">Allow Decimal / Fractional Quantities</label>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BRAND FORM */}
              {(module === 'brands' || module === 'masters/brands') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Company</label>
                      <select value={brandCompanyId} onChange={e => setBrandCompanyId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbCompanies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Brand Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="BRND-001" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Brand Name <span className="text-red-500">*</span></label>
                      <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full p-2 border rounded" placeholder="India Gate" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Manufacturer Name</label>
                      <input type="text" value={brandManufacturer} onChange={e => setBrandManufacturer(e.target.value)} className="w-full p-2 border rounded" placeholder="KRBL Limited" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Origin Country</label>
                      <input type="text" value={brandOrigin} onChange={e => setBrandOrigin(e.target.value)} className="w-full p-2 border rounded" placeholder="India" />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. CATEGORY FORM */}
              {(module === 'categories' || module === 'masters/categories') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Company</label>
                      <select value={catCompanyId} onChange={e => setCatCompanyId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbCompanies.map(c => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Category Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="CAT-001" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Category Name <span className="text-red-500">*</span></label>
                      <input type="text" value={catName} onChange={e => setCatName(e.target.value)} className="w-full p-2 border rounded" placeholder="Food & Grains" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Parent Category (Optional)</label>
                      <select value={catParentId} onChange={e => setCatParentId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        <option value="">None (Top Level Category)</option>
                        {dbCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">GST Rate % (Default)</label>
                      <select value={catGstRate} onChange={e => setCatGstRate(Number(e.target.value))} className="w-full p-2 border rounded bg-white font-mono font-bold">
                        <option value={0}>0% (Exempt)</option>
                        <option value={5}>5% (Essential Foods)</option>
                        <option value={12}>12% (Processed FMCG)</option>
                        <option value={18}>18% (Standard FMCG)</option>
                        <option value={28}>28% (Luxury Goods)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">HSN Code (Default)</label>
                      <input type="text" value={catHsnDefault} onChange={e => setCatHsnDefault(e.target.value)} className="w-full p-2 border rounded font-mono" placeholder="1006.30" />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. WAREHOUSE FORM */}
              {(module === 'warehouses' || module === 'masters/warehouses') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch Link <span className="text-red-500">*</span></label>
                      <select value={whBranchId} onChange={e => setWhBranchId(e.target.value)} className="w-full p-2 border rounded bg-white font-semibold">
                        {dbBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Warehouse Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="WH-DEL-HQ" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Warehouse Name <span className="text-red-500">*</span></label>
                      <input type="text" value={whName} onChange={e => setWhName(e.target.value)} className="w-full p-2 border rounded" placeholder="Delhi Central Depot" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Depot Type</label>
                      <select value={whType} onChange={e => setWhType(e.target.value)} className="w-full p-2 border rounded bg-white">
                        <option value="Central Depot">Central Depot</option>
                        <option value="Regional Warehouse">Regional Warehouse</option>
                        <option value="Cold Storage">Cold Storage</option>
                        <option value="Transit Hub">Transit Hub</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Capacity (Square Feet)</label>
                      <input type="number" value={whCapacitySqFt} onChange={e => setWhCapacitySqFt(Number(e.target.value))} className="w-full p-2 border rounded font-mono font-bold" placeholder="150000" />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input type="checkbox" id="tempCheck" checked={whTempControl} onChange={e => setWhTempControl(e.target.checked)} className="w-4 h-4 text-brand-primary rounded" />
                      <label htmlFor="tempCheck" className="font-bold text-brand-text-primary cursor-pointer">Temperature Controlled Facility</label>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. PRODUCT FORM */}
              {(module === 'products' || module === 'masters/products') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">SKU Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="PROD-001" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-brand-text-primary">Product Name <span className="text-red-500">*</span></label>
                      <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full p-2 border rounded" placeholder="Premium Basmati Rice 5kg" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Barcode / EAN</label>
                      <input type="text" value={prodBarcode} onChange={e => setProdBarcode(e.target.value)} className="w-full p-2 border rounded font-mono" placeholder="8901234567890" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Category</label>
                      <select value={prodCategoryId} onChange={e => setProdCategoryId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Brand</label>
                      <select value={prodBrandId} onChange={e => setProdBrandId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Base Unit of Measure</label>
                      <select value={prodBaseUomId} onChange={e => setProdBaseUomId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbUnits.map(u => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-brand-bg-secondary/30 rounded border">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">MRP (₹)</label>
                      <input type="number" value={prodMrp} onChange={e => setProdMrp(Number(e.target.value))} className="w-full p-2 border rounded bg-white font-mono font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Base B2B Price (₹)</label>
                      <input type="number" value={prodBasePrice} onChange={e => setProdBasePrice(Number(e.target.value))} className="w-full p-2 border rounded bg-white font-mono font-bold text-brand-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">GST Rate %</label>
                      <select value={prodGstRate} onChange={e => setProdGstRate(Number(e.target.value))} className="w-full p-2 border rounded bg-white font-mono">
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">HSN Code</label>
                      <input type="text" value={prodHsnCode} onChange={e => setProdHsnCode(e.target.value)} className="w-full p-2 border rounded bg-white font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Min Order Qty</label>
                      <input type="number" value={prodMinOrderQty} onChange={e => setProdMinOrderQty(Number(e.target.value))} className="w-full p-2 border rounded font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Shelf Life (Days)</label>
                      <input type="number" value={prodShelfLifeDays} onChange={e => setProdShelfLifeDays(Number(e.target.value))} className="w-full p-2 border rounded font-mono" />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input type="checkbox" id="batchCheck" checked={prodIsBatchTracked} onChange={e => setProdIsBatchTracked(e.target.checked)} className="w-4 h-4 text-brand-primary rounded" />
                      <label htmlFor="batchCheck" className="font-bold text-brand-text-primary cursor-pointer">Batch & Expiry Tracked</label>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. SUPPLIER FORM */}
              {(module === 'suppliers' || module === 'masters/suppliers') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Vendor Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="SUPP-301" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Legal Entity Name <span className="text-red-500">*</span></label>
                      <input type="text" value={suppLegalName} onChange={e => setSuppLegalName(e.target.value)} className="w-full p-2 border rounded" placeholder="Hindustan Unilever Ltd" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Trade / Brand Name</label>
                      <input type="text" value={suppTradeName} onChange={e => setSuppTradeName(e.target.value)} className="w-full p-2 border rounded" placeholder="HUL Foods" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Contact Person</label>
                      <input type="text" value={suppContactPerson} onChange={e => setSuppContactPerson(e.target.value)} className="w-full p-2 border rounded" placeholder="Ramesh Shah" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Official Email</label>
                      <input type="email" value={suppEmail} onChange={e => setSuppEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="vendor@hul.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Phone Number</label>
                      <input type="text" value={suppPhone} onChange={e => setSuppPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="+91 22 4415 5620" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Credit Limit (₹)</label>
                      <input type="number" value={suppCreditLimit} onChange={e => setSuppCreditLimit(Number(e.target.value))} className="w-full p-2 border rounded font-mono font-bold text-brand-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* 11. CUSTOMER FORM */}
              {(module === 'customers' || module === 'masters/customers') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Customer Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="CUST-201" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Customer / Business Name <span className="text-red-500">*</span></label>
                      <input type="text" value={custLegalName} onChange={e => setCustLegalName(e.target.value)} className="w-full p-2 border rounded" placeholder="Apex Retail Distributors" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Customer Channel Type</label>
                      <select value={custType} onChange={e => setCustType(e.target.value)} className="w-full p-2 border rounded bg-white font-semibold">
                        <option value="Retailer">Kirana / Retailer Store</option>
                        <option value="Wholesaler">Wholesaler Dealer</option>
                        <option value="Key Account">Key Account / Supermarket</option>
                        <option value="Distributor">Regional Stockist</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Contact Person</label>
                      <input type="text" value={custContactPerson} onChange={e => setCustContactPerson(e.target.value)} className="w-full p-2 border rounded" placeholder="Anil Gupta" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Email Address</label>
                      <input type="email" value={custEmail} onChange={e => setCustEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="billing@apex.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Phone Number</label>
                      <input type="text" value={custPhone} onChange={e => setCustPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="+91 98110 24512" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Credit Limit (₹)</label>
                      <input type="number" value={custCreditLimit} onChange={e => setCustCreditLimit(Number(e.target.value))} className="w-full p-2 border rounded font-mono font-bold text-brand-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* 12. EMPLOYEE FORM */}
              {(module === 'employees' || module === 'masters/employees') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Employee Code <span className="text-red-500">*</span></label>
                      <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} disabled={mode === 'edit'} className="w-full p-2 border rounded" placeholder="EMP-1001" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">First Name <span className="text-red-500">*</span></label>
                      <input type="text" value={empFirstName} onChange={e => setEmpFirstName(e.target.value)} className="w-full p-2 border rounded" placeholder="Rajesh" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" value={empLastName} onChange={e => setEmpLastName(e.target.value)} className="w-full p-2 border rounded" placeholder="Kumar" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Official Email <span className="text-red-500">*</span></label>
                      <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="rajesh@ink-fmcg.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Branch Location</label>
                      <select value={empBranchId} onChange={e => setEmpBranchId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Department</label>
                      <select value={empDepartmentId} onChange={e => setEmpDepartmentId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Designation</label>
                      <select value={empDesignationId} onChange={e => setEmpDesignationId(e.target.value)} className="w-full p-2 border rounded bg-white">
                        {dbDesignations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-brand-text-primary">Joining Date</label>
                      <input type="date" value={empJoiningDate} onChange={e => setEmpJoiningDate(e.target.value)} className="w-full p-2 border rounded bg-white font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Switcher & Attachment Link */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-brand-text-primary">Active Record Status:</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="p-1.5 border rounded bg-white font-bold text-brand-primary">
                    <option value="Active">Active (Available across ERP operations)</option>
                    <option value="Inactive">Inactive (Deactivated from active listings)</option>
                  </select>
                </div>
              </div>

            </form>
          )}

        </div>
      )}

      {/* CONFIRMATION DELETE DIALOG */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-brand-border p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-50 text-brand-danger flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-text-primary">Confirm Deactivation</h3>
              <p className="text-xs text-brand-text-secondary mt-1">Are you sure you want to deactivate this master data record?</p>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 border rounded hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-3.5 py-1.5 bg-brand-danger text-white rounded hover:bg-red-700">Deactivate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
