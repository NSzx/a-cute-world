import * as esbuild from "esbuild"
import fs from "fs"

const IS_PROD = process.argv.includes("-p")
const entryFilenames = fs.readdirSync("build/tsc")
                         .filter(maybeJs => maybeJs.match(/\.js$/))

await esbuild.build({
    entryPoints: entryFilenames.map(filename => "build/tsc/" + filename),
    minify: true,
    sourcemap: !IS_PROD,
    bundle: true,
    splitting: true,
    format: "esm",
    outdir: "build/esbuild",
})

