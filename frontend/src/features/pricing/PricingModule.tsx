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
  ChevronRight
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
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Price Lists State
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Active Selections
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<{
    companyId: string;
    name: string;
    description: string;
    effectiveFrom: string;
    effectiveTo: string;
    items: PriceListItem[];
  }>({
    companyId: '00000000-0000-0000-0000-000000000001',
    name: '',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    items: [
      { productId: '00000000-0000-0000-0000-000000000101', basePrice: 100, msrp: 120, minSellingPrice: 90, currencyCode: 'INR' }
    ]
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
    { id: 'CUR-02', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 83.5, isBase: false, status: 'Active' }
  ]);

  const toastRef = React.useRef(onTriggerToast);
  useEffect(() => {
    toastRef.current = onTriggerToast;
  }, [onTriggerToast]);

  // Load Price Lists from API
  const fetchPriceLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pricingService.getPriceLists({
        search: searchQuery || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
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
  }, [searchQuery, statusFilter, pageNumber, pageSize]);

  useEffect(() => {
    if (activeTab === 'lists') {
      fetchPriceLists();
    }
  }, [fetchPriceLists, activeTab]);

  // View Details Action
  const handleViewPriceList = async (id: string) => {
    try {
      setLoading(true);
      const data = await pricingService.getPriceListById(id);
      setSelectedPriceList(data);
      setIsViewModalOpen(true);
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
    setFormData({
      companyId: '00000000-0000-0000-0000-000000000001',
      name: '',
      description: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      items: [
        { productId: '00000000-0000-0000-0000-000000000101', basePrice: 100, msrp: 120, minSellingPrice: 90, currencyCode: 'INR' }
      ]
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = async (id: string) => {
    try {
      setLoading(true);
      const data = await pricingService.getPriceListById(id);
      setEditingPriceList(data);
      setFormData({
        companyId: data.companyId || '00000000-0000-0000-0000-000000000001',
        name: data.name || '',
        description: data.description || '',
        effectiveFrom: data.effectiveFrom ? data.effectiveFrom.split('T')[0] : '',
        effectiveTo: data.effectiveTo ? data.effectiveTo.split('T')[0] : '',
        items: data.items && data.items.length > 0 ? data.items : [
          { productId: '00000000-0000-0000-0000-000000000101', basePrice: 100, msrp: 120, minSellingPrice: 90, currencyCode: 'INR' }
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

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onTriggerToast('warning', 'Validation Error', 'Price List Name is required.');
      return;
    }
    if (!formData.effectiveFrom) {
      onTriggerToast('warning', 'Validation Error', 'Effective From date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPriceList) {
        // Update Price List
        const payload: Partial<PriceList> = {
          id: editingPriceList.id,
          companyId: formData.companyId,
          name: formData.name,
          description: formData.description,
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : undefined,
          concurrencyToken: editingPriceList.concurrencyToken,
          items: formData.items
        };
        await pricingService.updatePriceList(editingPriceList.id, payload);
        onTriggerToast('success', 'Price List Updated', `Updated "${formData.name}" successfully.`);
      } else {
        // Create Price List
        const payload: Partial<PriceList> = {
          companyId: formData.companyId,
          name: formData.name,
          description: formData.description,
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : undefined,
          items: formData.items
        };
        await pricingService.createPriceList(payload);
        onTriggerToast('success', 'Price List Created', `Created price list "${formData.name}" in Draft status.`);
      }
      setIsFormModalOpen(false);
      fetchPriceLists();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save price list.';
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
  const handleAddLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: `00000000-0000-0000-0000-000000000${101 + prev.items.length}`, basePrice: 100, msrp: 120, minSellingPrice: 90, currencyCode: 'INR' }
      ]
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleLineItemChange = (index: number, field: keyof PriceListItem, value: any) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
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

  return (
    <div className="space-y-6">

      {/* SECTION 1: PRICING KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Price Tariffs" 
          value={totalCount} 
          badgeText="Live Synced" 
          badgeVariant="success"
          subLabel="Total Tariffs Configured"
          subValue={`${totalCount} Lists`}
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
          { id: 'lists', label: 'Price Lists (Tariffs)', icon: Tag },
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

      {/* TAB 1: PRICE LISTS TARIFFS GRID */}
      {activeTab === 'lists' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm-flat overflow-hidden">
          
          {/* SEARCH & FILTERS HEADER */}
          <div className="p-4 border-b border-brand-border bg-brand-bg-secondary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search price list name, description..." />
              
              <div className="flex items-center gap-1 bg-white border border-brand-border rounded px-2 py-1 text-xs">
                <Filter size={13} className="text-brand-text-secondary" />
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
              <Plus size={14} /> Create Price Tariff
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
              description="No price lists match your filter parameters. Click create to configure a new price list."
            />
          )}

          {/* DATA TABLE */}
          {!loading && !error && priceLists.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-brand-bg-secondary border-b border-brand-border text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ID / Name</th>
                    <th className="p-3">Effective From</th>
                    <th className="p-3">Effective To</th>
                    <th className="p-3 text-center">Version</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {priceLists.map(list => (
                    <tr key={list.id} className="hover:bg-brand-bg-secondary/30 transition text-brand-text-primary">
                      <td className="p-3">
                        <div className="font-mono font-bold text-brand-primary text-[11px]">{list.name}</div>
                        {list.description && <div className="text-[10px] text-brand-text-secondary truncate max-w-xs">{list.description}</div>}
                      </td>
                      <td className="p-3 text-brand-text-secondary font-mono">{list.effectiveFrom ? formatDate(list.effectiveFrom) : list.effectiveDate || '—'}</td>
                      <td className="p-3 text-brand-text-secondary font-mono">{list.effectiveTo ? formatDate(list.effectiveTo) : list.expiryDate || 'Open'}</td>
                      <td className="p-3 text-center font-mono font-bold">v{list.version}.0</td>
                      <td className="p-3 text-center">
                        <Badge variant={getStatusBadgeVariant(list.status)}>
                          {list.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {/* VIEW */}
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

                        {/* PUBLISH */}
                        {list.status === 'Draft' && (
                          <button
                            onClick={() => handlePublish(list)}
                            className="p-1 border border-brand-border rounded hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                            title="Publish Tariff (Increments Version)"
                          >
                            <Send size={13} />
                          </button>
                        )}

                        {/* ARCHIVE */}
                        {list.status !== 'Archived' && (
                          <button
                            onClick={() => handleArchive(list)}
                            className="p-1 border border-brand-border rounded hover:bg-amber-50 text-amber-600 cursor-pointer"
                            title="Archive Tariff"
                          >
                            <Archive size={13} />
                          </button>
                        )}

                        {/* DELETE */}
                        <button
                          onClick={() => setIsDeletingId(list.id)}
                          className="p-1 border border-brand-border rounded hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Soft Delete Tariff"
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
                  className="p-1 border rounded disabled:opacity-40 cursor-pointer hover:bg-brand-bg-secondary"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-semibold text-brand-text-primary">Page {pageNumber} of {totalPages}</span>
                <button
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(p => p + 1)}
                  className="p-1 border rounded disabled:opacity-40 cursor-pointer hover:bg-brand-bg-secondary"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMER PRICING */}
      {activeTab === 'customer' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">Customer-Specific Contract Pricing</h4>
            <Badge variant="primary">Priority Resolution Engine</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product SKU</th>
                  <th className="p-3 text-right">Contract Special Price</th>
                  <th className="p-3 text-right">Discount Off MSRP</th>
                  <th className="p-3 text-center">Priority Rule</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {customerRules.map(rule => (
                  <tr key={rule.id}>
                    <td className="p-3 font-semibold">{rule.customerName}</td>
                    <td className="p-3 text-brand-text-secondary">{rule.productName}</td>
                    <td className="p-3 text-right font-mono font-bold text-brand-success">{formatINR(rule.specialPrice)}</td>
                    <td className="p-3 text-right font-bold text-brand-primary">{rule.discountPercent}% OFF</td>
                    <td className="p-3 text-center font-mono">P{rule.priority}</td>
                    <td className="p-3 text-center"><Badge variant="success">{rule.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISTRIBUTOR PRICING */}
      {activeTab === 'distributor' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">Region & Territory Distributor Matrix</h4>
            <Badge variant="info">Geographic Pricing</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                <tr>
                  <th className="p-3">Distributor Node</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Territory</th>
                  <th className="p-3">Product SKU</th>
                  <th className="p-3 text-right">Agreed Price</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {distributorRules.map(rule => (
                  <tr key={rule.id}>
                    <td className="p-3 font-semibold">{rule.distributorName}</td>
                    <td className="p-3 font-mono">{rule.region}</td>
                    <td className="p-3 text-brand-text-secondary">{rule.territory}</td>
                    <td className="p-3 font-medium">{rule.productName}</td>
                    <td className="p-3 text-right font-mono font-bold">{formatINR(rule.agreedPrice)}</td>
                    <td className="p-3 text-center"><Badge variant="success">{rule.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISCOUNT ENGINE */}
      {activeTab === 'discounts' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">Tiered & Quantity Discount Engine</h4>
            <Badge variant="warning">Dynamic Calculations</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discountRules.map(disc => (
              <div key={disc.id} className="p-4 border rounded-lg bg-brand-bg-secondary/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-brand-primary">{disc.code}</span>
                  <Badge variant="success">{disc.type} Discount</Badge>
                </div>
                <h5 className="text-sm font-bold text-brand-text-primary">{disc.name}</h5>
                <p className="text-xs text-brand-text-secondary">
                  Value: <strong>{disc.type === 'Percentage' ? `${disc.value}%` : formatINR(disc.value)}</strong>
                  {disc.minQuantity && ` (Min Qty: ${disc.minQuantity} Units)`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROMOTIONS */}
      {activeTab === 'promotions' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">BOGO & Coupon Campaigns</h4>
            <Badge variant="danger">Limited-Time Offers</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map(prm => (
              <div key={prm.id} className="p-4 border rounded-lg bg-amber-50/30 border-amber-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-brand-warning">{prm.code}</span>
                  <Badge variant="warning">{prm.type}</Badge>
                </div>
                <h5 className="text-sm font-bold text-brand-text-primary">{prm.name}</h5>
                <div className="text-xs text-brand-text-secondary space-y-1">
                  {prm.couponCode && <p>Coupon Code: <strong className="font-mono bg-white px-1.5 py-0.5 border rounded">{prm.couponCode}</strong></p>}
                  {prm.buyQuantity && <p>Mechanic: Buy {prm.buyQuantity} Get {prm.getQuantity} Free</p>}
                  <p>Validity: {prm.startDate} to {prm.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: TAX GROUPS */}
      {activeTab === 'taxes' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">GST & VAT Tax Categories</h4>
            <Badge variant="info">Tax Matrix Active</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taxConfigs.map(tax => (
              <div key={tax.id} className="p-4 border rounded-lg bg-brand-bg-secondary/40 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-brand-primary">{tax.code}</span>
                  <span className="text-lg font-bold text-brand-success">{tax.ratePercent}%</span>
                </div>
                <h5 className="text-xs font-bold text-brand-text-primary">{tax.name}</h5>
                <span className="text-[10px] text-brand-text-secondary font-semibold uppercase">{tax.type} Category: {tax.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CURRENCIES */}
      {activeTab === 'currencies' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">Multi-Currency Exchange Rates</h4>
            <Badge variant="success">Base Currency: INR</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currencies.map(curr => (
              <div key={curr.id} className="p-4 border rounded-lg bg-brand-bg-secondary/40 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-brand-primary">{curr.code} ({curr.symbol})</span>
                  {curr.isBase ? <Badge variant="success">Base Currency</Badge> : <Badge variant="neutral">Rate: {curr.exchangeRate}</Badge>}
                </div>
                <h5 className="text-xs font-bold text-brand-text-primary">{curr.name}</h5>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedPriceList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-brand-text-primary">{selectedPriceList.name}</h3>
                  <Badge variant={getStatusBadgeVariant(selectedPriceList.status)}>
                    {selectedPriceList.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-brand-primary">v{selectedPriceList.version}.0</span>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1">{selectedPriceList.description || 'No description provided.'}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-brand-bg-secondary/30 p-3 rounded text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Effective From</span>
                <span className="font-mono font-semibold">{selectedPriceList.effectiveFrom ? formatDate(selectedPriceList.effectiveFrom) : '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Effective To</span>
                <span className="font-mono font-semibold">{selectedPriceList.effectiveTo ? formatDate(selectedPriceList.effectiveTo) : 'Open'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Company ID</span>
                <span className="font-mono font-semibold truncate block" title={selectedPriceList.companyId}>{selectedPriceList.companyId || 'Default'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">Items Count</span>
                <span className="font-mono font-bold text-brand-primary">{selectedPriceList.items ? selectedPriceList.items.length : 0} Lines</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-2">Price List Line Items</h4>
              {(!selectedPriceList.items || selectedPriceList.items.length === 0) ? (
                <p className="text-xs text-brand-text-secondary italic">No line items configured in this tariff.</p>
              ) : (
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-brand-bg-secondary text-[10px] font-bold text-brand-text-secondary uppercase">
                      <tr>
                        <th className="p-2">Product ID</th>
                        <th className="p-2 text-right">Base Price</th>
                        <th className="p-2 text-right">MSRP</th>
                        <th className="p-2 text-right">Min Selling Price</th>
                        <th className="p-2 text-center">Currency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {selectedPriceList.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2 font-mono text-[11px] font-semibold text-brand-primary">{item.productId}</td>
                          <td className="p-2 text-right font-mono font-bold text-brand-success">{formatINR(item.basePrice)}</td>
                          <td className="p-2 text-right font-mono text-brand-text-secondary">{formatINR(item.msrp || item.basePrice)}</td>
                          <td className="p-2 text-right font-mono text-brand-text-secondary">{formatINR(item.minSellingPrice || item.basePrice)}</td>
                          <td className="p-2 text-center font-mono">{item.currencyCode || 'INR'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-brand-text-primary">
                {editingPriceList ? 'Edit Price List Tariff' : 'Create New Price Tariff'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded text-brand-text-secondary hover:bg-brand-bg-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-text-primary mb-1">Price List Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Standard Pan-India Wholesale 2026"
                    className="w-full p-2 border rounded border-brand-border outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-text-primary mb-1">Company ID</label>
                  <input
                    type="text"
                    value={formData.companyId}
                    onChange={(e) => setFormData(p => ({ ...p, companyId: e.target.value }))}
                    className="w-full p-2 border rounded border-brand-border font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-text-primary mb-1">Effective From *</label>
                  <input
                    type="date"
                    required
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
                  placeholder="Additional tariff description or notes..."
                  className="w-full p-2 border rounded border-brand-border outline-none"
                />
              </div>

              {/* LINE ITEMS FORM SECTION */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-brand-text-primary uppercase tracking-wider">Line Items Configuration</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-2 py-1 bg-brand-bg-secondary text-brand-text-primary font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-2 border rounded bg-brand-bg-secondary/20 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-[11px]">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-brand-text-secondary">Product ID</label>
                        <input
                          type="text"
                          value={item.productId}
                          onChange={(e) => handleLineItemChange(idx, 'productId', e.target.value)}
                          className="w-full p-1 border rounded font-mono text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-text-secondary">Base Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.basePrice}
                          onChange={(e) => handleLineItemChange(idx, 'basePrice', parseFloat(e.target.value) || 0)}
                          className="w-full p-1 border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-text-secondary">MSRP</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.msrp || item.basePrice}
                          onChange={(e) => handleLineItemChange(idx, 'msrp', parseFloat(e.target.value) || 0)}
                          className="w-full p-1 border rounded font-mono"
                        />
                      </div>
                      <div className="flex items-end gap-1">
                        <div className="flex-1">
                          <label className="block font-bold text-brand-text-secondary">Min Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.minSellingPrice || item.basePrice}
                            onChange={(e) => handleLineItemChange(idx, 'minSellingPrice', parseFloat(e.target.value) || 0)}
                            className="w-full p-1 border rounded font-mono"
                          />
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                  {editingPriceList ? 'Update Tariff' : 'Create Tariff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-base font-bold text-brand-text-primary">Delete Price List</h3>
            </div>
            <p className="text-xs text-brand-text-secondary">
              Are you sure you want to soft-delete this price list? This action will mark the tariff and its line items as deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-3 py-1.5 border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeletingId)}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
