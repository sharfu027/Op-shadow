export type PriceListStatus = 'Active' | 'Draft' | 'Archived' | 'Expired';

export interface PriceListItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  basePrice: number;
  costPrice: number;
  wholesalePrice: number;
  msrp: number;
  sellingPrice: number;
}

export interface PriceList {
  id: string;
  code: string;
  name: string;
  type: 'Standard' | 'Distributor' | 'Retail' | 'Special';
  currency: string;
  effectiveDate: string;
  expiryDate: string;
  version: number;
  status: PriceListStatus;
  itemsCount?: number;
  items?: PriceListItem[];
}

export interface CustomerPricingRule {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  specialPrice: number;
  discountPercent: number;
  priority: number;
  status: 'Active' | 'Inactive';
}

export interface DistributorPricingRule {
  id: string;
  distributorId: string;
  distributorName: string;
  region: string;
  territory: string;
  productId: string;
  productName: string;
  agreedPrice: number;
  status: 'Active' | 'Inactive';
}

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: 'Flat' | 'Percentage' | 'Tier' | 'Quantity';
  value: number;
  minQuantity?: number;
  categoryId?: string;
  productId?: string;
  status: 'Active' | 'Inactive';
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: 'BuyXGetY' | 'Bundle' | 'Combo' | 'LimitedTime' | 'Coupon';
  discountValue: number;
  couponCode?: string;
  buyQuantity?: number;
  getQuantity?: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Scheduled' | 'Expired';
}

export interface TaxConfig {
  id: string;
  code: string;
  name: string;
  type: 'GST' | 'VAT';
  ratePercent: number;
  category: 'Standard' | 'Reduced' | 'Zero' | 'Exempt';
  status: 'Active' | 'Inactive';
}

export interface CurrencyConfig {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBase: boolean;
  status: 'Active' | 'Inactive';
}
