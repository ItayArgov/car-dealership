import { zValidator } from "@hono/zod-validator";
import {
	createCarSchema,
	updateCarDataSchema,
	sortQuerySchema,
	carFiltersSchema,
} from "@dealership/common/schemas";
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
 * Schema for pagination, sorting, and filtering query parameters
 */
const paginationQuerySchema = z
	.object({
		offset: z.coerce.number().int().min(0).default(0),
		limit: z.coerce.number().int().min(1).max(100).default(50),
		sort: sortQuerySchema,
		// Filter parameters - all optional
		sku: z.string().optional(),
		model: z.string().optional(),
		make: z.string().optional(),
		priceMin: z.string().optional(),
		priceMax: z.string().optional(),
		yearMin: z.string().optional(),
		yearMax: z.string().optional(),
		color: z.string().optional(),
	})
	.transform((val) => {
		// Extract filter fields
		const { offset, limit, sort, ...filterFields } = val;

		// Build filters object, removing empty values
		const filters: Record<string, string> = {};
		for (const [key, value] of Object.entries(filterFields)) {
			if (value && value.trim() !== "") {
				filters[key] = value;
			}
		}

		// Parse filters using carFiltersSchema if any exist
		const parsedFilters = Object.keys(filters).length > 0 ? carFiltersSchema.parse(filters) : undefined;

		return {
			offset,
			limit,
			sort,
			filters: parsedFilters,
		};
	});

export const validatePagination = zValidator("query", paginationQuerySchema);

/**
 * Schema for SKU path parameter
 */
const skuParamSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
});

export const validateSkuParam = zValidator("param", skuParamSchema);
