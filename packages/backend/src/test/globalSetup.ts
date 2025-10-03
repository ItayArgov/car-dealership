import { MongoDBContainer } from "@testcontainers/mongodb";

let container: any;

export async function setup() {
	console.log("Starting MongoDB testcontainer...");

	// Start container
	container = await new MongoDBContainer("mongo:6.0").start();

	// Get connection string and add directConnection parameter
	const connectionString = `${container.getConnectionString()}?directConnection=true`;

	// Set environment variable BEFORE any application code loads
	process.env.MONGO_URL = connectionString;

	console.log("MongoDB testcontainer started at:", connectionString);

	// Return teardown function
	return async () => {
		console.log("Stopping MongoDB testcontainer...");
		await container?.stop();
		delete process.env.MONGO_URL;
		console.log("MongoDB testcontainer stopped");
	};
}
