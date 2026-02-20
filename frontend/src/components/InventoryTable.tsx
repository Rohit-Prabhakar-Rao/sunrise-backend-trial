import * as React from "react";
import { InventoryItem } from "@/lib/inventoryData";
import { CardFieldConfig } from "@/components/CardConfigDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ChevronDown, ChevronUp, User } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  config: CardFieldConfig;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

export const InventoryTable = ({
  items,
  config,
  selectedIds,
  onSelectionChange,
  sortBy,
  onSortChange
}: InventoryTableProps) => {

  // Helper to parse the current sort state (handles both legacy and generic keys)
  const parseSortState = (sortKey: string | undefined) => {
    if (!sortKey) return { field: "panDate", dir: "desc" }; // Default to recent

    // Legacy mapping
    const legacyMap: Record<string, { field: string; dir: "asc" | "desc" }> = {
      "recent": { field: "panDate", dir: "desc" },
      "quantity-high": { field: "availableQty", dir: "desc" },
      "quantity-low": { field: "availableQty", dir: "asc" },
      "supplier": { field: "supplierCode", dir: "asc" },
      "polymer": { field: "polymerCode", dir: "asc" },
      "lot": { field: "lot", dir: "asc" }
    };

    if (legacyMap[sortKey]) {
      return legacyMap[sortKey];
    }

    // Generic mapping (field,dir)
    if (sortKey.includes(",")) {
      const [field, dir] = sortKey.split(",");
      return { field, dir: dir as "asc" | "desc" };
    }

    // Fallback
    return { field: sortKey, dir: "asc" as const };
  };

  const handleSort = (key: string) => {
    if (!onSortChange) return;

    // Mapping table keys to backend property names
    const fieldMap: Record<string, string> = {
      polymerCode: "polymerCode",
      formCode: "formCode",
      gradeCode: "gradeCode",
      supplierCode: "supplierCode",
      availableQty: "availableQty",
      warehouseName: "warehouseName",
      location: "locationGroup",
      density: "density",
      mi: "meltIndex",
      izod: "izodImpact",
      brand: "brand",
      date: "panDate",
      lot: "lot",
      lotName: "lotName",
      panId: "panId",
      // allocationStatus: "allocationStatus",
      po: "purchaseOrder",
      containerNum: "containerNum",
      packing: "packing",
      compartment: "rcCompartment"
    };

    const targetField = fieldMap[key] || key;
    const { field: currentField, dir: currentDir } = parseSortState(sortBy);

    let newSort = "";
    if (currentField === targetField) {
      // Toggle direction
      const newDir = currentDir === "asc" ? "desc" : "asc";
      newSort = `${targetField},${newDir}`;
    } else {
      // Default new sort based on type (numbers/dates typically desc first)
      const descByDefault = ["availableQty", "panDate", "density", "meltIndex", "izodImpact"];
      const defaultDir = descByDefault.includes(targetField) ? "desc" : "asc";
      newSort = `${targetField},${defaultDir}`;
    }

    onSortChange(newSort);
  };

  const getSortIcon = (key: string) => {
    const fieldMap: Record<string, string> = {
      polymerCode: "polymerCode",
      formCode: "formCode",
      gradeCode: "gradeCode",
      supplierCode: "supplierCode",
      availableQty: "availableQty",
      warehouseName: "warehouseName",
      location: "locationGroup",
      density: "density",
      mi: "meltIndex",
      izod: "izodImpact",
      brand: "brand",
      date: "panDate",
      lot: "lot",
      lotName: "lotName",
      panId: "panId",
      // allocationStatus: "allocationStatus",
      po: "po",
      containerNum: "containerNum",
      packing: "packing",
      compartment: "rcCompartment"
    };

    const targetField = fieldMap[key] || key;
    const { field: activeField, dir: activeDir } = parseSortState(sortBy);

    if (activeField !== targetField) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />;
    }

    return activeDir === "desc"
      ? <ChevronDown className="ml-2 h-4 w-4 text-primary" />
      : <ChevronUp className="ml-2 h-4 w-4 text-primary" />;
  };

  // Selection Logic Helpers
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map((item) => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Determine which columns to show and their sortability
  const columns = [
    { key: "supplierCode", label: "Supplier", show: config.supplierCode, sortable: true },
    { key: "polymerCode", label: "Polymer", show: config.polymerCode, sortable: true },
    { key: "formCode", label: "Form", show: config.formCode, sortable: true },
    { key: "gradeCode", label: "Grade", show: config.gradeCode, sortable: true },
    { key: "lot", label: "Lot", show: config.lot, sortable: true },
    { key: "folderCode", label: "Folder", show: config.folderCode, sortable: true },
    { key: "availableQty", label: "Quantity", show: config.quantity, sortable: true },
    { key: "warehouseName", label: "Warehouse", show: config.warehouse, sortable: true },
    { key: "location", label: "Location", show: config.location, sortable: true },
    { key: "density", label: "Density", show: config.density, sortable: true },
    { key: "mi", label: "MI", show: config.mi, sortable: true },
    { key: "izod", label: "Izod", show: config.izod, sortable: true },
    { key: "brand", label: "Brand", show: config.brand, sortable: true },
    { key: "date", label: "Date", show: config.date, sortable: true },
    { key: "lotName", label: "Lot Name", show: config.lotName, sortable: true },
    { key: "allocationStatus", label: "Status", show: config.allocationStatus, sortable: false },
    { key: "po", label: "PO", show: config.po, sortable: true },
    { key: "containerNum", label: "Container", show: config.containerNum, sortable: true },
    { key: "packing", label: "Packing", show: config.packing, sortable: true },
    { key: "compartment", label: "Compartment", show: config.compartment, sortable: true },
    { key: "panId", label: "Pan ID", show: config.panId, sortable: true },
    { key: "overAllocatedBy", label: "Over Allocated By", show: config.overAllocatedBy, sortable: false },
    { key: "packLeft", label: "Pack Left", show: config.packLeft, sortable: false },
    { key: "weightLeft", label: "Weight Left", show: config.weightLeft, sortable: false },
    { key: "comment", label: "Comment", show: config.comment, sortable: true },
    { key: "allocatedCustomers", label: "Allocated Customers", show: config.allocatedCustomers, sortable: false },
    { key: "allocationIds", label: "Allocation IDs", show: config.allocationIds, sortable: false },
    { key: "bookNums", label: "Book Numbers", show: config.bookNums, sortable: false },
    { key: "contNums", label: "Container Numbers", show: config.contNums, sortable: false },
    { key: "soTypes", label: "Sales Order Types", show: config.soTypes, sortable: false },
  ].filter((col) => col.show);

  // Parse customer codes (comma-separated string)
  const parseCustomerCodes = (codes: string | null | undefined): string[] => {
    if (!codes) return [];
    return codes.split(",").map((c) => c.trim()).filter((c) => c.length > 0);
  };

  // Parse allocation IDs (comma-separated string)
  const parseAllocationIds = (ids: string | null | undefined): string[] => {
    if (!ids) return [];
    return ids.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
  };

  // Parse book numbers (comma-separated string)
  const parseBookNums = (nums: string | null | undefined): string[] => {
    if (!nums) return [];
    return nums.split(",").map((num) => num.trim()).filter((num) => num.length > 0);
  };

  // Parse container numbers (comma-separated string)
  const parseContNums = (nums: string | null | undefined): string[] => {
    if (!nums) return [];
    return nums.split(",").map((num) => num.trim()).filter((num) => num.length > 0);
  };

  // Parse sales order types (comma-separated string)
  const parseSOTypes = (types: string | null | undefined): string[] => {
    if (!types) return [];
    return types.split(",").map((type) => type.trim()).filter((type) => type.length > 0);
  };

  // Get allocated customers with allocation level info
  const getAllocatedCustomers = (item: InventoryItem): Array<{ code: string; level: "pan" | "inventory" | "both" }> => {
    const customers: Array<{ code: string; level: "pan" | "inventory" | "both" }> = [];

    const panCustomers = parseCustomerCodes(item.panLevelCustomerCodes);
    const inventoryCustomers = parseCustomerCodes(item.inventoryLevelCustomerCodes);
    const allCustomers = parseCustomerCodes(item.allocatedCustomerCodes);

    // Combine and deduplicate
    const allUnique = new Set([...panCustomers, ...inventoryCustomers, ...allCustomers]);

    allUnique.forEach((code) => {
      const isPan = panCustomers.includes(code);
      const isInventory = inventoryCustomers.includes(code);
      const level = isPan && isInventory ? "both" : isPan ? "pan" : "inventory";
      customers.push({ code, level });
    });

    return customers;
  };

  const getCellValue = (item: InventoryItem, key: string): string | number | React.ReactNode => {
    switch (key) {
      case "polymerCode":
        return item.polymerCode;
      case "formCode":
        return <Badge variant="secondary" className="text-xs">{item.formCode}</Badge>;
      case "gradeCode":
        return item.gradeCode || "N/A";
      case "supplierCode":
        return item.supplierCode;
      case "po":
        return item.po;
      case "containerNum":
        return item.containerNum;
      case "availableQty":
        return item.availableQty.toLocaleString();
      case "packing":
        return item.packing;
      case "warehouseName":
        return item.warehouseName || "N/A";
      case "location":
        return item.locationGroup || "N/A";
      case "compartment":
        return item.rcCompartment || "N/A";
      case "density": {
        const val = Number(item.density);
        return !isNaN(val) && item.density != null ? val.toFixed(3) : "N/A";
      }
      case "mi": {
        const val = Number(item.mi);
        return !isNaN(val) && item.mi != null ? (val % 1 === 0 ? val : val.toFixed(1)) : "N/A";
      }
      case "izod": {
        const val = Number(item.izod);
        return !isNaN(val) && item.izod != null ? (val % 1 === 0 ? val : val.toFixed(1)) : "N/A";
      }
      case "brand":
        return item.brand || "N/A";
      case "date":
        return item.panDate ? format(new Date(item.panDate), "MMM dd, yyyy") : "N/A";
      case "folderCode":
        return item.folderCode;
      case "lot":
        return item.lot ? item.lot.toString() : "N/A";
      case "lotName":
        return item.lotName;
      case "panId":
        return item.panId.toLocaleString();
      case "allocationStatus": {
        const getStatusBgColor = (status: string) => {
          if (status === "Available") {
            return "bg-green-200 dark:bg-green-900/40 border border-green-300 dark:border-green-800/50";
          } else if (status === "Partially Allocated" || status.includes("Partially")) {
            return "bg-yellow-200 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-800/50";
          } else if (status === "Fully Allocated" || status.includes("Fully")) {
            return "bg-gray-100 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50";
          } else if (status === "Over Allocated" || status.includes("Over")) {
            return "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40";
          }
          return "bg-muted/30";
        };
        const statusBgColor = getStatusBgColor(item.allocationStatus);
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusBgColor}`}>
            {item.allocationStatus}
          </span>
        );
      }
      case "overAllocatedBy": {
        const val = Number(item.overAllocatedBy);
        if (!isNaN(val) && val > 0) {
          return (
            <span className="font-semibold text-red-700 dark:text-red-400">
              {val.toLocaleString()}
            </span>
          );
        }
        return "—";
      }
      case "packLeft": {
        const val = Number(item.packLeft);
        return !isNaN(val) && item.packLeft != null ? val.toLocaleString() : "N/A";
      }
      case "weightLeft": {
        const val = Number(item.weightLeft);
        return !isNaN(val) && item.weightLeft != null ? val.toLocaleString() : "N/A";
      }
      case "comment":
        return item.comment || "N/A";
      case "allocatedCustomers": {
        const customers = getAllocatedCustomers(item);
        if (customers.length === 0) return "—";
        return (
          <div className="space-y-1">
            {customers.map((customer, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{customer.code}</span>
                <span className="text-muted-foreground text-[10px]">
                  {customer.level === "both"
                    ? "Pan & Inventory"
                    : customer.level === "pan"
                      ? "Pan Level"
                      : "Inventory Level"}
                </span>
              </div>
            ))}
          </div>
        );
      }
      case "allocationIds": {
        const allocationIds = parseAllocationIds(item.allocatedAllocationIds);
        if (allocationIds.length === 0) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {allocationIds.map((id, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-mono">
                {id}
              </Badge>
            ))}
          </div>
        );
      }
      case "bookNums": {
        const bookNums = parseBookNums(item.allocatedBookNums);
        if (bookNums.length === 0) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {bookNums.map((num, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-mono">
                {num}
              </Badge>
            ))}
          </div>
        );
      }
      case "contNums": {
        const contNums = parseContNums(item.allocatedContNums);
        if (contNums.length === 0) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {contNums.map((num, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-mono">
                {num}
              </Badge>
            ))}
          </div>
        );
      }
      case "soTypes": {
        const soTypes = parseSOTypes(item.allocatedSOtypes);
        if (soTypes.length === 0) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {soTypes.map((type, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-mono">
                {type}
              </Badge>
            ))}
          </div>
        );
      }
      default:
        return "N/A";
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto relative scroll-smooth cursor-default">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-background/80 backdrop-blur-md shadow-sm">
            <TableRow className="border-b border-border hover:bg-transparent">
              {/* Header Checkbox */}
              <TableHead className="w-[50px] px-4 py-3 text-center align-middle">
                <Checkbox
                  checked={isAllSelected || isIndeterminate}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className="translate-y-[2px]"
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`
                    h-10 px-4 py-2 text-[12px] font-bold tracking-tight text-muted-foreground uppercase whitespace-nowrap
                    ${column.sortable ? "cursor-pointer select-none group transition-colors hover:text-foreground hover:bg-muted/30" : ""}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <TableRow
                  key={item.id}
                  className={`
                        group border-b border-border/50 last:border-b-0 transition-all duration-200
                        ${isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}
                        animate-in fade-in slide-in-from-bottom-2 duration-300
                    `}
                  style={{ animationDelay: `${items.indexOf(item) * 30}ms`, animationFillMode: 'both' }}
                >
                  {/* Row Checkbox */}
                  <TableCell className="w-[50px] px-4 py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                      aria-label={`Select item ${item.id}`}
                      className="translate-y-[2px]"
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className="px-4 py-2 text-xs font-medium text-foreground whitespace-nowrap group-hover:text-foreground/90"
                    >
                      {getCellValue(item, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};