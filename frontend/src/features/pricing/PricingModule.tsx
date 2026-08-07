import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Sliders,
  Globe,
  Loader2,
  Send,
  Archive,
  X,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Clock,
  UserCheck,
  ShieldCheck,
  Check,
  Boxes
} from 'lucide-react';
import {
  PriceList,
  PriceListItem,
  PriceListStatus,
  PagedPriceListResult,
  CustomerPricingRule,
  DistributorPricingRule,
  DiscountRule,
  Promotion,
  TaxConfig,
  CurrencyConfig
} from '../../types/pricing';
import { pricingService } from '../../services/pricingService';
import * as masterDataService from '../../services/masterDataService';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatINR, formatDate } from '../../utils/formatters';

interface PricingModuleProps {
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function PricingModule({ onTriggerToast }: PricingModuleProps) {
  const [activeTab, setActiveTab] = useState<
    'lists' | 'customer' | 'distributor' | 'discounts' | 'promotions' | 'taxes' | 'currencies'
  >('lists');

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Price Lists State
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master Products for Autocomplete
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);

  // Modals & Active Selections
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  // Form Fields
  const [formData, setFormData] = useState<{
    companyId: string;
    code: string;
    name: string;
    type: 'Retail' | 'Wholesale' | 'Distributor' | 'Customer Specific' | 'Promotional' | 'Internal Transfer';
    currency: string;
    status: PriceListStatus;
    description: string;
    effectiveFrom: string;
    effectiveTo: string;
    items: (PriceListItem & { searchInput?: string; isSearching?: boolean })[];
  }>({
    companyId: '',
    code: '',
    name: '',
    type: 'Retail',
    currency: 'INR',
    status: 'Draft',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    items: []
  });

  // Secondary Mock Data for other tabs
  const [customerRules] = useState<CustomerPricingRule[]>([
    { id: 'CPR-01', customerId: 'CUST-001', customerName: 'Reliance Retail Chain', productId: 'PRD-901', productName: 'Surf Excel Quick Wash 1kg', specialPrice: 185, discountPercent: 12, priority: 1, status: 'Active' },
    { id: 'CPR-02', customerId: 'CUST-002', customerName: 'Metro Cash & Carry', productId: 'PRD-904', productName: 'Dove Hair Fall Rescue Shampoo 650ml', specialPrice: 420, discountPercent: 8, priority: 2, status: 'Active' }
  ]);

  const [distributorRules] = useState<DistributorPricingRule[]>([
    { id: 'DPR-01', distributorId: 'DIST-90', distributorName: 'Apex Logistics Hub', region: 'North', territory: 'Delhi NCR', productId: 'PRD-901', productName: 'Surf Excel Quick Wash 1kg', agreedPrice: 170, status: 'Active' },
    { id: 'DPR-02', distributorId: 'DIST-92', distributorName: 'Western FMCG Traders', region: 'West', territory: 'Mumbai South', productId: 'PRD-902', productName: 'Rin Detergent Bar 250g', agreedPrice: 28, status: 'Active' }
  ]);

  const [discountRules] = useState<DiscountRule[]>([
    { id: 'DSC-10', code: 'DISC-BULK-50', name: 'Bulk Order 50+ Cartons Tier', type: 'Quantity', value: 7.5, minQuantity: 50, status: 'Active' },
    { id: 'DSC-11', code: 'DISC-FLAT-MON', name: 'Monthly Distributor Volume Flat Off', type: 'Flat', value: 5000, status: 'Active' }
  ]);

  const [promotions] = useState<Promotion[]>([
    { id: 'PRM-01', code: 'BOGO-SOAP', name: 'Buy 5 Get 1 Free Soap Pack', type: 'BuyXGetY', discountValue: 0, buyQuantity: 5, getQuantity: 1, startDate: '2026-07-01', endDate: '2026-08-15', status: 'Active' },
    { id: 'PRM-02', code: 'COUPON-FMCG', name: 'Festive Monsoon ₹500 Coupon', type: 'Coupon', discountValue: 500, couponCode: 'MONSOON500', startDate: '2026-07-15', endDate: '2026-07-31', status: 'Active' }
  ]);

  const [taxConfigs] = useState<TaxConfig[]>([
    { id: 'TAX-01', code: 'GST-18', name: 'Standard FMCG GST 18%', type: 'GST', ratePercent: 18, category: 'Standard', status: 'Active' },
    { id: 'TAX-02', code: 'GST-05', name: 'Essential Goods GST 5%', type: 'GST', ratePercent: 5, category: 'Reduced', status: 'Active' }
  ]);

  const [currencies] = useState<CurrencyConfig[]>([
    { id: 'CUR-01', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1.0, isBase: true, status: 'Active' },
    { id: 'CUR-02', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 83.5, isBase: false, status: 'Active' },
    { id: 'CUR-03', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 90.2, isBase: false, status: 'Active' },
    { id: 'CUR-04', code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 22.7, isBase: false, status: 'Active' }
  ]);

  const toastRef = React.useRef(onTriggerToast);
  useEffect(() => {
    toastRef.current = onTriggerToast;
  }, [onTriggerToast]);

  // Fetch Master Data (Products & Companies)
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [prodData, compData] = await Promise.all([
          masterDataService.fetchProducts({}),
          masterDataService.fetchCompanies({})
        ]);
        
        const prods = Array.isArray(prodData) ? prodData : (prodData && Array.isArray(prodData.items) ? prodData.items : []);
        setAvailableProducts(prods);

        const comps = Array.isArray(compData) ? compData : (compData && Array.isArray(compData.items) ? compData.items : []);
        setAvailableCompanies(comps);
      } catch {
        // Fallback mock products if server master data fails
        setAvailableProducts([
          { id: '76b29511-ea74-422a-928f-f5ef3abd8d80', code: 'SOAP001', name: 'Soap 100g Classic', sku: 'SKU-SOAP-100', baseUom: 'Pcs', basePrice: 35, mrp: 45 },
          { id: 'a59e6217-3baa-426c-aff5-ba8fa06e48ac', code: 'SOAP002', name: 'Soap 250g Family Pack', sku: 'SKU-SOAP-250', baseUom: 'Pcs', basePrice: 80, mrp: 100 },
          { id: 'b28f1122-3c44-5566-7788-9900aabbccdd', code: 'DET001', name: 'Surf Washing Powder 1kg', sku: 'SKU-DET-1000', baseUom: 'Kg', basePrice: 180, mrp: 220 },
          { id: 'c39e2233-4d55-6677-8899-0011bbccddee', code: 'OIL005', name: 'Fortune Refined Sunflower Oil 1L', sku: 'SKU-OIL-1L', baseUom: 'Ltr', basePrice: 130, mrp: 155 }
        ]);
      }
    }
    loadMasterData();
  }, []);

  // Load Price Lists from API
  const fetchPriceLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pricingService.getPriceLists({
        search: searchQuery || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        currency: currencyFilter !== 'All' ? currencyFilter : undefined,
        pageNumber,
        pageSize
      });

      if (Array.isArray(response)) {
        setPriceLists(response);
        setTotalCount(response.length);
        setTotalPages(1);
      } else if (response && Array.isArray(response.items)) {
        setPriceLists(response.items);
        setTotalCount(response.totalCount);
        setTotalPages(response.totalPages || 1);
      } else {
        setPriceLists([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      const errMsg = err?.data?.detail || err?.data?.title || err?.message || 'Failed to fetch price lists from server.';
      setError(errMsg);
      toastRef.current('error', 'API Error', errMsg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, currencyFilter, pageNumber, pageSize]);

  useEffect(() => {
    if (activeTab === 'lists') {
      fetchPriceLists();
    }
  }, [fetchPriceLists, activeTab]);

  // View Details Action (Drawer)
  const handleViewPriceList = async (id: string) => {
    try {
      setLoading(true);
      const data = await pricingService.getPriceListById(id);
      setSelectedPriceList(data);
      setIsViewDrawerOpen(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load price list details.';
      onTriggerToast('error', 'Error Loading Details', msg);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPriceList(null);
    setFormValidationErrors({});
    
    // Auto-select first real company GUID or fallback
    const defaultCompanyId = availableCompanies[0]?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80';
    const firstProd = availableProducts[0];

    setFormData({
      companyId: defaultCompanyId,
      code: '',
      name: '',
      type: 'Retail',
      currency: 'INR',
      status: 'Draft',
      description: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      items: [
        {
          productId: firstProd?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80',
          productCode: firstProd?.code || 'SOAP001',
          productName: firstProd?.name || 'Soap 100g Classic',
          uom: firstProd?.baseUom || firstProd?.uom || 'Pcs',
          basePrice: firstProd?.basePrice || 100,
          msrp: firstProd?.mrp || 120,
          minSellingPrice: 90,
          currencyCode: 'INR',
          status: 'Active',
          searchInput: firstProd ? `${firstProd.code} - ${firstProd.name}` : 'SOAP001 - Soap 100g Classic'
        }
      ]
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = async (id: string) => {
    try {
      setLoading(true);
      setFormValidationErrors({});
      const data = await pricingService.getPriceListById(id);
      setEditingPriceList(data);
      
      const defaultCompanyId = data.companyId || availableCompanies[0]?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80';
      
      setFormData({
        companyId: defaultCompanyId,
        code: data.code || '',
        name: data.name || '',
        type: (data.type as any) || 'Retail',
        currency: data.currency || 'INR',
        status: data.status || 'Draft',
        description: data.description || '',
        effectiveFrom: data.effectiveFrom ? data.effectiveFrom.split('T')[0] : new Date().toISOString().split('T')[0],
        effectiveTo: data.effectiveTo ? data.effectiveTo.split('T')[0] : '',
        items: data.items && data.items.length > 0 ? data.items.map(it => ({
          ...it,
          msrp: it.msrp ?? it.basePrice,
          minSellingPrice: it.minSellingPrice ?? it.basePrice,
          status: it.status || 'Active',
          searchInput: it.productCode && it.productName ? `${it.productCode} - ${it.productName}` : (it.productName || it.productId)
        })) : [
          { productId: availableProducts[0]?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80', basePrice: 100, msrp: 120, minSellingPrice: 90, currencyCode: 'INR', status: 'Active' }
        ]
      });
      setIsFormModalOpen(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load price list for editing.';
      onTriggerToast('error', 'Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Duplicate Action Workflow
  const handleDuplicatePriceList = async (list: PriceList) => {
    try {
      setLoading(true);
      setFormValidationErrors({});
      const data = await pricingService.getPriceListById(list.id);
      setEditingPriceList(null); // Treat as NEW creation
      
      const defaultCompanyId = data.companyId || availableCompanies[0]?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80';

      setFormData({
        companyId: defaultCompanyId,
        code: '', // Clear code so backend/frontend generates new unique code
        name: `Copy of ${data.name}`,
        type: (data.type as any) || 'Retail',
        currency: data.currency || 'INR',
        status: 'Draft',
        description: `Cloned from ${data.name} (${data.code || 'PL'}). ${data.description || ''}`.trim(),
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        items: data.items && data.items.length > 0 ? data.items.map(it => ({
          productId: it.productId,
          productCode: it.productCode,
          productName: it.productName,
          uom: it.uom || 'Pcs',
          basePrice: it.basePrice,
          msrp: it.msrp || it.basePrice,
          minSellingPrice: it.minSellingPrice || it.basePrice,
          currencyCode: it.currencyCode || 'INR',
          status: 'Active',
          searchInput: it.productCode && it.productName ? `${it.productCode} - ${it.productName}` : (it.productName || it.productId)
        })) : []
      });

      setIsFormModalOpen(true);
      onTriggerToast('info', 'Price List Cloned', `Pre-filled form with items from "${data.name}". Adjust prices and click Save.`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to clone price list.';
      onTriggerToast('error', 'Cloning Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Price List Name is required.';
    }
    if (!formData.type) {
      errors.type = 'Price List Type is required.';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required.';
    }
    if (!formData.status) {
      errors.status = 'Status is required.';
    }
    if (!formData.effectiveFrom) {
      errors.effectiveFrom = 'Effective From date is required.';
    }

    // Row-level product grid validations
    formData.items.forEach((item, idx) => {
      if (!item.productId) {
        errors[`item_${idx}_product`] = 'Product selection is required.';
      }
      if (typeof item.basePrice !== 'number' || item.basePrice < 0) {
        errors[`item_${idx}_basePrice`] = 'Base Price must be ≥ 0.';
      }
      const mrpVal = item.msrp ?? item.basePrice;
      const minVal = item.minSellingPrice ?? item.basePrice;

      if (mrpVal < item.basePrice) {
        errors[`item_${idx}_mrp`] = 'MRP must be ≥ Base Price.';
      }
      if (minVal > item.basePrice) {
        errors[`item_${idx}_minSelling`] = 'Minimum Allowed Price must be ≤ Base Price.';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      const firstErr = Object.values(errors)[0];
      onTriggerToast('warning', 'Validation Failed', firstErr);
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-generate code if left blank by user
      const generatedCode = formData.code.trim() || `PL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const validCompanyId = formData.companyId || availableCompanies[0]?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80';

      const cleanedItems = formData.items.map(it => ({
        productId: it.productId,
        productCode: it.productCode,
        productName: it.productName,
        uom: it.uom,
        basePrice: Number(it.basePrice),
        msrp: Number(it.msrp ?? it.basePrice),
        minSellingPrice: Number(it.minSellingPrice ?? it.basePrice),
        currencyCode: formData.currency,
        status: it.status || 'Active'
      }));

      if (editingPriceList) {
        // Update Price List
        const payload: Partial<PriceList> = {
          id: editingPriceList.id,
          companyId: validCompanyId,
          code: generatedCode,
          name: formData.name.trim(),
          type: formData.type,
          currency: formData.currency,
          status: formData.status,
          description: formData.description.trim(),
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : undefined,
          concurrencyToken: editingPriceList.concurrencyToken,
          items: cleanedItems as any
        };
        await pricingService.updatePriceList(editingPriceList.id, payload);
        onTriggerToast('success', 'Price List Updated', `Updated "${formData.name}" successfully.`);
      } else {
        // Create Price List
        const payload: Partial<PriceList> = {
          companyId: validCompanyId,
          code: generatedCode,
          name: formData.name.trim(),
          type: formData.type,
          currency: formData.currency,
          status: formData.status,
          description: formData.description.trim(),
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : undefined,
          items: cleanedItems as any
        };
        await pricingService.createPriceList(payload);
        onTriggerToast('success', 'Price List Created', `Created price list "${formData.name}" (${generatedCode}) successfully.`);
      }
      setIsFormModalOpen(false);
      fetchPriceLists();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.data?.detail || err?.message || 'Failed to save price list.';
      onTriggerToast('error', 'Save Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish Action
  const handlePublish = async (list: PriceList) => {
    if (!list.concurrencyToken) return;
    try {
      setLoading(true);
      await pricingService.publishPriceList(list.id, list.concurrencyToken);
      onTriggerToast('success', 'Price List Published', `Price list "${list.name}" version incremented and published.`);
      fetchPriceLists();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to publish price list.';
      onTriggerToast('error', 'Publish Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Archive Action
  const handleArchive = async (list: PriceList) => {
    if (!list.concurrencyToken) return;
    try {
      setLoading(true);
      await pricingService.archivePriceList(list.id, list.concurrencyToken);
      onTriggerToast('info', 'Price List Archived', `Price list "${list.name}" moved to Archived state.`);
      fetchPriceLists();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to archive price list.';
      onTriggerToast('error', 'Archive Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await pricingService.deletePriceList(id);
      onTriggerToast('success', 'Price List Deleted', `Price list soft-deleted successfully.`);
      setIsDeletingId(null);
      fetchPriceLists();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to delete price list.';
      onTriggerToast('error', 'Delete Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Line item helpers for form modal
  const handleAddProductRow = () => {
    const firstProd = availableProducts[0];
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: firstProd?.id || '76b29511-ea74-422a-928f-f5ef3abd8d80',
          productCode: firstProd?.code || 'PRD-001',
          productName: firstProd?.name || 'Product SKU',
          uom: firstProd?.baseUom || firstProd?.uom || 'Pcs',
          basePrice: firstProd?.basePrice || 100,
          msrp: firstProd?.mrp || 120,
          minSellingPrice: 90,
          currencyCode: prev.currency,
          status: 'Active',
          searchInput: firstProd ? `${firstProd.code} - ${firstProd.name}` : ''
        }
      ]
    }));
  };

  const handleRemoveProductRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProductRowChange = (index: number, field: keyof PriceListItem | 'searchInput' | 'isSearching', value: any) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleSelectProductForLine = (index: number, prod: any) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        sku: prod.sku,
        uom: prod.baseUom || prod.uom || 'Pcs',
        basePrice: prod.basePrice || updated[index].basePrice || 100,
        msrp: prod.mrp || updated[index].msrp || 120,
        minSellingPrice: prod.basePrice ? Math.round(prod.basePrice * 0.9) : 90,
        searchInput: `${prod.code} - ${prod.name}`,
        isSearching: false
      };
      return { ...prev, items: updated };
    });
  };

  const getStatusBadgeVariant = (status: PriceListStatus) => {
    switch (status) {
      case 'Published':
      case 'Active':
        return 'success';
      case 'Draft':
        return 'warning';
      case 'Archived':
        return 'neutral';
      case 'Expired':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getTypeBadgeVariant = (type?: string) => {
    switch (type) {
      case 'Retail': return 'primary';
      case 'Wholesale': return 'info';
      case 'Distributor': return 'warning';
      case 'Customer Specific': return 'purple';
      case 'Promotional': return 'success';
      case 'Internal Transfer': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1: PRICING KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Price Lists" 
          value={totalCount} 
          badgeText="Engine Ready" 
          badgeVariant="success"
          subLabel="Total Configured Price Lists"
          subValue={`${totalCount} Active Lists`}
        />
        <StatCard 
          title="Customer Overrides" 
          value={customerRules.length} 
          badgeText="Priority Rules" 
          badgeVariant="primary"
          subLabel="Active B2B Contracts"
          subValue="100% Validated"
        />
        <StatCard 
          title="Promotional Banners" 
          value={promotions.length} 
          badgeText="BOGO / Coupon" 
          badgeVariant="warning"
          subLabel="Active Coupons"
          subValue="MONSOON500"
        />
        <StatCard 
          title="Base Tax Standard" 
          value="18% GST" 
          badgeText="GST / VAT Ready" 
          badgeVariant="info"
          subLabel="Multi-Currency"
          subValue="INR Base"
        />
      </div>

      {/* SECTION 2: SUB-NAVIGATION TAB PILLS */}
      <div className="bg-white p-2 rounded-lg border border-brand-border shadow-sm flex flex-wrap gap-1">
        {[
          { id: 'lists', label: 'Price Lists', icon: Tag },
          { id: 'customer', label: 'Customer Pricing', icon: DollarSign },
          { id: 'distributor', label: 'Distributor Pricing', icon: Sliders },
          { id: 'discounts', label: 'Discount Engine', icon: Percent },
          { id: 'promotions', label: 'Promotions & Coupons', icon: Sparkles },
          { id: 'taxes', label: 'Tax Groups (GST/VAT)', icon: Layers },
          { id: 'currencies', label: 'Multi-Currency', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isActive ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg-secondary'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRICE LISTS GRID */}
      {activeTab === 'lists' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm-flat overflow-hidden">
          
          {/* SEARCH & FILTERS HEADER */}
          <div className="p-4 border-b border-brand-border bg-brand-bg-secondary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search price list name, code..." />
              
              {/* FILTER: PRICE LIST TYPE */}
              <div className="flex items-center gap-1 bg-white border border-brand-border rounded px-2 py-1 text-xs">
                <Filter size={13} className="text-brand-text-secondary" />
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPageNumber(1); }}
                  className="bg-transparent text-xs text-brand-text-primary font-semibold border-none outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Customer Specific">Customer Specific</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Internal Transfer">Internal Transfer</option>
                </select>
              </div>

              {/* FILTER: STATUS */}
              <div className="flex items-center gap-1 bg-white border border-brand-border rounded px-2 py-1 text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
                  className="bg-transparent text-xs text-brand-text-primary font-semibold border-none outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* FILTER: CURRENCY */}
              <div className="flex items-center gap-1 bg-white border border-brand-border rounded px-2 py-1 text-xs">
                <select
                  value={currencyFilter}
                  onChange={(e) => { setCurrencyFilter(e.target.value); setPageNumber(1); }}
                  className="bg-transparent text-xs text-brand-text-primary font-semibold border-none outline-none cursor-pointer"
                >
                  <option value="All">All Currencies</option>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <button
                onClick={fetchPriceLists}
                className="p-1.5 border border-brand-border rounded hover:bg-brand-bg-secondary text-brand-text-secondary cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-3 py-1.5 bg-brand-primary hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition shadow-sm"
            >
              <Plus size={14} /> Create Price List
            </button>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="p-12 text-center text-brand-text-secondary flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-brand-primary" />
              <span className="text-xs font-semibold">Fetching price lists from API...</span>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="p-6 text-center text-red-600 bg-red-50 space-y-2 border-b">
              <AlertCircle size={24} className="mx-auto" />
              <p className="text-xs font-bold">{error}</p>
              <button
                onClick={fetchPriceLists}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && priceLists.length === 0 && (
            <EmptyState
              icon={Tag}
              title="No Price Lists Found"
              description="No price lists match your search parameters. Click Create Price List to configure a new price list."
            />
          )}

          {/* DATA TABLE */}
          {!loading && !error && priceLists.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-brand-bg-secondary border-b border-brand-border text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Price List Name & Code</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Currency</th>
                    <th className="p-3">Effective Period</th>
                    <th className="p-3 text-center">Total Products</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {priceLists.map(list => (
                    <tr key={list.id} className="hover:bg-brand-bg-secondary/30 transition text-brand-text-primary">
                      <td className="p-3">
                        <div className="font-bold text-brand-primary text-xs">{list.name}</div>
                        <div className="font-mono text-[10px] text-brand-text-secondary">{list.code || 'PL-AUTO'}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={getTypeBadgeVariant(list.type) as any}>
                          {list.type || 'Retail'}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-semibold">{list.currency || 'INR'}</td>
                      <td className="p-3 text-brand-text-secondary font-mono text-[11px]">
                        {list.effectiveFrom ? formatDate(list.effectiveFrom) : (list.effectiveDate || '—')}
                        <span className="mx-1 text-gray-400">→</span>
                        {list.effectiveTo ? formatDate(list.effectiveTo) : (list.expiryDate || 'Open')}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-xs">
                        {list.itemsCount ?? (list.items ? list.items.length : 0)} Products
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={getStatusBadgeVariant(list.status)}>
                          {list.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {/* VIEW DETAIL DRAWER */}
                        <button
                          onClick={() => handleViewPriceList(list.id)}
                          className="p-1 border border-brand-border rounded hover:bg-brand-bg-secondary text-brand-text-primary cursor-pointer"
                          title="View Price List Details"
                        >
                          <Eye size={13} />
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() => handleOpenEditModal(list.id)}
                          className="p-1 border border-brand-border rounded hover:bg-brand-bg-secondary text-brand-text-primary cursor-pointer"
                          title="Edit Price List"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* DUPLICATE / CLONE */}
                        <button
                          onClick={() => handleDuplicatePriceList(list)}
                          className="p-1 border border-brand-border rounded hover:bg-purple-50 text-purple-600 cursor-pointer"
                          title="Duplicate / Copy Price List"
                        >
                          <Copy size={13} />
                        </button>

                        {/* PUBLISH */}
                        {list.status === 'Draft' && (
                          <button
                            onClick={() => handlePublish(list)}
                            className="p-1 border border-brand-border rounded hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                            title="Publish Price List"
                          >
                            <Send size={13} />
                          </button>
                        )}

                        {/* ARCHIVE */}
                        {list.status !== 'Archived' && (
                          <button
                            onClick={() => handleArchive(list)}
                            className="p-1 border border-brand-border rounded hover:bg-amber-50 text-amber-600 cursor-pointer"
                            title="Archive Price List"
                          >
                            <Archive size={13} />
                          </button>
                        )}

                        {/* DELETE */}
                        <button
                          onClick={() => setIsDeletingId(list.id)}
                          className="p-1 border border-brand-border rounded hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Soft Delete Price List"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION FOOTER */}
          {!loading && !error && priceLists.length > 0 && (
            <div className="p-3 border-t border-brand-border bg-brand-bg-secondary/10 flex items-center justify-between text-xs">
              <span className="text-brand-text-secondary">
                Showing <strong>{priceLists.length}</strong> of <strong>{totalCount}</strong> price lists
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  className="p-1 border border-brand-border rounded hover:bg-brand-bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-mono text-brand-text-secondary">Page {pageNumber} of {totalPages}</span>
                <button
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(p => p + 1)}
                  className="p-1 border border-brand-border rounded hover:bg-brand-bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* READ-ONLY VIEW PRICE LIST DRAWER */}
      {isViewDrawerOpen && selectedPriceList && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl animate-fade-in border-l border-brand-border overflow-hidden">
            {/* DRAWER HEADER */}
            <div className="p-4 border-b border-brand-border bg-brand-bg-secondary/20 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-brand-text-primary">{selectedPriceList.name}</h3>
                  <Badge variant={getStatusBadgeVariant(selectedPriceList.status)}>{selectedPriceList.status}</Badge>
                </div>
                <p className="text-xs font-mono text-brand-text-secondary">Code: {selectedPriceList.code || 'PL-AUTO'}</p>
              </div>
              <button
                onClick={() => setIsViewDrawerOpen(false)}
                className="p-1.5 rounded-md text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* DRAWER BODY */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
              
              {/* SECTION: GENERAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1.5">
                  <Tag size={14} className="text-brand-primary" /> General Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-brand-bg-secondary/20 rounded-lg border border-brand-border/60">
                  <div>
                    <span className="block text-[10px] text-brand-text-secondary font-bold uppercase">Price List Type</span>
                    <span className="font-semibold text-brand-text-primary">{selectedPriceList.type || 'Retail'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-text-secondary font-bold uppercase">Currency</span>
                    <span className="font-mono font-bold text-brand-primary">{selectedPriceList.currency || 'INR'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-text-secondary font-bold uppercase">Effective From</span>
                    <span className="font-mono text-brand-text-primary">{selectedPriceList.effectiveFrom ? formatDate(selectedPriceList.effectiveFrom) : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-brand-text-secondary font-bold uppercase">Effective To</span>
                    <span className="font-mono text-brand-text-primary">{selectedPriceList.effectiveTo ? formatDate(selectedPriceList.effectiveTo) : 'Open'}</span>
                  </div>
                </div>
                {selectedPriceList.description && (
                  <div className="p-3 bg-gray-50 border rounded text-brand-text-secondary italic">
                    {selectedPriceList.description}
                  </div>
                )}
              </div>

              {/* SECTION: PRODUCTS GRID */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Boxes size={14} className="text-brand-primary" /> Products Configured ({selectedPriceList.items ? selectedPriceList.items.length : 0})
                  </h4>
                </div>

                {!selectedPriceList.items || selectedPriceList.items.length === 0 ? (
                  <p className="text-xs text-brand-text-secondary italic p-4 bg-gray-50 rounded text-center">No products configured in this price list.</p>
                ) : (
                  <div className="border border-brand-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                        <tr>
                          <th className="p-2">Product</th>
                          <th className="p-2 text-center">UOM</th>
                          <th className="p-2 text-right">Base Price</th>
                          <th className="p-2 text-right">MRP</th>
                          <th className="p-2 text-right">Min Allowed Price</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {selectedPriceList.items.map((item, i) => (
                          <tr key={i} className="hover:bg-brand-bg-secondary/20">
                            <td className="p-2">
                              <div className="font-bold text-brand-text-primary">{item.productName || 'Product SKU'}</div>
                              <div className="font-mono text-[10px] text-brand-text-secondary">{item.productCode || item.productId}</div>
                            </td>
                            <td className="p-2 text-center font-semibold text-brand-text-secondary">{item.uom || 'Pcs'}</td>
                            <td className="p-2 text-right font-mono font-bold">{formatINR(item.basePrice)}</td>
                            <td className="p-2 text-right font-mono font-bold text-emerald-700">{formatINR(item.msrp || item.basePrice)}</td>
                            <td className="p-2 text-right font-mono font-semibold text-amber-700">{formatINR(item.minSellingPrice || item.basePrice)}</td>
                            <td className="p-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.status === 'Disabled' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                                {item.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION: AUDIT INFORMATION */}
              <div className="space-y-3 pt-2 border-t">
                <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-brand-primary" /> Audit Trail Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border rounded-lg text-[11px]">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Created By</span>
                    <span className="font-semibold text-brand-text-primary">{selectedPriceList.createdBy || selectedPriceList.createdByEmail || 'System Administrator'}</span>
                    <span className="block text-[10px] font-mono text-gray-400">{selectedPriceList.createdAtUtc ? formatDate(selectedPriceList.createdAtUtc) : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Last Modified</span>
                    <span className="font-semibold text-brand-text-primary">{selectedPriceList.lastModifiedBy || 'System Administrator'}</span>
                    <span className="block text-[10px] font-mono text-gray-400">{selectedPriceList.lastModifiedAtUtc ? formatDate(selectedPriceList.lastModifiedAtUtc) : '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Published By</span>
                    <span className="font-semibold text-brand-text-primary">{selectedPriceList.publishedBy || (selectedPriceList.status === 'Published' ? 'Admin' : 'Not Published')}</span>
                    <span className="block text-[10px] font-mono text-gray-400">{selectedPriceList.publishedAtUtc ? formatDate(selectedPriceList.publishedAtUtc) : '—'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* DRAWER FOOTER */}
            <div className="p-4 border-t border-brand-border bg-brand-bg-secondary/20 flex justify-end gap-2">
              <button
                onClick={() => setIsViewDrawerOpen(false)}
                className="px-4 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT / DUPLICATE FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-4xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-text-primary">
                  {editingPriceList ? 'Edit Price List' : 'Create Price List'}
                </h3>
                <p className="text-xs text-brand-text-secondary">Configure reusable price engine attributes for ERP sales operations.</p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              {/* GENERAL INFORMATION SECTION */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px]">General Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">Price List Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(p => ({ ...p, name: e.target.value }));
                        setFormValidationErrors(p => ({ ...p, name: '' }));
                      }}
                      placeholder="e.g. Retail Pan-India 2026"
                      className={`w-full p-2 border rounded outline-none ${formValidationErrors.name ? 'border-red-500 bg-red-50/50' : 'border-brand-border'}`}
                    />
                    {formValidationErrors.name && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{formValidationErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">
                      Price List Code <span className="text-gray-400 font-normal">(Optional - Auto Generated if Empty)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. PL-RETAIL-2026 (Leave blank for auto-code)"
                      className="w-full p-2 border rounded border-brand-border uppercase font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">Price List Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as any }))}
                      className="w-full p-2 border rounded border-brand-border bg-white font-semibold"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Customer Specific">Customer Specific</option>
                      <option value="Promotional">Promotional</option>
                      <option value="Internal Transfer">Internal Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">Currency *</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))}
                      className="w-full p-2 border rounded border-brand-border bg-white font-semibold"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="AED">AED (د.إ - UAE Dirham)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full p-2 border rounded border-brand-border bg-white font-semibold"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published (Sales Ready)</option>
                      <option value="Expired">Expired</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">Effective From *</label>
                    <input
                      type="date"
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData(p => ({ ...p, effectiveFrom: e.target.value }))}
                      className="w-full p-2 border rounded border-brand-border"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text-primary mb-1">Effective To (Optional)</label>
                    <input
                      type="date"
                      value={formData.effectiveTo}
                      onChange={(e) => setFormData(p => ({ ...p, effectiveTo: e.target.value }))}
                      className="w-full p-2 border rounded border-brand-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-text-primary mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Price List Description..."
                    className="w-full p-2 border rounded border-brand-border outline-none"
                  />
                </div>
              </div>

              {/* PRODUCTS GRID SECTION */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-brand-text-primary uppercase tracking-wider text-[11px]">Products</h4>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="px-2.5 py-1 bg-brand-primary text-white font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer hover:bg-blue-700 transition"
                  >
                    <Plus size={12} /> Add Product
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="p-4 border border-dashed rounded text-center text-gray-500 bg-gray-50">
                    No products added. Click "+ Add Product" to add items to this price list.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {formData.items.map((item, idx) => {
                      const filteredProds = availableProducts.filter(p => {
                        if (!item.searchInput) return true;
                        const q = item.searchInput.toLowerCase();
                        return (
                          (p.code && p.code.toLowerCase().includes(q)) ||
                          (p.name && p.name.toLowerCase().includes(q)) ||
                          (p.sku && p.sku.toLowerCase().includes(q))
                        );
                      });

                      const errBasePrice = formValidationErrors[`item_${idx}_basePrice`];
                      const errMrp = formValidationErrors[`item_${idx}_mrp`];
                      const errMinSelling = formValidationErrors[`item_${idx}_minSelling`];

                      return (
                        <div key={idx} className="p-3 border rounded-lg bg-brand-bg-secondary/20 grid grid-cols-1 sm:grid-cols-12 gap-2 items-start text-[11px]">
                          
                          {/* PRODUCT AUTOCOMPLETE SEARCH */}
                          <div className="sm:col-span-4 relative">
                            <label className="block font-bold text-brand-text-secondary mb-0.5">Search Product</label>
                            <input
                              type="text"
                              value={item.searchInput || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleProductRowChange(idx, 'searchInput', val);
                                handleProductRowChange(idx, 'isSearching', true);
                              }}
                              onFocus={() => handleProductRowChange(idx, 'isSearching', true)}
                              placeholder="Type Code, Name, SKU..."
                              className="w-full p-1.5 border rounded border-brand-border bg-white font-medium text-xs"
                            />

                            {/* AUTOCOMPLETE DROPDOWN */}
                            {item.isSearching && (
                              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-md shadow-lg max-h-40 overflow-y-auto text-[11px]">
                                {filteredProds.length === 0 ? (
                                  <div className="p-2 text-gray-400 italic">No matching products</div>
                                ) : (
                                  filteredProds.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => handleSelectProductForLine(idx, p)}
                                      className="p-2 hover:bg-brand-primary/10 cursor-pointer border-b border-gray-100 last:border-none"
                                    >
                                      <div className="font-bold text-brand-primary">{p.code} - {p.name}</div>
                                      <div className="text-[10px] text-gray-500">SKU: {p.sku || p.code} | UOM: {p.baseUom || p.uom || 'Pcs'}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                          {/* UOM READ ONLY */}
                          <div className="sm:col-span-1">
                            <label className="block font-bold text-brand-text-secondary mb-0.5">UOM</label>
                            <input
                              type="text"
                              readOnly
                              value={item.uom || 'Pcs'}
                              className="w-full p-1.5 border rounded bg-gray-100 font-semibold text-center text-brand-text-secondary"
                            />
                          </div>

                          {/* BASE PRICE */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-brand-text-secondary mb-0.5">Base Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.basePrice}
                              onChange={(e) => handleProductRowChange(idx, 'basePrice', parseFloat(e.target.value) || 0)}
                              className={`w-full p-1.5 border rounded font-mono font-bold ${errBasePrice ? 'border-red-500 bg-red-50' : 'border-brand-border bg-white'}`}
                            />
                            {errBasePrice && <p className="text-[9px] text-red-500 mt-0.5">{errBasePrice}</p>}
                          </div>

                          {/* MRP */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-brand-text-secondary mb-0.5">MRP (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.msrp ?? item.basePrice}
                              onChange={(e) => handleProductRowChange(idx, 'msrp', parseFloat(e.target.value) || 0)}
                              className={`w-full p-1.5 border rounded font-mono font-bold text-emerald-700 ${errMrp ? 'border-red-500 bg-red-50' : 'border-brand-border bg-white'}`}
                            />
                            {errMrp && <p className="text-[9px] text-red-500 mt-0.5">{errMrp}</p>}
                          </div>

                          {/* MINIMUM ALLOWED PRICE */}
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-brand-text-secondary mb-0.5">Min Allowed (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.minSellingPrice ?? item.basePrice}
                              onChange={(e) => handleProductRowChange(idx, 'minSellingPrice', parseFloat(e.target.value) || 0)}
                              className={`w-full p-1.5 border rounded font-mono font-bold text-amber-700 ${errMinSelling ? 'border-red-500 bg-red-50' : 'border-brand-border bg-white'}`}
                            />
                            {errMinSelling && <p className="text-[9px] text-red-500 mt-0.5">{errMinSelling}</p>}
                          </div>

                          {/* REMOVE BUTTON */}
                          <div className="sm:col-span-1 pt-4 text-right">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProductRow(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Remove Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {editingPriceList ? 'Update Price List' : 'Create Price List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle size={18} />
              <span>Confirm Delete</span>
            </div>
            <p className="text-xs text-brand-text-secondary">
              Are you sure you want to soft-delete this price list? This action will mark the price list and its product lines as deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-3 py-1.5 border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeletingId)}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 cursor-pointer"
              >
                Delete Price List
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
