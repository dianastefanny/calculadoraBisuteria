/** @type {import('tailwindcss').Config} */
const AppColors = require("./src/constants/app-colors.js");

function toKebabCase(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

const brand = Object.fromEntries(
  Object.entries(AppColors).map(([key, value]) => [toKebabCase(key), value]),
);

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { brand },
    },
  },
  plugins: [],
};
