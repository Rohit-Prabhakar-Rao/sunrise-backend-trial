package com.sunrise.inventory_management_system.service;

import com.sunrise.inventory_management_system.dto.InventoryDTO;
import com.sunrise.inventory_management_system.dto.InventorySearchCriteria;
import com.sunrise.inventory_management_system.entity.Inventory;
import com.sunrise.inventory_management_system.entity.InventoryView;
import com.sunrise.inventory_management_system.repository.InventoryFastRepository;
import com.sunrise.inventory_management_system.repository.InventoryRepository;
import com.sunrise.inventory_management_system.repository.InventorySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMapper mapper;
    private final InventoryRepository viewRepository;
    private final InventoryFastRepository fastRepository;

    @Transactional(readOnly = true)
    public Page<InventoryDTO> searchInventory(InventorySearchCriteria criteria, int page, int size, String sortParam) {

        Sort sort = Sort.by("panDate").descending();
        if (sortParam != null) {
            sort = switch (sortParam) {
                case "quantity-high" -> Sort.by("availableQty").descending();
                case "quantity-low" -> Sort.by("availableQty").ascending();
                case "supplier" -> Sort.by("supplierCode").ascending();
                case "polymer" -> Sort.by("polymerCode").ascending();
                case "lot" -> Sort.by("lot").ascending();
                default -> Sort.by("panDate").descending();
            };
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<InventoryView> viewSpec = InventorySpecifications.withDynamicFilter(criteria);
        Specification<Inventory> fastSpec = (root, query, cb) -> {
            return ((Specification) viewSpec).toPredicate(root, query, cb);
        };

        // 'findAll' here runs two queries on tblInventory:
        // A. Select Top 50 (Instant)
        // B. Count(*) (Instant - because it ignores the heavy View logic)
        Page<Inventory> fastPage = fastRepository.findAll(fastSpec, pageable);

        if (fastPage.isEmpty()) {
            return Page.empty(pageable);
        }

        // Extract IDs of the "Winners"
        List<Long> ids = fastPage.getContent().stream()
                .map(Inventory::getInventoryId)
                .toList();

        // Fetch heavy data (Images, POs) ONLY for these 50 IDs
        List<InventoryView> heavyViews = viewRepository.findAllById(ids);

        // 6. Re-Sort and Map
        Map<Long, InventoryView> viewMap = heavyViews.stream()
                .collect(Collectors.toMap(InventoryView::getInventoryId, v -> v));

        List<InventoryDTO> dtos = ids.stream()
                .map(viewMap::get)
                .filter(java.util.Objects::nonNull)
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        // We combine the 'dtos' (heavy details) with the 'totalElements' (fast count)
        return new PageImpl<>(dtos, pageable, fastPage.getTotalElements());
    }

    public InventoryDTO getInventoryById(Long id) {
        return viewRepository.findFirstByPanId(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with PanID: " + id));
    }

    @Cacheable("filter-options")
    public Map<String, List<String>> getFilterValues() {
        Map<String, List<String>> filters = new HashMap<>();
        filters.put("suppliers", removeEmpty(viewRepository.findDistinctSuppliers()));
        filters.put("grades", removeEmpty(viewRepository.findDistinctGrades()));
        filters.put("forms", removeEmpty(viewRepository.findDistinctForms()));
        filters.put("polymers", removeEmpty(viewRepository.findDistinctPolymers()));
        filters.put("warehouses", removeEmpty(viewRepository.findDistinctWarehouses()));
        filters.put("locations", removeEmpty(viewRepository.findDistinctLocations()));
        filters.put("lots", removeEmpty(viewRepository.findDistinctLotNames()));

        // 2. Fetch Ranges (MI, Density, Izod)
        // Results are: [0]=minMi, [1]=maxMi, [2]=minDen, [3]=maxDen, [4]=minIzod, [5]=maxIzod
        Object[] ranges = viewRepository.findGlobalSpecRanges();

        // Handle potential nulls safely (if DB is empty)
        if (ranges != null && ranges.length > 0 && ranges[0] instanceof Object[]) {
            Object[] row = (Object[]) ranges[0];

            filters.put("miRange", toRangeList(row[0], row[1], "0.0", "100.0"));
            filters.put("densityRange", toRangeList(row[2], row[3], "0.0", "2.0"));
            filters.put("izodRange", toRangeList(row[4], row[5], "0.0", "20.0"));
            String defaultDate = java.time.LocalDate.now().toString();
            filters.put("dateRange", toRangeList(row[6], row[7], defaultDate, defaultDate));
        } else {
            // Fallback defaults
            filters.put("miRange", List.of("0.0", "100.0"));
            filters.put("densityRange", List.of("0.0", "2.0"));
            filters.put("izodRange", List.of("0.0", "20.0"));
        }
        return filters;
    }

    private List<String> removeEmpty(List<String> list) {
        return list.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .collect(Collectors.toList());
    }

    // Helper to convert Object numbers to List<String>
    private List<String> toRangeList(Object min, Object max, String defaultMin, String defaultMax) {
        String minStr = (min != null) ? min.toString() : defaultMin;
        String maxStr = (max != null) ? max.toString() : defaultMax;
        return Arrays.asList(minStr, maxStr);
    }
}
