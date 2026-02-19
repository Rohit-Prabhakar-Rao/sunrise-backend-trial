import { useState, useRef } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Loader2, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@/components/PageLoader";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useReactToPrint } from "react-to-print";

const ComparePage = () => {
    const { items, clearCart, removeItem } = useCartStore();
    const navigate = useNavigate();

    // Create the Ref for the area you want to print
    const contentRef = useRef<HTMLDivElement>(null);

    // Setup the Print Function
    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: "Sunrise Inventory Comparison",
    });

    const { data: fullItems, isLoading } = useQuery({
        queryKey: ["compare-items", items],
        queryFn: async () => {
            if (items.length === 0) return [];
            const results = await Promise.allSettled(
                items.map(cartItem => api.getInventoryById(cartItem.panId, ""))
            );
            return results
                .filter(res => res.status === 'fulfilled')
                .map(res => (res as PromiseFulfilledResult<any>).value);
        },
        enabled: items.length > 0,
    });

    if (items.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-background">
                <h2 className="text-xl font-semibold text-muted-foreground">Comparison list is empty</h2>
                <Button onClick={() => navigate("/")}>Go Back to Inventory</Button>
            </div>
        );
    }

    if (isLoading) {
        return <PageLoader message="Comparing products..." />;
    }

    // Define rows to compare
    const specs = [
        { label: "Supplier", key: "supplierCode" },
        { label: "Polymer", key: "polymerCode" },
        { label: "Grade", key: "gradeCode", highlight: true },
        { label: "Form", key: "formCode" },
        { label: "Brand", key: "brand" },
        { label: "Lot Number", key: "lot", font: "mono" },
        { label: "Lot Name", key: "lotName" },
        {
            label: "Melt Index",
            key: "mi",
            unit: "g/10min",
            format: (v: any) => {
                const num = Number(v);
                return !isNaN(num) && v != null ? (num % 1 === 0 ? num : num.toFixed(1)) : "-"
            }
        },
        {
            label: "Density",
            key: "density",
            unit: "g/cm³",
            format: (v: any) => {
                const num = Number(v);
                return !isNaN(num) && v != null ? num.toFixed(3) : "-"
            }
        },
        {
            label: "Izod Impact",
            key: "izod",
            unit: "J/m",
            format: (v: any) => {
                const num = Number(v);
                return !isNaN(num) && v != null ? (num % 1 === 0 ? num : num.toFixed(1)) : "-"
            }
        },
        { label: "Available Qty", key: "availableQty", format: (v: any) => v?.toLocaleString() + " kg", bold: true },
        { label: "Warehouse", key: "warehouseName" },
        { label: "Location", key: "locationGroup" },
        { label: "PO #", key: "po" },
        { label: "Container #", key: "containerNum" },
        { label: "Packing", key: "packing" },
        { label: "Pan ID", key: "panId" },
    ];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* --- HEADER (Hidden in PDF) --- */}
                <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate("/")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <h1 className="text-2xl font-bold hidden md:block">Compare Products</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handlePrint()}
                            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            <Printer className="h-4 w-4" /> Export PDF
                        </Button>

                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => clearCart()}>
                            Clear All
                        </Button>
                    </div>
                </div>

                {/* --- COMPARISON TABLE (Ref attached here) --- */}
                <div ref={contentRef} className="print-container border rounded-xl bg-card shadow-lg overflow-hidden relative">

                    {/* PDF HEADER: Visible only when printing */}
                    <div className="hidden print:block p-6 pb-2 border-b mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Sunrise Inventory Report</h1>
                        <p className="text-xs text-gray-500">
                            Generated on {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* ScrollArea with PRINT overrides */}
                    <ScrollArea className="w-full h-full print:h-auto print:overflow-visible">
                        <div className="w-full min-w-max print:min-w-0 print:w-full">

                            <table className="w-full text-sm text-left border-collapse print:table-fixed">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        {/* ATTRIBUTE HEADER */}
                                        <th className="p-4 w-[200px] print:w-[100px] sticky left-0 bg-muted/50 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top pt-12 print:static print:shadow-none print:pt-4">
                                            <span className="font-bold text-foreground text-lg print:text-sm">Properties</span>
                                            <p className="text-xs text-muted-foreground font-normal mt-1 print:hidden">
                                                Compare specs side-by-side
                                            </p>
                                        </th>

                                        {/* PRODUCT COLUMNS */}
                                        {fullItems?.map((item: any) => (
                                            <th key={item.inventoryId} className="p-4 min-w-[300px] w-[300px] print:w-auto print:min-w-0 align-top relative group border-r">

                                                {/* Remove Button (Hidden in Print) */}
                                                <button
                                                    onClick={() => removeItem(item.id || `inv-${item.inventoryId}`)}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 print:hidden"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>

                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-lg font-bold text-foreground leading-tight print:text-sm">
                                                            {item.polymerCode}
                                                        </div>
                                                        <Badge variant="secondary" className="mt-1 font-mono text-xs border-gray-200 print:text-[10px] print:px-1">
                                                            {item.gradeCode}
                                                        </Badge>
                                                    </div>

                                                    <ProductImageGallery images={item.sampleImages} />
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {specs.map((spec, idx) => (
                                        <tr key={spec.key} className={`group hover:bg-primary/5 transition-colors ${spec.highlight ? "bg-primary/10" : ""}`}>
                                            <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-primary/5 print:static print:shadow-none">
                                                {spec.label}
                                            </td>
                                            {fullItems?.map((item: any) => {
                                                const val = item[spec.key];
                                                return (
                                                    <td key={item.inventoryId} className={`p-4 text-foreground border-r ${spec.font === 'mono' ? 'font-mono text-xs' : ''} ${spec.bold ? 'font-bold' : ''}`}>
                                                        {spec.format
                                                            ? spec.format(val)
                                                            : (val ?? <span className="text-muted-foreground/50">-</span>)
                                                        }
                                                        {spec.unit && val != null && <span className="text-xs text-muted-foreground ml-1">{spec.unit}</span>}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                        <ScrollBar orientation="horizontal" className="print:hidden" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

// --- IMAGE GALLERY COMPONENT ---
const ProductImageGallery = ({ images }: { images: string[] }) => {
    return (
        <div className="space-y-2">
            <div className="h-40 w-full bg-muted rounded-lg border flex items-center justify-center overflow-hidden relative print:h-24">
                <img
                    src="/images/Pellets-1.jpg"
                    alt="Product"
                    className="h-full w-full object-cover print:object-contain"
                />
            </div>
        </div>
    );
};

export default ComparePage;