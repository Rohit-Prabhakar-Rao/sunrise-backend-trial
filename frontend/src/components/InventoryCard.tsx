import { Package, User, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const polymerFull = `${item.polymerCode}-${item.formCode}`;
  const lotFull = `${item.folderCode}-${item.lot}`;
  const warehouseFull = item.warehouseName || "N/A";

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 h-full flex flex-col relative",
        isSelected
          ? "border-2 border-primary ring-2 ring-primary/20 shadow-xl scale-[1.02]"
          : "border border-border hover:shadow-2xl bg-card hover:-translate-y-1"
      )}
    >
      {/* Visual Overlay for selection */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none z-0" />
      )}

      {/* MEDIA SECTION */}
      <div className="aspect-video bg-muted/20 relative overflow-hidden border-b border-border z-0">
        {hasImages ? (
          /* inset-0 ensures the carousel fills the relative parent completely */
          <Carousel className="w-full h-full absolute inset-0 z-10">
            <CarouselContent className="h-full -ml-0">
              {item.sampleImages.map((imageUrl, index) => (
                <CarouselItem key={index} className="pl-0 basis-full h-full">
                  <img
                    src={imageUrl}
                    alt={`${item.polymerCode} sample`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {item.sampleImages.length > 1 && (
              <div onClick={(e) => e.stopPropagation()} className="z-40">
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 z-40" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 z-40" />
              </div>
            )}
          </Carousel>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <Package className="h-16 w-16 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}

        {/* UI OVERLAYS - All sibling to the Carousel, but higher Z-Index */}

        {/* TOP LEFT: Supplier Code */}
        <div className="absolute top-2 left-2 z-40">
          {item.supplierCode && (
            <Badge className="bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-bold px-2 py-0.5 shadow-md border border-white/20 uppercase">
              {item.supplierCode}
            </Badge>
          )}
        </div>

        {/* TOP RIGHT: Checkbox */}
        <div className="absolute top-2 right-2 z-40">
          {onToggle && (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle()}
                className={cn(
                  "h-6 w-6 border-2 transition-all shadow-md rounded-lg",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background/80 backdrop-blur-sm border-white/50 hover:border-primary"
                )}
              />
            </div>
          )}
        </div>

        {/* BOTTOM LEFT: Brand Badge */}
        {item.brand && (
          <div className="absolute bottom-2 left-2 z-50 leading-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-black/60 backdrop-blur-md text-white border-white/30 text-[9px] font-bold px-2 py-1 shadow-lg uppercase max-w-[100px] truncate"
                >
                  {item.brand}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{item.brand}</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* BOTTOM RIGHT: Status Indicator */}
        {item.allocationStatus && (
          <div className="absolute bottom-2 right-2 z-50 flex items-center">
            <div className={cn(
              "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border shadow-lg backdrop-blur-md",
              item.allocationStatus === "Available"
                ? "bg-green-500/80 border-green-400/50 text-white"
                : "bg-amber-500/80 border-amber-400/50 text-white"
            )}>
              {item.allocationStatus}
            </div>
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 space-y-4 flex-1 z-10 relative">

        <div className="flex justify-between items-start gap-3 border-b border-border/10 pb-3">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-tight text-primary/70 mb-0.5">Polymer-Form</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-bold text-xs leading-tight text-foreground truncate cursor-help">
                  {polymerFull}
                </h3>
              </TooltipTrigger>
              <TooltipContent>{polymerFull}</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col items-end text-right min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-tight text-primary/70 mb-0.5">Folder-Lot</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-bold text-xs text-foreground truncate w-full cursor-help">
                  {lotFull}
                </h3>
              </TooltipTrigger>
              <TooltipContent>{lotFull}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2">
          <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10 flex flex-col justify-center">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Quantity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-foreground">{item.availableQty.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.packing?.split(' ')[1] || 'LBS'}</span>
            </div>
          </div>
          <div className="bg-accent/5 rounded-lg p-2.5 border border-accent/10 flex flex-col justify-center min-w-0">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Warehouse</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 min-w-0 cursor-help">
                  <span className="text-xs font-bold text-foreground truncate">
                    {warehouseFull}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{warehouseFull}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Technical Specs Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Density</span>
            <span className="text-xs font-bold text-foreground">
              {item.density?.toFixed(3) || "-"}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-border/50">
            <span className="text-[9px] text-muted-foreground font-bold uppercase mb-1">MI</span>
            <span className="text-xs font-bold text-foreground">
              {item.mi ? (item.mi % 1 === 0 ? item.mi : item.mi.toFixed(1)) : "-"}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Izod</span>
            <span className="text-xs font-bold text-foreground">
              {item.izod !== undefined && item.izod !== null ? (item.izod % 1 === 0 ? item.izod : item.izod.toFixed(1)) : "-"}
            </span>
          </div>
        </div>

        {/* Secondary Details (Single Column Alignment - Better Spacing) */}
        <div className="grid grid-cols-1 gap-y-1.5 text-xs py-1">
          {item.gradeCode && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Grade</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[11px] font-medium text-muted-foreground italic truncate cursor-help">
                    {item.gradeCode}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{item.gradeCode}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.panId && item.panId && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Pan ID</span>
              <span className="font-medium">{item.panId}</span>
            </div>
          )}
          {config.date && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Pan Date</span>
              <span className="font-medium">{item.panDate ? format(new Date(item.panDate), "dd MMM yyyy") : "-"}</span>
            </div>
          )}
          {config.location && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Location</span>
              <span className="font-medium">{item.locationGroup || "-"}</span>
            </div>
          )}
          {config.lotName && item.lot && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Lot Number</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium truncate ml-4 cursor-help">{item.lot}</span>
                </TooltipTrigger>
                <TooltipContent>{item.lot}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.po && item.po && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Purchase Order</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-semibold truncate ml-4 cursor-help text-foreground">{item.po}</span>
                </TooltipTrigger>
                <TooltipContent>{item.po}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.containerNum && item.containerNum && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Container #</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono bg-muted text-[10px] px-1.5 py-0.5 rounded truncate ml-4 cursor-help">{item.containerNum}</span>
                </TooltipTrigger>
                <TooltipContent>{item.containerNum}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.packing && item.packing && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Packing</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium truncate ml-4 cursor-help">{item.packing}</span>
                </TooltipTrigger>
                <TooltipContent>{item.packing}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.compartment && item.rcCompartment && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Compartment</span>
              <span className="font-semibold">{item.rcCompartment}</span>
            </div>
          )}
          {config.overAllocatedBy && item.overAllocatedBy > 0 && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-red-500 font-bold uppercase text-[9px]">Over Allocated By</span>
              <span className="font-black text-red-600">{item.overAllocatedBy.toLocaleString()}</span>
            </div>
          )}
          {config.packLeft && item.packLeft != null && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Pack Left</span>
              <span className="font-medium">{item.packLeft}</span>
            </div>
          )}
          {config.weightLeft && item.weightLeft != null && (
            <div className="flex justify-between border-b border-border/10 pb-1">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Weight Left</span>
              <span className="font-medium">{item.weightLeft.toLocaleString()}</span>
            </div>
          )}
          {config.allocationIds && item.allocatedAllocationIds && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Allocation IDs</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-[10px] truncate ml-4 cursor-help">{item.allocatedAllocationIds}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs break-all">{item.allocatedAllocationIds}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.bookNums && item.allocatedBookNums && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Book Numbers</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-[10px] truncate ml-4 cursor-help">{item.allocatedBookNums}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs break-all">{item.allocatedBookNums}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.contNums && item.allocatedContNums && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">Container #s</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-[10px] truncate ml-4 cursor-help">{item.allocatedContNums}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs break-all">{item.allocatedContNums}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.soTypes && item.allocatedSOtypes && (
            <div className="flex justify-between border-b border-border/10 pb-1 min-w-0">
              <span className="text-muted-foreground uppercase text-[9px] shrink-0 font-bold">SO Types</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-[10px] truncate ml-4 cursor-help">{item.allocatedSOtypes}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs break-all">{item.allocatedSOtypes}</TooltipContent>
              </Tooltip>
            </div>
          )}
          {config.comment && item.comment && (
            <div className="flex flex-col border-b border-border/10 py-1.5 mt-0.5">
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Comment</span>
              <p className="text-[11px] italic text-foreground/80 line-clamp-2 mt-1" title={item.comment}>
                {item.comment}
              </p>
            </div>
          )}
        </div>

        {/* Customer Allocations */}
        {config.allocatedCustomers && allocatedCustomers.length > 0 && (
          <div className="mt-1 pt-1 border-t border-border/10">
            <span className="text-muted-foreground uppercase text-[9px] font-bold">Allocated Customers</span>
            <div className="flex flex-wrap gap-1">
              {allocatedCustomers.map((customer, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div className="bg-muted/60 px-1 py-0.5 rounded-[3px] text-[8px] font-bold border border-border/20 flex items-center gap-1 cursor-help max-w-[90px] truncate">
                      <div className={cn("h-1 w-1 rounded-full shrink-0", customer.level === 'pan' ? 'bg-blue-400' : 'bg-green-400')} />
                      {customer.code}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px]">{customer.code} ({customer.level === 'both' ? 'Pan & Inventory' : customer.level === 'pan' ? 'Pan Level' : 'Inventory Level'})</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};