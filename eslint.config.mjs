import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/*old*",
      "**/*_old*",
      "**/route_old.ts",
      "**/page_old.tsx",
      "**/page-old.tsx",
      "src/app/payments/add-payment-dialog-old.tsx",
      "src/app/subjects/page-old.tsx",
      "src/app/api/grades/route_old.ts",
      "src/app/api/registrations/route_new.ts",
      "src/app/teacher/page_old.tsx",
      "src/app/teacher/page_new.tsx"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/jsx-no-undef": "off"
    }
  }
];

export default eslintConfig;
