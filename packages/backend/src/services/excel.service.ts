import * as XLSX from "xlsx";
import { CreateCarSchema } from "@dealership/common/schemas";
import type { CreateCarRequest, ExcelRowError, ParseCarDataResult } from "@dealership/common/types";

const MAX_ROWS = 10000;

interface ParsedExcelResult {
	data: unknown[];
	sheetName: string;
}

/**
 * Parse Excel file to raw data
 * @throws Error if parsing fails or too many rows
 */
export function parseExcelFile(buffer: Buffer): ParsedExcelResult {
	try {
		// Parse the workbook
		const workbook = XLSX.read(buffer);

		// Get first worksheet
		const sheetName = workbook.SheetNames[0];
		if (!sheetName) {
			throw new Error("Excel file contains no worksheets");
		}

		const worksheet = workbook.Sheets[sheetName];

		// Convert to JSON (array of objects)
		const data = XLSX.utils.sheet_to_json(worksheet);

		// Check row count
		if (data.length > MAX_ROWS) {
			throw new Error(`Excel file contains ${data.length} rows, which exceeds the maximum of ${MAX_ROWS} rows`);
		}

		return { data, sheetName };
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Failed to parse Excel file");
	}
}

/**
 * Validate and parse car data from Excel rows
 * Returns valid cars and errors for invalid rows
 */
export function validateAndParseCarData(data: unknown[]): ParseCarDataResult {
	const validCars: CreateCarRequest[] = [];
	const errors: ExcelRowError[] = [];

	data.forEach((row, index) => {
		const rowNumber = index + 2; // +1 for 0-index, +1 for header row

		const result = CreateCarSchema.safeParse(row);

		if (result.success) {
			validCars.push(result.data);
		} else {
			// Extract SKU if it exists in the row
			const sku = typeof row === "object" && row !== null && "sku" in row ? String(row.sku) : undefined;

			// Format Zod errors
			const errorMessages = result.error.issues.map((err) => {
				const path = err.path.length > 0 ? `${err.path.join(".")}: ` : "";
				return `${path}${err.message}`;
			});

			errors.push({
				row: rowNumber,
				sku,
				errors: errorMessages,
			});
		}
	});

	return { validCars, errors };
}
