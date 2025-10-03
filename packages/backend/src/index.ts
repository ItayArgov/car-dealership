import type { Car } from "@dealership/common/models";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import db from "~/db";
import carsRoutes from "~/routes/cars.routes";

const app = new Hono().basePath("/api");

app.use("*", cors());

app.get("/message", async (c) => {
	const carCount = await db.collection<Car>("cars").countDocuments();
	return c.json({ message: `Welcome to the Car Dealership! We have ${carCount} car${carCount === 1 ? "" : "s"} in catalog` });
});

app.route("/cars", carsRoutes);

async function initializeDb() {
	// Drop old indexes if they exist
	try {
		await db.collection<Car>("cars").dropIndex("sku_1");
	} catch (error) {
		// Ignore error if index doesn't exist
	}
	try {
		await db.collection<Car>("cars").dropIndex("deletedAt_1");
	} catch (error) {
		// Ignore error if index doesn't exist
	}

	// Unique index on SKU for active cars only (allows reusing SKU after deletion)
	await db.collection<Car>("cars").createIndex(
		{ sku: 1 },
		{ unique: true, partialFilterExpression: { deletedAt: { $in: [null] } } }
	);

	// Partial index on deletedAt for efficient soft delete queries
	// Only indexes documents where deletedAt is null (active cars)
	await db.collection<Car>("cars").createIndex(
		{ deletedAt: 1 },
		{ partialFilterExpression: { deletedAt: { $in: [null] } } }
	);

	await db
		.collection<Car>("cars")
		.replaceOne(
			{ sku: "Delorean-DMC-12" },
			{ sku: "Delorean-DMC-12", model: "DMC-12", make: "Delorean", price: 100000, year: 1981, color: "silver" },
			{ upsert: true }
		);
}

await initializeDb();
serve({ fetch: app.fetch, port: 3000 }, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});
