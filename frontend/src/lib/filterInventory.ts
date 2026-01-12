import { InventoryItem } from "./inventoryData";

export interface FilterState {
  suppliers: string[];
  polymers: string[];
  forms: string[];
  grades: string[];
  folders: string[];
  warehouses: string[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  miRange: { from: number | undefined; to: number | undefined };
  densityRange: { from: number | undefined; to: number | undefined };
  izodRange: { from: number | undefined; to: number | undefined };
  quantityRange: { from: number | undefined; to: number | undefined };
  lots: string[];
  searchQuery: string;
  includeNAMI: boolean;
  includeNADensity: boolean;
  includeNAIzod: boolean;
  qualityControl: {
    mi: boolean;
    izod: boolean;
    density: boolean;
  };
}

export function filterInventory(
  inventory: InventoryItem[],
  filters: FilterState
): InventoryItem[] {
  return inventory.filter((item) => {
    // Supplier filter
    if (filters.suppliers.length > 0 && !filters.suppliers.includes(item.supplierCode)) {
      return false;
    }

    // Polymer filter
    if (filters.polymers.length > 0 && !filters.polymers.includes(item.polymerCode)) {
      return false;
    }

    // Form filter
    if (filters.forms.length > 0 && !filters.forms.includes(item.formCode)) {
      return false;
    }

    // Grade filter
    if (filters.grades.length > 0) {
      if (!item.gradeCode || !filters.grades.includes(item.gradeCode)) {
        return false;
      }
    }

    // Folder filter
    if (filters.folders.length > 0 && !filters.folders.includes(item.folderCode)) {
      return false;
    }

    // Warehouse filter
    if (filters.warehouses.length > 0) {
      const warehouseMatch =
        filters.warehouses.includes(item.warehouseName) ||
        filters.warehouses.includes(item.locationGroup);
      if (!warehouseMatch) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const itemDate = item.date instanceof Date ? item.date : new Date(item.date);
      if (filters.dateRange.from) {
        const fromDate = filters.dateRange.from instanceof Date ? filters.dateRange.from : new Date(filters.dateRange.from);
        if (itemDate < fromDate) {
          return false;
        }
      }
      if (filters.dateRange.to) {
        const toDate = filters.dateRange.to instanceof Date ? filters.dateRange.to : new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate > toDate) {
          return false;
        }
      }
    }

    // Quality Control MI filter (shows only N/A values)
    if (filters.qualityControl.mi) {
      const miValue = item.mi;
      const isMIValid = miValue != null && typeof miValue === "number" && !isNaN(miValue);
      if (isMIValid) {
        return false; // Quality control MI only shows N/A values
      }
    }

    // MI range filter
    const hasMIRange = filters.miRange.from !== undefined || filters.miRange.to !== undefined;
    if (hasMIRange) {
      const miValue = item.mi;
      const isMIValid = miValue != null && typeof miValue === "number" && !isNaN(miValue);
      
      if (!isMIValid) {
        // Item has N/A MI - only include if includeNAMI is true
        if (!filters.includeNAMI) {
          return false;
        }
      } else {
        // Item has valid MI - check range
        if (filters.miRange.from !== undefined && miValue < filters.miRange.from) {
          return false;
        }
        if (filters.miRange.to !== undefined && miValue > filters.miRange.to) {
          return false;
        }
      }
    }

    // Quality Control Density filter (shows only N/A values)
    if (filters.qualityControl.density) {
      const densityValue = item.density;
      const isDensityValid = densityValue != null && typeof densityValue === "number" && !isNaN(densityValue);
      if (isDensityValid) {
        return false; // Quality control Density only shows N/A values
      }
    }

    // Density range filter
    const hasDensityRange = filters.densityRange?.from !== undefined || filters.densityRange?.to !== undefined;
    if (hasDensityRange) {
      const densityValue = item.density;
      const isDensityValid = densityValue != null && typeof densityValue === "number" && !isNaN(densityValue);
      
      if (!isDensityValid) {
        // Item has N/A Density - only include if includeNADensity is true
        if (!filters.includeNADensity) {
          return false;
        }
      } else {
        // Item has valid Density - check range
        if (filters.densityRange?.from !== undefined && densityValue < filters.densityRange.from) {
          return false;
        }
        if (filters.densityRange?.to !== undefined && densityValue > filters.densityRange.to) {
          return false;
        }
      }
    }

    // Quality Control Izod filter (shows only N/A values)
    if (filters.qualityControl.izod) {
      const izodValue = item.izod;
      const isIzodValid = izodValue != null && typeof izodValue === "number" && !isNaN(izodValue);
      if (isIzodValid) {
        return false; // Quality control Izod only shows N/A values
      }
    }

    // Izod range filter
    const hasIzodRange = filters.izodRange?.from !== undefined || filters.izodRange?.to !== undefined;
    if (hasIzodRange) {
      const izodValue = item.izod;
      const isIzodValid = izodValue != null && typeof izodValue === "number" && !isNaN(izodValue);
      
      if (!isIzodValid) {
        // Item has N/A Izod - only include if includeNAIzod is true
        if (!filters.includeNAIzod) {
          return false;
        }
      } else {
        // Item has valid Izod - check range
        if (filters.izodRange?.from !== undefined && izodValue < filters.izodRange.from) {
          return false;
        }
        if (filters.izodRange?.to !== undefined && izodValue > filters.izodRange.to) {
          return false;
        }
      }
    }

    // Quantity range filter
    if (filters.quantityRange.from !== undefined && item.availableQty < filters.quantityRange.from) {
      return false;
    }
    if (filters.quantityRange.to !== undefined && item.availableQty > filters.quantityRange.to) {
      return false;
    }

    // Lot filter
    if (filters.lots.length > 0) {
      const itemLotName = item.lotName?.toLowerCase() || "";
      const itemLotNumber = item.lot.toString().toLowerCase();
      const matchesLot = filters.lots.some((selectedLot) => {
        const selectedLotLower = selectedLot.toLowerCase();
        return (
          itemLotName.includes(selectedLotLower) ||
          itemLotNumber.includes(selectedLotLower) ||
          itemLotName === selectedLotLower ||
          itemLotNumber === selectedLotLower
        );
      });
      if (!matchesLot) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        (item.polymerCode && item.polymerCode.toLowerCase().includes(query)) ||
        (item.gradeCode && item.gradeCode.toLowerCase().includes(query)) ||
        (item.supplierCode && item.supplierCode.toLowerCase().includes(query)) ||
        (item.po && item.po.toLowerCase().includes(query)) ||
        (item.containerNum && item.containerNum.toLowerCase().includes(query));
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
}

