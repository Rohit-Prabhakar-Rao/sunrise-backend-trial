import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/lib/cartStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useCartStore();

  // Calculate total quantity
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    console.log("Checkout Items:", items);
    toast.success("Order submitted! (Simulation)");
    clearCart();
  };

  return (
    <Sheet>
      {/* The Button that opens the drawer */}
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative ml-2">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-in zoom-in">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      {/* The Drawer Content */}
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Compare Cart ({items.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 flex-1 h-[calc(100vh-200px)]">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <ShoppingCart className="h-16 w-16 opacity-20" />
                    <p>Your cart is empty</p>
                </div>
            ) : (
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex flex-col border rounded-lg p-3 space-y-2 bg-muted/20">
                                <div className="flex justify-between font-medium">
                                    <span className="text-primary">{item.grade}</span>
                                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">Lot: {item.lot}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Qty: <span className="font-semibold text-foreground">{item.quantity.toLocaleString()} kg</span>
                                    </span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 h-8 w-8"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>

        {items.length > 0 && (
            <SheetFooter className="mt-auto border-t pt-4">
                <div className="w-full space-y-4">
                    <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                        <span className="font-medium">Total Quantity:</span>
                        <span className="font-bold text-lg">{totalQty.toLocaleString()} kg</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={clearCart}>
                          Clear
                      </Button>
                      <Button className="flex-[2]" onClick={() => navigate("/compare")}>
                          Compare Selected ({items.length})
                      </Button>
                  </div>
                </div>
            </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}