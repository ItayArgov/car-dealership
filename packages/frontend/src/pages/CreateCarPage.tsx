import { useNavigate } from "react-router-dom";
import { Container, Paper, Title, Button, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { CarForm } from "../components/CarForm";
import { useCreateCar } from "../hooks/useCarMutations";
import type { CreateCarRequest } from "@dealership/common/types";

export function CreateCarPage() {
	const navigate = useNavigate();
	const createCar = useCreateCar();

	const handleSubmit = async (data: CreateCarRequest) => {
		await createCar.mutateAsync(data);
		navigate("/");
	};

	const handleCancel = () => {
		navigate("/");
	};

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

			<Paper shadow="sm" p="xl" withBorder>
				<Title order={2} mb="xl">
					Create New Car
				</Title>

				<CarForm onSubmit={handleSubmit} isSubmitting={createCar.isPending} />

				<Group mt="md">
					<Button variant="default" onClick={handleCancel}>
						Cancel
					</Button>
				</Group>
			</Paper>
		</Container>
	);
}
