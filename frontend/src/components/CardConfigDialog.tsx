import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface CardFieldConfig {
  polymerCode: boolean;
  formCode: boolean;
  gradeCode: boolean;
  supplierCode: boolean;
  po: boolean;
  containerNum: boolean;
  quantity: boolean;
  packing: boolean;
  warehouse: boolean;
  location: boolean;
  compartment: boolean;
  density: boolean;
  mi: boolean;
  izod: boolean;
  brand: boolean;
  date: boolean;
  folderCode: boolean;
  lot: boolean;
  lotName: boolean;
  panId: boolean;
  allocationStatus: boolean;
  overAllocatedBy: boolean;
  packLeft: boolean;
  weightLeft: boolean;
  comment: boolean;
  allocatedCustomers: boolean;
  allocationIds: boolean;
  bookNums: boolean;
  contNums: boolean;
  soTypes: boolean;
}

const defaultConfig: CardFieldConfig = {
  polymerCode: true,
  formCode: true,
  gradeCode: true,
  supplierCode: true,
  po: false,
  containerNum: false,
  quantity: true,
  packing: false,
  warehouse: true,
  location: false,
  compartment: false,
  density: true,
  mi: true,
  izod: true,
  brand: true,
  date: true,
  folderCode: true,
  lot: false,
  lotName: true,
  panId: false,
  allocationStatus: true,
  overAllocatedBy: false,
  packLeft: false,
  weightLeft: false,
  comment: false,
  allocatedCustomers: false,
  allocationIds: false,
  bookNums: false,
  contNums: false,
  soTypes: false,
};

const STORAGE_KEY = "inventory-card-config";

function loadConfig(): CardFieldConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to load card config:", error);
  }
  return defaultConfig;
}

function saveConfig(config: CardFieldConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save card config:", error);
  }
}

interface CardConfigDialogProps {
  config: CardFieldConfig;
  onConfigChange: (config: CardFieldConfig) => void;
}

export const CardConfigDialog = ({ config, onConfigChange }: CardConfigDialogProps) => {
  const [open, setOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<CardFieldConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleFieldToggle = (field: keyof CardFieldConfig) => {
    const updated = { ...localConfig, [field]: !localConfig[field] };
    setLocalConfig(updated);
  };

  const handleSave = () => {
    saveConfig(localConfig);
    onConfigChange(localConfig);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
  };

  const handleSelectAll = () => {
    const allSelected = Object.keys(fieldLabels).reduce((acc, key) => {
      acc[key as keyof CardFieldConfig] = true;
      return acc;
    }, {} as CardFieldConfig);
    setLocalConfig(allSelected);
  };

  const fieldLabels: Record<keyof CardFieldConfig, string> = {
    polymerCode: "Polymer Code",
    formCode: "Form Code",
    supplierCode: "Supplier Code",
    quantity: "Quantity",
    warehouse: "Warehouse",
    density: "Density",
    mi: "Melt Index (MI)",
    izod: "Izod Impact",
    brand: "Brand",
    date: "Date",
    folderCode: "Folder Code",
    lotName: "Lot Name",
    gradeCode: "Grade Code", // Positioned lower as requested
    po: "Purchase Order",
    containerNum: "Container Number",
    packing: "Packing",
    compartment: "Compartment",
    lot: "Lot Number",
    panId: "Pan ID",
    allocationStatus: "Allocation Status",
    overAllocatedBy: "Over Allocated By",
    packLeft: "Pack Left",
    weightLeft: "Weight Left",
    comment: "Comment",
    allocatedCustomers: "Allocated Customers",
    allocationIds: "Allocation IDs",
    bookNums: "Book Numbers",
    contNums: "Container Numbers",
    soTypes: "Sales Order Types",
    location: "Location", // Positioned here as requested
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings className="h-4 w-4 mr-2" />
          Card Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Card Fields</DialogTitle>
          <DialogDescription>
            Select which fields to display on inventory cards
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-4 py-4">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={localConfig[field as keyof CardFieldConfig]}
                  onCheckedChange={() => handleFieldToggle(field as keyof CardFieldConfig)}
                />
                <Label
                  htmlFor={field}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center pt-4 border-t mt-auto flex-shrink-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { loadConfig, saveConfig, defaultConfig };

