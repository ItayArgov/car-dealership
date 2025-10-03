import * as XLSX from "xlsx";
import { createCarSchema } from "@dealership/common/schemas";
import type { CreateCarRequest, CarError, ParseCarDataResult } from "@dealership/common/types";
import { ValidationError } from "./errors";

const MAX_ROWS = 10000;

interface ParsedExcelResult {
	data: unknown[];
	sheetName: string;
}

/**
 * Parse Excel file to raw data
 * @throws ValidationError if no worksheets or too many rows
 */
export function parseExcelFile(buffer: Buffer): ParsedExcelResult {
	const workbook = XLSX.read(buffer);

	const sheetName = workbook.SheetNames[0];
	if (!sheetName) {
		throw new ValidationError("Excel file contains no worksheets");
	}

	const worksheet = workbook.Sheets[sheetName];
	const data = XLSX.utils.sheet_to_json(worksheet);

	if (data.length > MAX_ROWS) {
		throw new ValidationError(
			`Excel file contains ${data.length} rows, which exceeds the maximum of ${MAX_ROWS} rows`,
		);
	}

	return { data, sheetName };
}

/**
 * Validate and parse car data from Excel rows
 * Returns valid cars and errors for invalid rows
 */
export function validateAndParseCarData(data: unknown[]): ParseCarDataResult {
	const validCars: CreateCarRequest[] = [];
	const errors: CarError[] = [];

	data.forEach((row, index) => {
		const rowNumber = index + 2; // +1 for 0-index, +1 for header row

		const result = createCarSchema.safeParse(row);

		if (result.success) {
			validCars.push(result.data);
		} else {
			const sku =
				typeof row === "object" && row !== null && "sku" in row ? String(row.sku) : undefined;

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
