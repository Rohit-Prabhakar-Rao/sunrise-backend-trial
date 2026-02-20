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

        if (sortParam != null && !sortParam.isEmpty()) {
            if (sortParam.contains(",")) {
                // Handle generic "field,direction" format
                String[] parts = sortParam.split(",");
                String property = parts[0];
                String direction = parts.length > 1 ? parts[1] : "asc";

                sort = direction.equalsIgnoreCase("desc")
                        ? Sort.by(property).descending()
                        : Sort.by(property).ascending();
            } else {
                // Fallback for legacy keys (if any still sent)
                sort = switch (sortParam) {
                    case "quantity-high" -> Sort.by("availableQty").descending();
                    case "quantity-low" -> Sort.by("availableQty").ascending();
                    case "supplier" -> Sort.by("supplierCode").ascending();
                    case "polymer" -> Sort.by("polymerCode").ascending();
                    case "lot" -> Sort.by("lot").ascending();
                    case "recent" -> Sort.by("panDate").descending();
                    default -> Sort.by("panDate").descending();
                };
            }
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

    public InventoryDTO getInventoryById(String id) {
        return viewRepository.findFirstByPanId(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with PanID: " + id));
    }

    public InventoryDTO getInventoryById(String id, String polymer, String form, String folder, String lot) {
        // 1. Try Specific Match if we have the detail params
        if (polymer != null && !polymer.isEmpty() && form != null && !form.isEmpty()) {
            Optional<InventoryView> match = viewRepository
                    .findFirstByPanIdAndPolymerCodeAndFormCodeAndFolderCodeAndLotName(
                            id, polymer, form, folder, lot);
            if (match.isPresent()) {
                return mapper.toDTO(match.get());
            }
        }

        // 2. Fallback to just PanID if missing params or no specific match found
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
        // Results are: [0]=minMi, [1]=maxMi, [2]=minDen, [3]=maxDen, [4]=minIzod,
        // [5]=maxIzod, [6]=minDate, [7]=maxDate
        Object[] ranges = viewRepository.findGlobalSpecRanges();

        if (ranges != null && ranges.length > 0 && ranges[0] instanceof Object[]) {
            Object[] row = (Object[]) ranges[0];

            if (row[0] != null || row[1] != null) {
                filters.put("miRange", toRangeList(row[0], row[1], "0.0", "100.0"));
            }
            if (row[2] != null || row[3] != null) {
                filters.put("densityRange", toRangeList(row[2], row[3], "0.0", "2.0"));
            }
            if (row[4] != null || row[5] != null) {
                filters.put("izodRange", toRangeList(row[4], row[5], "0.0", "20.0"));
            }

            String defaultDate = java.time.LocalDate.now().toString();
            filters.put("dateRange", toRangeList(row[6], row[7], defaultDate, defaultDate));
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
