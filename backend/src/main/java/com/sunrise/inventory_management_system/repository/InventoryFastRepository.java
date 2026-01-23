package com.sunrise.inventory_management_system.repository;

import com.sunrise.inventory_management_system.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryFastRepository extends JpaRepository<Inventory, Long>, JpaSpecificationExecutor<Inventory> {
}