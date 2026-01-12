package com.sunrise.inventory_management_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Table(name = "vInventoryAvailability", schema = "dbo")
@Immutable
@Data
public class InventoryView {

    @Id
    @Column(name = "InventoryID")
    private Long inventoryId;

    @Column(name = "PanID")
    private Long panId;

    @Column(name = "PanDate")
    private LocalDateTime panDate;

    // --- Product Info ---
    @Column(name = "PolymerCode")
    private String polymerCode;

    @Column(name = "GradeCode")
    private String gradeCode;

    @Column(name = "Brand")
    private String brand;

    @Column(name = "FormCode")
    private String formCode;

    @Column(name = "Descriptor")
    private String descriptor;

    // --- Technical Specs (Dynamic columns from the View) ---
    // Note: In the View, we aliased these as 'MI', 'Density', 'Izod'
    @Column(name = "MI")
    private Double meltIndex;

    @Column(name = "Density")
    private Double density;

    @Column(name = "Izod")
    private Double izodImpact;

    // --- Quantities ---
    @Column(name = "WeightLeft")
    private Integer weightLeft;

    @Column(name = "TotalAllocated")
    private Double totalAllocated;

    @Column(name = "AvailableQty")
    private Double availableQty;

    @Column(name = "AllocationStatus")
    private String allocationStatus;

    // --- Logistics ---
    @Column(name = "whname")
    private String warehouseName;

    @Column(name = "LocationGroup")
    private String locationGroup;

    @Column(name = "LOT")
    private String lot;

    @Column(name = "LotName")
    private String lotName;

    @Column(name = "InventoryPO")
    private String purchaseOrder;

    @Column(name = "ContainerNum")
    private String containerNum;

    @Column(name = "SupplierCode")
    private String supplierCode;

    // --- Images ---
    @Column(name = "sampleImages")
    private String imageFiles; // Comma-separated list of filenames
}
