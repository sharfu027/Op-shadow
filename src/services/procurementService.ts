import { apiClient } from '../api/apiClient';
import {
  Vendor,
  PurchaseRequisition,
  RFQ,
  PurchaseOrder,
  GRN,
  PurchaseInvoice,
  VendorReturn,
  ProcurementMetrics
} from '../types/procurement';

export const procurementService = {
  // Vendors
  async getVendors(params?: Record<string, string | number | boolean | undefined>): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>('/api/v1/procurement/vendors', { params });
  },

  async createVendor(payload: Partial<Vendor>): Promise<Vendor> {
    return apiClient.post<Vendor>('/api/v1/procurement/vendors', payload);
  },

  // Purchase Requisitions
  async getRequisitions(): Promise<PurchaseRequisition[]> {
    return apiClient.get<PurchaseRequisition[]>('/api/v1/procurement/requisitions');
  },

  async createRequisition(payload: Partial<PurchaseRequisition>): Promise<PurchaseRequisition> {
    return apiClient.post<PurchaseRequisition>('/api/v1/procurement/requisitions', payload);
  },

  // RFQs
  async getRFQs(): Promise<RFQ[]> {
    return apiClient.get<RFQ[]>('/api/v1/procurement/rfqs');
  },

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return apiClient.get<PurchaseOrder[]>('/api/v1/procurement/orders');
  },

  async createPurchaseOrder(payload: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>('/api/v1/procurement/orders', payload);
  },

  // GRN
  async getGRNs(): Promise<GRN[]> {
    return apiClient.get<GRN[]>('/api/v1/procurement/grns');
  },

  async createGRN(payload: Partial<GRN>): Promise<GRN> {
    return apiClient.post<GRN>('/api/v1/procurement/grns', payload);
  },

  // Purchase Invoices
  async getPurchaseInvoices(): Promise<PurchaseInvoice[]> {
    return apiClient.get<PurchaseInvoice[]>('/api/v1/procurement/invoices');
  },

  // Vendor Returns
  async getVendorReturns(): Promise<VendorReturn[]> {
    return apiClient.get<VendorReturn[]>('/api/v1/procurement/returns');
  },

  // Procurement KPIs
  async getProcurementMetrics(): Promise<ProcurementMetrics> {
    return apiClient.get<ProcurementMetrics>('/api/v1/procurement/metrics');
  }
};
