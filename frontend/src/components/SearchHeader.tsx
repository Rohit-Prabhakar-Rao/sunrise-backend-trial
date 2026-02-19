import { Search, Grid3x3, List, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardConfigDialog, CardFieldConfig } from "@/components/CardConfigDialog";
import { CartDrawer } from "@/components/CartDrawer";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";

interface SearchHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  resultCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchExecute?: () => void;
  cardConfig: CardFieldConfig;
  onCardConfigChange: (config: CardFieldConfig) => void;
  onExport: () => void;
}

export const SearchHeader = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  resultCount,
  searchQuery,
  onSearchChange,
  onSearchExecute,
  cardConfig,
  onCardConfigChange,
  onExport,
}: SearchHeaderProps) => {
  return (
    <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
      <div className="p-4 space-y-3">
        {/* --- SEARCH BAR --- */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lot (e.g. folder-lot), polymer, grade, supplier, PO..."
              className="pl-10 h-10 bg-background border-border pr-20"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchExecute) {
                  onSearchExecute();
                }
              }}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all active:scale-95"
              onClick={onSearchExecute}
            >
              Search
            </Button>
          </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex items-center justify-between">

          {/* LEFT SIDE: Results & Sort */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground hidden sm:block">
              <span className="font-bold text-foreground text-sm">{resultCount}</span> results
            </p>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[160px] h-9 bg-background border-border text-sm">
                <SelectValue placeholder="Sort results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="quantity-high">Quantity: High to Low</SelectItem>
                <SelectItem value="quantity-low">Quantity: Low to High</SelectItem>
                <SelectItem value="supplier">Supplier A-Z</SelectItem>
                <SelectItem value="polymer">Polymer Type</SelectItem>
                <SelectItem value="lot">Lot Number</SelectItem>
                {!["recent", "quantity-high", "quantity-low", "supplier", "polymer", "lot"].includes(sortBy || "") && (
                  <SelectItem value={sortBy || ""}>Custom Sorting</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* RIGHT SIDE: Actions */}
          <div className="flex items-center gap-2">

            {/* EXPORT BUTTON */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex gap-2 mr-2"
              onClick={onExport}
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Export
            </Button>

            {/* Compare Cart */}
            <CartDrawer />

            {/* Card Settings */}
            <CardConfigDialog config={cardConfig} onConfigChange={onCardConfigChange} />

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className="h-7 w-7 px-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className="h-7 w-7 px-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Divider & Theme Toggle */}
            <div className="h-6 w-px bg-border mx-1" />
            <ModeToggle />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
};