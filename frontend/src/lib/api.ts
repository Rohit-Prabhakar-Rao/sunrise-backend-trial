const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Helper to make requests with the Bearer Token
   */
  private async request<T>(
    endpoint: string, 
    token: string | null, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers as any,
    };

    // Attach the Token if it exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }
  /**
   * Get a single inventory item by ID
   */
  async getInventoryById(id: string, token: string): Promise<any> {
    return this.request(`/inventory/${id}`, token);
  }

  /**
   * Export filtered inventory to Excel
   */
  async exportInventory(
    filters: any = {}, 
    sortBy: string, 
    token: string
  ): Promise<void> {
    
    // 1. Start with empty params
    const params = new URLSearchParams();
    
    // Text Search
    if (filters.searchQuery) params.append('searchText', filters.searchQuery);

    // Arrays (Join with commas)
    if (filters.polymers?.length) params.append('polymerCodes', filters.polymers.join(','));
    if (filters.suppliers?.length) params.append('suppliers', filters.suppliers.join(','));
    if (filters.forms?.length) params.append('formCodes', filters.forms.join(','));
    if (filters.grades?.length) params.append('gradeCodes', filters.grades.join(','));
    if (filters.warehouses?.length) params.append('warehouseNames', filters.warehouses.join(','));
    if (filters.locationGroups?.length) params.append('locationGroups', filters.locationGroups.join(','));
    if (filters.lots?.length) params.append('lots', filters.lots.join(','));

    // Ranges (Sliders)
    if (filters.miRange?.from) params.append('minMi', filters.miRange.from.toString());
    if (filters.miRange?.to) params.append('maxMi', filters.miRange.to.toString());

    if (filters.densityRange?.from) params.append('minDensity', filters.densityRange.from.toString());
    if (filters.densityRange?.to) params.append('maxDensity', filters.densityRange.to.toString());

    if (filters.izodRange?.from) params.append('minIzod', filters.izodRange.from.toString());
    if (filters.izodRange?.to) params.append('maxIzod', filters.izodRange.to.toString());

    // Sorting
    if (sortBy) params.append('sort', sortBy);
    
    // 3. Send Request with the Params attached
    const response = await fetch(`${this.baseUrl}/inventory/export?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error("Export failed");

    // 4. Handle File Download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /**
   * Get inventory data with Pagination, Filters, and Auth Token
   */
  async getInventory(
    filters: any = {}, 
    pageParam: number = 0, 
    token: string
  ): Promise<{ data: any[] }> {
    
    const params = new URLSearchParams();

    // --- 1. Pagination ---
    params.append('page', pageParam.toString());
    params.append('size', '50');

    // --- 2. Text Search ---
    // Frontend uses 'searchQuery', Backend expects 'searchText'
    if (filters.searchQuery) params.append('searchText', filters.searchQuery);

    // --- 3. Checkbox Filters ---
    // Mapping frontend names to backend DTO fields
    if (filters.polymers?.length) params.append('polymerCodes', filters.polymers.join(','));
    if (filters.suppliers?.length) params.append('suppliers', filters.suppliers.join(','));
    if (filters.forms?.length) params.append('formCodes', filters.forms.join(','));
    if (filters.grades?.length) params.append('gradeCodes', filters.grades.join(','));
    if (filters.warehouses?.length) params.append('warehouseNames', filters.warehouses.join(','));
    if (filters.locationGroups?.length) params.append('locationGroups', filters.locationGroups.join(','));

    // --- 4. Range Sliders ---
    // Melt Index
    if (filters.miRange?.from) params.append('minMi', filters.miRange.from.toString());
    if (filters.miRange?.to) params.append('maxMi', filters.miRange.to.toString());

    // Density
    if (filters.densityRange?.from) params.append('minDensity', filters.densityRange.from.toString());
    if (filters.densityRange?.to) params.append('maxDensity', filters.densityRange.to.toString());

    // Izod Impact
    if (filters.izodRange?.from) params.append('minIzod', filters.izodRange.from.toString());
    if (filters.izodRange?.to) params.append('maxIzod', filters.izodRange.to.toString());

    // --- 5. Sorting ---
    if (filters.sortBy) params.append('sort', filters.sortBy);

    // Send Request with Token
    return this.request(`/inventory?${params.toString()}`, token);
  }
}

export const api = new ApiClient(API_BASE_URL);
