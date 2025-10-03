import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, NumberInput, Select, Button, Stack, Group } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
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
					render={({ field }) => {
						// Convert year number to Date object for YearPickerInput
						const dateValue = field.value && typeof field.value === 'number'
							? new Date(field.value, 0, 1)
							: null;

						return (
							<YearPickerInput
								label="Year"
								placeholder="Pick year"
								value={dateValue}
								onChange={(dateString) => {
									// YearPickerInput returns string in "YYYY-MM-DD" format or null
									if (!dateString) {
										field.onChange(null);
									} else {
										// Parse year from "YYYY-MM-DD" string
										const year = new Date(dateString).getFullYear();
										field.onChange(year);
									}
								}}
								error={errors.year?.message}
								minDate={new Date(1900, 0, 1)}
								maxDate={new Date(2100, 11, 31)}
								required={!readOnly}
								withAsterisk={!readOnly}
								readOnly={readOnly}
								variant={readOnly ? "filled" : "default"}
							/>
						);
					}}
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
