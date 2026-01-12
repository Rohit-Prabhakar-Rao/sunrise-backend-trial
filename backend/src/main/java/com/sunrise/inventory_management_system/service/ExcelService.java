package com.sunrise.inventory_management_system.service;

import com.sunrise.inventory_management_system.dto.InventoryDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelService {

    public ByteArrayInputStream exportInventoryToExcel(List<InventoryDTO> data) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Inventory");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                    "Pan ID", "Date", "Lot", "Polymer", "Grade", "Supplier",
                    "Qty (kg)", "Location", "Density", "MI", "Izod", "Status"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (InventoryDTO item : data) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(
                        item.getPanId() != null ? item.getPanId().toString() : ""
                );

                row.createCell(1).setCellValue(
                        item.getDate() != null ? item.getDate().toString() : ""
                );

                row.createCell(2).setCellValue(
                        item.getLot() != null ? item.getLot().toString() : ""
                );

                row.createCell(3).setCellValue(
                        item.getPolymerCode() != null ? item.getPolymerCode() : ""
                );

                row.createCell(4).setCellValue(
                        item.getGradeCode() != null ? item.getGradeCode() : ""
                );

                row.createCell(5).setCellValue(
                        item.getSupplierCode() != null ? item.getSupplierCode() : ""
                );

                Cell qtyCell = row.createCell(6);
                qtyCell.setCellValue(
                        item.getAvailableQty() != null ? item.getAvailableQty() : 0.0
                );

                row.createCell(7).setCellValue(
                        item.getWarehouseName() != null ? item.getWarehouseName() : ""
                );

                if (item.getDensity() != null) row.createCell(8).setCellValue(item.getDensity());
                if (item.getMi() != null) row.createCell(9).setCellValue(item.getMi());
                if (item.getIzod() != null) row.createCell(10).setCellValue(item.getIzod());

                row.createCell(11).setCellValue(
                        item.getAllocationStatus() != null ? item.getAllocationStatus() : ""
                );
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to export Excel data: " + e.getMessage());
        }
    }
}
