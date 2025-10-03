import { describe, it, expect, beforeEach } from "vitest";
import {
	getAllCars,
	getCarBySku,
	createCar,
	updateCar,
	softDeleteCar,
	bulkInsertCars,
	bulkUpdateCars,
} from "./car.service";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";
import db from "~/db";

describe("Car Service", () => {
	// Clean up database before each test
	beforeEach(async () => {
		await db.collection("cars").deleteMany({});
	});

	describe("createCar", () => {
		it("should create a new car", async () => {
			const carData: CreateCarRequest = {
				sku: "TEST-001",
				make: "Toyota",
				model: "Camry",
				year: 2024,
				color: "blue",
				price: 30000,
			};

			const result = await createCar({ ...carData });

			expect(result).toMatchObject(carData);
			expect(result).not.toHaveProperty("_id");
		});

		it("should throw error for duplicate SKU", async () => {
			const car: CreateCarRequest = {
				sku: "DUP-001",
				make: "Honda",
				model: "Accord",
				year: 2024,
				color: "red",
				price: 28000,
			};

			await createCar(car);

			await expect(createCar(car)).rejects.toThrow('Car with SKU "DUP-001" already exists');
		});
	});

	describe("getAllCars", () => {
		it("should return empty result when no cars exist", async () => {
			const result = await getAllCars();
			expect(result.cars).toEqual([]);
			expect(result.total).toBe(0);
		});

		it("should return all cars", async () => {
			const carsData: CreateCarRequest[] = [
				{ sku: "CAR-001", make: "Toyota", model: "Camry", year: 2024, color: "blue", price: 30000 },
				{ sku: "CAR-002", make: "Honda", model: "Accord", year: 2023, color: "red", price: 28000 },
				{
					sku: "CAR-003",
					make: "Ford",
					model: "Mustang",
					year: 2024,
					color: "yellow",
					price: 45000,
				},
			];

			for (const car of carsData) {
				await createCar({ ...car });
			}

			const result = await getAllCars();

			expect(result.cars).toHaveLength(3);
			expect(result.total).toBe(3);
			result.cars.forEach((car) => {
				expect(car).not.toHaveProperty("_id");
				expect(car).toHaveProperty("createdAt");
				expect(car).toHaveProperty("updatedAt");
			});
			// Check all cars are present (use objectContaining to ignore timestamps)
			carsData.forEach((expectedCar) => {
				expect(result.cars).toContainEqual(expect.objectContaining(expectedCar));
			});
		});
	});

	describe("getCarBySku", () => {
		it("should return null when car does not exist", async () => {
			const result = await getCarBySku("NONEXISTENT");
			expect(result).toBeNull();
		});

		it("should return car by SKU", async () => {
			const carData: CreateCarRequest = {
				sku: "FIND-001",
				make: "Tesla",
				model: "Model 3",
				year: 2024,
				color: "white",
				price: 42000,
			};

			await createCar({ ...carData });
			const result = await getCarBySku("FIND-001");

			expect(result).toMatchObject(carData);
			expect(result).not.toHaveProperty("_id");
		});
	});

	describe("updateCar", () => {
		it("should throw NotFoundError when car does not exist", async () => {
			const updateData: UpdateCarRequest = {
				make: "Toyota",
				model: "Camry",
				year: 2025,
				color: "blue",
				price: 32000,
			};

			await expect(updateCar("NONEXISTENT", updateData)).rejects.toThrow(
				'Car with SKU "NONEXISTENT" not found',
			);
		});

		it("should update existing car", async () => {
			const originalCar: CreateCarRequest = {
				sku: "UPD-001",
				make: "Toyota",
				model: "Camry",
				year: 2024,
				color: "blue",
				price: 30000,
			};

			await createCar({ ...originalCar });

			const updateData: UpdateCarRequest = {
				make: "Toyota",
				model: "Camry",
				year: 2025,
				color: "red",
				price: 32000,
			};

			const result = await updateCar("UPD-001", updateData);

			expect(result).toMatchObject({
				sku: "UPD-001",
				...updateData,
			});
			expect(result).not.toHaveProperty("_id");
			expect(result).toHaveProperty("createdAt");
			expect(result).toHaveProperty("updatedAt");
		});
	});

	describe("softDeleteCar", () => {
		it("should throw NotFoundError when car does not exist", async () => {
			await expect(softDeleteCar("NONEXISTENT")).rejects.toThrow(
				'Car with SKU "NONEXISTENT" not found',
			);
		});

		it("should soft delete existing car", async () => {
			const carData: CreateCarRequest = {
				sku: "DEL-001",
				make: "BMW",
				model: "3 Series",
				year: 2024,
				color: "black",
				price: 50000,
			};

			await createCar({ ...carData });

			const deleteResult = await softDeleteCar("DEL-001");
			expect(deleteResult).toHaveProperty("deletedAt");

			const findResult = await getCarBySku("DEL-001");
			expect(findResult).toBeNull();
		});
	});

	describe("bulkInsertCars", () => {
		it("should return empty result for empty array", async () => {
			const result = await bulkInsertCars([]);

			expect(result).toEqual({
				inserted: 0,
				updated: 0,
				failed: [],
			});
		});

		it("should insert new cars", async () => {
			const cars: CreateCarRequest[] = [
				{
					sku: "BATCH-001",
					make: "Toyota",
					model: "Camry",
					year: 2024,
					color: "blue",
					price: 30000,
				},
				{
					sku: "BATCH-002",
					make: "Honda",
					model: "Accord",
					year: 2023,
					color: "red",
					price: 28000,
				},
			];

			const result = await bulkInsertCars(cars);

			expect(result.inserted).toBe(2);
			expect(result.updated).toBe(0);
			expect(result.failed).toHaveLength(0);

			// Verify cars were inserted with timestamps
			const car1 = await getCarBySku("BATCH-001");
			expect(car1).toHaveProperty("createdAt");
			expect(car1).toHaveProperty("updatedAt");
		});

		it("should fail when inserting duplicate SKU", async () => {
			const car: CreateCarRequest = {
				sku: "DUP-BULK",
				make: "Ford",
				model: "Mustang",
				year: 2024,
				color: "red",
				price: 45000,
			};

			await createCar({ ...car });

			const result = await bulkInsertCars([car]);

			expect(result.inserted).toBe(0);
			expect(result.failed).toHaveLength(1);
			expect(result.failed[0].sku).toBe("DUP-BULK");
		});
	});

	describe("bulkUpdateCars", () => {
		it("should return empty result for empty array", async () => {
			const result = await bulkUpdateCars([]);

			expect(result).toEqual({
				inserted: 0,
				updated: 0,
				failed: [],
			});
		});

		it("should update existing cars", async () => {
			const carData: CreateCarRequest = {
				sku: "BATCH-003",
				make: "Ford",
				model: "Mustang",
				year: 2024,
				color: "red",
				price: 45000,
			};

			await createCar({ ...carData });

			const updatedCar: CreateCarRequest = {
				...carData,
				price: 47000,
				color: "blue",
			};

			const result = await bulkUpdateCars([updatedCar]);

			expect(result.inserted).toBe(0);
			expect(result.updated).toBe(1);
			expect(result.failed).toHaveLength(0);

			const found = await getCarBySku("BATCH-003");
			expect(found?.price).toBe(47000);
			expect(found?.color).toBe("blue");
		});

		it("should fail when updating non-existent cars", async () => {
			const cars: CreateCarRequest[] = [
				{
					sku: "NONEXIST-001",
					make: "Toyota",
					model: "Camry",
					year: 2024,
					color: "blue",
					price: 30000,
				},
			];

			const result = await bulkUpdateCars(cars);

			expect(result.updated).toBe(0);
			expect(result.failed).toHaveLength(1);
			expect(result.failed[0].sku).toBe("NONEXIST-001");
		});

		it("should handle partial success with some not found", async () => {
			await createCar({
				sku: "UPDATE-001",
				make: "Toyota",
				model: "Camry",
				year: 2024,
				color: "blue",
				price: 30000,
			});

			const cars: CreateCarRequest[] = [
				{
					sku: "UPDATE-001",
					make: "Toyota",
					model: "Camry",
					year: 2025,
					color: "red",
					price: 32000,
				},
				{
					sku: "NOTFOUND-001",
					make: "Honda",
					model: "Accord",
					year: 2024,
					color: "white",
					price: 29000,
				},
			];

			const result = await bulkUpdateCars(cars);

			expect(result.updated).toBe(1);
			expect(result.failed).toHaveLength(1);
			expect(result.failed[0].sku).toBe("NOTFOUND-001");
		});
	});
});
