import type { Car } from "@dealership/common/models";
import type { CreateCarRequest, UpdateCarRequest, BatchOperationResponse, GetAllCarsResponse } from "@dealership/common/types";
import type { CarDocument } from "~/types/car.types";
import { MongoError } from "mongodb";
import db from "~/db";
import { toCarModel, toCarModels } from "~/types/car.types";
import { MongoErrorCode } from "~/constants/mongo-errors";

const carsCollection = db.collection<CarDocument>("cars");

/**
 * Get all cars from the database with pagination
 */
export async function getAllCars(offset = 0, limit = 50): Promise<GetAllCarsResponse> {
	const [docs, total] = await Promise.all([
		carsCollection.find({}).skip(offset).limit(limit).toArray(),
		carsCollection.countDocuments(),
	]);
	return { cars: toCarModels(docs), total };
}

/**
 * Get a single car by SKU
 */
export async function getCarBySku(sku: string): Promise<Car | null> {
	const doc = await carsCollection.findOne({ sku });
	return doc ? toCarModel(doc) : null;
}

/**
 * Create a new car
 * @throws Error if car with same SKU already exists
 */
export async function createCar(car: CreateCarRequest): Promise<Car> {
	try {
		const now = new Date();
		const carWithTimestamps = {
			...car,
			createdAt: now,
			updatedAt: now,
		};

		const result = await carsCollection.insertOne(carWithTimestamps as CarDocument);
		const inserted = await carsCollection.findOne({ _id: result.insertedId });

		if (!inserted) {
			throw new Error("Failed to retrieve inserted car");
		}

		return toCarModel(inserted);
	} catch (error) {
		// MongoDB duplicate key error (unique index violation)
		if (error instanceof MongoError && error.code === MongoErrorCode.DUPLICATE_KEY) {
			throw new Error(`Car with SKU "${car.sku}" already exists`);
		}
		throw error;
	}
}

/**
 * Update an existing car by SKU
 * @param sku - The SKU of the car to update (from URL path)
 * @param data - The updated car data (without SKU)
 * @returns Updated car or null if not found
 */
export async function updateCar(sku: string, data: UpdateCarRequest): Promise<Car | null> {
	const result = await carsCollection.findOneAndUpdate(
		{ sku },
		{
			$set: data,
			$currentDate: { updatedAt: true as const },
		},
		{ returnDocument: "after" },
	);

	return result ? toCarModel(result) : null;
}

/**
 * Bulk insert new cars
 * Used for Excel uploads - insert only, no updates
 * Note: insertOne doesn't support $currentDate, so we set timestamps manually
 */
export async function bulkInsertCars(cars: CreateCarRequest[]): Promise<BatchOperationResponse> {
	const response: BatchOperationResponse = {
		inserted: 0,
		updated: 0,
		failed: [],
	};

	if (cars.length === 0) {
		return response;
	}

	// Build bulk insert operations with timestamps
	const now = new Date();
	const operations = cars.map((car) => ({
		insertOne: {
			document: {
				...car,
				createdAt: now,
				updatedAt: now,
			} as CarDocument,
		},
	}));

	try {
		const result = await carsCollection.bulkWrite(operations, { ordered: false });

		response.inserted = result.insertedCount;

		// Handle individual write errors (e.g., duplicate SKU)
		if (result.hasWriteErrors()) {
			const errors = result.getWriteErrors();
			for (const error of errors) {
				const failedCar = cars[error.index];
				if (!failedCar) continue;

				response.failed.push({
					sku: failedCar.sku,
					errors: [error.errmsg || "Unknown error"],
				});
			}
		}
	} catch (error) {
		// Catastrophic failure - mark all as failed
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		response.failed = cars.map((car) => ({
			sku: car.sku,
			errors: [errorMessage],
		}));
	}

	return response;
}

/**
 * Bulk update existing cars by SKU
 * Used for Excel uploads - update only, no inserts
 */
export async function bulkUpdateCars(cars: CreateCarRequest[]): Promise<BatchOperationResponse> {
	const response: BatchOperationResponse = {
		inserted: 0,
		updated: 0,
		failed: [],
	};

	if (cars.length === 0) {
		return response;
	}

	// Build bulk update operations with automatic updatedAt timestamp
	const operations = cars.map((car) => ({
		updateOne: {
			filter: { sku: car.sku },
			update: {
				$set: car,
				$currentDate: { updatedAt: true as const },
			},
		},
	}));

	try {
		const result = await carsCollection.bulkWrite(operations, { ordered: false });

		response.updated = result.modifiedCount;

		// Track cars that weren't found (matchedCount = 0 for that operation)
		const notFoundCount = cars.length - result.matchedCount;
		if (notFoundCount > 0) {
			// Bulk check which cars exist
			const skus = cars.map((car) => car.sku);
			const existingCars = await carsCollection.find({ sku: { $in: skus } }).toArray();
			const existingSkus = new Set(existingCars.map((car) => car.sku));

			// Track cars that don't exist
			for (const car of cars) {
				if (!existingSkus.has(car.sku)) {
					response.failed.push({
						sku: car.sku,
						errors: [`Car with SKU "${car.sku}" not found`],
					});
				}
			}
		}

		// Handle individual write errors
		if (result.hasWriteErrors()) {
			const errors = result.getWriteErrors();
			for (const error of errors) {
				const failedCar = cars[error.index];
				if (!failedCar) continue;

				response.failed.push({
					sku: failedCar.sku,
					errors: [error.errmsg || "Unknown error"],
				});
			}
		}
	} catch (error) {
		// Catastrophic failure - mark all as failed
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		response.failed = cars.map((car) => ({
			sku: car.sku,
			errors: [errorMessage],
		}));
	}

	return response;
}
