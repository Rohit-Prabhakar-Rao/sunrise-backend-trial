package com.sunrise.inventory_management_system.controller;

import com.sunrise.inventory_management_system.dto.InventoryDTO;
import com.sunrise.inventory_management_system.dto.InventorySearchCriteria;
import com.sunrise.inventory_management_system.service.ExcelService;
import com.sunrise.inventory_management_system.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost:8080", "http://localhost:8081" }, allowCredentials = "true")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService service;

    @Autowired
    private ExcelService excelService;

    @GetMapping("/inventory")
    public Map<String, Slice<InventoryDTO>> getInventory(
            InventorySearchCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "recent") String sort) {
        Slice<InventoryDTO> results = service.searchInventory(criteria, page, size, sort);

        Map<String, Slice<InventoryDTO>> response = new HashMap<>();
        response.put("data", results);
        return response;
    }

    @GetMapping("/inventory/{id}")
    public InventoryDTO getInventoryById(
            @PathVariable String id,
            @RequestParam(required = false) String polymer,
            @RequestParam(required = false) String form,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String lot) {
        return service.getInventoryById(id, polymer, form, folder, lot);
    }

    @GetMapping("/inventory/export")
    public ResponseEntity<InputStreamResource> exportInventory(
            InventorySearchCriteria criteria,
            @RequestParam(defaultValue = "recent") String sort) {
        Slice<InventoryDTO> pageResults = service.searchInventory(criteria, 0, 100000, sort);
        java.io.ByteArrayInputStream in = excelService.exportInventoryToExcel(pageResults.getContent());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=inventory_export.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/inventory/filters")
    public Map<String, List<String>> getFilterValues() {
        return service.getFilterValues();
    }
}
