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
import { InventoryItem } from "@/lib/inventoryData";
import {
  getUniqueSuppliers,
  getUniquePolymers,
  getUniqueForms,
  getUniqueFolders,
  getUniqueGrades,
  getUniqueWarehouses,
  getUniqueLots,
  getMIRange,
  getDensityRange,
  getIzodRange,
  getQuantityRange,
  getDateRange,
} from "@/lib/inventoryData";
import { FilterState } from "@/lib/filterInventory";

interface FilterSidebarProps {
  inventory: InventoryItem[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FILTER_ORDER_STORAGE_KEY = "inventory-filter-order";

const DEFAULT_FILTER_ORDER = [
  "supplier",
  "polymer",
  "form",
  "date",
  "mi",
  "folder",
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

export const FilterSidebar = ({ inventory, filters, onFiltersChange }: FilterSidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "supplier",
    "polymer",
    "form",
  ]);
  const [filterOrder, setFilterOrder] = useState<string[]>(loadFilterOrder());
  const [draggedFilterId, setDraggedFilterId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Get unique values from inventory
  const suppliers = getUniqueSuppliers(inventory);
  const polymers = getUniquePolymers(inventory);
  const forms = getUniqueForms(inventory);
  const folders = getUniqueFolders(inventory);
  const grades = getUniqueGrades(inventory);
  const warehouses = getUniqueWarehouses(inventory);
  const lots = getUniqueLots(inventory);
  const miRange = getMIRange(inventory);
  const densityRange = getDensityRange(inventory);
  const izodRange = getIzodRange(inventory);
  const quantityRange = getQuantityRange(inventory);
  const dateRange = getDateRange(inventory);

  const hasGrades = grades.length > 0;
  const hasDensity = densityRange !== null;
  const hasIzod = izodRange !== null;

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
      const prevQualityControl = filters.qualityControl;
      
      if (qualityControl.mi && !prevQualityControl.mi) {
        newFilters.miRange = { from: undefined, to: undefined };
        newFilters.includeNAMI = true;
      }
      if (qualityControl.density && !prevQualityControl.density) {
        newFilters.densityRange = { from: undefined, to: undefined };
        newFilters.includeNADensity = true;
      }
      if (qualityControl.izod && !prevQualityControl.izod) {
        newFilters.izodRange = { from: undefined, to: undefined };
        newFilters.includeNAIzod = true;
      }
    }
    
    if (key === "miRange") {
      const miRange = value as FilterState["miRange"];
      const hasMIRange = miRange.from !== undefined || miRange.to !== undefined;
      if (hasMIRange) {
        newFilters.qualityControl = {
          ...newFilters.qualityControl,
          mi: false,
        };
      }
    }
    if (key === "densityRange") {
      const densityRange = value as FilterState["densityRange"];
      const hasDensityRange = densityRange?.from !== undefined || densityRange?.to !== undefined;
      if (hasDensityRange) {
        newFilters.qualityControl = {
          ...newFilters.qualityControl,
          density: false,
        };
      }
    }
    if (key === "izodRange") {
      const izodRange = value as FilterState["izodRange"];
      const hasIzodRange = izodRange?.from !== undefined || izodRange?.to !== undefined;
      if (hasIzodRange) {
        newFilters.qualityControl = {
          ...newFilters.qualityControl,
          izod: false,
        };
      }
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      suppliers: [],
      polymers: [],
      forms: [],
      grades: [],
      folders: [],
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
    });
  };

  const totalActiveFilters =
    filters.suppliers.length +
    filters.polymers.length +
    filters.forms.length +
    filters.grades.length +
    filters.folders.length +
    filters.warehouses.length +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0) +
    (filters.miRange.from !== undefined ? 1 : 0) +
    (filters.miRange.to !== undefined ? 1 : 0) +
    (filters.densityRange?.from !== undefined ? 1 : 0) +
    (filters.densityRange?.to !== undefined ? 1 : 0) +
    (filters.izodRange?.from !== undefined ? 1 : 0) +
    (filters.izodRange?.to !== undefined ? 1 : 0) +
    (filters.quantityRange?.from !== undefined ? 1 : 0) +
    (filters.quantityRange?.to !== undefined ? 1 : 0) +
    filters.lots.length +
    (filters.qualityControl.mi ? 1 : 0) +
    (filters.qualityControl.izod ? 1 : 0) +
    (filters.qualityControl.density ? 1 : 0);

  const renderFilter = (filterId: string) => {
    switch (filterId) {
      case "supplier":
        return (
          <Collapsible
            key="supplier"
            open={expandedGroups.includes("supplier")}
            onOpenChange={() => toggleGroup("supplier")}
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("supplier");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "supplier");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Supplier
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("supplier") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("polymer");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "polymer");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Polymer
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("polymer") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("form");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "form");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Form
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("form") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
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
        if (!dateRange) return null;
        return (
          <Collapsible
            key="date"
            open={expandedGroups.includes("date")}
            onOpenChange={() => toggleGroup("date")}
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("date");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "date");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Date Range
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("date") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <Slider
                min={dateRange[0].getTime()}
                max={dateRange[1].getTime()}
                step={86400000} // 1 day in milliseconds
                value={[
                  filters.dateRange.from?.getTime() ?? dateRange[0].getTime(),
                  filters.dateRange.to?.getTime() ?? dateRange[1].getTime(),
                ]}
                onValueChange={(value) =>
                  updateFilter("dateRange", {
                    from: new Date(value[0]),
                    to: new Date(value[1]),
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={
                      filters.dateRange.from
                        ? format(filters.dateRange.from, "yyyy-MM-dd")
                        : format(dateRange[0], "yyyy-MM-dd")
                    }
                    min={format(dateRange[0], "yyyy-MM-dd")}
                    max={format(dateRange[1], "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : dateRange[0];
                      updateFilter("dateRange", {
                        ...filters.dateRange,
                        from: date,
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={
                      filters.dateRange.to
                        ? format(filters.dateRange.to, "yyyy-MM-dd")
                        : format(dateRange[1], "yyyy-MM-dd")
                    }
                    min={
                      filters.dateRange.from
                        ? format(filters.dateRange.from, "yyyy-MM-dd")
                        : format(dateRange[0], "yyyy-MM-dd")
                    }
                    max={format(dateRange[1], "yyyy-MM-dd")}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : dateRange[1];
                      updateFilter("dateRange", {
                        ...filters.dateRange,
                        to: date,
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "mi":
        return (
          <Collapsible
            key="mi"
            open={expandedGroups.includes("mi")}
            onOpenChange={() => toggleGroup("mi")}
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("mi");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "mi");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Melt Index (MI)
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("mi") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <Slider
                min={miRange[0]}
                max={miRange[1]}
                step={(miRange[1] - miRange[0]) / 100}
                value={[
                  filters.miRange.from ?? miRange[0],
                  filters.miRange.to ?? miRange[1],
                ]}
                onValueChange={(value) =>
                  updateFilter("miRange", {
                    from: value[0],
                    to: value[1],
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.miRange.from ?? miRange[0]}
                    min={miRange[0]}
                    max={miRange[1]}
                    step="0.01"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : miRange[0];
                      updateFilter("miRange", {
                        ...filters.miRange,
                        from: Math.max(miRange[0], Math.min(miRange[1], val)),
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.miRange.to ?? miRange[1]}
                    min={miRange[0]}
                    max={miRange[1]}
                    step="0.01"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : miRange[1];
                      updateFilter("miRange", {
                        ...filters.miRange,
                        to: Math.max(miRange[0], Math.min(miRange[1], val)),
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-na-mi"
                  checked={filters.includeNAMI}
                  onCheckedChange={(checked) => updateFilter("includeNAMI", checked === true)}
                />
                <Label
                  htmlFor="include-na-mi"
                  className="text-xs font-normal cursor-pointer"
                >
                  Include N/A values
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case "folder":
        return (
          <Collapsible
            key="folder"
            open={expandedGroups.includes("folder")}
            onOpenChange={() => toggleGroup("folder")}
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("folder");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "folder");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Folder
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("folder") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <SearchableCombobox
                options={folders}
                selected={filters.folders}
                onSelectionChange={(selected) => updateFilter("folders", selected)}
                placeholder="Select folders..."
                searchPlaceholder="Search folders..."
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("lot");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "lot");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Lot
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("lot") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("grade");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "grade");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Grade
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("grade") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("warehouse");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "warehouse");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Warehouse
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("warehouse") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("density");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "density");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Density
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("density") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <Slider
                min={densityRange![0]}
                max={densityRange![1]}
                step={(densityRange![1] - densityRange![0]) / 100}
                value={[
                  filters.densityRange?.from ?? densityRange![0],
                  filters.densityRange?.to ?? densityRange![1],
                ]}
                onValueChange={(value) =>
                  updateFilter("densityRange", {
                    from: value[0],
                    to: value[1],
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.densityRange?.from ?? densityRange![0]}
                    min={densityRange![0]}
                    max={densityRange![1]}
                    step="0.01"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : densityRange![0];
                      updateFilter("densityRange", {
                        from: Math.max(densityRange![0], Math.min(densityRange![1], val)),
                        to: filters.densityRange?.to ?? densityRange![1],
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.densityRange?.to ?? densityRange![1]}
                    min={densityRange![0]}
                    max={densityRange![1]}
                    step="0.01"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : densityRange![1];
                      updateFilter("densityRange", {
                        from: filters.densityRange?.from ?? densityRange![0],
                        to: Math.max(densityRange![0], Math.min(densityRange![1], val)),
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-na-density"
                  checked={filters.includeNADensity}
                  onCheckedChange={(checked) => updateFilter("includeNADensity", checked === true)}
                />
                <Label
                  htmlFor="include-na-density"
                  className="text-xs font-normal cursor-pointer"
                >
                  Include N/A values
                </Label>
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("izod");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "izod");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Izod Impact
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("izod") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <Slider
                min={izodRange![0]}
                max={izodRange![1]}
                step={(izodRange![1] - izodRange![0]) / 100}
                value={[
                  filters.izodRange?.from ?? izodRange![0],
                  filters.izodRange?.to ?? izodRange![1],
                ]}
                onValueChange={(value) =>
                  updateFilter("izodRange", {
                    from: value[0],
                    to: value[1],
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="number"
                    value={filters.izodRange?.from ?? izodRange![0]}
                    min={izodRange![0]}
                    max={izodRange![1]}
                    step="1"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : izodRange![0];
                      updateFilter("izodRange", {
                        from: Math.max(izodRange![0], Math.min(izodRange![1], val)),
                        to: filters.izodRange?.to ?? izodRange![1],
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="number"
                    value={filters.izodRange?.to ?? izodRange![1]}
                    min={izodRange![0]}
                    max={izodRange![1]}
                    step="1"
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : izodRange![1];
                      updateFilter("izodRange", {
                        from: filters.izodRange?.from ?? izodRange![0],
                        to: Math.max(izodRange![0], Math.min(izodRange![1], val)),
                      });
                    }}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="include-na-izod"
                  checked={filters.includeNAIzod}
                  onCheckedChange={(checked) => updateFilter("includeNAIzod", checked === true)}
                />
                <Label
                  htmlFor="include-na-izod"
                  className="text-xs font-normal cursor-pointer"
                >
                  Include N/A values
                </Label>
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("quantity");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "quantity");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Quantity
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("quantity") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <Slider
                min={quantityRange[0]}
                max={quantityRange[1]}
                step={(quantityRange[1] - quantityRange[0]) / 100}
                value={[
                  filters.quantityRange?.from ?? quantityRange[0],
                  filters.quantityRange?.to ?? quantityRange[1],
                ]}
                onValueChange={(value) =>
                  updateFilter("quantityRange", {
                    from: value[0],
                    to: value[1],
                  })
                }
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
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : quantityRange[0];
                      updateFilter("quantityRange", {
                        from: Math.max(quantityRange[0], Math.min(quantityRange[1], val)),
                        to: filters.quantityRange?.to ?? quantityRange[1],
                      });
                    }}
                    className="h-9 text-xs"
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
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : quantityRange[1];
                      updateFilter("quantityRange", {
                        from: filters.quantityRange?.from ?? quantityRange[0],
                        to: Math.max(quantityRange[0], Math.min(quantityRange[1], val)),
                      });
                    }}
                    className="h-9 text-xs"
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
            className="border-b border-border pb-4"
          >
            <CollapsibleTrigger
              className="flex items-center justify-between w-full py-3 hover:text-primary transition-colors group"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart("qualityControl");
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e, "qualityControl");
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                handleDragEnd();
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-move" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Quality Control
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedGroups.includes("qualityControl") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qc-mi"
                  checked={filters.qualityControl.mi}
                  onCheckedChange={(checked) =>
                    updateFilter("qualityControl", {
                      ...filters.qualityControl,
                      mi: checked === true,
                    })
                  }
                />
                <Label htmlFor="qc-mi" className="text-xs font-normal cursor-pointer">
                  MI (N/A only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qc-izod"
                  checked={filters.qualityControl.izod}
                  onCheckedChange={(checked) =>
                    updateFilter("qualityControl", {
                      ...filters.qualityControl,
                      izod: checked === true,
                    })
                  }
                />
                <Label htmlFor="qc-izod" className="text-xs font-normal cursor-pointer">
                  Izod Impact (N/A only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qc-density"
                  checked={filters.qualityControl.density}
                  onCheckedChange={(checked) =>
                    updateFilter("qualityControl", {
                      ...filters.qualityControl,
                      density: checked === true,
                    })
                  }
                />
                <Label htmlFor="qc-density" className="text-xs font-normal cursor-pointer">
                  Density (N/A only)
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-foreground uppercase tracking-wide">
            Filter Inventory
          </h2>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="w-full justify-center text-xs text-primary hover:text-primary hover:bg-primary/10"
        >
          Clear All Filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {filterOrder.map((filterId) => renderFilter(filterId))}
        </div>
      </ScrollArea>
    </aside>
  );
};
