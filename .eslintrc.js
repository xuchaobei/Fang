module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "globals": {
        "document": true,
        "BMap": true
    },
    "rules": {
        "react/jsx-filename-extension": ["off"],
        "prefer-template": ["off"],
        "no-trailing-spaces": 0,
        "arrow-body-style": ["error", "always"],
        "no-underscore-dangle": ["off"],
        "no-mixed-operators": ["off"]
    }
};