import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput, NumberInput, Select, Button, Stack } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
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
							required
							withAsterisk
						/>
					)}
				/>

				<Controller
					name="year"
					control={control}
					render={({ field }) => (
						<YearPickerInput
							label="Year"
							placeholder="Pick year"
							value={field.value ? new Date(field.value, 0, 1) : null}
							onChange={(date) => field.onChange(date ? date.getFullYear() : null)}
							error={errors.year?.message}
							minDate={new Date(1900, 0, 1)}
							maxDate={new Date(2100, 11, 31)}
							required
							withAsterisk
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
							required
							withAsterisk
						/>
					)}
				/>

				<Button type="submit" loading={isSubmitting} fullWidth mt="md">
					{isEdit ? "Update Car" : "Create Car"}
				</Button>
			</Stack>
		</form>
	);
}
