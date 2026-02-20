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
        if (entity == null)
            return null;

        return InventoryDTO.builder()
                .id("pan-" + entity.getPanId() + "-inv-" + entity.getInventoryId())

                .panId(entity.getPanId())
                .panDate(entity.getPanDate())
                .inventoryId(entity.getInventoryId())
                .folderId(entity.getFolderId())
                .folderCode(entity.getFolderCode())

                .supplierCode(entity.getSupplierCode())
                .po(entity.getPurchaseOrder())
                .containerNum(entity.getContainerNum())

                .PolymerId(entity.getPolymerId())
                .polymerCode(entity.getPolymerCode())
                .gradeId(entity.getGradeId())
                .gradeCode(entity.getGradeCode())
                .brandId(entity.getBrandId())
                .brand(entity.getBrand())
                .formId(entity.getFormId())
                .formCode(entity.getFormCode())
                .lot(entity.getLot())
                .lotName(entity.getLotName())
                .comment(entity.getComment())
                .supplierId(entity.getSupplierId())

                .weightLeft(entity.getWeightLeft())
                .availableQty(entity.getAvailableQty())
                .allocationStatus(entity.getAllocationStatus())
                .totalAllocated(entity.getTotalAllocated())
                .allocationCount(entity.getAllocationCount())
                .allocatedContNums(entity.getAllocatedContNums())
                .overAllocatedBy(entity.getOverAllocatedBy())
                .allocatedPOs(entity.getAllocatedPOs())
                .allocatedCustomerCodes(entity.getAllocatedCustomerCodes())
                .allocatedAllocationIds(entity.getAllocatedAllocationIDs())
                .allocatedAllocationItemIDs(entity.getAllocatedAllocationItemIDs())
                .allocatedBookNums(entity.getAllocatedBookNums())
                .allocatedBookNums(entity.getAllocatedBookNums())
                .allocatedSOtypes(entity.getAllocatedSOtypes())
                .panLevelPOs(entity.getPanLevelPOS())
                .panLevelCustomerCodes(entity.getPanLevelCustomerCodes())
                .inventoryLevelPOS(entity.getInventoryLevelPOS())
                .inventoryLevelCustomerCodes(entity.getInventoryLevelCustomerCodes())

                .warehouse(entity.getWarehouse())
                .warehouseName(entity.getWarehouseName())
                .warehouseSection(entity.getWareHouseSection())
                .locationGroup(entity.getLocationGroup())
                .rcCompartment(entity.getRcCompartment())
                .packageNumber(entity.getPackageNumber())

                .packId(entity.getPackId())
                .packLeft(entity.getPackLeft())
                .partialLoad(entity.getPartialLoad())
                .packing(entity.getPacking())
                .descriptorId(entity.getDescriptorId())
                .descriptor(entity.getDescriptor())

                .panLevelAllocated(entity.getPanLevelAllocated())
                .inventoryLevelAllocated(entity.getInventoryLevelAllocated())

                .mi(entity.getMeltIndex())
                .density(entity.getDensity())
                .izod(entity.getIzodImpact())

                // Image Parsing Logic
                .images(parseImages(entity.getImages()))
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
}
