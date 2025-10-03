import { Modal } from "@mantine/core";
import { CarForm } from "./CarForm";
import { useCreateCar, useUpdateCar } from "../hooks/useCarMutations";
import type { Car } from "@dealership/common/models";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";

interface CarModalProps {
	opened: boolean;
	onClose: () => void;
	car?: Car;
}

export function CarModal({ opened, onClose, car }: CarModalProps) {
	const createCar = useCreateCar();
	const updateCar = useUpdateCar();

	const isEdit = !!car;
	const title = isEdit ? "Edit Car" : "Create New Car";

	const handleSubmit = async (data: CreateCarRequest | UpdateCarRequest) => {
		if (isEdit) {
			await updateCar.mutateAsync({ sku: car.sku, data: data as UpdateCarRequest });
		} else {
			await createCar.mutateAsync(data as CreateCarRequest);
		}
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={title} size="md">
			<CarForm
				car={car}
				onSubmit={handleSubmit}
				isSubmitting={createCar.isPending || updateCar.isPending}
			/>
		</Modal>
	);
}
