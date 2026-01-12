package com.sunrise.inventory_management_system.repository;

import com.sunrise.inventory_management_system.entity.InventoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends
        JpaRepository<InventoryView, Long>,
        JpaSpecificationExecutor<InventoryView> {
    java.util.Optional<InventoryView> findByPanId(Long panId);
}
