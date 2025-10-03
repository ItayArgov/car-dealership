import { Hono } from "hono";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";
import * as carService from "~/services/car.service";
import * as excelService from "~/services/excel.service";
import {
	validateCreateCar,
	validateUpdateCar,
	validateExcelFile,
} from "~/middleware/validation.middleware";

const cars = new Hono();

/**
 * GET /api/cars - Get all cars with pagination
 */
cars.get("/", async (c) => {
	try {
		const offset = Math.max(0, Number.parseInt(c.req.query("offset") || "0"));
		const limit = Math.min(100, Math.max(1, Number.parseInt(c.req.query("limit") || "50")));

		const result = await carService.getAllCars(offset, limit);

		return c.json({
			cars: result.cars,
			total: result.total,
			offset,
			limit,
		});
	} catch (error) {
		console.error("Error fetching cars:", error);
		return c.json({ error: "Failed to fetch cars" }, 500);
	}
});

/**
 * GET /api/cars/:sku - Get single car by SKU
 */
cars.get("/:sku", async (c) => {
	try {
		const sku = c.req.param("sku");
		const car = await carService.getCarBySku(sku);

		if (!car) {
			return c.json({ error: `Car with SKU "${sku}" not found` }, 404);
		}

		return c.json(car);
	} catch (error) {
		console.error("Error fetching car:", error);
		return c.json({ error: "Failed to fetch car" }, 500);
	}
});

/**
 * POST /api/cars - Create a new car
 */
cars.post("/", validateCreateCar, async (c) => {
	const carData = c.req.valid("json") as CreateCarRequest;
	const car = await carService.createCar(carData);
	return c.json(car, 201);
});

/**
 * PUT /api/cars/:sku - Update an existing car
 */
cars.put("/:sku", validateUpdateCar, async (c) => {
	const sku = c.req.param("sku");
	const updateData = c.req.valid("json") as UpdateCarRequest;
	const car = await carService.updateCar(sku, updateData);
	return c.json(car);
});

/**
 * DELETE /api/cars/:sku - Soft delete a car
 */
cars.delete("/:sku", async (c) => {
	const sku = c.req.param("sku");
	const car = await carService.softDeleteCar(sku);
	return c.json({ message: "Car deleted successfully", car });
});

/**
 * POST /api/cars/excel/insert - Bulk insert cars from Excel file
 */
cars.post("/excel/insert", validateExcelFile, async (c) => {
	const { file } = c.req.valid("form");

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { data } = excelService.parseExcelFile(buffer);
	const { validCars, errors: parseErrors } = excelService.validateAndParseCarData(data);

	const result = await carService.bulkInsertCars(validCars);

	const allErrors = [...parseErrors, ...result.failed];

	return c.json({
		inserted: result.inserted,
		updated: 0,
		failed: allErrors,
	});
});

/**
 * POST /api/cars/excel/update - Bulk update cars from Excel file
 */
cars.post("/excel/update", validateExcelFile, async (c) => {
	const { file } = c.req.valid("form");

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { data } = excelService.parseExcelFile(buffer);
	const { validCars, errors: parseErrors } = excelService.validateAndParseCarData(data);

	const result = await carService.bulkUpdateCars(validCars);

	const allErrors = [...parseErrors, ...result.failed];

	return c.json({
		inserted: 0,
		updated: result.updated,
		failed: allErrors,
	});
});

export default cars;
