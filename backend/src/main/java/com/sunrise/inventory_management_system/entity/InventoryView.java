package com.sunrise.inventory_management_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;

@Entity
@Table(name = "vinventoryavailability")
@Immutable
@Data
public class InventoryView {

    @Id
    @Column(name = "\"InventoryID\"")
    private Long inventoryId;

    @Column(name = "\"PanID\"")
    private String panId;

    @Column(name = "\"PanDate\"")
    private LocalDateTime panDate;

    @Column(name = "\"PanLevelAllocated\"")
    private int panLevelAllocated;

    @Column(name = "\"InventoryLevelAllocated\"")
    private int inventoryLevelAllocated;

    @Column(name = "\"FolderID\"")
    private String folderId;

    @Column(name = "\"FolderCode\"")
    private String folderCode;

    // --- Product Info ---
    @Column(name = "\"PolymerID\"")
    private String polymerId;

    @Column(name = "\"PolymerCode\"")
    private String polymerCode;

    @Column(name = "\"GradeID\"")
    private String gradeId;

    @Column(name = "\"GradeCode\"")
    private String gradeCode;

    @Column(name = "\"BrandID\"")
    private String brandId;

    @Column(name = "\"Brand\"")
    private String brand;

    @Column(name = "\"FormID\"")
    private Integer formId;

    @Column(name = "\"FormCode\"")
    private String formCode;

    @Column(name = "\"DescriptorID\"")
    private String descriptorId;

    @Column(name = "\"Descriptor\"")
    private String descriptor;

    // --- Technical Specs ---
    @Column(name = "\"MI\"")
    private String meltIndex;

    @Column(name = "\"Density\"")
    private String density;

    @Column(name = "\"Izod\"")
    private String izodImpact;

    @Column(name = "\"sComment\"")
    private String comment;

    // --- Quantities ---
    @Column(name = "\"WeightLeft\"")
    private int weightLeft;

    @Column(name = "\"TotalAllocated\"")
    private String totalAllocated;

    @Column(name = "\"AvailableQty\"")
    private Double availableQty;

    @Column(name = "\"AllocationStatus\"")
    private String allocationStatus;

    @Column(name = "\"AllocationCount\"")
    private String allocationCount;

    @Column(name = "\"OverAllocatedBy\"")
    private int overAllocatedBy;

    @Column(name = "\"Allocated_POs\"")
    private String allocatedPOs;

    @Column(name = "\"Allocated_CustomerCodes\"")
    private String allocatedCustomerCodes;

    @Column(name = "\"Allocated_AllocationIDs\"")
    private String allocatedAllocationIDs;

    @Column(name = "\"Allocated_AllocationItemIDs\"")
    private String allocatedAllocationItemIDs;

    @Column(name = "\"Allocated_BookNums\"")
    private String allocatedBookNums;

    @Column(name = "\"Allocated_ContNums\"")
    private String allocatedContNums;

    @Column(name = "\"Allocated_SOtypes\"")
    private String allocatedSOtypes;

    @Column(name = "\"PanLevel_POs\"")
    private String panLevelPOS;

    @Column(name = "\"PanLevel_CustomerCodes\"")
    private String panLevelCustomerCodes;

    @Column(name = "\"InventoryLevel_POs\"")
    private String inventoryLevelPOS;

    @Column(name = "\"InventoryLevel_CustomerCodes\"")
    private String inventoryLevelCustomerCodes;

    // --- Logistics ---
    @Column(name = "\"wh\"")
    private int warehouse;

    @Column(name = "\"whname\"")
    private String warehouseName;

    @Column(name = "\"WHsection\"")
    private String wareHouseSection;

    @Column(name = "\"LocationGroup\"")
    private String locationGroup;

    @Column(name = "\"LOT\"")
    private int lot;

    @Column(name = "\"LotName\"")
    private String lotName;

    @Column(name = "\"InventoryPO\"")
    private String purchaseOrder;

    @Column(name = "\"ContainerNum\"")
    private String containerNum;

    @Column(name = "\"SupplierCode\"")
    private String supplierCode;

    @Column(name = "\"SupplierID\"")
    private int supplierId;

    @Column(name = "\"rc_compartment\"")
    private String rcCompartment;

    // -- Packing --
    @Column(name = "\"PackID\"")
    private int packId;

    @Column(name = "\"Packing\"")
    private String packing;

    @Column(name = "\"PackLeft\"")
    private int packLeft;

    @Column(name = "\"PartialLoad\"")
    private int partialLoad;

    @Column(name = "\"Package\"")
    private int packageNumber;

    // --- Images ---
    @Column(name = "\"Images\"")
    private String images;

    @Column(name = "\"SampleImages\"")
    private String imageFiles;
}