export interface Company {
  id: string;
  code: string;
  name: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  status: 'Active' | 'Inactive';
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  companyId: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: 'Active' | 'Inactive';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  branchId: string;
  manager: string;
  employeeCount: number;
  status: 'Active' | 'Inactive';
}

export interface Designation {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  level: string;
  status: 'Active' | 'Inactive';
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  branch: string;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone?: string;
  email: string;
  balance?: number;
  creditLimit?: number;
  region?: string;
  status: 'Active' | 'Inactive';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone?: string;
  email: string;
  balance?: number;
  paymentTerms?: string;
  category?: string;
  status: 'Active' | 'Inactive';
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export type Category = ProductCategory;

export interface Brand {
  id: string;
  code: string;
  name: string;
  origin: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  price: number;
  taxRate: number;
  stockLevel: number;
  status: 'Active' | 'Inactive';
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  baseUnit: string;
  conversionFactor: number;
  status: 'Active' | 'Inactive';
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  capacitySft: number;
  manager: string;
  status: 'Active' | 'Inactive';
}

export interface SalesRep {
  id: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  email: string;
  territory?: string;
  region?: string;
  target?: number;
  monthlyTarget?: number;
  status: 'Active' | 'Inactive';
}
