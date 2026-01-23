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
import { User } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  config: CardFieldConfig;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const InventoryTable = ({ 
  items, 
  config, 
  selectedIds, 
  onSelectionChange 
}: InventoryTableProps) => {
  
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

  // Determine which columns to show based on config
  const columns = [
    { key: "polymerCode", label: "Polymer", show: config.polymerCode },
    { key: "formCode", label: "Form", show: config.formCode },
    { key: "gradeCode", label: "Grade", show: config.gradeCode },
    { key: "supplierCode", label: "Supplier", show: config.supplierCode },
    { key: "po", label: "PO", show: config.po },
    { key: "containerNum", label: "Container", show: config.containerNum },
    { key: "availableQty", label: "Quantity", show: config.quantity },
    { key: "packing", label: "Packing", show: config.packing },
    { key: "warehouseName", label: "Warehouse", show: config.warehouse },
    { key: "compartment", label: "Compartment", show: config.compartment },
    { key: "density", label: "Density", show: config.density },
    { key: "mi", label: "MI", show: config.mi },
    { key: "izod", label: "Izod", show: config.izod },
    { key: "brand", label: "Brand", show: config.brand },
    { key: "date", label: "Date", show: config.date },
    { key: "folderCode", label: "Folder", show: config.folderCode },
    { key: "lot", label: "Lot", show: config.lot },
    { key: "lotName", label: "Lot Name", show: config.lotName },
    { key: "panId", label: "Pan ID", show: config.panId },
    { key: "allocationStatus", label: "Status", show: config.allocationStatus },
    { key: "overAllocatedBy", label: "Over Allocated By", show: config.overAllocatedBy },
    { key: "packLeft", label: "Pack Left", show: config.packLeft },
    { key: "weightLeft", label: "Weight Left", show: config.weightLeft },
    { key: "comment", label: "Comment", show: config.comment },
    { key: "allocatedCustomers", label: "Allocated Customers", show: config.allocatedCustomers },
    { key: "allocationIds", label: "Allocation IDs", show: config.allocationIds },
    { key: "bookNums", label: "Book Numbers", show: config.bookNums },
    { key: "contNums", label: "Container Numbers", show: config.contNums },
    { key: "soTypes", label: "Sales Order Types", show: config.soTypes },
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
        return item.warehouseName || item.locationGroup || "N/A";
      case "compartment":
        return item.rcCompartment || "N/A";
      case "density":
        return item.density != null ? item.density.toFixed(2) : "N/A";
      case "mi":
        return item.mi != null ? item.mi.toFixed(2) : "N/A";
      case "izod":
        return item.izod != null ? item.izod.toString() : "N/A";
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
      case "overAllocatedBy":
        if (item.overAllocatedBy > 0) {
          return (
            <span className="font-semibold text-red-700 dark:text-red-400">
              {item.overAllocatedBy.toLocaleString()}
            </span>
          );
        }
        return "—";
      case "packLeft":
        return item.packLeft ? item.packLeft.toLocaleString() : "N/A";
      case "weightLeft":
        return item.weightLeft ? item.weightLeft.toLocaleString() : "N/A";
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
    <div className="w-full overflow-auto border border-border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="border-b border-border hover:bg-transparent">
            {/* Header Checkbox */}
            <TableHead className="w-[50px] bg-muted/50 border-r border-border px-3 py-2">
               <Checkbox 
                 checked={isAllSelected || isIndeterminate}
                 onCheckedChange={handleSelectAll}
                 aria-label="Select all"
               />
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="font-semibold whitespace-nowrap bg-muted/50 border-r border-border last:border-r-0 px-3 py-2"
              >
                {column.label}
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
                className={`border-b border-border last:border-b-0 transition-colors ${
                    isSelected ? "bg-muted/50" : "hover:bg-muted/30"
                }`}
              >
                {/* Row Checkbox */}
                <TableCell className="border-r border-border px-3 py-2 text-center">
                    <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                        aria-label={`Select item ${item.id}`}
                    />
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="whitespace-nowrap border-r border-border last:border-r-0 px-3 py-2 text-sm"
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
  );
};