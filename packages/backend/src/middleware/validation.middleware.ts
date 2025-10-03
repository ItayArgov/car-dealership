import { zValidator } from "@hono/zod-validator";
import { CreateCarSchema, UpdateCarDataSchema } from "@dealership/common/schemas";
import { z } from "zod";

export const validateCreateCar = zValidator("json", CreateCarSchema);

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

export const validateExcelFile = zValidator("form", ExcelFileSchema);

/**
 * Schema for pagination query parameters
 */
const PaginationQuerySchema = z.object({
	offset: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const validatePagination = zValidator("query", PaginationQuerySchema);

/**
 * Schema for SKU path parameter
 */
const SkuParamSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
});

export const validateSkuParam = zValidator("param", SkuParamSchema);
