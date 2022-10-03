// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.31.0/mod.ts";

const packageJson = Deno.readTextFileSync(new URL(import.meta.resolve('../package.json')))
await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: JSON.parse(packageJson)
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
