const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

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

  async getInventoryById(id: string, token: string): Promise<any> {
    return this.request(`/inventory/${id}`, token);
  }

  // --- EXPORT FUNCTION ---
  async exportInventory(
    filters: any = {},
    sortBy: string,
    token: string
  ): Promise<void> {
    const params = this.buildSearchParams(filters, sortBy);

    const response = await fetch(`${this.baseUrl}/inventory/export?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async getInventory(
    filters: any = {},
    pageParam: number = 0,
    token: string
  ): Promise<{ data: any[]; totalPages: number; totalElements: number }> {

    const params = this.buildSearchParams(filters, filters.sortBy);
    params.append('page', pageParam.toString());
    params.append('size', '50');

    const response = await this.request<any>(`/inventory?${params.toString()}`, token);


    // Get the list of items
    const root = response.data || response;
    const content = root.content || [];

    // Get the metadata
    // it's inside response.data.page.totalPages
    const pageInfo = root.page || {};

    return {
      data: content,
      totalPages: pageInfo.totalPages || root.totalPages || 0,
      totalElements: pageInfo.totalElements || root.totalElements || 0
    };
  }

  async getFilters(token: string): Promise<{
    suppliers: string[];
    grades: string[];
    forms: string[];
    polymers: string[];
    warehouses: string[];
    locations: string[];
    lots: string[];
    miRange?: string[];      // ["0.5", "50.0"]
    densityRange?: string[]; // ["0.91", "0.98"]
    izodRange?: string[];    // ["2.0", "15.0"]
  }> {
    return this.request(`/inventory/filters`, token);
  }

  // --- HELPER: CENTRALIZED PARAM BUILDER ---
  // This ensures Export and Search use EXACTLY the same logic
  private buildSearchParams(filters: any, sortBy: string): URLSearchParams {
    const params = new URLSearchParams();

    // Text Search
    if (filters.searchQuery) params.append('searchText', filters.searchQuery);

    // Arrays
    if (filters.polymers?.length) params.append('polymerCodes', filters.polymers.join(','));
    if (filters.suppliers?.length) params.append('suppliers', filters.suppliers.join(','));
    if (filters.forms?.length) params.append('formCodes', filters.forms.join(','));
    if (filters.grades?.length) params.append('gradeCodes', filters.grades.join(','));
    if (filters.warehouses?.length) params.append('warehouseNames', filters.warehouses.join(','));
    if (filters.locations?.length) {
      params.append('locationGroups', filters.locations.join(','));
    }
    if (filters.lots?.length) params.append('lots', filters.lots.join(','));

    // --- RANGE SLIDERS ---
    if (filters.miRange?.from !== undefined) params.append('minMi', filters.miRange.from.toString());
    if (filters.miRange?.to !== undefined) params.append('maxMi', filters.miRange.to.toString());

    if (filters.densityRange?.from !== undefined) params.append('minDensity', filters.densityRange.from.toString());
    if (filters.densityRange?.to !== undefined) params.append('maxDensity', filters.densityRange.to.toString());

    if (filters.izodRange?.from !== undefined) params.append('minIzod', filters.izodRange.from.toString());
    if (filters.izodRange?.to !== undefined) params.append('maxIzod', filters.izodRange.to.toString());
    if (filters.dateRange?.from) {
      // toISOString() gives "2023-10-25T14:00:00.000Z", split keeps only "2023-10-25"
      const dateStr = filters.dateRange.from.toISOString().split('T')[0];
      params.append('startDate', dateStr);
    }

    if (filters.dateRange?.to) {
      const dateStr = filters.dateRange.to.toISOString().split('T')[0];
      params.append('endDate', dateStr);
    }

    // --- QUANTITY (This was missing!) ---
    if (filters.quantityRange?.from !== undefined) params.append('minQty', filters.quantityRange.from.toString());
    if (filters.quantityRange?.to !== undefined) params.append('maxQty', filters.quantityRange.to.toString());

    // --- QC & INCLUDE N/A FLAGS ---
    if (filters.qualityControl?.mi) params.append('qcMi', 'true');
    if (filters.qualityControl?.density) params.append('qcDensity', 'true');
    if (filters.qualityControl?.izod) params.append('qcIzod', 'true');

    // Add these "Include NA" flags:
    if (filters.includeNAMI) params.append('includeNAMI', 'true');
    if (filters.includeNADensity) params.append('includeNADensity', 'true');
    if (filters.includeNAIzod) params.append('includeNAIzod', 'true');
    // Sorting
    if (sortBy) params.append('sort', sortBy);

    return params;
  }
}

export const api = new ApiClient(API_BASE_URL);
