import { build } from "bun";

build({
    entrypoints: ["src/index.ts"],
    minify: true,
    outdir: "dist"
})