export type PriceListStatus = 'Draft' | 'Published' | 'Archived' | 'Expired' | 'Active';

export interface PriceListItem {
  id?: string;
  priceListId?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  basePrice: number;
  costPrice?: number;
  wholesalePrice?: number;
  msrp?: number;
  minSellingPrice?: number;
  sellingPrice?: number;
  currencyCode?: string;
  effectiveDate?: string;
  isActive?: boolean;
}

export interface PriceList {
  id: string;
  companyId?: string;
  code?: string;
  name: string;
  type?: 'Standard' | 'Distributor' | 'Retail' | 'Special';
  currency?: string;
  description?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  effectiveDate?: string;
  expiryDate?: string;
  version: number;
  status: PriceListStatus;
  concurrencyToken?: string;
  isDeleted?: boolean;
  createdAtUtc?: string;
  lastModifiedAtUtc?: string;
  itemsCount?: number;
  items?: PriceListItem[];
}

export interface PagedPriceListResult {
  items: PriceList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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
