/** @format */

module.exports = {
    extends: [
        "react-app",
        "prettier",
    ],
    rules: {
        "no-console": "off",
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
    env: {
        "jest": true
    },
    settings: {
        "react": {
            "pragma": "React",
            "version": "16.6.0"
        },
    },
};
