import { apiClient } from '../api/apiClient';
import {
  PriceList,
  CustomerPricingRule,
  DistributorPricingRule,
  DiscountRule,
  Promotion,
  TaxConfig,
  CurrencyConfig
} from '../types/pricing';

export const pricingService = {
  // Price Lists
  async getPriceLists(params?: Record<string, string | number | boolean | undefined>): Promise<PriceList[]> {
    return apiClient.get<PriceList[]>('/api/v1/pricing/price-lists', { params });
  },

  async getPriceListById(id: string): Promise<PriceList> {
    return apiClient.get<PriceList>(`/api/v1/pricing/price-lists/${id}`);
  },

  async createPriceList(payload: Partial<PriceList>): Promise<PriceList> {
    return apiClient.post<PriceList>('/api/v1/pricing/price-lists', payload);
  },

  async updatePriceList(id: string, payload: Partial<PriceList>): Promise<PriceList> {
    return apiClient.put<PriceList>(`/api/v1/pricing/price-lists/${id}`, payload);
  },

  async archivePriceList(id: string): Promise<void> {
    return apiClient.post<void>(`/api/v1/pricing/price-lists/${id}/archive`);
  },

  // Customer Pricing
  async getCustomerPricingRules(): Promise<CustomerPricingRule[]> {
    return apiClient.get<CustomerPricingRule[]>('/api/v1/pricing/customer-rules');
  },

  // Distributor Pricing
  async getDistributorPricingRules(): Promise<DistributorPricingRule[]> {
    return apiClient.get<DistributorPricingRule[]>('/api/v1/pricing/distributor-rules');
  },

  // Discounts
  async getDiscountRules(): Promise<DiscountRule[]> {
    return apiClient.get<DiscountRule[]>('/api/v1/pricing/discounts');
  },

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return apiClient.get<Promotion[]>('/api/v1/pricing/promotions');
  },

  // Tax Configuration
  async getTaxConfigs(): Promise<TaxConfig[]> {
    return apiClient.get<TaxConfig[]>('/api/v1/pricing/taxes');
  },

  // Currency Configuration
  async getCurrencies(): Promise<CurrencyConfig[]> {
    return apiClient.get<CurrencyConfig[]>('/api/v1/pricing/currencies');
  }
};
