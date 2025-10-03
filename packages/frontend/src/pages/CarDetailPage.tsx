import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Paper, Title, Button, Loader, Center, Text, Alert, Group, Switch } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { CarForm } from "../components/CarForm";
import { useCar } from "../hooks/useCars";
import { useUpdateCar } from "../hooks/useCarMutations";
import type { UpdateCarRequest } from "@dealership/common/types";

export function CarDetailPage() {
	const navigate = useNavigate();
	const { sku } = useParams<{ sku: string }>();
	const { data: car, isLoading, error } = useCar(sku!);
	const updateCar = useUpdateCar();
	const [isEditMode, setIsEditMode] = useState(false);

	const handleSubmit = async (data: UpdateCarRequest) => {
		if (!sku) return;
		await updateCar.mutateAsync({ sku, data });
		navigate("/");
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
		<Container size="sm" py="xl">
			<Group justify="space-between" align="center" mb="md">
				<Button
					variant="subtle"
					leftSection={<IconArrowLeft size={16} />}
					onClick={handleCancel}
				>
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

				<CarForm
					car={car}
					onSubmit={handleSubmit}
					onCancel={() => setIsEditMode(false)}
					isSubmitting={updateCar.isPending}
					readOnly={!isEditMode}
				/>
			</Paper>
		</Container>
	);
}
