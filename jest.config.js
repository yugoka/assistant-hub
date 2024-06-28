module.exports = {
  preset: "ts-jest",
  transformIgnorePatterns: ["/node_modules/(?!three/examples/)"],
  transform: {
    "node_modules/three/examples/.+.(j|t)sx?$": "ts-jest",
  },
  testEnvironment: "node", // or jest-environment-jsdom
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
