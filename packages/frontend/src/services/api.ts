import axios from "axios";
import type { Car } from "@dealership/common/models";
import type {
	CreateCarRequest,
	UpdateCarRequest,
	GetAllCarsResponse,
	BatchOperationResponse,
	ExcelPreviewResponse,
	SortOption,
} from "@dealership/common/types";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
});

// Add response interceptor to extract error messages from API responses
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Extract error message from response data if available
		if (error.response?.data?.error) {
			error.message = error.response.data.error;
		}
		return Promise.reject(error);
	},
);

/**
 * Get all cars with pagination and sorting
 */
export async function getCars(
	offset = 0,
	limit = 50,
	sort?: SortOption[],
): Promise<GetAllCarsResponse> {
	const params: Record<string, string | number> = { offset, limit };

	// Format sort array as comma-separated string: "field:direction,field:direction"
	if (sort && sort.length > 0) {
		params.sort = sort.map((s) => `${s.field}:${s.direction}`).join(",");
	}

	const response = await api.get<GetAllCarsResponse>("/cars", { params });
	return response.data;
}

/**
 * Get a single car by SKU
 */
export async function getCarBySku(sku: string): Promise<Car> {
	const response = await api.get<Car>(`/cars/${sku}`);
	return response.data;
}

/**
 * Create a new car
 */
export async function createCar(data: CreateCarRequest): Promise<Car> {
	const response = await api.post<Car>("/cars", data);
	return response.data;
}

/**
 * Update an existing car
 */
export async function updateCar(sku: string, data: UpdateCarRequest): Promise<Car> {
	const response = await api.put<Car>(`/cars/${sku}`, data);
	return response.data;
}

/**
 * Delete a car (soft delete)
 */
export async function deleteCar(sku: string): Promise<void> {
	await api.delete(`/cars/${sku}`);
}

/**
 * Upload Excel file for bulk insert
 */
export async function uploadExcelInsert(file: File): Promise<BatchOperationResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post<BatchOperationResponse>("/cars/excel/insert", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}

/**
 * Upload Excel file for bulk update
 */
export async function uploadExcelUpdate(file: File): Promise<BatchOperationResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post<BatchOperationResponse>("/cars/excel/update", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}

/**
 * Preview Excel file changes before update
 */
export async function previewExcelUpdate(file: File): Promise<ExcelPreviewResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post<ExcelPreviewResponse>("/cars/excel/preview", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}
