import { zValidator } from "@hono/zod-validator";
import { CreateCarSchema, UpdateCarDataSchema } from "@dealership/common/schemas";
import { z } from "zod";

/**
 * Middleware for validating create car request
 */
export const validateCreateCar = zValidator("json", CreateCarSchema);

/**
 * Middleware for validating update car request
 */
export const validateUpdateCar = zValidator("json", UpdateCarDataSchema);

/**
 * Schema for Excel file upload
 */
const ExcelFileSchema = z.object({
	file: z
		.file()
		.max(10 * 1024 * 1024, "File size exceeds maximum allowed size of 10MB")
		.mime(
			[
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
			],
			"Invalid file type. Only .xlsx and .xls files are allowed",
		),
});

/**
 * Middleware for validating Excel file upload
 */
export const validateExcelFile = zValidator("form", ExcelFileSchema);
