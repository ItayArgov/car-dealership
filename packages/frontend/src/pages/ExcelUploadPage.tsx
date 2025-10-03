import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Container,
	Paper,
	Title,
	Stack,
	Select,
	Text,
	Group,
	Alert,
	Table,
	ScrollArea,
	Button,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconFileSpreadsheet, IconUpload, IconX, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { useExcelInsert, useExcelUpdate } from "../hooks/useExcelUpload";
import type { BatchOperationResponse } from "@dealership/common/types";

export function ExcelUploadPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"insert" | "update">("insert");
	const [result, setResult] = useState<BatchOperationResponse | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const excelInsert = useExcelInsert();
	const excelUpdate = useExcelUpdate();

	const isUploading = excelInsert.isPending || excelUpdate.isPending;

	const handleDrop = (files: File[]) => {
		if (files.length === 0) return;
		setSelectedFile(files[0]);
		setResult(null); // Clear previous results
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		try {
			const data = mode === "insert"
				? await excelInsert.mutateAsync(selectedFile)
				: await excelUpdate.mutateAsync(selectedFile);
			setResult(data);
			setSelectedFile(null); // Clear file after upload
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	const handleClearFile = () => {
		setSelectedFile(null);
	};

	const handleBack = () => {
		navigate("/");
	};

	return (
		<Container size="xl" py="xl">
			<Button
				variant="subtle"
				leftSection={<IconArrowLeft size={16} />}
				onClick={handleBack}
				mb="md"
			>
				Back to list
			</Button>

			<Paper shadow="sm" p="xl" withBorder>
				<Title order={2} mb="xl">
					Upload Excel File
				</Title>

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
						disabled={isUploading}
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

					{selectedFile && !result && (
						<Paper p="md" withBorder>
							<Stack gap="sm">
								<Group justify="space-between">
									<div>
										<Text size="sm" fw={500}>
											Selected file: {selectedFile.name}
										</Text>
										<Text size="xs" c="dimmed">
											Size: {(selectedFile.size / 1024).toFixed(2)} KB
										</Text>
									</div>
									<Button variant="subtle" size="xs" onClick={handleClearFile} disabled={isUploading}>
										Clear
									</Button>
								</Group>
								<Button onClick={handleUpload} loading={isUploading} fullWidth>
									Upload and {mode === "insert" ? "Insert" : "Update"}
								</Button>
							</Stack>
						</Paper>
					)}

					{result && (
						<>
							{result.failed.length === 0 ? (
								<Alert title="Success" color="green" variant="light" icon={<IconCheck />}>
									<Text size="sm">
										Successfully processed {result.inserted + result.updated} car(s)!
									</Text>
									<Button mt="md" onClick={handleBack}>
										Back to car list
									</Button>
								</Alert>
							) : (
								<Alert title="Partial Success" color="orange" variant="light">
									<Text size="sm" mb="md">
										Successfully processed {result.inserted + result.updated} car(s), but{" "}
										{result.failed.length} row(s) failed:
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
												{result.failed.map((error, index) => {
													// Display row number if available, otherwise SKU
													const identifier = error.row
														? `Row ${error.row}${error.sku ? ` (${error.sku})` : ""}`
														: error.sku || "N/A";

													return (
														<Table.Tr key={index}>
															<Table.Td>{identifier}</Table.Td>
															<Table.Td>
																<Text size="sm">{error.errors.join(", ")}</Text>
															</Table.Td>
														</Table.Tr>
													);
												})}
											</Table.Tbody>
										</Table>
									</ScrollArea>
									<Button mt="md" onClick={handleBack}>
										Back to car list
									</Button>
								</Alert>
							)}
						</>
					)}
				</Stack>
			</Paper>
		</Container>
	);
}
