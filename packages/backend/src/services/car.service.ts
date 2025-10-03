import type { Car } from "@dealership/common/models";
import type {
	CreateCarRequest,
	UpdateCarRequest,
	BatchOperationResponse,
	GetAllCarsResponse,
} from "@dealership/common/types";
import type { CarDocument } from "~/types/car.types";
import { MongoError, MongoBulkWriteError } from "mongodb";
import db from "~/db";
import { toCarModel, toCarModels } from "~/types/car.types";
import { MongoErrorCode } from "~/constants/mongo-errors";
import { NotFoundError, DuplicateError } from "~/utils/errors";

const carsCollection = db.collection<CarDocument>("cars");

/**
 * Find which SKUs from the input already exist in the database (duplicates)
 * Used by bulkInsertCars to identify insert failures
 */
async function findDuplicateSkus(
	cars: CreateCarRequest[],
): Promise<{ sku: string; errors: string[] }[]> {
	const skus = cars.map((car) => car.sku);
	const existingCars = await carsCollection.find({ sku: { $in: skus } }).toArray();
	const existingSkus = new Set(existingCars.map((car) => car.sku));

	const failures: { sku: string; errors: string[] }[] = [];
	for (const car of cars) {
		if (existingSkus.has(car.sku)) {
			failures.push({
				sku: car.sku,
				errors: ["This SKU already exists in the database"],
			});
		}
	}
	return failures;
}

/**
 * Find which SKUs from the input don't exist in the database (not found)
 * Used by bulkUpdateCars to identify update failures
 */
async function findMissingSkus(
	cars: CreateCarRequest[],
): Promise<{ sku: string; errors: string[] }[]> {
	const skus = cars.map((car) => car.sku);
	const existingCars = await carsCollection.find({ sku: { $in: skus }, deletedAt: null }).toArray();
	const existingSkus = new Set(existingCars.map((car) => car.sku));

	const failures: { sku: string; errors: string[] }[] = [];
	for (const car of cars) {
		if (!existingSkus.has(car.sku)) {
			failures.push({
				sku: car.sku,
				errors: [`Car with SKU "${car.sku}" not found`],
			});
		}
	}
	return failures;
}

/**
 * Get all cars from the database with pagination
 */
export async function getAllActiveCars(offset = 0, limit = 50): Promise<GetAllCarsResponse> {
	const filter = { deletedAt: null };
	const [docs, total] = await Promise.all([
		carsCollection.find(filter).skip(offset).limit(limit).toArray(),
		carsCollection.countDocuments(filter),
	]);
	return { cars: toCarModels(docs), total, offset, limit };
}

/**
 * Get a single car by SKU
 * Only returns non-deleted cars
 */
export async function getCarBySku(sku: string): Promise<Car | null> {
	const doc = await carsCollection.findOne({ sku, deletedAt: null });
	return doc ? toCarModel(doc) : null;
}

/**
 * Create a new car
 * @throws DuplicateError if car with same SKU already exists
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
		if (error instanceof MongoError && error.code === MongoErrorCode.DUPLICATE_KEY) {
			throw new DuplicateError(`Car with SKU "${car.sku}" already exists`);
		}
		throw error;
	}
}

/**
 * Update an existing car by SKU
 * @param sku - The SKU of the car to update (from URL path)
 * @param data - The updated car data (without SKU)
 * @returns Updated car
 * @throws NotFoundError if car not found
 */
export async function updateCar(sku: string, data: UpdateCarRequest): Promise<Car> {
	const result = await carsCollection.findOneAndUpdate(
		{ sku, deletedAt: null },
		{
			$set: data,
			$currentDate: { updatedAt: true as const },
		},
		{ returnDocument: "after" },
	);

	if (!result) {
		throw new NotFoundError(`Car with SKU "${sku}" not found`);
	}

	return toCarModel(result);
}

/**
 * Soft delete a car by SKU
 * Sets deletedAt timestamp instead of removing the document
 * @param sku - The SKU of the car to delete
 * @returns The deleted car
 * @throws NotFoundError if car not found
 */
export async function softDeleteCar(sku: string): Promise<Car> {
	const result = await carsCollection.findOneAndUpdate(
		{ sku, deletedAt: null },
		{
			$currentDate: { deletedAt: true as const },
		},
		{ returnDocument: "after" },
	);

	if (!result) {
		throw new NotFoundError(`Car with SKU "${sku}" not found`);
	}

	return toCarModel(result);
}

/**
 * Bulk insert new cars
 * Used for Excel uploads - insert only, no updates
 * Uses two-pass strategy: attempt bulk insert, then query for duplicates on failure
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

		// If some operations failed, find which SKUs already exist
		const failedCount = cars.length - result.insertedCount;
		if (failedCount > 0) {
			const failures = await findDuplicateSkus(cars);
			response.failed.push(...failures);
		}
	} catch (error) {
		// Only handle MongoBulkWriteError - some might have succeeded
		if (!(error instanceof MongoBulkWriteError)) {
			throw error;
		}

		response.inserted = error.result.insertedCount || 0;

		// Find which SKUs already exist (duplicates that caused the failure)
		const failures = await findDuplicateSkus(cars);
		response.failed.push(...failures);
	}

	return response;
}

/**
 * Bulk update existing cars by SKU
 * Used for Excel uploads - update only, no inserts
 * Uses two-pass strategy: attempt bulk update, then query for missing SKUs on failure
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

	const operations = cars.map((car) => ({
		updateOne: {
			filter: { sku: car.sku, deletedAt: null },
			update: {
				$set: car,
				$currentDate: { updatedAt: true as const },
			},
		},
	}));

	try {
		const result = await carsCollection.bulkWrite(operations, { ordered: false });
		response.updated = result.modifiedCount;

		// If some cars weren't matched, find which SKUs don't exist
		const notFoundCount = cars.length - result.matchedCount;
		if (notFoundCount > 0) {
			const failures = await findMissingSkus(cars);
			response.failed.push(...failures);
		}
	} catch (error) {
		// Only handle MongoBulkWriteError - some might have succeeded
		if (!(error instanceof MongoBulkWriteError)) {
			throw error;
		}

		response.updated = error.result.modifiedCount || 0;

		// Find which SKUs don't exist (not found errors)
		const failures = await findMissingSkus(cars);
		response.failed.push(...failures);
	}

	return response;
}
