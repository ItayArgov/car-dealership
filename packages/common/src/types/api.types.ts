import type { CreateCarInput, UpdateCarData } from "../schemas/car.schema";
import type { Car } from "../models/Car";

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

export interface GetAllCarsResponse {
	cars: Car[];
	total: number;
	offset: number;
	limit: number;
}

export interface ParseCarDataResult {
	validCars: CreateCarRequest[];
	errors: CarError[];
}
