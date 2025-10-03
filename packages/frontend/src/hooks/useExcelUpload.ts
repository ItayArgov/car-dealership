import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api";
import { notifications } from "@mantine/notifications";

/**
 * Hook for uploading Excel files for bulk insert
 */
export function useExcelInsert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => api.uploadExcelInsert(file),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["cars"] });

			const { inserted, failed } = data;
			const hasErrors = failed.length > 0;

			notifications.show({
				title: hasErrors ? "Partially Completed" : "Success",
				message: `Inserted ${inserted} cars${hasErrors ? `, ${failed.length} failed` : ""}`,
				color: hasErrors ? "yellow" : "green",
			});
		},
		onError: (error: Error) => {
			notifications.show({
				title: "Error",
				message: error.message || "Failed to upload Excel file",
				color: "red",
			});
		},
	});
}

/**
 * Hook for uploading Excel files for bulk update
 */
export function useExcelUpdate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => api.uploadExcelUpdate(file),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["cars"] });

			const { updated, failed } = data;
			const hasErrors = failed.length > 0;

			notifications.show({
				title: hasErrors ? "Partially Completed" : "Success",
				message: `Updated ${updated} cars${hasErrors ? `, ${failed.length} failed` : ""}`,
				color: hasErrors ? "yellow" : "green",
			});
		},
		onError: (error: Error) => {
			notifications.show({
				title: "Error",
				message: error.message || "Failed to upload Excel file",
				color: "red",
			});
		},
	});
}
