import { beforeEach } from "vitest";
import db from "~/db";

// Clean up database before each test
beforeEach(async () => {
	await db.collection("cars").deleteMany({});
});

// Create unique index on module import for test isolation (Note: Production uses partial index for soft deletes)
await db.collection("cars").createIndex({ sku: 1 }, { unique: true });
