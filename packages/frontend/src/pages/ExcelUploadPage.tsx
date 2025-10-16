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
	Accordion,
	Badge,
	Loader,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
	IconFileSpreadsheet,
	IconUpload,
	IconX,
	IconArrowLeft,
	IconCheck,
} from "@tabler/icons-react";
import { useExcelInsert, useExcelUpdate } from "../hooks/useExcelUpload";
import { CarDiffDisplay } from "../components/CarDiffDisplay";
import { previewExcelUpdate } from "../services/api";
import type { BatchOperationResponse, ExcelPreviewResponse } from "@dealership/common/types";

export function ExcelUploadPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"insert" | "update">("insert");
	const [result, setResult] = useState<BatchOperationResponse | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
	const [isLoadingPreview, setIsLoadingPreview] = useState(false);

	const excelInsert = useExcelInsert();
	const excelUpdate = useExcelUpdate();

	const isUploading = excelInsert.isPending || excelUpdate.isPending;

	const handleDrop = (files: File[]) => {
		if (files.length === 0) return;
		setSelectedFile(files[0]);
		setResult(null); // Clear previous results
		setPreviewData(null); // Clear preview
	};

	const handlePreviewOrUpload = async () => {
		if (!selectedFile) return;

		// For update mode, show preview first
		if (mode === "update" && !previewData) {
			setIsLoadingPreview(true);
			try {
				const preview = await previewExcelUpdate(selectedFile);
				setPreviewData(preview);
			} catch (error) {
				console.error("Preview failed:", error);
			} finally {
				setIsLoadingPreview(false);
			}
			return;
		}

		// For insert mode or after preview confirmation, proceed with upload
		try {
			const data =
				mode === "insert"
					? await excelInsert.mutateAsync(selectedFile)
					: await excelUpdate.mutateAsync(selectedFile);
			setResult(data);
			setSelectedFile(null); // Clear file after upload
			setPreviewData(null); // Clear preview
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	const handleClearFile = () => {
		setSelectedFile(null);
		setPreviewData(null);
	};

	const handleBackFromPreview = () => {
		setPreviewData(null);
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

					{selectedFile && !result && !previewData && (
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
									<Button
										variant="subtle"
										size="xs"
										onClick={handleClearFile}
										disabled={isUploading || isLoadingPreview}
									>
										Clear
									</Button>
								</Group>
								<Button
									onClick={handlePreviewOrUpload}
									loading={isUploading || isLoadingPreview}
									fullWidth
								>
									{mode === "insert"
										? "Upload and Insert"
										: isLoadingPreview
											? "Loading Preview..."
											: "Preview Changes"}
								</Button>
							</Stack>
						</Paper>
					)}

					{previewData && !result && (
						<Paper p="md" withBorder>
							<Stack gap="md">
								<Group justify="space-between">
									<Title order={4}>Preview Changes</Title>
									<Badge size="lg" color="blue">
										{previewData.previews.length} car(s) to update
									</Badge>
								</Group>

								{previewData.failed.length > 0 && (
									<Alert title="Validation Errors" color="orange" variant="light">
										<Text size="sm" mb="sm">
											{previewData.failed.length} row(s) have errors and will be skipped:
										</Text>
										<ScrollArea h={150}>
											<Table striped withTableBorder withColumnBorders size="sm">
												<Table.Thead>
													<Table.Tr>
														<Table.Th>Row/SKU</Table.Th>
														<Table.Th>Errors</Table.Th>
													</Table.Tr>
												</Table.Thead>
												<Table.Tbody>
													{previewData.failed.map((error, index) => {
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
									</Alert>
								)}

								{previewData.previews.length > 0 && (
									<Accordion variant="contained">
										{previewData.previews.map((preview, index) => (
											<Accordion.Item key={preview.sku} value={preview.sku}>
												<Accordion.Control>
													<Group justify="space-between" pr="xl">
														<div>
															<Text fw={500}>
																{preview.make} {preview.model}
															</Text>
															<Text size="xs" c="dimmed">
																SKU: {preview.sku}
															</Text>
														</div>
														<Badge size="sm" color="yellow">
															{preview.changes.length} change(s)
														</Badge>
													</Group>
												</Accordion.Control>
												<Accordion.Panel>
													<CarDiffDisplay changes={preview.changes} />
												</Accordion.Panel>
											</Accordion.Item>
										))}
									</Accordion>
								)}

								{previewData.previews.length === 0 && previewData.failed.length === 0 && (
									<Alert title="No Changes" color="gray" variant="light">
										<Text size="sm">No valid updates found in the Excel file.</Text>
									</Alert>
								)}

								<Group justify="flex-end" mt="md">
									<Button
										variant="default"
										onClick={handleBackFromPreview}
										disabled={isUploading}
									>
										Back
									</Button>
									<Button
										onClick={handlePreviewOrUpload}
										loading={isUploading}
										disabled={previewData.previews.length === 0}
									>
										Confirm and Update ({previewData.previews.length} car(s))
									</Button>
								</Group>
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
