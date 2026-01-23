import { Package, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"; 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { InventoryItem } from "@/lib/inventoryData";
import { CardFieldConfig } from "@/components/CardConfigDialog";
import { format } from "date-fns";
// Removed useNavigate import
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  item: InventoryItem;
  config: CardFieldConfig;
  isSelected?: boolean;
  onToggle?: () => void;
}

export const InventoryCard = ({ 
  item, 
  config, 
  isSelected = false, 
  onToggle 
}: InventoryCardProps) => {
  const hasImages = item.sampleImages && item.sampleImages.length > 0;

  // Helper to get status colors
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

  // Parsing Helpers
  const parseList = (str: string | null | undefined) => 
    str ? str.split(",").map(s => s.trim()).filter(s => s.length > 0) : [];

  const allocatedCustomers = (() => {
    const pan = parseList(item.panLevelCustomerCodes);
    const inv = parseList(item.inventoryLevelCustomerCodes);
    const all = parseList(item.allocatedCustomerCodes);
    const unique = new Set([...pan, ...inv, ...all]);
    
    return Array.from(unique).map(code => ({
        code,
        level: pan.includes(code) && inv.includes(code) ? "both" : pan.includes(code) ? "pan" : "inventory"
    }));
  })();

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 h-full flex flex-col relative",
        isSelected 
          ? "border-2 border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]" 
          : "border border-border hover:shadow-lg bg-card"
      )}
    >
      {/* Visual Overlay for selection */}
      {isSelected && (
         <div className="absolute inset-0 bg-primary/5 pointer-events-none z-0" />
      )}

      <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden border-b border-border z-10">
        
        {/* Checkbox */}
        {onToggle && (
            <div 
                className="absolute top-2 right-2 z-50"
                // Stop propagation to ensure checking the box doesn't trigger other events (if any)
                onClick={(e) => e.stopPropagation()} 
            >
                <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onToggle()}
                    className={cn(
                        "h-5 w-5 border-2 transition-all shadow-sm",
                        isSelected 
                           ? "bg-primary border-primary text-primary-foreground" 
                           : "bg-background/80 backdrop-blur-sm border-muted-foreground/50 hover:border-primary"
                    )}
                />
            </div>
        )}

        {hasImages ? (
          <Carousel className="w-full h-full absolute inset-0">
            <CarouselContent className="h-full -ml-0">
              {item.sampleImages.map((imageUrl, index) => (
                <CarouselItem key={index} className="pl-0 basis-full h-full">
                  <img
                    src={imageUrl}
                    alt={`${item.polymerCode} sample`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {item.sampleImages.length > 1 && (
              <>
                {/* Added click stopping to carousel buttons just in case */}
                <div onClick={(e) => e.stopPropagation()}>
                    <CarouselPrevious className="left-2 bg-background/50 hover:bg-background/80 border-none" />
                    <CarouselNext className="right-2 bg-background/50 hover:bg-background/80 border-none" />
                </div>
              </>
            )}
          </Carousel>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-20 w-20 text-primary/20 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        
        {/* Form Code Badge */}
        {config.formCode && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
              {item.formCode}
            </Badge>
          </div>
        )}

        {/* Warehouse Badge */}
        {config.warehouse && (
          <div className="absolute bottom-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs backdrop-blur-md bg-background/80">
              {item.warehouseName || item.locationGroup}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 z-10 relative">
        {/* Creates the Row Layout */}
        <div className="flex justify-between items-start w-full gap-2">
          
          {/* LEFT SIDE: Polymer & Grade */}
          <div className="flex items-baseline gap-2 min-w-0">
            {config.polymerCode && (
              <h3 
                className="font-bold text-base text-foreground truncate" 
                title={item.polymerCode}
              >
                {item.polymerCode}
              </h3>
            )}
            
            {/* Render Grade beside Polymer, italicized (slanting) */}
            {config.gradeCode && item.gradeCode && (
              <span 
                className="text-xs text-muted-foreground italic font-medium truncate shrink-0"
                title={(item.gradeCode)}
              >
                {item.gradeCode}
              </span>
            )}
          </div>

          {/* RIGHT SIDE: Brand */}
          {config.brand && item.brand && (
            <div className="flex shrink-0">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                {item.brand}
              </span>
            </div>
          )}
          
        </div>

        {(config.quantity || config.compartment) && (
          <div className="flex items-center justify-between py-2 border-y border-border">
            {config.quantity && (
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Quantity</p>
                <p className="text-sm font-bold text-foreground">
                  {item.availableQty.toLocaleString()}
                </p>
              </div>
            )}
            {config.quantity && config.compartment && <div className="w-px h-8 bg-border"></div>}
            {config.compartment && (
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                <p className="text-sm font-bold text-foreground">
                  {item.locationGroup || "N/A"}
                </p>
              </div>
            )}
          </div>
        )}

        {(config.density || config.mi || config.izod) && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {config.density && (
              <div className="text-center p-2 rounded bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase">Density</p>
                <p className="text-xs font-semibold">{item.density?.toFixed(2) || "N/A"}</p>
              </div>
            )}
            {config.mi && (
              <div className="text-center p-2 rounded bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase">MI</p>
                <p className="text-xs font-semibold">{item.mi?.toFixed(2) || "N/A"}</p>
              </div>
            )}
            {config.izod && (
              <div className="text-center p-2 rounded bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase">Izod</p>
                <p className="text-xs font-semibold">{item.izod || "N/A"}</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 space-y-1.5 text-xs">
          {config.supplierCode && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier:</span>
              <span className="font-medium text-foreground">{item.supplierCode}</span>
            </div>
          )}
          {config.po && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">PO:</span>
              <span className="font-medium text-foreground">{item.po}</span>
            </div>
          )}
          {config.containerNum && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Container:</span>
              <span className="font-medium text-foreground">{item.containerNum}</span>
            </div>
          )}
          {config.packing && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packing:</span>
              <span className="font-medium text-foreground">{item.packing}</span>
            </div>
          )}
          {config.date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium text-foreground">
                {item.panDate ? format(new Date(item.panDate), "MMM dd, yyyy") : "-"}
              </span>
            </div>
          )}
          {config.folderCode && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Folder Code:</span>
              <span className="font-medium text-foreground">{item.folderCode}</span>
            </div>
          )}
          {config.lot && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lot:</span>
              <span className="font-medium text-foreground">{item.lot}</span>
            </div>
          )}
          {config.lotName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lot Name:</span>
              <span className="font-medium text-foreground">{item.lotName}</span>
            </div>
          )}
          {config.panId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pan ID:</span>
              <span className="font-medium text-foreground">{item.panId.toLocaleString()}</span>
            </div>
          )}
          {config.compartment && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compartment:</span>
              <span className="font-medium text-foreground">{item.rcCompartment}</span>
            </div>
          )}
          {config.allocationStatus && (
            <div
              className={`flex justify-between p-2 rounded ${getStatusBgColor(
                item.allocationStatus
              )}`}
            >
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-foreground">{item.allocationStatus}</span>
            </div>
          )}
          {config.overAllocatedBy && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Over Allocated By:</span>
              <span className="font-medium text-foreground">{item.overAllocatedBy}</span>
            </div>
          )}
          {config.packLeft && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pack Left:</span>
              <span className="font-medium text-foreground">{item.packLeft}</span>
            </div>
          )}
          {config.weightLeft && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight Left:</span>
              <span className="font-medium text-foreground">{item.weightLeft}</span>
            </div>
          )}
          {config.comment && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comment:</span>
              <span className="font-medium text-foreground">{item.comment}</span>
            </div>
          )}
          {config.allocationIds && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocated Allocation IDs:</span>
              <span className="font-medium text-foreground">{item.allocatedAllocationIds}</span>
            </div>
          )}
          {config.bookNums && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocated Book Numbers:</span>
              <span className="font-medium text-foreground">{item.allocatedBookNums}</span>
            </div>
          )}
          {config.contNums && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocated Container Numbers:</span>
              <span className="font-medium text-foreground">{item.allocatedContNums}</span>
            </div>
          )}
          {config.soTypes && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocated SO Types:</span>
              <span className="font-medium text-foreground">{item.allocatedSOtypes}</span>
            </div>
          )}
        </div>
        
        {config.allocatedCustomers && allocatedCustomers.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="p-2 rounded bg-muted/30 w-full">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Allocated Customers</p>
              </div>
              <div className="space-y-1">
                {allocatedCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{customer.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};