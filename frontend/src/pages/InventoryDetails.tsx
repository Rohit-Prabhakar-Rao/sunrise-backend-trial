import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, ArrowLeft, ShoppingCart, 
  Package, FileText, Ruler, Warehouse 
} from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // 1. Fetch Data
  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      const token = auth.user?.access_token || "";
      return api.getInventoryById(id!, token);
    },
    enabled: !!id && auth.isAuthenticated,
  });

  // 2. Set initial main image
  useEffect(() => {
    if (item?.sampleImages?.length > 0) {
      setActiveImage(item.sampleImages[0]);
    }
  }, [item]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !item) {
    return <div className="p-10 text-center">Item not found.</div>;
  }

  // Helper for Add to Compare Cart
  const handleAddToCart = () => {
    addItem({
      id: item.id || `inv-${item.inventoryId}`,
      lot: item.lot,
      grade: item.gradeCode,
      quantity: item.availableQty,
      panId: item.panId,
    });
    toast.success(`Added ${item.gradeCode} to compare`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border shadow-sm relative">
            {activeImage ? (
              <img 
                src={activeImage} 
                alt="Main Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Package className="h-20 w-20 opacity-20" />
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {item.sampleImages && item.sampleImages.length > 0 && (
             <Carousel className="w-full max-w-md mx-auto">
                <CarouselContent>
                  {item.sampleImages.map((img: string, idx: number) => (
                    <CarouselItem key={idx} className="basis-1/4 cursor-pointer" onClick={() => setActiveImage(img)}>
                      <div className={`rounded-md overflow-hidden border-2 aspect-square ${activeImage === img ? 'border-primary' : 'border-transparent'}`}>
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
             </Carousel>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{item.polymerCode} - {item.gradeCode}</h1>
                <p className="text-lg text-muted-foreground">{item.supplierCode}</p>
              </div>
              <Badge className="text-sm px-3 py-1" variant={item.availableQty > 0 ? "default" : "secondary"}>
                {item.availableQty > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
               <span className="text-sm text-muted-foreground">Lot Number</span>
               <p className="font-mono font-medium">{item.lot}</p>
            </div>
            <div className="space-y-1">
               <span className="text-sm text-muted-foreground">Form</span>
               <p className="font-medium">{item.formCode}</p>
            </div>
            <div className="space-y-1">
               <span className="text-sm text-muted-foreground">Available Quantity</span>
               <p className="text-2xl font-bold text-primary">{item.availableQty.toLocaleString()} kg</p>
            </div>
            <div className="space-y-1">
               <span className="text-sm text-muted-foreground">Location</span>
               <p className="font-medium flex items-center gap-2">
                 <Warehouse className="h-4 w-4" /> 
                 {item.warehouseName} ({item.locationGroup})
               </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart} disabled={item.availableQty <= 0}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Compare Cart
             </Button>
          </div>

          {/* TABS FOR DEEP DIVE */}
          <Tabs defaultValue="specs" className="w-full mt-8">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="allocations">Allocations & History</TabsTrigger>
              <TabsTrigger value="container">Logistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specs" className="mt-4">
               <Card>
                 <CardContent className="pt-6 grid grid-cols-2 gap-4">
                    <SpecRow label="Melt Index (MI)" value={item.mi} unit="g/10min" />
                    <SpecRow label="Density" value={item.density} unit="g/cm³" decimals={4} />
                    <SpecRow label="Izod Impact" value={item.izod} unit="J/m" />
                    <SpecRow label="Resin Type" value={item.polymerCode} />
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="allocations" className="mt-4">
               <Card>
                 <CardContent className="pt-6 space-y-4">
                    <div>
                       <p className="text-sm font-medium mb-2">Allocated Customers</p>
                       <div className="flex flex-wrap gap-2">
                          {item.allocatedCustomerCodes ? (
                              item.allocatedCustomerCodes.split(',').map((c: string) => (
                                <Badge key={c} variant="outline">{c.trim()}</Badge>
                              ))
                          ) : <span className="text-muted-foreground text-sm">None</span>}
                       </div>
                    </div>
                    <div>
                       <p className="text-sm font-medium mb-2">Sales Order Types</p>
                       <p className="text-sm text-muted-foreground">{item.allocatedSOtypes || "N/A"}</p>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="container" className="mt-4">
               <Card>
                 <CardContent className="pt-6 grid grid-cols-2 gap-4">
                    <SpecRow label="Container #" value={item.containerNum} />
                    <SpecRow label="Purchase Order" value={item.po} />
                    <SpecRow label="Packing" value={item.packing} />
                    <SpecRow label="Pan ID" value={item.panId} />
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Specs
const SpecRow = ({ label, value, unit, decimals = 2 }: any) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground uppercase">{label}</span>
    <span className="font-medium">
       {value != null ? (typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: decimals }) : value) : "N/A"} 
       {unit && <span className="text-muted-foreground text-xs ml-1">{unit}</span>}
    </span>
  </div>
);

export default InventoryDetail;