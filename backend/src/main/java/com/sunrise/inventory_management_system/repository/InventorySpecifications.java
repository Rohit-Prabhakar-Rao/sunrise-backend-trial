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

            // 1. Text Search
            if (criteria.getSearchText() != null && !criteria.getSearchText().isEmpty()) {
                String likePattern = "%" + criteria.getSearchText().toLowerCase() + "%";

                Predicate polymerMatch = cb.like(cb.lower(root.get("polymerCode")), likePattern);
                Predicate gradeMatch = cb.like(cb.lower(root.get("gradeCode")), likePattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), likePattern);
                Predicate supplierMatch = cb.like(cb.lower(root.get("supplierCode")), likePattern);

                // Cast numbers to string for text search
                Predicate poMatch = cb.like(root.get("purchaseOrder").as(String.class), likePattern);
                Predicate containerMatch = cb.like(root.get("containerNum").as(String.class), likePattern);

                Predicate lotNameMatch = cb.like(cb.lower(root.get("lotName")), likePattern);
                predicates.add(cb.or(polymerMatch, gradeMatch, brandMatch, poMatch, containerMatch, supplierMatch, lotNameMatch));
            }

            // 2. Multi-Select Filters (IN Clauses)
            if (hasItems(criteria.getPolymerCodes())) {
                predicates.add(root.get("polymerCode").in(criteria.getPolymerCodes()));
            }
            if (hasItems(criteria.getFormCodes())) {
                predicates.add(root.get("formCode").in(criteria.getFormCodes()));
            }
            if (hasItems(criteria.getGradeCodes())) {
                predicates.add(root.get("gradeCode").in(criteria.getGradeCodes()));
            }
            if (hasItems(criteria.getSuppliers())) {
                predicates.add(root.get("supplierCode").in(criteria.getSuppliers()));
            }
            if (hasItems(criteria.getWarehouseNames())) {
                predicates.add(root.get("warehouseName").in(criteria.getWarehouseNames()));
            }
            if (hasItems(criteria.getLocationGroups())) {
                predicates.add(root.get("locationGroup").in(criteria.getLocationGroups()));
            }
            if (hasItems(criteria.getLots())) {
                predicates.add(root.get("lotName").in(criteria.getLots()));
            }

            // 3. RANGE LOGIC
            // --- Melt Index (MI) ---
            if (Boolean.TRUE.equals(criteria.getQcMi())) {
                predicates.add(cb.isNull(root.get("meltIndex")));
            } else {
                List<Predicate> miConditions = new ArrayList<>();
                boolean hasRange = false;

                if (criteria.getMinMi() != null) {
                    miConditions.add(cb.greaterThanOrEqualTo(root.get("meltIndex"), criteria.getMinMi()));
                    hasRange = true;
                }
                if (criteria.getMaxMi() != null) {
                    miConditions.add(cb.lessThanOrEqualTo(root.get("meltIndex"), criteria.getMaxMi()));
                    hasRange = true;
                }

                Predicate rangePredicate = miConditions.isEmpty() ? null : cb.and(miConditions.toArray(new Predicate[0]));

                if (Boolean.TRUE.equals(criteria.getIncludeNAMI()) && rangePredicate != null) {
                    predicates.add(cb.or(rangePredicate, cb.isNull(root.get("meltIndex"))));
                } else if (rangePredicate != null) {
                    predicates.add(rangePredicate);
                }
            }

            // --- Density ---
            if (Boolean.TRUE.equals(criteria.getQcDensity())) {
                predicates.add(cb.isNull(root.get("density")));
            } else {
                List<Predicate> densityConditions = new ArrayList<>();

                if (criteria.getMinDensity() != null)
                    densityConditions.add(cb.greaterThanOrEqualTo(root.get("density"), criteria.getMinDensity()));
                if (criteria.getMaxDensity() != null)
                    densityConditions.add(cb.lessThanOrEqualTo(root.get("density"), criteria.getMaxDensity()));

                Predicate rangePredicate = densityConditions.isEmpty() ? null : cb.and(densityConditions.toArray(new Predicate[0]));

                if (Boolean.TRUE.equals(criteria.getIncludeNADensity()) && rangePredicate != null) {
                    predicates.add(cb.or(rangePredicate, cb.isNull(root.get("density"))));
                } else if (rangePredicate != null) {
                    predicates.add(rangePredicate);
                }
            }

            // --- Izod ---
            if (Boolean.TRUE.equals(criteria.getQcIzod())) {
                predicates.add(cb.isNull(root.get("izodImpact")));
            } else {
                List<Predicate> izodConditions = new ArrayList<>();

                if (criteria.getMinIzod() != null)
                    izodConditions.add(cb.greaterThanOrEqualTo(root.get("izodImpact"), criteria.getMinIzod()));
                if (criteria.getMaxIzod() != null)
                    izodConditions.add(cb.lessThanOrEqualTo(root.get("izodImpact"), criteria.getMaxIzod()));

                Predicate rangePredicate = izodConditions.isEmpty() ? null : cb.and(izodConditions.toArray(new Predicate[0]));

                if (Boolean.TRUE.equals(criteria.getIncludeNAIzod()) && rangePredicate != null) {
                    predicates.add(cb.or(rangePredicate, cb.isNull(root.get("izodImpact"))));
                } else if (rangePredicate != null) {
                    predicates.add(rangePredicate);
                }
            }
            // --- Quantity ---
            if (criteria.getMinQty() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("availableQty"), criteria.getMinQty()));
            }
            if (criteria.getMaxQty() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("availableQty"), criteria.getMaxQty()));
            }
            if (criteria.getStartDate() != null) {
                // Assuming your entity field is named "date" or "createdDate"
                predicates.add(cb.greaterThanOrEqualTo(root.get("panDate"), criteria.getStartDate()));
            }
            if (criteria.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("panDate"), criteria.getEndDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static boolean hasItems(List<String> list) {
        return list != null && !list.isEmpty();
    }
}