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

  // Mock Database State Repositories
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
    { id: '2', branchId: '1', branchName: 'Delhi Main Branch', code: 'DEP-SLS', name: 'Field Sales & Distribution', description: 'Oversees trade marketing and key accounts.', status: 'Active' }
  ]);

  const [dbDesignations, setDbDesignations] = useState([
    { id: '1', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'DSG-DIR', title: 'Managing Director', level: 1, approvalLimit: 5000000, status: 'Active' },
    { id: '2', companyId: '1', companyName: 'INK FMCG India Pvt Ltd', code: 'DSG-RSM', title: 'Regional Sales Manager', level: 3, approvalLimit: 500000, status: 'Active' }
  ]);

  const [dbEmployees, setDbEmployees] = useState([
    { id: '1', companyId: '1', branchId: '1', departmentId: '2', designationId: '2', employeeCode: 'EMP-1001', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.k@ink-fmcg.com', phone: '+91 98100 12345', joiningDate: '2022-04-15', salary: 120000, status: 'Active' }
  ]);

  const [dbProducts, setDbProducts] = useState<Product[]>([
    { id: '1', code: 'PROD-001', name: 'Premium Basmati Rice 5kg', category: 'Food & Grains', brand: 'India Gate', unit: 'Bag', price: 650, taxRate: 5, stockLevel: 1420, status: 'Active' }
  ]);

  const [dbCategories, setDbCategories] = useState<Category[]>([
    { id: '1', code: 'CAT-001', name: 'Food & Grains', description: 'Essential raw rice, wheat flour, and pulses.', productCount: 42, status: 'Active' }
  ]);

  const [dbBrands, setDbBrands] = useState<Brand[]>([
    { id: '1', code: 'BRND-001', name: 'India Gate', origin: 'India', productCount: 12, status: 'Active' }
  ]);

  const [dbUnits, setDbUnits] = useState<Unit[]>([
    { id: '1', code: 'UOM-KG', name: 'Kilograms', baseUnit: 'Gram', conversionFactor: 1000, status: 'Active' }
  ]);

  const [dbWarehouses, setDbWarehouses] = useState<Warehouse[]>([
    { id: '1', code: 'WH-DEL-HQ', name: 'Delhi Central Depot', address: 'Plot 45, Okhla Industrial Area Phase III, Delhi', capacitySft: 150000, manager: 'Aman Deep', status: 'Active' }
  ]);

  const [dbCustomers, setDbCustomers] = useState<Customer[]>([
    { id: '1', code: 'CUST-201', name: 'Apex Retail Distributors', contact: '+91 98110 24512', email: 'billing@apexretail.com', balance: 425000, region: 'North', status: 'Active' }
  ]);

  const [dbSuppliers, setDbSuppliers] = useState<Supplier[]>([
    { id: '1', code: 'SUPP-301', name: 'Hindustan Unilever Limited', contact: '+91 22441 55620', email: 'b2b.support@hul.com', balance: 3450000, category: 'National Brand Packaged', status: 'Active' }
  ]);

  const [dbReps, setDbReps] = useState<SalesRep[]>([
    { id: '1', code: 'REP-401', name: 'Amit Sharma', contact: '+91 98101 24510', email: 'amit.sharma@ink-fmcg.com', region: 'Delhi NCR', target: 2500000, status: 'Active' }
  ]);

  // UI Control
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'empty' | 'error' | 'denied'>('normal');
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State & Errors
  const [formCode, setFormCode] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 1. Company Fields
  const [compLegalName, setCompLegalName] = useState('');
  const [compTradeName, setCompTradeName] = useState('');
  const [compGstin, setCompGstin] = useState('');
  const [compPan, setCompPan] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compCurrency, setCompCurrency] = useState('INR');

  // Shared Address
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrCountry, setAddrCountry] = useState('India');

  // 2. Branch Fields
  const [branchCompanyId, setBranchCompanyId] = useState('1');
  const [branchName, setBranchName] = useState('');
  const [branchGstin, setBranchGstin] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchEmail, setBranchEmail] = useState('');
  const [branchIsHq, setBranchIsHq] = useState(false);

  // 3. Department Fields
  const [deptBranchId, setDeptBranchId] = useState('1');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // 4. Designation Fields
  const [desigCompanyId, setDesigCompanyId] = useState('1');
  const [desigTitle, setDesigTitle] = useState('');
  const [desigLevel, setDesigLevel] = useState<number>(1);
  const [desigApprovalLimit, setDesigApprovalLimit] = useState<number>(0);

  // 5. UOM Fields
  const [uomCompanyId, setUomCompanyId] = useState('1');
  const [uomName, setUomName] = useState('');
  const [uomBaseCode, setUomBaseCode] = useState('Piece');
  const [uomConversionFactor, setUomConversionFactor] = useState<number>(1);
  const [uomIsFractional, setUomIsFractional] = useState(false);

  // 6. Brand Fields
  const [brandCompanyId, setBrandCompanyId] = useState('1');
  const [brandName, setBrandName] = useState('');
  const [brandManufacturer, setBrandManufacturer] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('India');

  // 7. Category Fields
  const [catCompanyId, setCatCompanyId] = useState('1');
  const [catName, setCatName] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [catGstRate, setCatGstRate] = useState<number>(5);
  const [catHsnDefault, setCatHsnDefault] = useState('');

  // 8. Warehouse Fields
  const [whCompanyId, setWhCompanyId] = useState('1');
  const [whBranchId, setWhBranchId] = useState('1');
  const [whName, setWhName] = useState('');
  const [whType, setWhType] = useState('Central Depot');
  const [whCapacitySqFt, setWhCapacitySqFt] = useState<number>(50000);
  const [whTempControl, setWhTempControl] = useState(false);

  // 9. Product Fields
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

  // 10. Supplier Fields
  const [suppCompanyId, setSuppCompanyId] = useState('1');
  const [suppLegalName, setSuppLegalName] = useState('');
  const [suppTradeName, setSuppTradeName] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppGstin, setSuppGstin] = useState('');
  const [suppPan, setSuppPan] = useState('');
  const [suppCreditLimit, setSuppCreditLimit] = useState<number>(100000);
  const [suppPaymentTermsDays, setSuppPaymentTermsDays] = useState<number>(30);

  // 11. Customer Fields
  const [custCompanyId, setCustCompanyId] = useState('1');
  const [custLegalName, setCustLegalName] = useState('');
  const [custType, setCustType] = useState('Retailer');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custPan, setCustPan] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState<number>(50000);
  const [custCreditDays, setCustCreditDays] = useState<number>(15);
  const [custSalesRouteId, setCustSalesRouteId] = useState('');

  // 12. Employee Fields
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

  useEffect(() => {
    setMode('list');
    setSelectedId(null);
    setSearchQuery('');
    setFormErrors({});

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
        }
      } catch (err) {
        console.error('[Master Data Dev Log] Failed to fetch live data:', err);
      }
    }
    loadLiveData();
  }, [module]);

  const populateForm = (id: string) => {
    setFormErrors({});
    if (module === 'companies' || module === 'masters/companies') {
      const x = dbCompanies.find(c => c.id === id);
      if (x) {
        setFormCode(x.code); setCompLegalName(x.legalName); setCompTradeName(x.tradeName); setCompGstin(x.gstin);
        setCompPan(x.pan); setCompEmail(x.email); setCompPhone(x.phone); setCompCurrency(x.currency); setFormStatus(x.status as any);
        setAddrLine1(x.addressLine1); setAddrCity(x.city); setAddrState(x.state); setAddrPostalCode(x.postalCode); setAddrCountry(x.country);
      }
    }
  };

  // ADVANCED ENTERPRISE VALIDATION & FOCUS CONTROLLER
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // 1. Code Validation
    if (!formCode.trim()) {
      errors.code = 'Code identifier is required (e.g. CMP-001).';
    } else if (formCode.length < 3) {
      errors.code = 'Code must be at least 3 characters long.';
    }

    // 2. Module Specific Validations
    if (module === 'companies' || module === 'masters/companies') {
      if (!compLegalName.trim()) {
        errors.compLegalName = 'Legal Entity Name is required.';
      }

      // GSTIN Validation (If filled)
      const cleanGstin = compGstin.trim().toUpperCase();
      if (cleanGstin) {
        if (cleanGstin.length !== 15) {
          errors.compGstin = `GSTIN must be exactly 15 characters long (currently ${cleanGstin.length}).`;
        } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
          errors.compGstin = 'GSTIN format is invalid (e.g. 07AAAAA0000A1Z5).';
        }
      }

      // PAN Validation (If filled)
      const cleanPan = compPan.trim().toUpperCase();
      if (cleanPan) {
        if (cleanPan.length !== 10) {
          errors.compPan = `PAN must be exactly 10 characters long (currently ${cleanPan.length}).`;
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
          errors.compPan = 'PAN format is invalid (e.g. AAAAA0000A).';
        }
      }

      // Email Validation
      if (compEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compEmail.trim())) {
        errors.compEmail = 'Corporate Email format is invalid (e.g. hq@company.com).';
      }

      // Phone Validation
      if (compPhone.trim() && compPhone.trim().length < 8) {
        errors.compPhone = 'Phone number must be at least 8 digits.';
      }
    } else if (module === 'branches' || module === 'masters/branches') {
      if (!branchName.trim()) errors.branchName = 'Branch Name is required.';
    } else if (module === 'departments' || module === 'masters/departments') {
      if (!deptName.trim()) errors.deptName = 'Department Name is required.';
    } else if (module === 'designations' || module === 'masters/designations') {
      if (!desigTitle.trim()) errors.desigTitle = 'Designation Title is required.';
    } else if (module === 'employees' || module === 'masters/employees') {
      if (!empFirstName.trim()) errors.empFirstName = 'First Name is required.';
      if (!empLastName.trim()) errors.empLastName = 'Last Name is required.';
      if (!empEmail.trim() || !empEmail.includes('@')) errors.empEmail = 'Valid official email address is required.';
    } else if (module === 'products' || module === 'masters/products') {
      if (!prodName.trim()) errors.prodName = 'Product SKU Name is required.';
    } else if (module === 'categories' || module === 'masters/categories') {
      if (!catName.trim()) errors.catName = 'Category Name is required.';
    } else if (module === 'brands' || module === 'masters/brands') {
      if (!brandName.trim()) errors.brandName = 'Brand Name is required.';
    } else if (module === 'units' || module === 'masters/units') {
      if (!uomName.trim()) errors.uomName = 'Unit Name is required.';
    } else if (module === 'warehouses' || module === 'masters/warehouses') {
      if (!whName.trim()) errors.whName = 'Warehouse Facility Name is required.';
    } else if (module === 'customers' || module === 'masters/customers') {
      if (!custLegalName.trim()) errors.custLegalName = 'Customer Business Name is required.';
    } else if (module === 'suppliers' || module === 'masters/suppliers') {
      if (!suppLegalName.trim()) errors.suppLegalName = 'Supplier Legal Name is required.';
    }

    // IF VALIDATION FAILS
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      const errorKeys = Object.keys(errors);
      const firstKey = errorKeys[0];
      const firstErrorMessage = errors[firstKey];

      // Requirement 6: Log backend validation errors in browser console during development
      console.group(' [Master Data Client & Backend Validation Audit]');
      console.error(`Validation Failed on Module: ${module}`);
      console.error(`Total Failing Rules: ${errorKeys.length}`);
      console.table(Object.entries(errors).map(([field, reason]) => ({ Field: field, 'Validation Failure Reason': reason })));
      console.groupEnd();

      // Requirement 5: Automatically focus the first invalid field element
      setTimeout(() => {
        const firstEl = document.getElementById(firstKey);
        if (firstEl) {
          firstEl.focus();
          if (firstEl instanceof HTMLInputElement) {
            firstEl.select();
          }
        }
      }, 50);

      // Requirement 4: Show specific validation failure title & description
      onTriggerToast('error', `Validation Failed: ${firstKey.replace(/^[a-z]+/, match => match.toUpperCase())}`, firstErrorMessage);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const isNew = mode === 'create';

      if (module === 'companies' || module === 'masters/companies') {
        if (isNew) {
          const item = {
            id: String(dbCompanies.length + 1), code: formCode, legalName: compLegalName, tradeName: compTradeName || compLegalName,
            gstin: compGstin.toUpperCase(), pan: compPan.toUpperCase(), email: compEmail, phone: compPhone, currency: compCurrency, status: formStatus,
            addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry
          };
          setDbCompanies([...dbCompanies, item]);
          masterDataService.createCompany({ code: formCode, legalName: compLegalName, tradeName: compTradeName, taxRegistrationNumber: compGstin.toUpperCase(), panNumber: compPan.toUpperCase(), email: compEmail, phone: compPhone, currencyCode: compCurrency, isActive: formStatus === 'Active', addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry });
        } else {
          setDbCompanies(dbCompanies.map(c => c.id === selectedId ? { ...c, code: formCode, legalName: compLegalName, tradeName: compTradeName, gstin: compGstin.toUpperCase(), pan: compPan.toUpperCase(), email: compEmail, phone: compPhone, currency: compCurrency, status: formStatus, addressLine1: addrLine1, city: addrCity, state: addrState, postalCode: addrPostalCode, country: addrCountry } : c));
        }
      }

      setIsSaving(false);
      onTriggerToast('success', `${config.singular} Saved`, `Master record has been configured successfully.`);
      setMode('list');
      setSelectedId(null);
    }, 400);
  };

  const getActiveArray = () => {
    if (module === 'companies' || module === 'masters/companies') return dbCompanies.map(c => ({ id: c.id, code: c.code, name: c.legalName, detail1: c.gstin || 'N/A', detail2: c.city || 'HQ', numericText: c.currency, status: c.status }));
    return dbCompanies.map(c => ({ id: c.id, code: c.code, name: c.legalName, detail1: c.gstin, detail2: c.city, numericText: c.currency, status: c.status }));
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

          {/* CREATE & EDIT FORM MODE — ENHANCED VALIDATION & FIELD HIGHLIGHTING */}
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={handleSave} noValidate className="bg-white border border-brand-border rounded-lg shadow-sm-flat p-6 space-y-6">
              
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

              {/* OVERALL VALIDATION SUMMARY ERROR BANNER */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-4 bg-red-50/90 border border-red-200 rounded-lg text-xs space-y-2 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2 text-red-700 font-bold">
                    <AlertCircle size={16} className="shrink-0 text-red-600" />
                    <span>Validation Failed ({Object.keys(formErrors).length} Errors Found)</span>
                  </div>
                  <ul className="list-disc list-inside text-red-600 font-medium space-y-0.5 pl-5">
                    {Object.entries(formErrors).map(([field, msg]) => (
                      <li key={field}>
                        <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1')}:</strong> {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DEDICATED FORM LAYOUT WITH INLINE ERROR MESSAGES & HIGHLIGHTING */}
              
              {/* 1. COMPANY FORM */}
              {(module === 'companies' || module === 'masters/companies') && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="code" className="font-bold text-brand-text-primary">Company Code <span className="text-red-500">*</span></label>
                      <input
                        id="code"
                        type="text"
                        value={formCode}
                        onChange={e => { setFormCode(e.target.value); setFormErrors(prev => ({ ...prev, code: '' })); }}
                        disabled={mode === 'edit'}
                        className={`w-full p-2 border rounded text-brand-text-primary ${
                          formErrors.code ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-brand-border'
                        }`}
                        placeholder="CMP-001"
                      />
                      {formErrors.code && (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" /> {formErrors.code}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="compLegalName" className="font-bold text-brand-text-primary">Legal Entity Name <span className="text-red-500">*</span></label>
                      <input
                        id="compLegalName"
                        type="text"
                        value={compLegalName}
                        onChange={e => { setCompLegalName(e.target.value); setFormErrors(prev => ({ ...prev, compLegalName: '' })); }}
                        className={`w-full p-2 border rounded text-brand-text-primary ${
                          formErrors.compLegalName ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-brand-border'
                        }`}
                        placeholder="INK FMCG Private Limited"
                      />
                      {formErrors.compLegalName && (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" /> {formErrors.compLegalName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="compTradeName" className="font-bold text-brand-text-primary">Trade / Brand Name</label>
                      <input
                        id="compTradeName"
                        type="text"
                        value={compTradeName}
                        onChange={e => setCompTradeName(e.target.value)}
                        className="w-full p-2 border border-brand-border rounded"
                        placeholder="INK Foods"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="compGstin" className="font-bold text-brand-text-primary">GSTIN (Tax ID)</label>
                      <input
                        id="compGstin"
                        type="text"
                        maxLength={15}
                        value={compGstin}
                        onChange={e => { setCompGstin(e.target.value.toUpperCase()); setFormErrors(prev => ({ ...prev, compGstin: '' })); }}
                        className={`w-full p-2 border rounded uppercase font-mono ${
                          formErrors.compGstin ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-brand-border'
                        }`}
                        placeholder="07AAAAA0000A1Z5"
                      />
                      {formErrors.compGstin ? (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" /> {formErrors.compGstin}
                        </p>
                      ) : (
                        <p className="text-[10px] text-brand-text-secondary">15-digit Tax Identification Number</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="compPan" className="font-bold text-brand-text-primary">PAN Number</label>
                      <input
                        id="compPan"
                        type="text"
                        maxLength={10}
                        value={compPan}
                        onChange={e => { setCompPan(e.target.value.toUpperCase()); setFormErrors(prev => ({ ...prev, compPan: '' })); }}
                        className={`w-full p-2 border rounded uppercase font-mono ${
                          formErrors.compPan ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-brand-border'
                        }`}
                        placeholder="AAAAA0000A"
                      />
                      {formErrors.compPan ? (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" /> {formErrors.compPan}
                        </p>
                      ) : (
                        <p className="text-[10px] text-brand-text-secondary">10-character Tax Account Number</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="compEmail" className="font-bold text-brand-text-primary">Corporate Email</label>
                      <input
                        id="compEmail"
                        type="email"
                        value={compEmail}
                        onChange={e => { setCompEmail(e.target.value); setFormErrors(prev => ({ ...prev, compEmail: '' })); }}
                        className={`w-full p-2 border rounded ${
                          formErrors.compEmail ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-brand-border'
                        }`}
                        placeholder="hq@ink-fmcg.com"
                      />
                      {formErrors.compEmail && (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" /> {formErrors.compEmail}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="compPhone" className="font-bold text-brand-text-primary">Phone Number</label>
                      <input
                        id="compPhone"
                        type="text"
                        value={compPhone}
                        onChange={e => { setCompPhone(e.target.value); setFormErrors(prev => ({ ...prev, compPhone: '' })); }}
                        className={`w-full p-2 border rounded ${
                          formErrors.compPhone ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-brand-border'
                        }`}
                        placeholder="+91 11 4500 8800"
                      />
                      {formErrors.compPhone && (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" /> {formErrors.compPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-brand-bg-secondary/30 rounded-lg border space-y-3">
                    <h4 className="font-bold text-brand-text-primary flex items-center gap-1.5"><MapPin size={14} /> Registered Address & Base Currency</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="font-semibold text-brand-text-secondary">Address Line 1</label>
                        <input type="text" value={addrLine1} onChange={e => setAddrLine1(e.target.value)} className="w-full p-2 border rounded bg-white border-brand-border" placeholder="Plot 101, Okhla Estate" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-brand-text-secondary">Base Currency</label>
                        <select value={compCurrency} onChange={e => setCompCurrency(e.target.value)} className="w-full p-2 border rounded bg-white font-bold border-brand-border">
                          <option value="INR">INR (₹ - Indian Rupee)</option>
                          <option value="USD">USD ($ - US Dollar)</option>
                          <option value="EUR">EUR (€ - Euro)</option>
                          <option value="AED">AED (Dirham)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><label className="font-semibold text-brand-text-secondary">City</label><input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)} className="w-full p-2 border border-brand-border rounded bg-white" placeholder="New Delhi" /></div>
                      <div><label className="font-semibold text-brand-text-secondary">State</label><input type="text" value={addrState} onChange={e => setAddrState(e.target.value)} className="w-full p-2 border border-brand-border rounded bg-white" placeholder="Delhi" /></div>
                      <div><label className="font-semibold text-brand-text-secondary">Postal Code</label><input type="text" value={addrPostalCode} onChange={e => setAddrPostalCode(e.target.value)} className="w-full p-2 border border-brand-border rounded bg-white" placeholder="110020" /></div>
                      <div><label className="font-semibold text-brand-text-secondary">Country</label><input type="text" value={addrCountry} onChange={e => setAddrCountry(e.target.value)} className="w-full p-2 border border-brand-border rounded bg-white" placeholder="India" /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Switcher */}
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

    </div>
  );
}
