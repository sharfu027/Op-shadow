export type RequisitionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Cancelled';
export type POApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
export type POOrderStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Closed' | 'Cancelled';
export type GRNStatus = 'Pending Inspection' | 'Received' | 'Damage Recorded' | 'Completed';
export type InvoiceMatchingStatus = 'Unmatched' | 'Matched' | 'Discrepancy';

export interface VendorBankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  rating: number; // 1 to 5 stars
  gstNo: string;
  panNo: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  paymentTerms: string;
  bankDetails: VendorBankDetails;
  status: 'Active' | 'Inactive';
}

export interface RequisitionItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  totalEstimatedPrice: number;
}

export interface PurchaseRequisition {
  id: string;
  code: string;
  departmentId: string;
  departmentName: string;
  requestedBy: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requiredDate: string;
  status: RequisitionStatus;
  notes?: string;
  itemsCount?: number;
  totalAmount?: number;
  items?: RequisitionItem[];
}

export interface RFQQuote {
  vendorId: string;
  vendorName: string;
  quoteAmount: number;
  deliveryDays: number;
  validUntil: string;
  selected: boolean;
}

export interface RFQ {
  id: string;
  code: string;
  title: string;
  requisitionCode: string;
  quoteDeadline: string;
  status: 'Published' | 'Closed' | 'Evaluated';
  quotes: RFQQuote[];
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  vendorId: string;
  vendorName: string;
  poDate: string;
  expectedDeliveryDate: string;
  approvalStatus: POApprovalStatus;
  orderStatus: POOrderStatus;
  totalAmount: number;
  itemsCount?: number;
  items?: PurchaseOrderItem[];
}

export interface GRNItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
  batchNumber: string;
  expiryDate: string;
}

export interface GRN {
  id: string;
  code: string;
  poCode: string;
  vendorName: string;
  warehouseName: string;
  receiptDate: string;
  receivedBy: string;
  status: GRNStatus;
  items?: GRNItem[];
}

export interface PurchaseInvoice {
  id: string;
  code: string;
  invoiceNumber: string;
  poCode: string;
  grnCode: string;
  vendorName: string;
  invoiceDate: string;
  subtotal: number;
  taxAmount: number;
  freightAmount: number;
  netAmount: number;
  matchingStatus: InvoiceMatchingStatus;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
}

export interface VendorReturn {
  id: string;
  code: string;
  vendorName: string;
  grnCode: string;
  returnDate: string;
  reason: string;
  returnAmount: number;
  creditNoteRef?: string;
  status: 'Pending Approval' | 'Approved' | 'Credit Note Issued';
}

export interface ProcurementMetrics {
  openRequisitionsCount: number;
  pendingApprovalsCount: number;
  openPOsCount: number;
  avgVendorRating: number;
  monthlyProcurementSpend: number;
}
