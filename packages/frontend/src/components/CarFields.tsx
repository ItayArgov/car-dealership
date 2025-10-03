import { Controller, useFormContext } from "react-hook-form";
import { TextInput, NumberInput, Select } from "@mantine/core";
import { CAR_COLORS } from "@dealership/common/constants";
import type { CreateCarRequest } from "@dealership/common/types";

type CommonFieldValues = Pick<CreateCarRequest, "model" | "make" | "price" | "year" | "color">;

export function CarCommonFields({ readOnly }: { readOnly: boolean }) {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<CommonFieldValues>();

    const required = !readOnly;
    const commonFieldProps = { readOnly, variant: readOnly ? "filled" : "default" } as const;
    const colorOptions = CAR_COLORS.map((color) => ({ value: color, label: color.charAt(0).toUpperCase() + color.slice(1) }));

    return (
        <>
            <TextInput
                label="Model"
                placeholder="Enter car model"
                {...register("model")}
                error={errors.model?.message}
                required={required}
                withAsterisk={required}
                {...commonFieldProps}
            />

            <TextInput
                label="Make"
                placeholder="Enter car make"
                {...register("make")}
                error={errors.make?.message}
                required={required}
                withAsterisk={required}
                {...commonFieldProps}
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
                        hideControls
                        required={required}
                        withAsterisk={required}
                        clampBehavior="none"
                        {...commonFieldProps}
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
                        hideControls
                        required={required}
                        withAsterisk={required}
                        clampBehavior="none"
                        {...commonFieldProps}
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
                        data={colorOptions}
                        required={required}
                        withAsterisk={required}
                        {...commonFieldProps}
                    />
                )}
            />
        </>
    );
}

export function SkuCreateField({ readOnly }: { readOnly: boolean }) {
    const {
        register,
        formState: { errors },
    } = useFormContext<CreateCarRequest>();
    const commonFieldProps = { readOnly, variant: readOnly ? "filled" : "default" } as const;
    return (
        <TextInput
            label="SKU"
            placeholder="Enter unique SKU"
            {...register("sku")}
            error={errors.sku?.message}
            required
            withAsterisk
            {...commonFieldProps}
        />
    );
}
