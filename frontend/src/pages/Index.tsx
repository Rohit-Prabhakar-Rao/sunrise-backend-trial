import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SearchHeader } from "@/components/SearchHeader";
import { InventoryCard } from "@/components/InventoryCard";
import { InventoryTable } from "@/components/InventoryTable";
import { loadConfig, CardFieldConfig } from "@/components/CardConfigDialog";
import { Loader2, ShoppingCart, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { FilterState } from "@/lib/filterInventory";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cartStore";
import { useInventoryUiStore } from "@/lib/inventoryUiStore";
import { PaginationControls } from "@/components/PaginationControls";
import { PageLoader } from "@/components/PageLoader";
import { ContentLoader } from "@/components/ContentLoader";

const PAGE_SIZE = 50;

const Index = () => {
  const [sortBy, setSortBy] = useState("recent");
  const [cardConfig, setCardConfig] = useState<CardFieldConfig>(loadConfig());
  const [loaderState, setLoaderState] = useState<{ message: string; timestamp: number } | null>(null);

  const {
    viewMode, setViewMode,
    page, setPage,
    selectedItems, toggleItem, clearSelection, setSelection,
    filters: appliedFilters, setFilters: setAppliedFilters
  } = useInventoryUiStore();

  const addItem = useCartStore((state) => state.addItem);
  const cartItemsCount = useCartStore((state) => state.items.length);

  const [pendingFilters, setPendingFilters] = useState<FilterState>(appliedFilters);
  const debouncedSort = useDebounce(sortBy, 500);

  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    if (loaderState) {
      const timer = setTimeout(() => setLoaderState(null), 300);
      return () => clearTimeout(timer);
    }
  }, [loaderState]);

  const triggerLoader = (message: string) => {
    setLoaderState({ message, timestamp: Date.now() });
  };

  const handleApplyFilters = () => {
    triggerLoader("Applying filters...");
    setAppliedFilters({
      ...pendingFilters,
      searchQuery: appliedFilters.searchQuery
    });
    setPage(0);
    toast.success("Filters applied");
  };

  const handleSearchExecute = () => {
    triggerLoader("Searching items...");
    setAppliedFilters({
      ...appliedFilters,
      searchQuery: pendingFilters.searchQuery
    });
    setPage(0);
  };

  const handleGlobalReset = () => {
    triggerLoader("Resetting view...");
    const initialFilters = {
      suppliers: [],
      polymers: [],
      forms: [],
      grades: [],
      locations: [],
      warehouses: [],
      dateRange: { from: undefined, to: undefined },
      miRange: { from: undefined, to: undefined },
      densityRange: { from: undefined, to: undefined },
      izodRange: { from: undefined, to: undefined },
      quantityRange: { from: undefined, to: undefined },
      lots: [],
      searchQuery: "",
      includeNAMI: true,
      includeNADensity: true,
      includeNAIzod: true,
      qualityControl: {
        mi: false,
        izod: false,
        density: false,
      },
    };

    setPendingFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSortBy("recent");
    setPage(0);
    clearSelection();
    toast.success("All filters, search, and sorting cleared");
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;

    let addedCount = 0;
    selectedItems.forEach(item => {
      const success = addItem({
        id: item.id,
        panId: item.panId ? item.panId.toString() : "N/A",
        polymer: item.polymerCode,
        form: item.formCode,
        folder: item.folderCode,
        lotName: item.lotName,
        lot: item.lot ? item.lot.toString() : "N/A",
        grade: item.gradeCode || "Unknown",
        quantity: item.availableQty || 0
      });
      if (success) addedCount++;
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to compare`);
      clearSelection();
    } else {
      toast.error("No new items could be added to the cart.");
    }
  };

  const { data: filterOptions } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: async () => {
      return api.getFilters("");
    },
    staleTime: 1000 * 60 * 15,
  });

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData
  } = useQuery({
    queryKey: ['inventory', appliedFilters, debouncedSort, page],
    queryFn: async () => {
      return api.getInventory({ ...appliedFilters, sortBy: debouncedSort }, page, "");
    },
    placeholderData: keepPreviousData,
  });

  const handleExport = async () => {
    try {
      toast.info("Preparing Excel file...");
      await api.exportInventory({ ...appliedFilters }, debouncedSort, "");
      toast.success("Download started!");
    } catch (e) {
      toast.error("Export failed.");
    }
  };

  const inventoryItems = data?.data || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const activeLoaderMessage = loaderState?.message || (isFetching || isPlaceholderData ? "Updating results..." : (isLoading && !data ? "Loading inventory..." : null));
  const isTransitioning = !!activeLoaderMessage;
  const loaderKey = loaderState ? `loader-${loaderState.timestamp}` : (isFetching ? 'fetching' : (isLoading ? 'loading' : 'none'));

  return (
    <div className="flex h-screen bg-background relative">
      <FilterSidebar
        inventory={inventoryItems}
        filterOptions={filterOptions}
        filters={pendingFilters}
        onFiltersChange={setPendingFilters}
        onApply={handleApplyFilters}
        onReset={handleGlobalReset}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <SearchHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={(val) => {
            setSortBy(val);
            triggerLoader("Sorting results...");
          }}
          resultCount={totalElements}
          searchQuery={pendingFilters.searchQuery}
          onSearchChange={(query) => setPendingFilters({ ...pendingFilters, searchQuery: query })}
          onSearchExecute={handleSearchExecute}
          cardConfig={cardConfig}
          onCardConfigChange={setCardConfig}
          onExport={handleExport}
        />

        <div className="flex-1 overflow-y-auto bg-background p-4 relative">
          {isTransitioning && <ContentLoader key={loaderKey} message={activeLoaderMessage || "Updating..."} />}
          {isError && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Network Error</h3>
                <p className="text-sm text-muted-foreground">Failed to load inventory. Please check the backend connection.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
            </div>
          )}
          {!isError && (() => {
            const { searchQuery: pSearch, ...pRest } = pendingFilters;
            const { searchQuery: aSearch, ...aRest } = appliedFilters;
            const isSidebarDirty = JSON.stringify(pRest) !== JSON.stringify(aRest);

            if (isSidebarDirty) {
              return (
                <div className="absolute top-2 right-4 z-40 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 shadow-sm animate-pulse">
                  Click "Apply Filters" to update results
                </div>
              );
            }
            return null;
          })()}

          <div className={`${isPlaceholderData ? "opacity-50 pointer-events-none" : ""}`}>
            {inventoryItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-lg font-semibold text-muted-foreground">
                  No items found
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {inventoryItems.map((item: any) => {
                  const isSelected = selectedItems.some(i => i.id === item.id);
                  return (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      config={cardConfig}
                      isSelected={isSelected}
                      onToggle={() => toggleItem(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <InventoryTable
                items={inventoryItems}
                config={cardConfig}
                sortBy={sortBy}
                onSortChange={(val) => {
                  setSortBy(val);
                  triggerLoader("Sorting results...");
                }}
                selectedIds={selectedItems.map(i => i.id)}
                onSelectionChange={(ids) => {
                  const newSelection = inventoryItems.filter((item: any) => ids.includes(item.id));
                  const existingOthers = selectedItems.filter(i => !inventoryItems.some((pageItem: any) => pageItem.id === i.id));
                  setSelection([...existingOthers, ...newSelection]);
                }}
              />
            )}
          </div>
        </div>

        <div className="border-t bg-background p-4 flex items-center justify-center z-10">
          {inventoryItems.length > 0 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              isLoading={isPlaceholderData || isLoading}
            />
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {selectedItems.length > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none text-white">
              {selectedItems.length} selected
            </span>
            <span className="text-[10px] text-white/60 font-medium mt-1">
              Cart total: {cartItemsCount}/4
            </span>
          </div>
          <div className="h-4 w-[1px] bg-background/30"></div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddToCart}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Compare
          </Button>
          <button
            onClick={() => clearSelection()}
            className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;