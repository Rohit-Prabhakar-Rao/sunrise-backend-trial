package com.sunrise.inventory_management_system.service;

import com.sunrise.inventory_management_system.dto.InventoryDTO;
import com.sunrise.inventory_management_system.entity.InventoryView;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class InventoryMapper {
    private static final String IMAGE_API_BASE = "http://localhost:3000/api/images/";
    public InventoryDTO toDTO(InventoryView entity) {
        if (entity == null) return null;

        return InventoryDTO.builder()
                // The composite ID logic from Node.js
                .id("pan-" + entity.getPanId() + "-inv-" + entity.getInventoryId())

                .panId(entity.getPanId())
//                .date(entity.getPanDate()) // You need to add PanDate to InventoryView entity first
                .inventoryId(entity.getInventoryId())

                .supplierCode(entity.getSupplierCode())
                .po(entity.getPurchaseOrder())
                .containerNum(entity.getContainerNum())

                .polymerCode(entity.getPolymerCode())
                .gradeCode(entity.getGradeCode())
                .brand(entity.getBrand())
                .formCode(entity.getFormCode())

                .weightLeft(entity.getWeightLeft())
                .availableQty(entity.getAvailableQty())
                .allocationStatus(entity.getAllocationStatus())
                .totalAllocated(entity.getTotalAllocated())

                .warehouseName(entity.getWarehouseName())
                .locationGroup(entity.getLocationGroup())
//                .compartment(entity.getCompartment())

                .mi(entity.getMeltIndex())
                .density(entity.getDensity())
                .izod(entity.getIzodImpact())

                // Image Parsing Logic
                .sampleImages(parseImages(entity.getImageFiles()))

                .build();
    }

    private List<String> parseImages(String imageString) {
        if (imageString == null || imageString.trim().isEmpty()) {
            return Collections.emptyList();
        }

        return Arrays.stream(imageString.split(","))
                .map(String::trim)
                .filter(path -> !path.isEmpty())
                .map(path -> {
                    String cleanName = path.replace("/images/", "").replace("\\images\\", "");

                    if (cleanName.startsWith("/") || cleanName.startsWith("\\")) {
                        cleanName = cleanName.substring(1);
                    }

                    return IMAGE_API_BASE + cleanName;
                })
                .collect(Collectors.toList());
    }

    private boolean isWebImageFormat(String filename) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") ||
                lower.endsWith(".png") || lower.endsWith(".webp");
    }
}
