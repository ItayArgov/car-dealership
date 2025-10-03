import type { Car } from "@dealership/common/models";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import db, { client } from "~/db";
import carsRoutes from "~/routes/cars.routes";
import { NotFoundError, DuplicateError, ValidationError } from "~/utils/errors";

const app = new Hono().basePath("/api");

app.use("*", cors());

app.get("/message", async (c) => {
	const carCount = await db.collection<Car>("cars").countDocuments();
	return c.json({
		message: `Welcome to the Car Dealership! We have ${carCount} car${carCount === 1 ? "" : "s"} in catalog`,
	});
});

app.route("/cars", carsRoutes);

// Centralized error handler
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ error: err.message }, err.status);
	}

	if (err instanceof NotFoundError) {
		return c.json({ error: err.message }, 404);
	}

	if (err instanceof DuplicateError) {
		return c.json({ error: err.message }, 409);
	}

	if (err instanceof ValidationError) {
		return c.json({ error: err.message }, 400);
	}

	console.error("Unexpected error:", err);
	return c.json({ error: "Internal server error" }, 500);
});

async function initializeDb() {
	// Drop old indexes from previous schema versions (migration cleanup)
	try {
		await db.collection<Car>("cars").dropIndex("sku_1");
	} catch (error) {
		// Ignore if index doesn't exist
	}
	try {
		await db.collection<Car>("cars").dropIndex("deletedAt_1");
	} catch (error) {
		// Ignore if index doesn't exist
	}

	// Unique index on SKU for active cars only (allows reusing SKU after deletion)
	await db
		.collection<Car>("cars")
		.createIndex(
			{ sku: 1 },
			{ unique: true, partialFilterExpression: { deletedAt: { $in: [null] } } },
		);

	// Partial index for efficient queries of active cars (where deletedAt is null)
	await db
		.collection<Car>("cars")
		.createIndex({ deletedAt: 1 }, { partialFilterExpression: { deletedAt: { $in: [null] } } });

	const now = new Date();
	await db.collection<Car>("cars").replaceOne(
		{ sku: "Delorean-DMC-12" },
		{
			sku: "Delorean-DMC-12",
			model: "DMC-12",
			make: "Delorean",
			price: 100000,
			year: 1981,
			color: "silver",
			createdAt: now,
			updatedAt: now,
		},
		{ upsert: true },
	);
}

await client.connect();
await initializeDb();
serve({ fetch: app.fetch, port: 3000 }, (info) => {
	console.log(`Server is running on http://localhost:${info.port}`);
});

// Graceful shutdown
const shutdown = async (signal: NodeJS.Signals) => {
	console.log(`\nReceived ${signal}. Shutting down gracefully...`);
	try {
		await client.close();
	} catch (err) {
		console.error("Error during Mongo disconnect:", err);
	} finally {
		process.exit(0);
	}
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
