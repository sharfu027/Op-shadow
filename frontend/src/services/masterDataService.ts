import { apiClient } from '../api/apiClient';
import { CompanyDto, BranchDto, DepartmentDto, DesignationDto, UnitOfMeasureDto, BrandDto, CategoryDto, WarehouseDto, ProductDto, SupplierDto, CustomerDto, EmployeeDto } from '../types/masterData';

const API_BASE_URL = '/api/v1/masters';

const getAuthToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('ink_erp_auth_token') || '' : '';
};

export async function fetchCompanies(params?: Record<string, string | number | boolean | undefined>): Promise<any> {
  return apiClient.get<any>(`${API_BASE_URL}/company`, { params });
}

export async function fetchCompanyById(id: string): Promise<CompanyDto> {
  return apiClient.get<CompanyDto>(`${API_BASE_URL}/company/${id}`);
}

export async function fetchCompanyLookup(): Promise<any[]> {
  return apiClient.get<any[]>(`${API_BASE_URL}/company/lookup`);
}

export async function createCompany(data: Partial<CompanyDto>): Promise<CompanyDto> {
  return apiClient.post<CompanyDto>(`${API_BASE_URL}/company`, data);
}

export async function updateCompany(id: string, data: Partial<CompanyDto>): Promise<CompanyDto> {
  return apiClient.put<CompanyDto>(`${API_BASE_URL}/company/${id}`, data);
}

export async function archiveCompany(id: string): Promise<CompanyDto> {
  return apiClient.post<CompanyDto>(`${API_BASE_URL}/company/${id}/archive`);
}

export async function restoreCompany(id: string): Promise<CompanyDto> {
  return apiClient.post<CompanyDto>(`${API_BASE_URL}/company/${id}/restore`);
}

export async function deleteCompany(id: string): Promise<void> {
  return apiClient.delete<void>(`${API_BASE_URL}/company/${id}`);
}

export async function fetchBranches(companyId?: string, search?: string, status?: string): Promise<BranchDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/branch?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch branches:', err);
    return [];
  }
}

export async function createBranch(data: Omit<BranchDto, 'id' | 'createdAtUtc' | 'companyName'>): Promise<BranchDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/branch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create branch:', err);
    return null;
  }
}

export async function fetchDepartments(branchId?: string, search?: string, status?: string): Promise<DepartmentDto[]> {
  try {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/department?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch departments:', err);
    return [];
  }
}

export async function createDepartment(data: Omit<DepartmentDto, 'id' | 'createdAtUtc' | 'branchName'>): Promise<DepartmentDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/department`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create department:', err);
    return null;
  }
}

export async function fetchDesignations(companyId?: string, search?: string, status?: string): Promise<DesignationDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/designation?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch designations:', err);
    return [];
  }
}

export async function createDesignation(data: Omit<DesignationDto, 'id' | 'createdAtUtc' | 'companyName'>): Promise<DesignationDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/designation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create designation:', err);
    return null;
  }
}

export async function fetchUnitsOfMeasure(companyId?: string, search?: string, status?: string): Promise<UnitOfMeasureDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/uom?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch UOMs:', err);
    return [];
  }
}

export async function createUnitOfMeasure(data: Omit<UnitOfMeasureDto, 'id' | 'createdAtUtc' | 'companyName'>): Promise<UnitOfMeasureDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/uom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create UOM:', err);
    return null;
  }
}

export async function fetchBrands(companyId?: string, search?: string, status?: string): Promise<BrandDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/brand?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch brands:', err);
    return [];
  }
}

export async function createBrand(data: Omit<BrandDto, 'id' | 'createdAtUtc' | 'companyName'>): Promise<BrandDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/brand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create brand:', err);
    return null;
  }
}

export async function fetchCategories(companyId?: string, search?: string, status?: string): Promise<CategoryDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/category?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

export async function createCategory(data: Omit<CategoryDto, 'id' | 'createdAtUtc' | 'companyName' | 'parentCategoryName'>): Promise<CategoryDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create category:', err);
    return null;
  }
}

export async function fetchWarehouses(companyId?: string, branchId?: string, search?: string, status?: string): Promise<WarehouseDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (branchId) params.append('branchId', branchId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/warehouse?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch warehouses:', err);
    return [];
  }
}

export async function createWarehouse(data: Omit<WarehouseDto, 'id' | 'createdAtUtc'>): Promise<WarehouseDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create warehouse:', err);
    return null;
  }
}

export async function fetchProducts(companyId?: string, categoryId?: string, brandId?: string, search?: string, status?: string): Promise<ProductDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (categoryId) params.append('categoryId', categoryId);
    if (brandId) params.append('brandId', brandId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/product?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function createProduct(data: Omit<ProductDto, 'id' | 'createdAtUtc' | 'companyName' | 'categoryName' | 'brandName' | 'baseUomCode'>): Promise<ProductDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create product:', err);
    return null;
  }
}

export async function fetchSuppliers(companyId?: string, search?: string, status?: string): Promise<SupplierDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/supplier?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch suppliers:', err);
    return [];
  }
}

export async function createSupplier(data: Omit<SupplierDto, 'id' | 'createdAtUtc' | 'companyName'>): Promise<SupplierDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/supplier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create supplier:', err);
    return null;
  }
}

export async function fetchCustomers(companyId?: string, search?: string, status?: string): Promise<CustomerDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/customer?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch customers:', err);
    return [];
  }
}

export async function createCustomer(data: Omit<CustomerDto, 'id' | 'createdAtUtc' | 'companyName'>): Promise<CustomerDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create customer:', err);
    return null;
  }
}

export async function fetchEmployees(companyId?: string, branchId?: string, departmentId?: string, search?: string, status?: string): Promise<EmployeeDto[]> {
  try {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (branchId) params.append('branchId', branchId);
    if (departmentId) params.append('departmentId', departmentId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/employee?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    return [];
  }
}

export async function createEmployee(data: Omit<EmployeeDto, 'id' | 'createdAtUtc' | 'companyName' | 'branchName' | 'departmentName' | 'designationTitle' | 'fullName'>): Promise<EmployeeDto | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/employee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to create employee:', err);
    return null;
  }
}

export async function deleteMasterEntity(entityEndpoint: string, id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${entityEndpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return response.ok;
  } catch (err) {
    console.error(`Failed to delete ${entityEndpoint} record ${id}:`, err);
    return false;
  }
}
