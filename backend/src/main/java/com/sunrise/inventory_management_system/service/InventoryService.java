package com.sunrise.inventory_management_system.service;

import com.sunrise.inventory_management_system.dto.InventoryDTO;
import com.sunrise.inventory_management_system.dto.InventorySearchCriteria;
import com.sunrise.inventory_management_system.repository.InventoryRepository;
import com.sunrise.inventory_management_system.repository.InventorySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository repository;
    private final InventoryMapper mapper;

    @Transactional(readOnly = true)
    public List<InventoryDTO> searchInventory(InventorySearchCriteria criteria, int page, int size, String sortParam) {

        Sort sort = Sort.by("panDate").descending();

        if (sortParam != null) {
            switch (sortParam) {
                case "quantity-high":
                    sort = Sort.by("availableQty").descending();
                    break;
                case "quantity-low":
                    sort = Sort.by("availableQty").ascending();
                    break;
                case "supplier":
                    sort = Sort.by("supplierCode").ascending();
                    break;
                case "polymer":
                    sort = Sort.by("polymerCode").ascending();
                    break;
                case "lot":
                    sort = Sort.by("lot").ascending();
                    break;
                case "recent":
                default:
                    sort = Sort.by("panDate").descending();
            }
        }

        Pageable pageRequest = PageRequest.of(page, size, sort);

        var specs = InventorySpecifications.withDynamicFilter(criteria);
        Page<com.sunrise.inventory_management_system.entity.InventoryView> pageResult = repository.findAll(specs, pageRequest);

        return pageResult.stream()
                .map(mapper::toDTO)
                .toList();
    }

    public InventoryDTO getInventoryById(Long id) {
        return repository.findByPanId(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with PanID: " + id));
    }
}
