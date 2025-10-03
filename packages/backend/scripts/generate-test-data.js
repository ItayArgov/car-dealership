import XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VALID_COLORS = ["red", "blue", "green", "yellow", "silver", "black", "white"];
const MAKES = [
	"Toyota",
	"Ford",
	"Honda",
	"Tesla",
	"BMW",
	"Mercedes",
	"Audi",
	"Chevrolet",
	"Nissan",
	"Mazda",
];
const MODELS = {
	Toyota: ["Camry", "Corolla", "RAV4", "Highlander"],
	Ford: ["Mustang", "F-150", "Explorer", "Bronco"],
	Honda: ["Civic", "Accord", "CR-V", "Pilot"],
	Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
	BMW: ["3 Series", "5 Series", "X5", "X3"],
	Mercedes: ["C-Class", "E-Class", "GLE", "GLA"],
	Audi: ["A4", "A6", "Q5", "Q7"],
	Chevrolet: ["Silverado", "Malibu", "Equinox", "Tahoe"],
	Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder"],
	Mazda: ["Mazda3", "CX-5", "Mazda6", "CX-9"],
};

// Helper to generate SKU
function generateSKU(make, model, year, color) {
	const makeCode = make.substring(0, 4).toUpperCase();
	const modelCode = model.replace(/\s+/g, "").substring(0, 3).toUpperCase();
	const colorCode = color.substring(0, 3).toUpperCase();
	return `${makeCode}-${modelCode}-${year}-${colorCode}`;
}

// Generate valid cars for insert
function generateValidInsertData(count = 20) {
	const cars = [];
	for (let i = 0; i < count; i++) {
		const make = MAKES[i % MAKES.length];
		const modelOptions = MODELS[make];
		const model = modelOptions[i % modelOptions.length];
		const year = 2015 + (i % 10); // Years from 2015-2024
		const color = VALID_COLORS[i % VALID_COLORS.length];
		const price = 20000 + i * 1000 + Math.floor(Math.random() * 5000);
		const sku = `${generateSKU(make, model, year, color)}-${String(i).padStart(3, "0")}`;

		cars.push({ sku, model, make, price, year, color });
	}
	return cars;
}

// Generate valid cars for update (same SKUs as insert, different data)
function generateValidUpdateData(insertCars) {
	return insertCars.map((car, i) => ({
		sku: car.sku, // Keep same SKU
		model: car.model, // Keep same model
		make: car.make, // Keep same make
		price: car.price + 5000, // Update price
		year: car.year, // Keep same year
		color: VALID_COLORS[(VALID_COLORS.indexOf(car.color) + 1) % VALID_COLORS.length], // Change color
	}));
}

// Generate invalid cars for insert
function generateInvalidInsertData() {
	return [
		// Missing SKU
		{ model: "Camry", make: "Toyota", price: 25000, year: 2023, color: "blue" },
		// Missing model
		{ sku: "INVA-LID-2023-RED", make: "Toyota", price: 25000, year: 2023, color: "red" },
		// Missing make
		{ sku: "INVA-LID-2023-GRE", model: "Camry", price: 25000, year: 2023, color: "green" },
		// Missing price
		{ sku: "INVA-LID-2023-YEL", model: "Camry", make: "Toyota", year: 2023, color: "yellow" },
		// Missing year
		{ sku: "INVA-LID-2023-SIL", model: "Camry", make: "Toyota", price: 25000, color: "silver" },
		// Missing color
		{ sku: "INVA-LID-2023-BLA", model: "Camry", make: "Toyota", price: 25000, year: 2023 },
		// Invalid color
		{
			sku: "INVA-LID-2023-PUR",
			model: "Camry",
			make: "Toyota",
			price: 25000,
			year: 2023,
			color: "purple",
		},
		// Negative price
		{
			sku: "INVA-LID-2023-ORA",
			model: "Camry",
			make: "Toyota",
			price: -5000,
			year: 2023,
			color: "blue",
		},
		// Invalid year (too old)
		{
			sku: "INVA-LID-1800-BLU",
			model: "Camry",
			make: "Toyota",
			price: 25000,
			year: 1800,
			color: "blue",
		},
		// Invalid year (future)
		{
			sku: "INVA-LID-2030-RED",
			model: "Camry",
			make: "Toyota",
			price: 25000,
			year: 2030,
			color: "red",
		},
		// Price as string
		{
			sku: "INVA-LID-2023-GRE",
			model: "Camry",
			make: "Toyota",
			price: "twenty-five thousand",
			year: 2023,
			color: "green",
		},
		// Year as string
		{
			sku: "INVA-LID-YEAR-YEL",
			model: "Camry",
			make: "Toyota",
			price: 25000,
			year: "twenty twenty three",
			color: "yellow",
		},
		// Empty SKU
		{ sku: "", model: "Camry", make: "Toyota", price: 25000, year: 2023, color: "silver" },
		// Empty model
		{
			sku: "INVA-LID-2023-BLA",
			model: "",
			make: "Toyota",
			price: 25000,
			year: 2023,
			color: "black",
		},
		// Empty make
		{
			sku: "INVA-LID-2023-WHT",
			model: "Camry",
			make: "",
			price: 25000,
			year: 2023,
			color: "white",
		},
		// Duplicate SKU (same as first invalid)
		{
			sku: "DUPL-ICA-2023-RED",
			model: "Accord",
			make: "Honda",
			price: 28000,
			year: 2023,
			color: "red",
		},
		{
			sku: "DUPL-ICA-2023-RED",
			model: "Civic",
			make: "Honda",
			price: 22000,
			year: 2023,
			color: "red",
		},
		// Zero price
		{
			sku: "INVA-LID-ZERO-BLU",
			model: "Camry",
			make: "Toyota",
			price: 0,
			year: 2023,
			color: "blue",
		},
		// Null values
		{
			sku: "INVA-LID-NULL-RED",
			model: null,
			make: "Toyota",
			price: 25000,
			year: 2023,
			color: "red",
		},
		// Extra invalid color
		{
			sku: "INVA-LID-PINK-GRE",
			model: "Camry",
			make: "Toyota",
			price: 25000,
			year: 2023,
			color: "pink",
		},
	];
}

// Generate invalid cars for update
function generateInvalidUpdateData(validInsertCars) {
	// Use first 10 SKUs from valid insert data for update attempts
	const skus = validInsertCars.slice(0, 10).map((car) => car.sku);

	return [
		// Invalid color
		{ sku: skus[0], model: "Camry", make: "Toyota", price: 30000, year: 2023, color: "orange" },
		// Negative price
		{ sku: skus[1], model: "Accord", make: "Honda", price: -10000, year: 2023, color: "blue" },
		// Invalid year (too old)
		{ sku: skus[2], model: "Civic", make: "Honda", price: 25000, year: 1800, color: "red" },
		// Invalid year (future)
		{ sku: skus[3], model: "Model 3", make: "Tesla", price: 45000, year: 2040, color: "white" },
		// Missing model
		{ sku: skus[4], make: "Ford", price: 35000, year: 2023, color: "black" },
		// Missing make
		{ sku: skus[5], model: "Mustang", price: 40000, year: 2023, color: "yellow" },
		// Missing price
		{ sku: skus[6], model: "F-150", make: "Ford", year: 2023, color: "silver" },
		// Missing year
		{ sku: skus[7], model: "RAV4", make: "Toyota", price: 32000, color: "green" },
		// Missing color
		{ sku: skus[8], model: "CR-V", make: "Honda", price: 29000, year: 2023 },
		// Empty model
		{ sku: skus[9], model: "", make: "Toyota", price: 27000, year: 2023, color: "blue" },
		// Price as string
		{ sku: skus[0], model: "Camry", make: "Toyota", price: "expensive", year: 2023, color: "red" },
		// Year as string
		{
			sku: skus[1],
			model: "Accord",
			make: "Honda",
			price: 28000,
			year: "two thousand twenty three",
			color: "blue",
		},
		// Invalid color name
		{ sku: skus[2], model: "Civic", make: "Honda", price: 25000, year: 2023, color: "magenta" },
		// Zero price
		{ sku: skus[3], model: "Model 3", make: "Tesla", price: 0, year: 2023, color: "white" },
		// Null values
		{ sku: skus[4], model: null, make: "Ford", price: 35000, year: 2023, color: "black" },
		// Non-existent SKU (should fail with not found error)
		{
			sku: "NONEXIST-SKU-9999-XXX",
			model: "Ghost",
			make: "Phantom",
			price: 99999,
			year: 2023,
			color: "black",
		},
	];
}

// Create Excel file
function createExcelFile(data, filename) {
	const ws = XLSX.utils.json_to_sheet(data);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Cars");

	const outputDir = join(__dirname, "..", "..", "..", "test-data");
	mkdirSync(outputDir, { recursive: true });

	const filepath = join(outputDir, filename);
	try {
		const wbout = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
		writeFileSync(filepath, wbout);
		console.log(`✓ Created ${filename}`);
	} catch (err) {
		console.error(`✗ Failed to create ${filename}:`, err.message);
	}
}

// Main execution
console.log("Generating test Excel files...\n");

// Generate 200 cars for testing pagination
const validInsertCars = generateValidInsertData(200);
const validUpdateCars = generateValidUpdateData(validInsertCars);
const invalidInsertCars = generateInvalidInsertData();
const invalidUpdateCars = generateInvalidUpdateData(validInsertCars);

createExcelFile(validInsertCars, "cars-valid-insert.xlsx");
createExcelFile(validUpdateCars, "cars-valid-update.xlsx");
createExcelFile(invalidInsertCars, "cars-invalid-insert.xlsx");
createExcelFile(invalidUpdateCars, "cars-invalid-update.xlsx");

console.log("\n✓ All test files generated in test-data/ folder");
console.log(`  - cars-valid-insert.xlsx: ${validInsertCars.length} valid cars for insertion`);
console.log(
	`  - cars-valid-update.xlsx: ${validUpdateCars.length} valid updates (same SKUs, modified data)`,
);
console.log(`  - cars-invalid-insert.xlsx: ${invalidInsertCars.length} invalid cars for insertion`);
console.log(`  - cars-invalid-update.xlsx: ${invalidUpdateCars.length} invalid update attempts`);
