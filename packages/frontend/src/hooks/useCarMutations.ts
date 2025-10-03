import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";
import * as api from "../services/api";
import { notifications } from "@mantine/notifications";

/**
 * Hook for creating a new car
 */
export function useCreateCar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCarRequest) => api.createCar(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cars"] });
			notifications.show({
				title: "Success",
				message: "Car created successfully",
				color: "green",
			});
		},
		onError: (error: Error) => {
			notifications.show({
				title: "Error",
				message: error.message || "Failed to create car",
				color: "red",
			});
		},
	});
}

/**
 * Hook for updating an existing car
 */
export function useUpdateCar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ sku, data }: { sku: string; data: UpdateCarRequest }) => api.updateCar(sku, data),
		onSuccess: (_, variables) => {
			// Invalidate both the list and the individual car query
			queryClient.invalidateQueries({ queryKey: ["cars"] });
			queryClient.invalidateQueries({ queryKey: ["car", variables.sku] });
			notifications.show({
				title: "Success",
				message: "Car updated successfully",
				color: "green",
			});
		},
		onError: (error: Error) => {
			notifications.show({
				title: "Error",
				message: error.message || "Failed to update car",
				color: "red",
			});
		},
	});
}

/**
 * Hook for deleting a car (soft delete)
 */
export function useDeleteCar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (sku: string) => api.deleteCar(sku),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cars"] });
			notifications.show({
				title: "Success",
				message: "Car deleted successfully",
				color: "green",
			});
		},
		onError: (error: Error) => {
			notifications.show({
				title: "Error",
				message: error.message || "Failed to delete car",
				color: "red",
			});
		},
	});
}
