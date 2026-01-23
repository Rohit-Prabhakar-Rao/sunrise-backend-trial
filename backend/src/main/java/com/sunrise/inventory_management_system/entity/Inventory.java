package com.sunrise.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.Formula;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblInventory")
@Getter
public class Inventory {

    @Id
    @Column(name = "InventoryID")
    private Long inventoryId;

    @Column(name = "PanID")
    private Long panId;

    @Column(name = "PanDate")
    private LocalDateTime panDate;

    @Column(name = "LOT")
    private String lot;

    @Column(name = "PolymerCode")
    private String polymerCode;

    @Column(name = "FormCode")
    private String formCode;

    @Column(name = "GradeCode")
    private String gradeCode;

    @Column(name = "SupplierCode")
    private String supplierCode;

    @Column(name = "Brand")
    private String brand;

    @Formula("FolderCode + '-' + CAST(LOT AS varchar(50))")
    private String lotName;

    @Column(name = "ContainerNum")
    private String containerNum;

    @Column(name = "PO")
    private String purchaseOrder;

    @Column(name = "whname")
    private String warehouseName;

    @Column(name = "LocationGroup")
    private String locationGroup;

    // It handles Pan-Level Allocations AND Inventory-Level Allocations
    @Formula("""
        (
            CASE 
                -- Condition 1: If there is a Pan-Level Allocation (where InventoryID is NULL)
                WHEN ISNULL((SELECT SUM(a.Qty) FROM dbo.tblAllocation a WHERE a.PanID = PanID AND a.InventoryID IS NULL), 0) > 0
                THEN (
                    -- Pan Logic: (Total Pan Weight) - (Pan Allocation) - (Item Allocation)
                    (SELECT SUM(i2.WeightLeft) FROM dbo.tblInventory i2 WHERE i2.PanID = PanID) - 
                    ISNULL((SELECT SUM(a.Qty) FROM dbo.tblAllocation a WHERE a.PanID = PanID AND a.InventoryID IS NULL), 0) - 
                    ISNULL((SELECT SUM(a.Qty) FROM dbo.tblAllocation a WHERE a.InventoryID = InventoryID), 0)
                )
                -- Condition 2: No Pan-Level Allocation (Standard Logic)
                ELSE (
                    -- Item Logic: Item Weight - (Pan Allocation + Item Allocation)
                    WeightLeft - 
                    (
                        ISNULL((SELECT SUM(a.Qty) FROM dbo.tblAllocation a WHERE a.PanID = PanID AND a.InventoryID IS NULL), 0) + 
                        ISNULL((SELECT SUM(a.Qty) FROM dbo.tblAllocation a WHERE a.InventoryID = InventoryID), 0)
                    )
                )
            END
        )
    """)
    private Double availableQty;

    @Formula("""
        (CASE 
            WHEN rc_compartment IS NULL OR rc_compartment = '' THEN MI_A
            WHEN rc_compartment = 'CA' THEN MI_CA
            WHEN rc_compartment = 'CB' THEN MI_CB
            WHEN rc_compartment = 'B' THEN MI_B
            WHEN rc_compartment = 'A' THEN MI_A
            ELSE MI_A
        END)
    """)
    private Double meltIndex;

    // 2. Compartment-Aware Density
    @Formula("""
        (CASE 
            WHEN rc_compartment IS NULL OR rc_compartment = '' THEN Density_A
            WHEN rc_compartment = 'CA' THEN Density_CA
            WHEN rc_compartment = 'CB' THEN Density_CB
            WHEN rc_compartment = 'B' THEN Density_B
            WHEN rc_compartment = 'A' THEN Density_A
            ELSE Density_A
        END)
    """)
    private Double density;

    // 3. Compartment-Aware Izod
    @Formula("""
        (CASE 
            WHEN rc_compartment IS NULL OR rc_compartment = '' THEN Izod_A
            WHEN rc_compartment = 'CA' THEN Izod_CA
            WHEN rc_compartment = 'CB' THEN Izod_CB
            WHEN rc_compartment = 'B' THEN Izod_B
            WHEN rc_compartment = 'A' THEN Izod_A
            ELSE Izod_A
        END)
    """)
    private Double izodImpact;
}