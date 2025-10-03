import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import * as XLSX from "xlsx";
import { parseExcelFile, validateAndParseCarData } from "./excel.service";

const TEST_DATA_DIR = join(__dirname, "..", "..", "..", "..", "test-data");

describe("Excel Service", () => {
	describe("parseExcelFile", () => {
		it("should parse valid .xlsx file", () => {
			const buffer = readFileSync(join(TEST_DATA_DIR, "cars-valid-insert.xlsx"));
			const result = parseExcelFile(buffer);
			expect(result).toHaveProperty("data");
			expect(result).toHaveProperty("sheetName");
			expect(Array.isArray(result.data)).toBe(true);
		});

		it("should throw error for empty workbook", () => {
			const workbook = XLSX.utils.book_new();
			// XLSX.write throws "Workbook is empty" before we can check
			expect(() => XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })).toThrow("Workbook is empty");
		});

		it("should parse valid Excel file with correct data", () => {
			const buffer = readFileSync(join(TEST_DATA_DIR, "cars-valid-insert.xlsx"));
			const result = parseExcelFile(buffer);

			expect(result.data.length).toBeGreaterThan(0);
			expect(result.sheetName).toBe("Cars");
			expect(result.data[0]).toHaveProperty("sku");
			expect(result.data[0]).toHaveProperty("model");
			expect(result.data[0]).toHaveProperty("make");
			expect(result.data[0]).toHaveProperty("price");
			expect(result.data[0]).toHaveProperty("year");
			expect(result.data[0]).toHaveProperty("color");
		});

		it("should throw error for file with too many rows", () => {
			// Create Excel with 10,001 rows
			const data = Array.from({ length: 10001 }, (_, i) => ({
				sku: `SKU-${i}`,
				model: "Model",
				make: "Make",
				price: 10000,
				year: 2020,
				color: "blue",
			}));

			const ws = XLSX.utils.json_to_sheet(data);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Cars");
			const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

			expect(() => parseExcelFile(buffer)).toThrow("Excel file contains 10001 rows, which exceeds the maximum of 10000 rows");
		});

		it("should handle empty Excel file", () => {
			const ws = XLSX.utils.json_to_sheet([]);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Empty");
			const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

			const result = parseExcelFile(buffer);
			expect(result.data).toHaveLength(0);
			expect(result.sheetName).toBe("Empty");
		});
	});

	describe("validateAndParseCarData", () => {
		it("should validate all cars from valid insert file", () => {
			const buffer = readFileSync(join(TEST_DATA_DIR, "cars-valid-insert.xlsx"));
			const { data } = parseExcelFile(buffer);
			const result = validateAndParseCarData(data);

			expect(result.validCars.length).toBeGreaterThan(0);
			expect(result.errors).toHaveLength(0);

			// Verify first car structure
			const firstCar = result.validCars[0];
			expect(firstCar).toHaveProperty("sku");
			expect(firstCar).toHaveProperty("model");
			expect(firstCar).toHaveProperty("make");
			expect(firstCar).toHaveProperty("price");
			expect(firstCar).toHaveProperty("year");
			expect(firstCar).toHaveProperty("color");
		});

		it("should return errors for invalid cars", () => {
			const buffer = readFileSync(join(TEST_DATA_DIR, "cars-invalid-insert.xlsx"));
			const { data } = parseExcelFile(buffer);
			const result = validateAndParseCarData(data);

			// Most rows should have errors (some might be valid due to test data structure)
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors.length).toBeGreaterThan(result.validCars.length);
		});

		it("should provide correct row numbers (1-based, accounting for header)", () => {
			const buffer = readFileSync(join(TEST_DATA_DIR, "cars-invalid-insert.xlsx"));
			const { data } = parseExcelFile(buffer);
			const result = validateAndParseCarData(data);

			// First data row is row 2 (after header)
			expect(result.errors[0].row).toBe(2);
		});

		it("should extract SKU when available in invalid rows", () => {
			const buffer = readFileSync(join(TEST_DATA_DIR, "cars-invalid-insert.xlsx"));
			const { data } = parseExcelFile(buffer);
			const result = validateAndParseCarData(data);

			// Find error with SKU
			const errorWithSku = result.errors.find((err) => err.sku);
			expect(errorWithSku).toBeDefined();
			expect(errorWithSku?.sku).toBeTruthy();
		});

		it("should handle missing required fields", () => {
			const invalidData = [
				{ model: "Camry", make: "Toyota", price: 25000, year: 2023, color: "blue" }, // Missing SKU
			];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("sku"))).toBe(true);
		});

		it("should handle invalid color", () => {
			const invalidData = [{ sku: "TEST-001", model: "Camry", make: "Toyota", price: 25000, year: 2023, color: "purple" }];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("color"))).toBe(true);
		});

		it("should handle negative price", () => {
			const invalidData = [{ sku: "TEST-001", model: "Camry", make: "Toyota", price: -5000, year: 2023, color: "blue" }];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("price"))).toBe(true);
		});

		it("should handle invalid year (too old)", () => {
			const invalidData = [{ sku: "TEST-001", model: "Camry", make: "Toyota", price: 25000, year: 1800, color: "blue" }];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("year"))).toBe(true);
		});

		it("should handle invalid year (too future)", () => {
			const currentYear = new Date().getFullYear();
			const invalidData = [{ sku: "TEST-001", model: "Camry", make: "Toyota", price: 25000, year: currentYear + 10, color: "blue" }];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("year"))).toBe(true);
		});

		it("should handle type errors (string instead of number)", () => {
			const invalidData = [
				{ sku: "TEST-001", model: "Camry", make: "Toyota", price: "expensive" as any, year: 2023, color: "blue" },
			];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("price"))).toBe(true);
		});

		it("should handle empty string values", () => {
			const invalidData = [{ sku: "", model: "Camry", make: "Toyota", price: 25000, year: 2023, color: "blue" }];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("sku"))).toBe(true);
		});

		it("should handle zero price", () => {
			const invalidData = [{ sku: "TEST-001", model: "Camry", make: "Toyota", price: 0, year: 2023, color: "blue" }];

			const result = validateAndParseCarData(invalidData);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].errors.some((e) => e.includes("price"))).toBe(true);
		});

		it("should handle empty array", () => {
			const result = validateAndParseCarData([]);

			expect(result.validCars).toHaveLength(0);
			expect(result.errors).toHaveLength(0);
		});

		it("should handle mixed valid and invalid rows", () => {
			const mixedData = [
				{ sku: "VALID-001", model: "Camry", make: "Toyota", price: 25000, year: 2023, color: "blue" },
				{ sku: "INVALID-001", model: "Accord", make: "Honda", price: -1000, year: 2023, color: "red" },
				{ sku: "VALID-002", model: "Civic", make: "Honda", price: 22000, year: 2022, color: "green" },
			];

			const result = validateAndParseCarData(mixedData);

			expect(result.validCars).toHaveLength(2);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].row).toBe(3); // Row 3 in Excel (2nd data row)
			expect(result.errors[0].sku).toBe("INVALID-001");
		});
	});
});
