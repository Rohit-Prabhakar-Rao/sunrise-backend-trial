package com.sunrise.inventory_management_system.dto;

import lombok.Data;
import java.util.List;

@Data
public class InventorySearchCriteria {

    // Matches against Code, Grade, Brand, Container, PO, etc.
    private String searchText;

    // --- Multi-Select Filters (Checkboxes) ---
    private List<String> polymerCodes;
    private List<String> formCodes;     // Pellets, Granules
    private List<String> gradeCodes;    // Injection, Blow Molding
    private List<String> suppliers;     // Supplier Codes
    private List<String> warehouseNames;
    private List<String> locationGroups;

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
}