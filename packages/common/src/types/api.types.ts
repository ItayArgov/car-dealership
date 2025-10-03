import type { CreateCarInput, UpdateCarData } from "../schemas/car.schema";
import type { Car } from "../models/Car";

// Request types
export type CreateCarRequest = CreateCarInput;
export type UpdateCarRequest = UpdateCarData; // SKU comes from URL path, not payload

export interface BatchOperationRequest {
	cars: CreateCarInput[];
}

// Response types
export interface CarError {
	row?: number; // Excel row number if from Excel parsing
	sku?: string; // SKU if available
	errors: string[];
}

export interface BatchOperationResponse {
	inserted: number;
	updated: number;
	failed: CarError[];
}

export interface GetAllCarsResponse {
	cars: Car[];
	total: number;
}

// Excel parsing types
export interface ExcelRowError {
	row: number; // Excel row number (1-based, accounting for header)
	sku?: string; // SKU if parseable
	errors: string[];
}

export interface ParseCarDataResult {
	validCars: CreateCarRequest[];
	errors: ExcelRowError[];
}
