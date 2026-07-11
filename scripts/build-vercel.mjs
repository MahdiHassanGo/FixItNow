import { execSync } from "node:child_process";
import { build } from "esbuild";

execSync("prisma generate", { stdio: "inherit" });

await build({
  entryPoints: ["src/vercel.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "api/index.js",
  external: ["pg-native"],
  banner: {
    js: `import { createRequire } from "node:module"; const require = createRequire(import.meta.url);`
  }
});