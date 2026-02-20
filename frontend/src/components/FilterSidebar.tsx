import { useState, useEffect } from "react";
import { ChevronDown, Filter, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { getQuantityRange } from "@/lib/inventoryData";
import { FilterState } from "@/lib/filterInventory";

interface FilterSidebarProps {
  inventory: any[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filterOptions?: {
    suppliers: string[];
    grades: string[];
    forms: string[];
    polymers: string[];
    warehouses: string[];
    locations: string[];
    lots: string[];
    miRange?: string[];
    densityRange?: string[];
    izodRange?: string[];
    dateRange?: string[];
  };
  onApply: () => void;
  onReset?: () => void;
}

const FILTER_ORDER_STORAGE_KEY = "inventory-filter-order";

const DEFAULT_FILTER_ORDER = [
  "supplier",
  "polymer",
  "form",
  "date",
  "mi",
  "location",
  "lot",
  "grade",
  "warehouse",
  "density",
  "izod",
  "quantity",
  "qualityControl",
];

function loadFilterOrder(): string[] {
  try {
    const stored = localStorage.getItem(FILTER_ORDER_STORAGE_KEY);
    if (stored) {
      const savedOrder = JSON.parse(stored);
      const missingFilters = DEFAULT_FILTER_ORDER.filter(
        (filterId) => !savedOrder.includes(filterId)
      );
      return [...savedOrder, ...missingFilters];
    }
  } catch (error) {
    console.error("Failed to load filter order:", error);
  }
  return DEFAULT_FILTER_ORDER;
}

function saveFilterOrder(order: string[]): void {
  try {
    localStorage.setItem(FILTER_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    console.error("Failed to save filter order:", error);
  }
}

const parseRange = (rangeData: string[] | undefined, defaultMin: number, defaultMax: number): [number, number] => {
  if (!rangeData || rangeData.length < 2) return [defaultMin, defaultMax];
  const min = parseFloat(rangeData[0]);
  const max = parseFloat(rangeData[1]);
  return [isNaN(min) ? defaultMin : min, isNaN(max) ? defaultMax : max];
};
export const FilterSidebar = ({
  inventory,
  filters,
  onFiltersChange,
  filterOptions,
  onApply,
  onReset
}: FilterSidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "supplier",
    "polymer",
    "form",
  ]);
  const [filterOrder, setFilterOrder] = useState<string[]>(loadFilterOrder());
  const [draggedFilterId, setDraggedFilterId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // --- API DATA ---
  const suppliers = filterOptions?.suppliers || [];
  const polymers = filterOptions?.polymers || [];
  const forms = filterOptions?.forms || [];
  const locations = filterOptions?.locations || [];
  const grades = filterOptions?.grades || [];
  const warehouses = filterOptions?.warehouses || [];
  const lots = filterOptions?.lots || [];

  // --- RANGES ---
  const [globalMinMi, globalMaxMi] = parseRange(filterOptions?.miRange, 0, 100);
  const [globalMinDensity, globalMaxDensity] = parseRange(filterOptions?.densityRange, 0, 2.0);
  const [globalMinIzod, globalMaxIzod] = parseRange(filterOptions?.izodRange, 0, 20.0);
  const quantityRange = getQuantityRange(inventory);

  // --- DATE RANGE LOGIC ---
  const defaultMinDate = new Date();
  defaultMinDate.setFullYear(defaultMinDate.getFullYear() - 1);
  const defaultMaxDate = new Date();

  let globalMinDate = defaultMinDate;
  let globalMaxDate = defaultMaxDate;

  if (filterOptions?.dateRange && filterOptions.dateRange.length === 2) {
    const d1 = new Date(filterOptions.dateRange[0]);
    const d2 = new Date(filterOptions.dateRange[1]);
    if (!isNaN(d1.getTime())) globalMinDate = d1;
    if (!isNaN(d2.getTime())) globalMaxDate = d2;
  }

  const hasGrades = grades.length > 0;
  const hasDensity = !!filterOptions?.densityRange;
  const hasIzod = !!filterOptions?.izodRange;
  const hasMi = !!filterOptions?.miRange;

  useEffect(() => {
    saveFilterOrder(filterOrder);
  }, [filterOrder]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleDragStart = (filterId: string) => {
    setDraggedFilterId(filterId);
  };

  const handleDragOver = (e: React.DragEvent, filterId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedFilterId === null || draggedFilterId === filterId) return;
    if (dragOverTarget === filterId) return;

    const draggedIndex = filterOrder.indexOf(draggedFilterId);
    const targetIndex = filterOrder.indexOf(filterId);

    if (draggedIndex === -1 || targetIndex === -1) return;
    if (draggedIndex === targetIndex) {
      setDragOverTarget(filterId);
      return;
    }

    setDragOverTarget(filterId);
    const newOrder = [...filterOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedFilterId);
    setFilterOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedFilterId(null);
    setDragOverTarget(null);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };

    if (key === "qualityControl") {
      const qualityControl = value as FilterState["qualityControl"];
      if (qualityControl.mi) newFilters.miRange = { from: undefined, to: undefined };
      if (qualityControl.density) newFilters.densityRange = { from: undefined, to: undefined };
      if (qualityControl.izod) newFilters.izodRange = { from: undefined, to: undefined };
    }

    if (key === "miRange") {
      const miRange = value as FilterState["miRange"];
      if (miRange.from !== undefined || miRange.to !== undefined) {
        newFilters.qualityControl = { ...newFilters.qualityControl, mi: false };
      }
    }
    if (key === "densityRange") {
      const densityRange = value as FilterState["densityRange"];
      if (densityRange?.from !== undefined || densityRange?.to !== undefined) {
        newFilters.qualityControl = { ...newFilters.qualityControl, density: false };
      }
    }
    if (key === "izodRange") {
      const izodRange = value as FilterState["izodRange"];
      if (izodRange?.from !== undefined || izodRange?.to !== undefined) {
        newFilters.qualityControl = { ...newFilters.qualityControl, izod: false };
      }
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const initialFilters = {
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
      qualityControl: {
        mi: false,
        izod: false,
        density: false,
      },
    };

    // Update pending state
    onFiltersChange(initialFilters);

    // If onReset handler is provided, call it to apply changes immediately
    if (onReset) {
      onReset();
    }
  };

  const renderFilter = (filterId: string) => {
    switch (filterId) {
      case "supplier":
        return (
          <Collapsible
            key="supplier"
            open={expandedGroups.includes("supplier")}
            onOpenChange={() => toggleGroup("supplier")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("supplier"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "supplier"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Supplier</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("supplier") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down">
              <SearchableCombobox
                options={suppliers}
                selected={filters.suppliers}
                onSelectionChange={(selected) => updateFilter("suppliers", selected)}
                placeholder="Select suppliers..."
                searchPlaceholder="Search suppliers..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "polymer":
        return (
          <Collapsible
            key="polymer"
            open={expandedGroups.includes("polymer")}
            onOpenChange={() => toggleGroup("polymer")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("polymer"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "polymer"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Polymer</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("polymer") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down">
              <SearchableCombobox
                options={polymers}
                selected={filters.polymers}
                onSelectionChange={(selected) => updateFilter("polymers", selected)}
                placeholder="Select polymers..."
                searchPlaceholder="Search polymers..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "form":
        return (
          <Collapsible
            key="form"
            open={expandedGroups.includes("form")}
            onOpenChange={() => toggleGroup("form")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("form"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "form"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Form</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("form") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down">
              <SearchableCombobox
                options={forms}
                selected={filters.forms}
                onSelectionChange={(selected) => updateFilter("forms", selected)}
                placeholder="Select forms..."
                searchPlaceholder="Search forms..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "date":
        return (
          <Collapsible
            key="date"
            open={expandedGroups.includes("date")}
            onOpenChange={() => toggleGroup("date")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("date"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "date"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Date Range</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("date") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-4">
              <Slider
                min={globalMinDate.getTime()}
                max={globalMaxDate.getTime()}
                step={86400000} // 1 day in ms
                value={[
                  filters.dateRange.from?.getTime() ?? globalMinDate.getTime(),
                  filters.dateRange.to?.getTime() ?? globalMaxDate.getTime(),
                ]}
                onValueChange={(value) => updateFilter("dateRange", { from: new Date(value[0]), to: new Date(value[1]) })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.from ? format(filters.dateRange.from, "yyyy-MM-dd") : format(globalMinDate, "yyyy-MM-dd")}
                    min={format(globalMinDate, "yyyy-MM-dd")}
                    max={format(globalMaxDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : globalMinDate;
                      updateFilter("dateRange", { ...filters.dateRange, from: date });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.to ? format(filters.dateRange.to, "yyyy-MM-dd") : format(globalMaxDate, "yyyy-MM-dd")}
                    min={filters.dateRange.from ? format(filters.dateRange.from, "yyyy-MM-dd") : format(globalMinDate, "yyyy-MM-dd")}
                    max={format(globalMaxDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : globalMaxDate;
                      updateFilter("dateRange", { ...filters.dateRange, to: date });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "mi":
        if (!hasMi) return null;
        return (
          <Collapsible
            key="mi"
            open={expandedGroups.includes("mi")}
            onOpenChange={() => toggleGroup("mi")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("mi"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "mi"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Melt Index (MI)</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("mi") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-4">
              <Slider
                min={globalMinMi}
                max={globalMaxMi}
                step={0.01}
                value={[filters.miRange.from ?? globalMinMi, filters.miRange.to ?? globalMaxMi]}
                onValueChange={(value) => updateFilter("miRange", { from: value[0], to: value[1] })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.miRange.from ?? globalMinMi}
                    min={globalMinMi}
                    max={globalMaxMi}
                    step="0.01"
                    onChange={(e) => updateFilter("miRange", { ...filters.miRange, from: Math.max(globalMinMi, Math.min(globalMaxMi, parseFloat(e.target.value) || globalMinMi)) })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.miRange.to ?? globalMaxMi}
                    min={globalMinMi}
                    max={globalMaxMi}
                    step="0.01"
                    onChange={(e) => updateFilter("miRange", { ...filters.miRange, to: Math.max(globalMinMi, Math.min(globalMaxMi, parseFloat(e.target.value) || globalMaxMi)) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-na-mi"
                  checked={filters.includeNAMI}
                  onCheckedChange={(checked) => updateFilter("includeNAMI", checked === true)}
                />
                <Label htmlFor="include-na-mi" className="text-xs font-normal cursor-pointer">Include N/A values</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "location":
        return (
          <Collapsible
            key="location"
            open={expandedGroups.includes("location")}
            onOpenChange={() => toggleGroup("location")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("location"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "location"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Location</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("location") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down">
              <SearchableCombobox
                options={locations}
                selected={filters.locations}
                onSelectionChange={(selected) => updateFilter("locations", selected)}
                placeholder="Select locations..."
                searchPlaceholder="Search locations..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "lot":
        return (
          <Collapsible
            key="lot"
            open={expandedGroups.includes("lot")}
            onOpenChange={() => toggleGroup("lot")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("lot"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "lot"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Lot</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("lot") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down">
              <SearchableCombobox
                options={lots}
                selected={filters.lots}
                onSelectionChange={(selected) => updateFilter("lots", selected)}
                placeholder="Select lots..."
                searchPlaceholder="Search lots..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "grade":
        if (!hasGrades) return null;
        return (
          <Collapsible
            key="grade"
            open={expandedGroups.includes("grade")}
            onOpenChange={() => toggleGroup("grade")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("grade"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "grade"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Grade</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("grade") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-3">
              <SearchableCombobox
                options={grades}
                selected={filters.grades}
                onSelectionChange={(selected) => updateFilter("grades", selected)}
                placeholder="Select grades..."
                searchPlaceholder="Search grades..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "warehouse":
        return (
          <Collapsible
            key="warehouse"
            open={expandedGroups.includes("warehouse")}
            onOpenChange={() => toggleGroup("warehouse")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("warehouse"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "warehouse"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Warehouse</h3> {/* Fixed: Changed from 'Material Type' to 'Warehouse' */}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("warehouse") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down">
              <SearchableCombobox
                options={warehouses}
                selected={filters.warehouses}
                onSelectionChange={(selected) => updateFilter("warehouses", selected)}
                placeholder="Select warehouses..."
                searchPlaceholder="Search warehouses..."
              />
            </CollapsibleContent>
          </Collapsible>
        );

      case "density":
        if (!hasDensity) return null;
        return (
          <Collapsible
            key="density"
            open={expandedGroups.includes("density")}
            onOpenChange={() => toggleGroup("density")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("density"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "density"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Density</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("density") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-4">
              <Slider
                min={globalMinDensity}
                max={globalMaxDensity}
                step={0.001}
                value={[filters.densityRange?.from ?? globalMinDensity, filters.densityRange?.to ?? globalMaxDensity]}
                onValueChange={(value) => updateFilter("densityRange", { from: value[0], to: value[1] })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.densityRange?.from ?? globalMinDensity}
                    min={globalMinDensity}
                    max={globalMaxDensity}
                    step="0.001"
                    onChange={(e) => updateFilter("densityRange", { from: Math.max(globalMinDensity, Math.min(globalMaxDensity, parseFloat(e.target.value) || globalMinDensity)), to: filters.densityRange?.to ?? globalMaxDensity })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.densityRange?.to ?? globalMaxDensity}
                    min={globalMinDensity}
                    max={globalMaxDensity}
                    step="0.001"
                    onChange={(e) => updateFilter("densityRange", { from: filters.densityRange?.from ?? globalMinDensity, to: Math.max(globalMinDensity, Math.min(globalMaxDensity, parseFloat(e.target.value) || globalMaxDensity)) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-na-density"
                  checked={filters.includeNADensity}
                  onCheckedChange={(checked) => updateFilter("includeNADensity", checked === true)}
                />
                <Label htmlFor="include-na-density" className="text-xs font-normal cursor-pointer">Include N/A values</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "izod":
        if (!hasIzod) return null;
        return (
          <Collapsible
            key="izod"
            open={expandedGroups.includes("izod")}
            onOpenChange={() => toggleGroup("izod")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("izod"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "izod"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Izod Impact</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("izod") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-4">
              <Slider
                min={globalMinIzod}
                max={globalMaxIzod}
                step={0.1}
                value={[filters.izodRange?.from ?? globalMinIzod, filters.izodRange?.to ?? globalMaxIzod]}
                onValueChange={(value) => updateFilter("izodRange", { from: value[0], to: value[1] })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.izodRange?.from ?? globalMinIzod}
                    min={globalMinIzod}
                    max={globalMaxIzod}
                    step="0.1"
                    onChange={(e) => updateFilter("izodRange", { from: Math.max(globalMinIzod, Math.min(globalMaxIzod, parseFloat(e.target.value) || globalMinIzod)), to: filters.izodRange?.to ?? globalMaxIzod })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.izodRange?.to ?? globalMaxIzod}
                    min={globalMinIzod}
                    max={globalMaxIzod}
                    step="0.1"
                    onChange={(e) => updateFilter("izodRange", { from: filters.izodRange?.from ?? globalMinIzod, to: Math.max(globalMinIzod, Math.min(globalMaxIzod, parseFloat(e.target.value) || globalMaxIzod)) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-na-izod"
                  checked={filters.includeNAIzod}
                  onCheckedChange={(checked) => updateFilter("includeNAIzod", checked === true)}
                />
                <Label htmlFor="include-na-izod" className="text-xs font-normal cursor-pointer">Include N/A values</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "quantity":
        return (
          <Collapsible
            key="quantity"
            open={expandedGroups.includes("quantity")}
            onOpenChange={() => toggleGroup("quantity")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("quantity"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "quantity"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Quantity</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("quantity") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-4">
              <Slider
                min={quantityRange[0]}
                max={quantityRange[1]}
                step={(quantityRange[1] - quantityRange[0]) / 100}
                value={[filters.quantityRange?.from ?? quantityRange[0], filters.quantityRange?.to ?? quantityRange[1]]}
                onValueChange={(value) => updateFilter("quantityRange", { from: value[0], to: value[1] })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.quantityRange?.from ?? quantityRange[0]}
                    min={quantityRange[0]}
                    max={quantityRange[1]}
                    step="1"
                    onChange={(e) => updateFilter("quantityRange", { from: Math.max(quantityRange[0], Math.min(quantityRange[1], parseFloat(e.target.value) || quantityRange[0])), to: filters.quantityRange?.to ?? quantityRange[1] })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.quantityRange?.to ?? quantityRange[1]}
                    min={quantityRange[0]}
                    max={quantityRange[1]}
                    step="1"
                    onChange={(e) => updateFilter("quantityRange", { from: filters.quantityRange?.from ?? quantityRange[0], to: Math.max(quantityRange[0], Math.min(quantityRange[1], parseFloat(e.target.value) || quantityRange[1])) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "qualityControl":
        return (
          <Collapsible
            key="qualityControl"
            open={expandedGroups.includes("qualityControl")}
            onOpenChange={() => toggleGroup("qualityControl")}
            className="bg-card rounded-lg border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors group rounded-lg"
              draggable
              onDragStart={(e) => { e.stopPropagation(); handleDragStart("qualityControl"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, "qualityControl"); }}
              onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-move transition-opacity" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Quality Control</h3>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes("qualityControl") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 pt-1 animate-collapsible-down space-y-3">
              {hasMi && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qc-mi"
                    checked={filters.qualityControl.mi}
                    onCheckedChange={(checked) => updateFilter("qualityControl", { ...filters.qualityControl, mi: checked === true })}
                  />
                  <Label htmlFor="qc-mi" className="text-xs font-normal cursor-pointer">MI (Strict N/A only)</Label>
                </div>
              )}
              {hasIzod && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qc-izod"
                    checked={filters.qualityControl.izod}
                    onCheckedChange={(checked) => updateFilter("qualityControl", { ...filters.qualityControl, izod: checked === true })}
                  />
                  <Label htmlFor="qc-izod" className="text-xs font-normal cursor-pointer">Izod Impact (Strict N/A only)</Label>
                </div>
              )}
              {hasDensity && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qc-density"
                    checked={filters.qualityControl.density}
                    onCheckedChange={(checked) => updateFilter("qualityControl", { ...filters.qualityControl, density: checked === true })}
                  />
                  <Label htmlFor="qc-density" className="text-xs font-normal cursor-pointer">Density (Strict N/A only)</Label>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="w-72 bg-card/60 backdrop-blur-xl border-r border-border flex flex-col h-screen shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-30">

      {/* HEADER */}
      <div className="p-5 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-foreground tracking-tight">Filters</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-9 font-medium text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onApply}
            className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* FILTER LIST */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2 pb-8">
          {filterOrder.map((filterId) => (
            <div
              key={filterId}
              className={`
                group/item transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${draggedFilterId === filterId ? "opacity-40 scale-95 grayscale" : "opacity-100 scale-100"}
                ${dragOverTarget === filterId ? "translate-y-2 ring-2 ring-primary/30 rounded-lg shadow-lg z-10" : ""}
              `}
            >
              {renderFilter(filterId)}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* COPYRIGHT FOOTER */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="text-xs text-center text-muted-foreground/70 font-medium">
          <p>© {new Date().getFullYear()} Sunrise Plastics</p>
          <p className="text-[10px] opacity-60 mt-0.5">Enterprise Edition</p>
        </div>
      </div>
    </aside>
  );
};
