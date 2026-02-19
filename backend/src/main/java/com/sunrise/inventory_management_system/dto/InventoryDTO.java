package com.sunrise.inventory_management_system.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class InventoryDTO {
    // Generated ID for Frontend Keys (pan-123-inv-456)
    private String id;

    // Core IDs
    private String panId;
    private LocalDateTime panDate;
    private Long inventoryId;

    // Supplier & PO
    private Integer supplierId;
    private String supplierCode;
    private String po;
    private String containerNum;

    // Product Info
    private String folderId;
    private String folderCode;
    private Integer lot;
    private String lotName;
    private String comment;

    private String PolymerId;
    private String polymerCode;
    private Integer formId;
    private String formCode;
    private String gradeId;
    private String gradeCode;

    // Packing
    private Integer packId;
    private String packing;
    private Integer packLeft;
    private Integer weightLeft;
    private Integer partialLoad;

    // Metadata
    private String descriptorId;
    private String descriptor;
    private String brandId;
    private String brand;

    // Warehouse
    private Integer warehouse;
    private String warehouseName;
    private String warehouseSection;
    private String locationGroup;
    private String rcCompartment;
    private Integer packageNumber;
    private Boolean packageField;

    // Allocation Math
    private Integer panLevelAllocated;
    private Integer inventoryLevelAllocated;
    private String totalAllocated;
    private Double availableQty;
    private String allocationCount;
    private String allocationStatus;
    private Integer overAllocatedBy;

    // Technical Specs
    private String mi;
    private String density;
    private String izod;

    // Images (List of URL strings)
    private List<String> images;
    private List<String> sampleImages;

    // Allocation Details (Lists in Node, usually CSV strings from DB)
    private String allocatedCustomerCodes;
    private String panLevelCustomerCodes;
    private String inventoryLevelCustomerCodes;

    private String allocatedPOs;
    private String panLevelPOs;
    private String inventoryLevelPOS;
    private String allocatedAllocationItemIDs;

    private String allocatedAllocationIds;
    private String allocatedBookNums;
    private String allocatedContNums;
    private String allocatedSOtypes;
}
