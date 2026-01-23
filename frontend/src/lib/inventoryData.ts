// This file contains type definitions and utility functions only

export interface RawInventoryItem {
  PanID: number;
  PanDate: string;
  InventoryID: number;
  SupplierID: number;
  SupplierCode: string;
  InventoryPO: string;
  ContainerNum: string;
  FolderID: number;
  FolderCode: string;
  LOT: number;
  LotName: string;
  sComment?: string | null;
  PolymerID: number;
  PolymerCode: string;
  FormID: number;
  FormCode: string;
  GradeID?: number | null;
  GradeCode?: string | null;
  PackID: number;
  Packing: string;
  PackLeft: number;
  WeightLeft: number;
  PartialLoad: number;
  DescriptorID?: number | null;
  Descriptor?: string | null;
  BrandID?: number | null;
  Brand?: string | null;
  wh: number;
  whname: string;
  WHsection?: string | null;
  LocationGroup: string;
  rcCompartment: string;
  Package: number;
  PanLevelAllocated: number;
  InventoryLevelAllocated: number;
  TotalAllocated: number;
  AvailableQty: number;
  AllocationCount: number;
  AllocationStatus: string;
  OverAllocatedBy: number;
  MI: number;
  Density?: number | null;
  Izod?: number | null;
  MI_A?: number | null;
  MI_CA?: number | null;
  MI_CB?: number | null;
  MI_B?: number | null;
  Density_A?: number | null;
  Density_CA?: number | null;
  Density_CB?: number | null;
  Density_B?: number | null;
  Izod_A?: number | null;
  Izod_CA?: number | null;
  Izod_CB?: number | null;
  Izod_B?: number | null;
  Allocated_POs?: string | null;
  Allocated_CustomerCodes?: string | null;
  Allocated_AllocationIDs?: string | null;
  Allocated_AllocationItemIDs?: string | null;
  Allocated_BookNums?: string | null;
  Allocated_ContNums?: string | null;
  Allocated_SOtypes?: string | null;
  PanLevel_POs?: string | null;
  PanLevel_CustomerCodes?: string | null;
  InventoryLevel_POs?: string | null;
  InventoryLevel_CustomerCodes?: string | null;
  Images?: string | null;
  SampleImages?: string | null;
}

export interface InventoryItem {
  id: string;
  panId: number;
  panDate: Date;
  inventoryId: number;
  supplierId: number;
  supplierCode: string;
  po: string;
  containerNum: string;
  folderId: number;
  folderCode: string;
  lot: number;
  lotName: string;
  comment?: string | null;
  polymerId: number;
  polymerCode: string;
  formId: number;
  formCode: string;
  gradeId?: number | null;
  gradeCode?: string | null;
  packId: number;
  packing: string;
  packLeft: number;
  weightLeft: number;
  partialLoad: number;
  descriptorId?: number | null;
  descriptor?: string | null;
  brandId?: number | null;
  brand?: string | null;
  warehouse: number;
  warehouseName: string;
  warehouseSection?: string | null;
  locationGroup: string;
  rcCompartment: string;
  package: number;
  panLevelAllocated: number;
  inventoryLevelAllocated: number;
  totalAllocated: number;
  availableQty: number;
  allocationCount: number;
  allocationStatus: string;
  overAllocatedBy: number;
  mi: number;
  density?: number | null;
  izod?: number | null;
  sampleImages: string[];
  allocatedCustomerCodes?: string | null;
  panLevelCustomerCodes?: string | null;
  inventoryLevelCustomerCodes?: string | null;
  allocatedPOs?: string | null;
  panLevelPOs?: string | null;
  inventoryLevelPOs?: string | null;
  allocatedAllocationIds?: string | null;
  allocatedBookNums?: string | null;
  allocatedContNums?: string | null;
  allocatedSOtypes?: string | null;
}

// Note: Data transformation is now handled by the backend API
// The backend transforms RawInventoryItem to InventoryItem format

export function getUniqueSuppliers(inventory: InventoryItem[]): string[] {
  const suppliers = new Set<string>();
  inventory.forEach((item) => {
    if (item.supplierCode) {
      suppliers.add(item.supplierCode);
    }
  });
  return Array.from(suppliers).sort();
}

export function getUniquePolymers(inventory: InventoryItem[]): string[] {
  const polymers = new Set<string>();
  inventory.forEach((item) => {
    if (item.polymerCode) {
      polymers.add(item.polymerCode);
    }
  });
  return Array.from(polymers).sort();
}

export function getUniqueForms(inventory: InventoryItem[]): string[] {
  const forms = new Set<string>();
  inventory.forEach((item) => {
    if (item.formCode) {
      forms.add(item.formCode);
    }
  });
  return Array.from(forms).sort();
}

export function getUniqueFolders(inventory: InventoryItem[]): string[] {
  const folders = new Set<string>();
  inventory.forEach((item) => {
    if (item.folderCode) {
      folders.add(item.folderCode);
    }
  });
  return Array.from(folders).sort();
}

export function getUniqueGrades(inventory: InventoryItem[]): string[] {
  const grades = new Set<string>();
  inventory.forEach((item) => {
    if (item.gradeCode) {
      grades.add(item.gradeCode);
    }
  });
  return Array.from(grades).sort();
}

export function getUniqueWarehouses(inventory: InventoryItem[]): string[] {
  const warehouses = new Set<string>();
  inventory.forEach((item) => {
    if (item.warehouseName && item.warehouseName !== "??") {
      warehouses.add(item.warehouseName);
    } else if (item.locationGroup) {
      warehouses.add(item.locationGroup);
    }
  });
  return Array.from(warehouses).sort();
}

export function getUniqueLots(inventory: InventoryItem[]): string[] {
  const lots = new Set<string>();
  inventory.forEach((item) => {
    // Use lotName if available, otherwise use lot number as string
    if (item.lotName && item.lotName.trim()) {
      lots.add(item.lotName);
    } else if (item.lot) {
      lots.add(item.lot.toString());
    }
  });
  return Array.from(lots).sort();
}

export function getMIRange(inventory: InventoryItem[]): [number, number] {
  const miValues = inventory.map((item) => item.mi).filter((mi) => mi != null);
  if (miValues.length === 0) return [0, 50];
  return [Math.min(...miValues), Math.max(...miValues)];
}

export function getDensityRange(inventory: InventoryItem[]): [number, number] | null {
  const densityValues = inventory
    .map((item) => item.density)
    .filter((d) => d != null) as number[];
  if (densityValues.length === 0) return null;
  return [Math.min(...densityValues), Math.max(...densityValues)];
}

export function getIzodRange(inventory: InventoryItem[]): [number, number] | null {
  const izodValues = inventory
    .map((item) => item.izod)
    .filter((i) => i != null) as number[];
  if (izodValues.length === 0) return null;
  return [Math.min(...izodValues), Math.max(...izodValues)];
}

export function getQuantityRange(inventory: InventoryItem[]): [number, number] {
  const quantities = inventory.map((item) => item.availableQty);
  if (quantities.length === 0) return [0, 10000];
  return [Math.min(...quantities), Math.max(...quantities)];
}

export function getDateRange(inventory: InventoryItem[]): [Date, Date] | null {
  if (inventory.length === 0) return null;
  const dates = inventory
    .map((item) => item.panDate)
    .filter((d) => d != null)
    .map((d) => d instanceof Date ? d : new Date(d));
  
  if (dates.length === 0) return null;
  
  return [
    new Date(Math.min(...dates.map((d) => d.getTime()))), 
    new Date(Math.max(...dates.map((d) => d.getTime())))
  ];
}

