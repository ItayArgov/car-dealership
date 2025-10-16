import type { CreateCarInput, UpdateCarData } from "../schemas/car.schema";
import type { Car } from "../models/Car";
import type { CarDiff } from "../utils/diff";
import type { CarFilters } from "../schemas/filter.schema";
import type { SortField, SortDirection, SortOption } from "../schemas/sort.schema";

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

// Re-export sorting types from schemas (avoid duplication)
export type { SortField, SortDirection, SortOption };

export interface GetAllCarsResponse {
	cars: Car[];
	total: number;
	offset: number;
	limit: number;
	sort?: SortOption[];
	filters?: CarFilters;
}

// Export filter types
export type { CarFilters } from "../schemas/filter.schema";

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
