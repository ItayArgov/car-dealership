import { useState } from "react";
import { Modal, Stack, Select, Text, Group, Alert, Table, ScrollArea } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconFileSpreadsheet, IconUpload, IconX } from "@tabler/icons-react";
import { useExcelInsert, useExcelUpdate } from "../hooks/useExcelUpload";
import type { BatchOperationResponse } from "@dealership/common/types";

interface ExcelUploadModalProps {
	opened: boolean;
	onClose: () => void;
}

export function ExcelUploadModal({ opened, onClose }: ExcelUploadModalProps) {
	const [mode, setMode] = useState<"insert" | "update">("insert");
	const [result, setResult] = useState<BatchOperationResponse | null>(null);

	const excelInsert = useExcelInsert();
	const excelUpdate = useExcelUpdate();

	const isUploading = excelInsert.isPending || excelUpdate.isPending;

	const handleDrop = async (files: File[]) => {
		if (files.length === 0) return;

		const file = files[0];
		try {
			const data = mode === "insert" ? await excelInsert.mutateAsync(file) : await excelUpdate.mutateAsync(file);
			setResult(data);
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	const handleClose = () => {
		setResult(null);
		setMode("insert");
		onClose();
	};

	return (
		<Modal opened={opened} onClose={handleClose} title="Upload Excel File" size="xl">
			<Stack>
				<Select
					label="Upload Mode"
					description="Choose whether to insert new cars or update existing ones"
					value={mode}
					onChange={(value) => setMode(value as "insert" | "update")}
					data={[
						{ value: "insert", label: "Insert New Cars" },
						{ value: "update", label: "Update Existing Cars" },
					]}
					disabled={isUploading}
				/>

				<Alert title="Excel Format" color="blue" variant="light">
					<Text size="sm">
						Please upload an Excel file (.xlsx or .xls) with the following columns:
						<br />
						<strong>SKU, Model, Make, Price, Year, Color</strong>
					</Text>
				</Alert>

				<Dropzone
					onDrop={handleDrop}
					loading={isUploading}
					maxSize={10 * 1024 * 1024}
					accept={[
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						"application/vnd.ms-excel",
					]}
					multiple={false}
				>
					<Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
						<Dropzone.Accept>
							<IconUpload size={52} stroke={1.5} color="var(--mantine-color-blue-6)" />
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX size={52} stroke={1.5} color="var(--mantine-color-red-6)" />
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconFileSpreadsheet size={52} stroke={1.5} color="var(--mantine-color-dimmed)" />
						</Dropzone.Idle>

						<div>
							<Text size="xl" inline>
								Drag Excel file here or click to select
							</Text>
							<Text size="sm" c="dimmed" inline mt={7}>
								File should not exceed 10MB
							</Text>
						</div>
					</Group>
				</Dropzone>

				{result && result.failed.length > 0 && (
					<Alert title="Errors" color="red" variant="light">
						<Text size="sm" mb="md">
							{result.failed.length} row(s) failed to process:
						</Text>
						<ScrollArea h={200}>
							<Table striped withTableBorder withColumnBorders>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Row/SKU</Table.Th>
										<Table.Th>Errors</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{result.failed.map((error, index) => (
										<Table.Tr key={index}>
											<Table.Td>{error.sku || "N/A"}</Table.Td>
											<Table.Td>
												<Text size="sm">{error.errors.join(", ")}</Text>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</ScrollArea>
					</Alert>
				)}
			</Stack>
		</Modal>
	);
}
