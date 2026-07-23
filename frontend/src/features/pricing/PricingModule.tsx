import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import {
  PriceList,
  PriceListStatus,
  CustomerPricingRule,
  DistributorPricingRule,
  DiscountRule,
  Promotion,
  TaxConfig,
  CurrencyConfig
} from '../../types/pricing';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial Mock Price Lists State matching production requirements
  const [priceLists, setPriceLists] = useState<PriceList[]>([
    { id: 'PL-101', code: 'PL-STD-2026', name: 'Standard Pan-India Price List', type: 'Standard', currency: 'INR', effectiveDate: '2026-01-01', expiryDate: '2026-12-31', version: 2, status: 'Active', itemsCount: 140 },
    { id: 'PL-102', code: 'PL-DIST-WEST', name: 'West Region Distributor Matrix', type: 'Distributor', currency: 'INR', effectiveDate: '2026-04-01', expiryDate: '2027-03-31', version: 1, status: 'Active', itemsCount: 88 },
    { id: 'PL-103', code: 'PL-RETAIL-DEL', name: 'Delhi NCR Modern Trade Tier 1', type: 'Retail', currency: 'INR', effectiveDate: '2026-06-01', expiryDate: '2026-11-30', version: 3, status: 'Draft', itemsCount: 45 },
    { id: 'PL-104', code: 'PL-PROMO-FEST', name: 'Diwali Wholesale Special Tariff', type: 'Special', currency: 'INR', effectiveDate: '2025-10-01', expiryDate: '2025-11-15', version: 1, status: 'Archived', itemsCount: 22 }
  ]);

  // Initial Mock Customer Pricing Rules
  const [customerRules, setCustomerRules] = useState<CustomerPricingRule[]>([
    { id: 'CPR-01', customerId: 'CUST-001', customerName: 'Reliance Retail Chain', productId: 'PRD-901', productName: 'Surf Excel Quick Wash 1kg', specialPrice: 185, discountPercent: 12, priority: 1, status: 'Active' },
    { id: 'CPR-02', customerId: 'CUST-002', customerName: 'Metro Cash & Carry', productId: 'PRD-904', productName: 'Dove Hair Fall Rescue Shampoo 650ml', specialPrice: 420, discountPercent: 8, priority: 2, status: 'Active' }
  ]);

  // Initial Mock Distributor Pricing Rules
  const [distributorRules, setDistributorRules] = useState<DistributorPricingRule[]>([
    { id: 'DPR-01', distributorId: 'DIST-90', distributorName: 'Apex Logistics Hub', region: 'North', territory: 'Delhi NCR', productId: 'PRD-901', productName: 'Surf Excel Quick Wash 1kg', agreedPrice: 170, status: 'Active' },
    { id: 'DPR-02', distributorId: 'DIST-92', distributorName: 'Western FMCG Traders', region: 'West', territory: 'Mumbai South', productId: 'PRD-902', productName: 'Rin Detergent Bar 250g', agreedPrice: 28, status: 'Active' }
  ]);

  // Initial Mock Discount Rules
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([
    { id: 'DSC-10', code: 'DISC-BULK-50', name: 'Bulk Order 50+ Cartons Tier', type: 'Quantity', value: 7.5, minQuantity: 50, status: 'Active' },
    { id: 'DSC-11', code: 'DISC-FLAT-MON', name: 'Monthly Distributor Volume Flat Off', type: 'Flat', value: 5000, status: 'Active' }
  ]);

  // Initial Mock Promotions
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 'PRM-01', code: 'BOGO-SOAP', name: 'Buy 5 Get 1 Free Soap Pack', type: 'BuyXGetY', discountValue: 0, buyQuantity: 5, getQuantity: 1, startDate: '2026-07-01', endDate: '2026-08-15', status: 'Active' },
    { id: 'PRM-02', code: 'COUPON-FMCG', name: 'Festive Monsoon ₹500 Coupon', type: 'Coupon', discountValue: 500, couponCode: 'MONSOON500', startDate: '2026-07-15', endDate: '2026-07-31', status: 'Active' }
  ]);

  // Initial Mock Tax Configs
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>([
    { id: 'TAX-01', code: 'GST-18', name: 'Standard FMCG GST 18%', type: 'GST', ratePercent: 18, category: 'Standard', status: 'Active' },
    { id: 'TAX-02', code: 'GST-05', name: 'Essential Goods GST 5%', type: 'GST', ratePercent: 5, category: 'Reduced', status: 'Active' }
  ]);

  // Initial Mock Currencies
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([
    { id: 'CUR-01', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1.0, isBase: true, status: 'Active' },
    { id: 'CUR-02', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 83.5, isBase: false, status: 'Active' }
  ]);

  const handleCreatePriceList = () => {
    const newList: PriceList = {
      id: `PL-${Math.floor(100 + Math.random() * 900)}`,
      code: 'PL-NEW-2026',
      name: 'New Custom Regional Tariff',
      type: 'Distributor',
      currency: 'INR',
      effectiveDate: '2026-08-01',
      expiryDate: '2026-12-31',
      version: 1,
      status: 'Active',
      itemsCount: 0
    };
    setPriceLists([newList, ...priceLists]);
    setIsModalOpen(false);
    onTriggerToast('success', 'Price List Created', 'New pricing tariff version 1.0 published.');
  };

  const handleToggleStatus = (id: string) => {
    setPriceLists(prev => prev.map(pl => {
      if (pl.id === id) {
        const nextStatus: PriceListStatus = pl.status === 'Active' ? 'Draft' : 'Active';
        return { ...pl, status: nextStatus };
      }
      return pl;
    }));
    onTriggerToast('info', 'Price List Status Shifted', `Tariff ${id} state updated.`);
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: PRICING KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Price Tariffs" 
          value={priceLists.filter(p => p.status === 'Active').length} 
          badgeText="Live Synced" 
          badgeVariant="success"
          subLabel="Total Tariffs Configured"
          subValue={`${priceLists.length} Lists`}
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
          <div className="p-4 border-b border-brand-border bg-brand-bg-secondary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search price list code, name..." />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-brand-primary hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition shadow-sm"
            >
              <Plus size={14} /> Create Price Tariff
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-bg-secondary border-b border-brand-border text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="p-3">Tariff Code</th>
                  <th className="p-3">Tariff Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Currency</th>
                  <th className="p-3">Effective Date</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3 text-center">Version</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {priceLists.map(list => (
                  <tr key={list.id} className="hover:bg-brand-bg-secondary/30 transition text-brand-text-primary">
                    <td className="p-3 font-mono font-bold text-brand-primary">{list.code}</td>
                    <td className="p-3 font-semibold">{list.name}</td>
                    <td className="p-3">{list.type}</td>
                    <td className="p-3 font-mono">{list.currency}</td>
                    <td className="p-3 text-brand-text-secondary">{list.effectiveDate}</td>
                    <td className="p-3 text-brand-text-secondary">{list.expiryDate}</td>
                    <td className="p-3 text-center font-mono font-bold">v{list.version}.0</td>
                    <td className="p-3 text-center">
                      <Badge variant={list.status === 'Active' ? 'success' : list.status === 'Draft' ? 'warning' : 'neutral'}>
                        {list.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleToggleStatus(list.id)}
                        className="p-1 border border-brand-border rounded hover:bg-brand-bg-secondary text-brand-text-secondary cursor-pointer"
                        title="Toggle Tariff Active State"
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        onClick={() => onTriggerToast('info', 'Viewing Price Tariff', `Inspecting items in ${list.code}`)}
                        className="p-1 border border-brand-border rounded hover:bg-brand-bg-secondary text-brand-text-primary cursor-pointer"
                        title="View Price List Items"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* CREATE MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-md w-full p-6 space-y-4 shadow-xl-flat animate-fade-in">
            <h3 className="text-base font-bold text-brand-text-primary">Create New Pricing Tariff</h3>
            <p className="text-xs text-brand-text-secondary">Configure a new standard or distributor price tariff for catalog items.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-text-primary mb-1">Tariff Code</label>
                <input type="text" defaultValue="PL-CUSTOM-2026" className="w-full p-2 border rounded border-brand-border" />
              </div>
              <div>
                <label className="block font-bold text-brand-text-primary mb-1">Tariff Name</label>
                <input type="text" defaultValue="Regional Retail Matrix" className="w-full p-2 border rounded border-brand-border" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePriceList}
                className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-sm"
              >
                Publish Tariff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
