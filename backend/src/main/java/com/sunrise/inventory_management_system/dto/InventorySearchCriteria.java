package com.sunrise.inventory_management_system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class InventorySearchCriteria {

    // Matches against Code, Grade, Brand, Container, PO, etc.
    private String searchText;

    // --- Multi-Select Filters (Checkboxes) ---
    private List<String> polymerCodes;
    private List<String> formCodes;
    private List<String> gradeCodes;
    private List<String> suppliers;
    private List<String> warehouseNames;
    private List<String> locationGroups;
    private List<String> lots;

    // --- Range Filters (Sliders) ---
    // Melt Index
    private Double minMi;
    private Double maxMi;

    // Density
    private Double minDensity;
    private Double maxDensity;

    // Izod Impact
    private Double minIzod;
    private Double maxIzod;

    // --- Boolean / Status Flags ---
    private Boolean onlyAvailable;

    private Boolean qcMi;
    private Boolean qcDensity;
    private Boolean qcIzod;

    // Quantity Range
    private Double minQty;
    private Double maxQty;

    // "Include N/A with Range"
    private Boolean includeNAMI;
    private Boolean includeNADensity;
    private Boolean includeNAIzod;

    private LocalDate startDate;
    private LocalDate endDate;
}