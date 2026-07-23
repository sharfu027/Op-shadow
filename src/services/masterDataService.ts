import { apiClient } from '../api/apiClient';
import {
  Company,
  Branch,
  Department,
  Designation,
  Employee,
  Customer,
  Supplier,
  ProductCategory,
  Brand,
  Product,
  Unit,
  Warehouse
} from '../types/masterData';

export const masterDataService = {
  // Generic CRUD Contract Methods
  async getEntities<T>(entityModule: string, params?: Record<string, string | number | boolean | undefined>): Promise<T[]> {
    return apiClient.get<T[]>(`/api/v1/master-data/${entityModule}`, { params });
  },

  async getEntityById<T>(entityModule: string, id: string): Promise<T> {
    return apiClient.get<T>(`/api/v1/master-data/${entityModule}/${id}`);
  },

  async createEntity<T>(entityModule: string, payload: Partial<T>): Promise<T> {
    return apiClient.post<T>(`/api/v1/master-data/${entityModule}`, payload);
  },

  async updateEntity<T>(entityModule: string, id: string, payload: Partial<T>): Promise<T> {
    return apiClient.put<T>(`/api/v1/master-data/${entityModule}/${id}`, payload);
  },

  async deleteEntity(entityModule: string, id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/master-data/${entityModule}/${id}`);
  },

  async restoreEntity<T>(entityModule: string, id: string): Promise<T> {
    return apiClient.post<T>(`/api/v1/master-data/${entityModule}/${id}/restore`);
  },

  // Specialized Entity Contracts
  async getCompanies(): Promise<Company[]> {
    return masterDataService.getEntities<Company>('companies');
  },

  async getBranches(): Promise<Branch[]> {
    return masterDataService.getEntities<Branch>('branches');
  },

  async getDepartments(): Promise<Department[]> {
    return masterDataService.getEntities<Department>('departments');
  },

  async getDesignations(): Promise<Designation[]> {
    return masterDataService.getEntities<Designation>('designations');
  },

  async getEmployees(): Promise<Employee[]> {
    return masterDataService.getEntities<Employee>('employees');
  },

  async getCustomers(): Promise<Customer[]> {
    return masterDataService.getEntities<Customer>('customers');
  },

  async getSuppliers(): Promise<Supplier[]> {
    return masterDataService.getEntities<Supplier>('suppliers');
  },

  async getCategories(): Promise<ProductCategory[]> {
    return masterDataService.getEntities<ProductCategory>('categories');
  },

  async getBrands(): Promise<Brand[]> {
    return masterDataService.getEntities<Brand>('brands');
  },

  async getProducts(): Promise<Product[]> {
    return masterDataService.getEntities<Product>('products');
  },

  async getUnits(): Promise<Unit[]> {
    return masterDataService.getEntities<Unit>('units');
  },

  async getWarehouses(): Promise<Warehouse[]> {
    return masterDataService.getEntities<Warehouse>('warehouses');
  }
};
