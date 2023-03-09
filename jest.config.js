const fs = require("fs");

const fileExtensions = [
    "ts",
    "tsx",
    "mts",
    "cts",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "node",
    "json",
];

/** @type {Partial<import('@jest/types').Config.ProjectConfig>} */
const commonProjectsConfig = {
    moduleDirectories: ["node_modules"],
    moduleFileExtensions: fileExtensions,
    moduleNameMapper: fs
        .readdirSync("./src/", { withFileTypes: true })
        .reduce((map, file) => {
            if (file.isDirectory()) {
                map[`^${file.name}/(.*)$`] = `<rootDir>/src/${file.name}/$1`;
            } else if (fileExtensions.find(item => file.name.endsWith(`.${item}`))) {
                const fileName = file.name.slice(0, file.name.lastIndexOf("."));
                map[`^${fileName}$`] = `<rootDir>/src/${fileName}`;
            }
            return map;
        }, {}),
    modulePathIgnorePatterns: [
        "<rootDir>/build",
        "<rootDir>/dist",
        "<rootDir>/.husky",
        "<rootDir>/.vscode",
        "<rootDir>/coverage",
    ],
    rootDir: "./",
    roots: ["<rootDir>/", "<rootDir>/src/"],
    testEnvironment: "node",
    testPathIgnorePatterns: [".husky/", ".vscode/", "dist/", "coverage/", "node_modules/"],
    transformIgnorePatterns: [],
};

/** @type {Omit<import('@jest/types').Config.GlobalConfig, "projects"> & { projects: Array<import('@jest/types').Config.ProjectConfig> }} */
module.exports = {
    maxWorkers: 3,
    projects: [
        {
            displayName: "unit",
            testMatch: ["<rootDir>/src/**/__tests__/**/unit/**/*.(spec|test).[tj]s?(x)"],
        },
        {
            displayName: "integration",
            testMatch: [
                "<rootDir>/src/**/__tests__/**/integration/**/*.(spec|test).[tj]s?(x)",
            ],
        },
        {
            displayName: "e2e",
            testMatch: ["<rootDir>/src/**/__tests__/**/e2e/**/*.(spec|test).[tj]s?(x)"],
        },
    ].map(obj => ({ ...commonProjectsConfig, ...obj })),
    cache: false,
    forceExit: true,
    passWithNoTests: true,
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,node}",
        "!**/*.d.{ts,tsx,mts,cts}",
        "!**/*.config.*",
        "!**/node_modules/**",
        "!**/.husky/**",
        "!**/.vscode/**",
        "!**/dist/**",
        "!**/coverage/**",
        "!**/__tests__/**",
        "!**/__mocks__/**",
        "!**/index.*",
    ],
    coverageDirectory: "<rootDir>/coverage",
    verbose: true,
};
