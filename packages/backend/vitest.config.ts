import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		globalSetup: ["./src/test/globalSetup.ts"],
		setupFiles: ["./src/test/setup.ts"],
		pool: "forks", // Required for testcontainers
		poolOptions: {
			forks: {
				singleFork: true, // Use single fork for all tests to share container
			},
		},
		testTimeout: 60000, // Increase timeout for container startup
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
			"@dealership/common": path.resolve(__dirname, "../common/src"),
		},
	},
});
