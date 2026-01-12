import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ComparePage = () => {
  const { items, clearCart, removeItem } = useCartStore();
  const auth = useAuth();
  const navigate = useNavigate();

  const { data: fullItems, isLoading } = useQuery({
    queryKey: ["compare-items", items],
    queryFn: async () => {
      if (items.length === 0) return [];
      const token = auth.user?.access_token || "";
      const promises = items.map(cartItem => 
        api.getInventoryById(cartItem.panId, token)
      );
      return Promise.all(promises);
    },
    enabled: items.length > 0 && auth.isAuthenticated,
  });

  if (items.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-600">Comparison list is empty</h2>
        <Button onClick={() => navigate("/")}>Go Back to Inventory</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- CONFIGURATION ---
  const specs = [
    { label: "Supplier", key: "supplierCode" },
    { label: "Grade", key: "gradeCode", highlight: true },
    { label: "Lot Number", key: "lot", font: "mono" },
    { label: "Form", key: "formCode" },
    { label: "Melt Index", key: "mi", unit: "g/10min" },
    { label: "Density", key: "density", unit: "g/cm³", decimals: 4 },
    { label: "Izod Impact", key: "izod", unit: "J/m" },
    { label: "Qty Available", key: "availableQty", format: (v: any) => v?.toLocaleString() + " kg", bold: true },
    { label: "Warehouse", key: "warehouseName" },
    { label: "Location", key: "locationGroup" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-bold hidden md:block">Compare Products</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => clearCart()}>
               Clear All
            </Button>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="border rounded-xl bg-white shadow-lg overflow-hidden relative">
            <ScrollArea className="w-full">
                <div className="w-full min-w-max"> 
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50/80">
                                {/* STICKY HEADER COLUMN */}
                                <th className="p-4 w-[200px] sticky left-0 bg-gray-50 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top pt-12">
                                    <span className="font-bold text-gray-700 text-lg">Properties</span>
                                    <p className="text-xs text-gray-400 font-normal mt-1">
                                        Compare specs side-by-side
                                    </p>
                                </th>
                                
                                {/* PRODUCT HEADERS (With Mini Gallery) */}
                                {fullItems?.map((item: any) => (
                                    <th key={item.inventoryId} className="p-4 min-w-[300px] w-[300px] align-top relative group border-r">
                                        {/* Remove Button */}
                                        <button 
                                            onClick={() => removeItem(item.id || `inv-${item.inventoryId}`)}
                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            title="Remove"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        <div className="space-y-3">
                                            {/* Product Title */}
                                            <div>
                                                <div className="text-lg font-bold text-gray-900 leading-tight">
                                                    {item.polymerCode}
                                                </div>
                                                <Badge variant="secondary" className="mt-1 font-mono text-xs">
                                                    {item.gradeCode}
                                                </Badge>
                                            </div>
                                            
                                            {/* IMAGE GALLERY COMPONENT */}
                                            <ProductImageGallery images={item.sampleImages} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y">
                            {specs.map((spec, idx) => (
                                <tr key={spec.key} className={`group hover:bg-blue-50/30 transition-colors ${spec.highlight ? "bg-blue-50/50" : ""}`}>
                                    <td className="p-4 font-medium text-gray-500 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-blue-50/30">
                                        {spec.label}
                                    </td>
                                    {fullItems?.map((item: any) => {
                                        const val = item[spec.key];
                                        return (
                                            <td key={item.inventoryId} className={`p-4 text-gray-700 border-r ${spec.font === 'mono' ? 'font-mono text-xs' : ''} ${spec.bold ? 'font-bold' : ''}`}>
                                                {spec.format 
                                                    ? spec.format(val) 
                                                    : (val ?? <span className="text-gray-300">-</span>)
                                                }
                                                {spec.unit && val != null && <span className="text-xs text-gray-400 ml-1">{spec.unit}</span>}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      </div>
    </div>
  );
};

// This handles the state for just ONE product column
const ProductImageGallery = ({ images }: { images: string[] }) => {
    // If no images, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className="h-40 w-full bg-gray-100 rounded-md border border-dashed flex items-center justify-center text-gray-400 text-xs">
                No Image
            </div>
        );
    }

    const [activeImg, setActiveImg] = useState(images[0]);

    return (
        <div className="space-y-2">
            {/* Main Active Image - FIXED HEIGHT & FULL COVER */}
            <div className="h-40 w-full bg-gray-100 rounded-md border flex items-center justify-center overflow-hidden relative">
                <img 
                    src={activeImg} 
                    alt="Product" 
                    // CHANGED: object-cover fills the space, mix-blend-multiply helps white backgrounds blend
                    className="h-full w-full object-cover" 
                />
            </div>

            {/* Thumbnail Strip (Only shows if > 1 image) */}
            {images.length > 1 && (
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImg(img)}
                            className={`flex-shrink-0 h-10 w-10 border rounded overflow-hidden transition-all ${
                                activeImg === img 
                                ? "ring-2 ring-blue-500 ring-offset-1 border-blue-500 opacity-100" 
                                : "border-gray-200 opacity-70 hover:opacity-100"
                            }`}
                        >
                            <img src={img} className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ComparePage;