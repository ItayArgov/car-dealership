import { beforeEach } from "vitest";
import db from "~/db";

// Clean up database before each test
beforeEach(async () => {
	await db.collection("cars").deleteMany({});
});

// Create unique index once when db is first accessed
await db.collection("cars").createIndex({ sku: 1 }, { unique: true });
