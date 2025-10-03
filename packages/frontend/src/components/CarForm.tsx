import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, NumberInput, Select, Button, Stack } from "@mantine/core";
import { CreateCarSchema, UpdateCarDataSchema } from "@dealership/common/schemas";
import { CAR_COLORS } from "@dealership/common/constants";
import type { Car } from "@dealership/common/models";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";

interface CarFormProps {
	car?: Car;
	onSubmit: (data: CreateCarRequest | UpdateCarRequest) => void | Promise<void>;
	isSubmitting?: boolean;
}

export function CarForm({ car, onSubmit, isSubmitting }: CarFormProps) {
	const isEdit = !!car;
	const schema = isEdit ? UpdateCarDataSchema : CreateCarSchema;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: car || {},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack>
				{!isEdit && (
					<TextInput
						label="SKU"
						placeholder="Enter unique SKU"
						{...register("sku")}
						error={errors.sku?.message}
						required
						withAsterisk
					/>
				)}

				<TextInput
					label="Model"
					placeholder="Enter car model"
					{...register("model")}
					error={errors.model?.message}
					required
					withAsterisk
				/>

				<TextInput
					label="Make"
					placeholder="Enter car make"
					{...register("make")}
					error={errors.make?.message}
					required
					withAsterisk
				/>

				<NumberInput
					label="Price"
					placeholder="Enter price"
					{...register("price", { valueAsNumber: true })}
					error={errors.price?.message}
					prefix="$"
					thousandSeparator=","
					min={0}
					required
					withAsterisk
				/>

				<NumberInput
					label="Year"
					placeholder="Enter year"
					{...register("year", { valueAsNumber: true })}
					error={errors.year?.message}
					min={1900}
					max={2100}
					required
					withAsterisk
				/>

				<Select
					label="Color"
					placeholder="Select color"
					{...register("color")}
					error={errors.color?.message}
					data={CAR_COLORS.map((color) => ({
						value: color,
						label: color.charAt(0).toUpperCase() + color.slice(1),
					}))}
					required
					withAsterisk
				/>

				<Button type="submit" loading={isSubmitting} fullWidth mt="md">
					{isEdit ? "Update Car" : "Create Car"}
				</Button>
			</Stack>
		</form>
	);
}
