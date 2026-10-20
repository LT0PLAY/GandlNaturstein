import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Das Design nutzt bewusst sichtbare Labels wie "// Anfrage" als Text.
      'react/jsx-no-comment-textnodes': 'off',
      // Bewusst: Zustand aus sessionStorage/localStorage/URL erst nach dem Mount
      // setzen (sonst Hydration-Fehler) und Menüs bei Routenwechsel schließen.
      'react-hooks/set-state-in-effect': 'off',
      // Bewusst <img>: Produkt-/Referenzbilder kommen in wechselnden Formaten aus
      // Supabase Storage und werden per CSS (object-fit, Seitenverhältnis) gesetzt;
      // next/image bräuchte feste Maße und würde Vercel-Bildoptimierung berechnen.
      '@next/next/no-img-element': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
