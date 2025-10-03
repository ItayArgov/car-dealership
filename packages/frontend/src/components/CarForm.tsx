import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, NumberInput, Select, Button, Stack, Group } from "@mantine/core";
import { CreateCarSchema, UpdateCarDataSchema } from "@dealership/common/schemas";
import { CAR_COLORS } from "@dealership/common/constants";
import type { Car } from "@dealership/common/models";
import type { CreateCarRequest, UpdateCarRequest } from "@dealership/common/types";

interface CarFormProps {
	car?: Car;
	onSubmit: (data: CreateCarRequest | UpdateCarRequest) => void | Promise<void>;
	onCancel?: () => void;
	isSubmitting?: boolean;
	readOnly?: boolean;
}

export function CarForm({ car, onSubmit, onCancel, isSubmitting, readOnly = false }: CarFormProps) {
	const isEdit = !!car;
	const schema = isEdit ? UpdateCarDataSchema : CreateCarSchema;

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: car || {},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack>
				{isEdit && (
					<TextInput
						label="SKU"
						value={car.sku}
						readOnly
						variant={readOnly ? "filled" : "default"}
						styles={{ input: { cursor: readOnly ? "default" : "not-allowed" } }}
					/>
				)}

				{!isEdit && (
					<TextInput
						label="SKU"
						placeholder="Enter unique SKU"
						{...register("sku")}
						error={errors.sku?.message}
						required
						withAsterisk
						readOnly={readOnly}
						variant={readOnly ? "filled" : "default"}
					/>
				)}

				<TextInput
					label="Model"
					placeholder="Enter car model"
					{...register("model")}
					error={errors.model?.message}
					required={!readOnly}
					withAsterisk={!readOnly}
					readOnly={readOnly}
					variant={readOnly ? "filled" : "default"}
				/>

				<TextInput
					label="Make"
					placeholder="Enter car make"
					{...register("make")}
					error={errors.make?.message}
					required={!readOnly}
					withAsterisk={!readOnly}
					readOnly={readOnly}
					variant={readOnly ? "filled" : "default"}
				/>

				<Controller
					name="price"
					control={control}
					render={({ field }) => (
						<NumberInput
							label="Price"
							placeholder="Enter price"
							{...field}
							onChange={(value) => field.onChange(value)}
							error={errors.price?.message}
							prefix="$"
							thousandSeparator=","
							min={0}
							hideControls
							required={!readOnly}
							withAsterisk={!readOnly}
							readOnly={readOnly}
							variant={readOnly ? "filled" : "default"}
						/>
					)}
				/>

				<Controller
					name="year"
					control={control}
					render={({ field }) => (
						<NumberInput
							label="Year"
							placeholder="Enter year"
							{...field}
							onChange={(value) => field.onChange(value)}
							error={errors.year?.message}
							min={1900}
							max={2100}
							hideControls
							required={!readOnly}
							withAsterisk={!readOnly}
							readOnly={readOnly}
							variant={readOnly ? "filled" : "default"}
						/>
					)}
				/>

				<Controller
					name="color"
					control={control}
					render={({ field }) => (
						<Select
							label="Color"
							placeholder="Select color"
							{...field}
							error={errors.color?.message}
							data={CAR_COLORS.map((color) => ({
								value: color,
								label: color.charAt(0).toUpperCase() + color.slice(1),
							}))}
							required={!readOnly}
							withAsterisk={!readOnly}
							readOnly={readOnly}
							variant={readOnly ? "filled" : "default"}
						/>
					)}
				/>

				{!readOnly && (
					<Group justify="flex-end" mt="xl">
						{onCancel && (
							<Button variant="default" onClick={onCancel} disabled={isSubmitting}>
								Cancel
							</Button>
						)}
						<Button type="submit" loading={isSubmitting}>
							{isEdit ? "Save Changes" : "Create Car"}
						</Button>
					</Group>
				)}
			</Stack>
		</form>
	);
}
