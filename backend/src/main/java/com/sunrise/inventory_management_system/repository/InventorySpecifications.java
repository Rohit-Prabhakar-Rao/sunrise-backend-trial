package com.sunrise.inventory_management_system.repository;

import com.sunrise.inventory_management_system.dto.InventorySearchCriteria;
import com.sunrise.inventory_management_system.entity.InventoryView;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class InventorySpecifications {

    public static Specification<InventoryView> withDynamicFilter(InventorySearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getSearchText() != null && !criteria.getSearchText().isEmpty()) {
                String likePattern = "%" + criteria.getSearchText().toLowerCase() + "%";

                Predicate polymerMatch = cb.like(cb.lower(root.get("polymerCode")), likePattern);
                Predicate gradeMatch = cb.like(cb.lower(root.get("gradeCode")), likePattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), likePattern);
                Predicate poMatch = cb.like(cb.lower(root.get("purchaseOrder")), likePattern);
                Predicate containerMatch = cb.like(cb.lower(root.get("containerNum")), likePattern);

                // --- NEW ADDITIONS ---
                Predicate supplierMatch = cb.like(cb.lower(root.get("supplierCode")), likePattern);
                Predicate lotMatch = cb.like(cb.lower(root.get("lot")), likePattern);

                predicates.add(cb.or(polymerMatch, gradeMatch, brandMatch, poMatch, containerMatch, supplierMatch, lotMatch));
            }

            // Multi-Select Filters (IN Clauses)
            if (criteria.getPolymerCodes() != null && !criteria.getPolymerCodes().isEmpty()) {
                predicates.add(root.get("polymerCode").in(criteria.getPolymerCodes()));
            }
            if (criteria.getFormCodes() != null && !criteria.getFormCodes().isEmpty()) {
                predicates.add(root.get("formCode").in(criteria.getFormCodes()));
            }
            if (criteria.getGradeCodes() != null && !criteria.getGradeCodes().isEmpty()) {
                predicates.add(root.get("gradeCode").in(criteria.getGradeCodes()));
            }
            if (criteria.getSuppliers() != null && !criteria.getSuppliers().isEmpty()) {
                predicates.add(root.get("supplierCode").in(criteria.getSuppliers()));
            }
            if (criteria.getWarehouseNames() != null && !criteria.getWarehouseNames().isEmpty()) {
                predicates.add(root.get("warehouseName").in(criteria.getWarehouseNames()));
            }

            // 3. Range Filters (Sliders)
            // Melt Index
            if (criteria.getMinMi() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("meltIndex"), criteria.getMinMi()));
            }
            if (criteria.getMaxMi() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("meltIndex"), criteria.getMaxMi()));
            }

            // Density
            if (criteria.getMinDensity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("density"), criteria.getMinDensity()));
            }
            if (criteria.getMaxDensity() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("density"), criteria.getMaxDensity()));
            }

            // Izod
            if (criteria.getMinIzod() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("izodImpact"), criteria.getMinIzod()));
            }
            if (criteria.getMaxIzod() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("izodImpact"), criteria.getMaxIzod()));
            }

            // 4. Availability Check
            if (Boolean.TRUE.equals(criteria.getOnlyAvailable())) {
                predicates.add(cb.greaterThan(root.get("availableQty"), 0.0));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
