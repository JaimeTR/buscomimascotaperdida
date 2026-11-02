import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".worktrees/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Las imágenes vienen de Supabase Storage, URLs externas y previews blob: del navegador;
    // next/image no aplica sin lista cerrada de hosts. Se mantiene <img> con alt y loading.
    rules: { "@next/next/no-img-element": "off" },
  },
]);

export default eslintConfig;
