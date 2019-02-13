module.exports = {
	roots: [ '<rootDir>/src' ],
	transform: {
		"^.+\\.(js|jsx)$": "babel-jest",
		'^.+\\.tsx?$': 'ts-jest'
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
	transformIgnorePatterns: [],
	snapshotSerializers: ["enzyme-to-json/serializer"],
	setupTestFrameworkScriptFile: "<rootDir>/setupEnzyme.ts",
};
