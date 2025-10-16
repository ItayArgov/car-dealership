import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Container,
	Paper,
	Title,
	Button,
	Loader,
	Center,
	Text,
	Alert,
	Group,
	Switch,
	Modal,
	Stack,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { EditCarForm } from "../components/CarForm";
import { CarDiffDisplay } from "../components/CarDiffDisplay";
import { useCar } from "../hooks/useCars";
import { useUpdateCar } from "../hooks/useCarMutations";
import { calculateCarDiff } from "@dealership/common";
import type { UpdateCarRequest } from "@dealership/common/types";
import type { CarDiff } from "@dealership/common";

export function CarDetailPage() {
	const navigate = useNavigate();
	const { sku } = useParams<{ sku: string }>();
	const { data: car, isLoading, error } = useCar(sku!);
	const updateCar = useUpdateCar();
	const [isEditMode, setIsEditMode] = useState(false);
	const [previewModalOpen, setPreviewModalOpen] = useState(false);
	const [pendingUpdate, setPendingUpdate] = useState<UpdateCarRequest | null>(null);
	const [diff, setDiff] = useState<CarDiff>([]);

	const handleSubmit = async (data: UpdateCarRequest) => {
		if (!car) return;

		// Calculate diff between current and new data
		const changes = calculateCarDiff(car, { ...car, ...data });

		if (changes.length === 0) {
			// No changes detected, just close edit mode
			setIsEditMode(false);
			return;
		}

		// Show preview modal
		setPendingUpdate(data);
		setDiff(changes);
		setPreviewModalOpen(true);
	};

	const handleConfirmUpdate = async () => {
		if (!sku || !pendingUpdate) return;

		try {
			await updateCar.mutateAsync({ sku, data: pendingUpdate });
			setPreviewModalOpen(false);
			setPendingUpdate(null);
			setDiff([]);
			navigate("/");
		} catch (error) {
			// Error is handled by react-query
			console.error("Update failed:", error);
		}
	};

	const handleCancelPreview = () => {
		setPreviewModalOpen(false);
		setPendingUpdate(null);
		setDiff([]);
	};

	const handleCancel = () => {
		navigate("/");
	};

	if (isLoading) {
		return (
			<Container size="sm" py="xl">
				<Center h={300}>
					<Loader size="lg" />
				</Center>
			</Container>
		);
	}

	if (error || !car) {
		return (
			<Container size="sm" py="xl">
				<Button
					variant="subtle"
					leftSection={<IconArrowLeft size={16} />}
					onClick={handleCancel}
					mb="md"
				>
					Back to list
				</Button>
				<Alert title="Error" color="red">
					<Text>Failed to load car details. The car may not exist.</Text>
				</Alert>
			</Container>
		);
	}

	return (
		<>
			<Container size="sm" py="xl">
				<Group justify="space-between" align="center" mb="md">
					<Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={handleCancel}>
						Back to list
					</Button>

					<Group gap="sm" align="center">
						<Text size="sm" fw={500}>
							Edit Mode
						</Text>
						<Switch
							checked={isEditMode}
							onChange={(event) => setIsEditMode(event.currentTarget.checked)}
							size="md"
						/>
					</Group>
				</Group>

				<Paper shadow="sm" p="xl" withBorder>
					<Title order={2} mb="xl">
						{isEditMode ? "Edit Car" : "Car Details"} - {car.make} {car.model}
					</Title>

					<EditCarForm
						car={car}
						onSubmit={handleSubmit}
						onCancel={() => setIsEditMode(false)}
						isSubmitting={updateCar.isPending}
						readOnly={!isEditMode}
					/>
				</Paper>
			</Container>

			<Modal
				opened={previewModalOpen}
				onClose={handleCancelPreview}
				title="Confirm Changes"
				size="lg"
			>
				<Stack>
					<Text size="sm" c="dimmed">
						Review the changes below before updating the car:
					</Text>

					<CarDiffDisplay changes={diff} />

					<Group justify="flex-end" mt="md">
						<Button variant="default" onClick={handleCancelPreview}>
							Cancel
						</Button>
						<Button onClick={handleConfirmUpdate} loading={updateCar.isPending}>
							Confirm Update
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
