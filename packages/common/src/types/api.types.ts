import type { CreateCarInput, UpdateCarData } from "../schemas/car.schema";
import type { Car } from "../models/Car";
import type { CarDiff } from "../utils/diff";

export type CreateCarRequest = CreateCarInput;
export type UpdateCarRequest = UpdateCarData;

export interface BatchOperationRequest {
	cars: CreateCarInput[];
}

export interface CarError {
	row?: number;
	sku?: string;
	errors: string[];
}

export interface BatchOperationResponse {
	inserted: number;
	updated: number;
	failed: CarError[];
}

// Sorting types
export type SortField = "sku" | "model" | "make" | "price" | "year" | "color" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface SortOption {
	field: SortField;
	direction: SortDirection;
}

export interface GetAllCarsResponse {
	cars: Car[];
	total: number;
	offset: number;
	limit: number;
	sort?: SortOption[];
}

export interface ParseCarDataResult {
	validCars: CreateCarRequest[];
	errors: CarError[];
}

export interface CarUpdatePreview {
	sku: string;
	make: string;
	model: string;
	changes: CarDiff;
}

export interface ExcelPreviewResponse {
	previews: CarUpdatePreview[];
	failed: CarError[];
}
