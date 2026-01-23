import { create } from 'zustand';
import { InventoryItem } from './inventoryData';
import { FilterState } from './filterInventory';

interface InventoryUiState {
  // View State
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // Pagination State
  page: number;
  setPage: (page: number | ((old: number) => number)) => void;

  // Selection State (Full Objects)
  selectedItems: InventoryItem[];
  toggleItem: (item: InventoryItem) => void;
  clearSelection: () => void;
  setSelection: (items: InventoryItem[]) => void;

  // Filter State
  // We can initialize this with your default empty state
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const defaultFilters: FilterState = {
    suppliers: [],
    polymers: [],
    forms: [],
    grades: [],
    locations: [],
    warehouses: [],
    dateRange: { from: undefined, to: undefined },
    miRange: { from: undefined, to: undefined },
    densityRange: { from: undefined, to: undefined },
    izodRange: { from: undefined, to: undefined },
    quantityRange: { from: undefined, to: undefined },
    lots: [],
    searchQuery: "",
    includeNAMI: true,
    includeNADensity: true,
    includeNAIzod: true,
    qualityControl: { mi: false, izod: false, density: false },
};

export const useInventoryUiStore = create<InventoryUiState>((set) => ({
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),

  page: 0,
  setPage: (page) => set((state) => ({ 
    page: typeof page === 'function' ? page(state.page) : page 
  })),

  selectedItems: [],
  toggleItem: (item) => set((state) => {
    const exists = state.selectedItems.find((i) => i.id === item.id);
    if (exists) {
      return { selectedItems: state.selectedItems.filter((i) => i.id !== item.id) };
    } else {
      return { selectedItems: [...state.selectedItems, item] };
    }
  }),
  setSelection: (items) => set({ selectedItems: items }),
  clearSelection: () => set({ selectedItems: [] }),

  filters: defaultFilters,
  //   setFilters: (filters) => set({ filters }),
  setFilters: (filters) => set({ 
      filters, 
      page: 0
  })
}));