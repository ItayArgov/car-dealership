import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, Button, Stack, Group } from "@mantine/core";
import { createCarSchema, updateCarDataSchema } from "@dealership/common/schemas";
import type { Car } from "@dealership/common/models";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";
import { CarCommonFields, SkuCreateField } from "./CarFields";

interface CreateCarFormProps {
	onSubmit: (data: CreateCarRequest) => void | Promise<void>;
	onCancel?: () => void;
	isSubmitting?: boolean;
	readOnly?: boolean;
}

export function CreateCarForm({
	onSubmit,
	onCancel,
	isSubmitting = false,
	readOnly = false,
}: CreateCarFormProps) {
	const methods = useForm<CreateCarRequest>({
		resolver: zodResolver(createCarSchema),
		defaultValues: {},
	});
	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<Stack>
					<SkuCreateField readOnly={readOnly} />
					<CarCommonFields readOnly={readOnly} />
					{!readOnly && (
						<Group justify="flex-end" mt="xl">
							{onCancel && (
								<Button variant="default" onClick={onCancel} disabled={isSubmitting}>
									Cancel
								</Button>
							)}
							<Button type="submit" loading={isSubmitting}>
								Create Car
							</Button>
						</Group>
					)}
				</Stack>
			</form>
		</FormProvider>
	);
}

interface EditCarFormProps {
	car: Car;
	onSubmit: (data: UpdateCarRequest) => void | Promise<void>;
	onCancel?: () => void;
	isSubmitting?: boolean;
	readOnly?: boolean;
}

export function EditCarForm({
	car,
	onSubmit,
	onCancel,
	isSubmitting = false,
	readOnly = false,
}: EditCarFormProps) {
	const { sku, ...defaults } = car;

	const methods = useForm<UpdateCarRequest>({
		resolver: zodResolver(updateCarDataSchema),
		defaultValues: defaults,
	});
	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<Stack>
					<TextInput
						label="SKU"
						value={sku}
						readOnly
						variant={readOnly ? "filled" : "default"}
						styles={{ input: { cursor: readOnly ? "default" : "not-allowed" } }}
					/>
					<CarCommonFields readOnly={readOnly} />
					{!readOnly && (
						<Group justify="flex-end" mt="xl">
							{onCancel && (
								<Button variant="default" onClick={onCancel} disabled={isSubmitting}>
									Cancel
								</Button>
							)}
							<Button type="submit" loading={isSubmitting}>
								Save Changes
							</Button>
						</Group>
					)}
				</Stack>
			</form>
		</FormProvider>
	);
}
