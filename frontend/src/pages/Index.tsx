import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useAuth } from "react-oidc-context";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SearchHeader } from "@/components/SearchHeader";
import { InventoryCard } from "@/components/InventoryCard";
import { InventoryTable } from "@/components/InventoryTable";
import { loadConfig, CardFieldConfig } from "@/components/CardConfigDialog";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { FilterState } from "@/lib/filterInventory";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [cardConfig, setCardConfig] = useState<CardFieldConfig>(loadConfig());
  const auth = useAuth();

  const [filters, setFilters] = useState<FilterState>({
    suppliers: [],
    polymers: [],
    forms: [],
    grades: [],
    folders: [],
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
    qualityControl: { mi: false, izod: false, density: false },
  });

  // --- 2. Create the Delay ---
  // This variable only updates 2000ms AFTER you stop typing/clicking
  const debouncedFilters = useDebounce(filters, 2000);
  const debouncedSort = useDebounce(sortBy, 2000);

  // --- INFINITE SCROLL LOGIC ---
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    // --- 3. Update Query Key ---
    // React Query will now wait for the debounced values to change before fetching
    queryKey: ['inventory', debouncedFilters, debouncedSort], 
    
    queryFn: async ({ pageParam = 0 }) => {
      const token = auth.user?.access_token || "";
      // We use 'debouncedFilters' here to ensure the API gets the stable value
      const response = await api.getInventory({ ...debouncedFilters, sortBy: debouncedSort }, pageParam, token);
      return response;
    },
    enabled: auth.isAuthenticated,
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages) => {
      if (!lastPage.data || lastPage.data.length < 50) return undefined;
      return allPages.length; 
    },
  });

  const handleExport = async () => {
    try {
      toast.info("Preparing Excel file...");
      const token = auth.user?.access_token || "";
      await api.exportInventory({ ...debouncedFilters }, debouncedSort, token);
      toast.success("Download started!");
    } catch (e) {
      toast.error("Export failed.");
    }
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const inventoryItems = data?.pages.flatMap((page: any) => page.data) || [];

  // --- RENDER ---
  // Note: We use the raw 'filters' for the UI props so the inputs update instantly visually
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div className="text-lg font-semibold mt-4">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (isError) {
     return <div className="p-10 text-center text-red-500">Error loading data. Check Backend Console.</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar 
        inventory={inventoryItems} 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <SearchHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={inventoryItems.length}
          searchQuery={filters.searchQuery} // Pass raw value so input is responsive
          onSearchChange={(query) => setFilters({ ...filters, searchQuery: query })} // Update raw value instantly
          cardConfig={cardConfig}
          onCardConfigChange={setCardConfig}
          onExport={handleExport}
        />

        <div className="flex-1 overflow-y-auto bg-background p-4 relative">
             {/* Show a small loading indicator OVER the content when refetching (optional) */}
             {/* {isFetching && !isFetchingNextPage && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50" />} */}

            {inventoryItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-lg font-semibold text-muted-foreground">
                  No items found
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {inventoryItems.map((item: any) => (
                  <InventoryCard key={item.id} item={item} config={cardConfig} />
                ))}
              </div>
            ) : (
              <InventoryTable items={inventoryItems} config={cardConfig} />
            )}

            <div ref={ref} className="h-20 w-full flex justify-center items-center mt-4">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   <span className="text-sm text-muted-foreground">Loading more...</span>
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Index;