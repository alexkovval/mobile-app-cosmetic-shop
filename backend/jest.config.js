/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  // Integration suites (orders.duplicate, cart.stock) share ONE real Postgres
  // database and each wipes every table in beforeAll (see tests/setup.ts).
  // Jest's default is to run test FILES in parallel worker processes, which
  // would let one suite's reset wipe rows another suite is mid-test with —
  // forcing them onto a single worker keeps that reset-then-seed sequence
  // safe. pricing.test.ts is a pure unit test and pays only a small,
  // fixed serialization cost for this.
  maxWorkers: 1,
};
