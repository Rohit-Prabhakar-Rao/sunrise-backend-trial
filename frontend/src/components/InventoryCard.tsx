import { Package, User, ShoppingCart, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/lib/cartStore";
import { toast } from "sonner";

interface InventoryCardProps {
  item: InventoryItem;
  config: CardFieldConfig;
}

export const InventoryCard = ({ item, config }: InventoryCardProps) => {
  const hasImages = item.sampleImages && item.sampleImages.length > 0;
  const navigate = useNavigate();

  const addItem = useCartStore((state) => state.addItem);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    addItem({
      id: item.id || `inv-${item.inventoryId}`,
      panId: String(item.panId),
      lot: item.lot?.toString() || "Unknown",
      grade: item.gradeCode || "Unknown",
      quantity: item.availableQty || 0,
    });

    toast.success(`Added ${item.gradeCode} (Lot: ${item.lot}) to cart`);
  };

  // Get status background color (darker pastel)
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
  const getAllocatedCustomers = () => {
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

  const allocatedCustomers = getAllocatedCustomers();

  return (
    <Card onClick={() => navigate(`/inventory/${item.panId}`)}
      className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-border hover:border-red-500 bg-card h-full flex flex-col">
      
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden border-b border-border">
        {hasImages ? (
          <Carousel className="w-full h-full absolute inset-0">
            <CarouselContent className="h-full -ml-0">
              {item.sampleImages.map((imageUrl, index) => (
                <CarouselItem key={index} className="pl-0 basis-full h-full">
                  <img
                    src={imageUrl}
                    alt={`${item.polymerCode} sample ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {item.sampleImages.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-20 w-20 text-primary/20 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        {config.formCode && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
              {item.formCode}
            </Badge>
          </div>
        )}
        {config.warehouse && (
          <div className="absolute bottom-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs">
              {item.warehouseName || item.locationGroup}
            </Badge>
          </div>
        )}
        
        {item.availableQty > 0 && (
          <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
                size="sm" 
                className="rounded-full shadow-lg" 
                onClick={handleAddToCart}
            >
                <ShoppingCart className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1">
        {config.polymerCode && (
          <div>
            <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
              {item.polymerCode}
            </h3>
            {config.gradeCode && item.gradeCode && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.gradeCode}
              </p>
            )}
          </div>
        )}

        {config.brand && item.brand && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">{item.brand}</span>
          </div>
        )}

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
                  {item.compartment || "N/A"}
                </p>
              </div>
            )}
          </div>
        )}

        {(config.density || config.mi || config.izod) && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {config.density && (
              <div className="text-center p-2 rounded bg-muted/30">
                <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">Density</p>
                <p className="text-xs font-semibold text-foreground">
                  {item.density != null ? item.density.toFixed(2) : "N/A"}
                </p>
              </div>
            )}
            {config.mi && (
              <div className="text-center p-2 rounded bg-muted/30">
                <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">MI</p>
                <p className="text-xs font-semibold text-foreground">
                  {item.mi != null ? item.mi.toFixed(2) : "N/A"}
                </p>
              </div>
            )}
            {config.izod && (
              <div className="text-center p-2 rounded bg-muted/30">
                <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">Izod</p>
                <p className="text-xs font-semibold text-foreground">
                  {item.izod != null ? item.izod : "N/A"}
                </p>
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
                {format(item.date, "MMM dd, yyyy")}
              </span>
            </div>
          )}
          {config.folderCode && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Folder:</span>
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
              <span className="font-medium text-foreground font-mono">{item.panId.toLocaleString()}</span>
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
          {config.overAllocatedBy && item.overAllocatedBy > 0 && (
            <div className="flex justify-between p-2 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40">
              <span className="text-muted-foreground">Over Allocated By:</span>
              <span className="font-medium text-foreground font-semibold text-red-700 dark:text-red-400">
                {item.overAllocatedBy.toLocaleString()}
              </span>
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
              <span className="font-medium text-foreground">{item.weightLeft.toLocaleString()}</span>
            </div>
          )}
          {config.comment && item.comment && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comment:</span>
              <span className="font-medium text-foreground text-right max-w-[60%] truncate" title={item.comment}>
                {item.comment}
              </span>
            </div>
          )}
        </div>

        {/* Allocated Customers Section */}
        {config.allocatedCustomers && allocatedCustomers.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="p-2 rounded bg-muted/30 w-full">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Allocated Customers
                </p>
              </div>
              <div className="space-y-1">
                {allocatedCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{customer.code}</span>
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
            </div>
          </div>
        )}

        {/* Allocation IDs Section */}
        {config.allocationIds && item.allocatedAllocationIds && (
          <div className="pt-2 border-t border-border">
            <div className="p-2 rounded bg-muted/30 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Allocation IDs
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parseAllocationIds(item.allocatedAllocationIds).map((id, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Book Numbers Section */}
        {config.bookNums && item.allocatedBookNums && (
          <div className="pt-2 border-t border-border">
            <div className="p-2 rounded bg-muted/30 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Book Numbers
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parseBookNums(item.allocatedBookNums).map((num, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Container Numbers Section */}
        {config.contNums && item.allocatedContNums && (
          <div className="pt-2 border-t border-border">
            <div className="p-2 rounded bg-muted/30 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Container Numbers
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parseContNums(item.allocatedContNums).map((num, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sales Order Types Section */}
        {config.soTypes && item.allocatedSOtypes && (
          <div className="pt-2 border-t border-border">
            <div className="p-2 rounded bg-muted/30 w-full">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Sales Order Types
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parseSOTypes(item.allocatedSOtypes).map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};