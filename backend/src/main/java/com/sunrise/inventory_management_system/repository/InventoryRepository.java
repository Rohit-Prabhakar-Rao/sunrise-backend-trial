package com.sunrise.inventory_management_system.repository;

import com.sunrise.inventory_management_system.entity.InventoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends
        JpaRepository<InventoryView, Long>,
        JpaSpecificationExecutor<InventoryView> {
    java.util.Optional<InventoryView> findFirstByPanId(Long panId);

    @Query("SELECT DISTINCT i.supplierCode FROM InventoryView i WHERE i.supplierCode IS NOT NULL ORDER BY i.supplierCode")
    List<String> findDistinctSuppliers();

    @Query("SELECT DISTINCT i.gradeCode FROM InventoryView i WHERE i.gradeCode IS NOT NULL ORDER BY i.gradeCode")
    List<String> findDistinctGrades();

    @Query("SELECT DISTINCT i.formCode FROM InventoryView i WHERE i.formCode IS NOT NULL ORDER BY i.formCode")
    List<String> findDistinctForms();

    @Query("SELECT DISTINCT i.polymerCode FROM InventoryView i WHERE i.polymerCode IS NOT NULL ORDER BY i.polymerCode")
    List<String> findDistinctPolymers();

    @Query("SELECT DISTINCT i.warehouseName FROM InventoryView i WHERE i.warehouseName IS NOT NULL ORDER BY i.warehouseName")
    List<String> findDistinctWarehouses();

    @Query("SELECT DISTINCT i.locationGroup FROM InventoryView i WHERE i.locationGroup IS NOT NULL ORDER BY i.locationGroup")
    List<String> findDistinctLocations();

    @Query("SELECT DISTINCT i.lotName FROM InventoryView i WHERE i.lotName IS NOT NULL ORDER BY i.lotName")
    List<String> findDistinctLotNames();

    @Query("SELECT " +
            "MIN(i.meltIndex), MAX(i.meltIndex), " +
            "MIN(i.density), MAX(i.density), " +
            "MIN(i.izodImpact), MAX(i.izodImpact), " +
            "MIN(i.panDate), MAX(i.panDate) " +
            "FROM InventoryView i")
    Object[] findGlobalSpecRanges();
}
