import { zValidator } from "@hono/zod-validator";
import { createCarSchema, updateCarDataSchema, sortQuerySchema } from "@dealership/common/schemas";
import { z } from "zod";

export const validateCreateCar = zValidator("json", createCarSchema);

export const validateUpdateCar = zValidator("json", updateCarDataSchema);

/**
 * Schema for Excel file upload
 */
const excelFileSchema = z.object({
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

export const validateExcelFile = zValidator("form", excelFileSchema);

/**
 * Schema for pagination and sorting query parameters
 */
const paginationQuerySchema = z.object({
	offset: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(50),
	sort: sortQuerySchema,
});

export const validatePagination = zValidator("query", paginationQuerySchema);

/**
 * Schema for SKU path parameter
 */
const skuParamSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
});

export const validateSkuParam = zValidator("param", skuParamSchema);
