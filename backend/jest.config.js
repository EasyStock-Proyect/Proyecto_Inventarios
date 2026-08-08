module.exports = {
    testEnvironment: "node",

    setupFiles: [
        "<rootDir>/tests/setup.js"
    ],

    testMatch: [
        "**/tests/**/*.test.js"
    ],

    collectCoverage: true,

    collectCoverageFrom: [
        "src/routes/**/*.js",
        "src/controllers/**/*.js",
        "src/services/**/*.js"
    ],

    coverageDirectory: "coverage",

    coverageReporters: [
        "text",
        "text-summary",
        "lcov"
    ],

    clearMocks: true,

    forceExit: true
};