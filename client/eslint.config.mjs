import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Disable unused-vars rule
      '@typescript-eslint/no-explicit-any': 'off', // Disable explicit-any rule
      '@typescript-eslint/no-empty-interface': 'off', // Disable empty interface rule
      '@typescript-eslint/no-wrapper-object-types': 'off', // Disable wrapper object types rule
      "react-hooks/rules-of-hooks": "off",
    },
  },
];

export const ignores = [
  "/client/src/app/api/auth/[...nextauth]/route.ts",
  "/server/build/index.js",
  "/build",
  "/dist",
];

export default eslintConfig;

