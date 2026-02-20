package com.sunrise.inventory_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.Formula;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblinventory")
@Getter
public class Inventory {

    @Id
    @Column(name = "\"InventoryID\"")
    private Long inventoryId;

    @Column(name = "\"PanID\"")
    private Long panId;

    @Column(name = "\"PanDate\"")
    private LocalDateTime panDate;

    @Column(name = "\"LOT\"")
    private String lot;

    @Column(name = "\"PolymerCode\"")
    private String polymerCode;

    @Column(name = "\"FormCode\"")
    private String formCode;

    @Column(name = "\"GradeCode\"")
    private String gradeCode;

    @Column(name = "\"SupplierCode\"")
    private String supplierCode;

    @Column(name = "\"Brand\"")
    private String brand;

    @Formula("\"FolderCode\" || '-' || CAST(\"LOT\" AS varchar)")
    private String lotName;

    @Column(name = "\"FolderCode\"")
    private String folderCode;

    @Column(name = "\"ContainerNum\"")
    private String containerNum;

    @Column(name = "\"PO\"")
    private String purchaseOrder;

    @Column(name = "\"whname\"")
    private String warehouseName;

    @Column(name = "\"LocationGroup\"")
    private String locationGroup;

    @Formula("""
        (
            CASE 
                WHEN COALESCE((SELECT SUM(a."Qty") FROM "tblallocation" a WHERE a."PanID" = "PanID" AND a."InventoryID" IS NULL), 0) > 0
                THEN (
                    (SELECT SUM(i2."WeightLeft") FROM "tblinventory" i2 WHERE i2."PanID" = "PanID") - 
                    COALESCE((SELECT SUM(a."Qty") FROM "tblallocation" a WHERE a."PanID" = "PanID" AND a."InventoryID" IS NULL), 0) - 
                    COALESCE((SELECT SUM(a."Qty") FROM "tblallocation" a WHERE a."InventoryID" = "InventoryID"), 0)
                )
                ELSE (
                    "WeightLeft" - 
                    (
                        COALESCE((SELECT SUM(a."Qty") FROM "tblallocation" a WHERE a."PanID" = "PanID" AND a."InventoryID" IS NULL), 0) + 
                        COALESCE((SELECT SUM(a."Qty") FROM "tblallocation" a WHERE a."InventoryID" = "InventoryID"), 0)
                    )
                )
            END
        )
    """)
    private Double availableQty;

    @Formula("""
    (CASE 
        WHEN "rc_compartment" = 'CA' THEN NULLIF(TRIM("MI_CA"), '')
        WHEN "rc_compartment" = 'CB' THEN NULLIF(TRIM("MI_CB"), '')
        WHEN "rc_compartment" = 'B'  THEN NULLIF(TRIM("MI_B"), '')
        ELSE NULLIF(TRIM("MI_A"), '')
    END)::double precision
""")
    private Double meltIndex;

    @Formula("""
    (CASE 
        WHEN "rc_compartment" = 'CA' THEN NULLIF(TRIM("Density_CA"), '')
        WHEN "rc_compartment" = 'CB' THEN NULLIF(TRIM("Density_CB"), '')
        WHEN "rc_compartment" = 'B'  THEN NULLIF(TRIM("Density_B"), '')
        ELSE NULLIF(TRIM("Density_A"), '')
    END)::double precision
""")
    private Double density;

    @Formula("""
    (CASE 
        WHEN "rc_compartment" = 'CA' THEN NULLIF(TRIM("Izod_CA"), '')
        WHEN "rc_compartment" = 'CB' THEN NULLIF(TRIM("Izod_CB"), '')
        WHEN "rc_compartment" = 'B'  THEN NULLIF(TRIM("Izod_B"), '')
        ELSE NULLIF(TRIM("Izod_A"), '')
    END)::double precision
""")
    private Double izodImpact;

    @Column(name = "\"rc_compartment\"")
    private String rcCompartment;

    @Column(name = "\"sComment\"")
    private String comment;

    @Column(name = "\"Packing\"")
    private String packing;
}