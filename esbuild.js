let fs = require("fs");
let path = require("path");
let usingts = fs.existsSync(path.join(__dirname, "src/main.ts"));
let usingjs = fs.existsSync(path.join(__dirname, "src/main.js"));

let shouldwatch = process.argv.splice(2).includes("-w");

if (!usingjs && !usingts) {
  console.log("You don't have a main file smh");
  process.exit(0);
}

let mainfile = usingjs ? "src/main.js" : "src/main.ts";

let watchoptions = shouldwatch
  ? {
      onRebuild(error, result) {
        if (error) console.error("Build failed ):");
        else console.log("Built successfully");
      },
    }
  : undefined;

require("esbuild")
  .build({
    entryPoints: [mainfile],
    bundle: true,
    minify: true,
    outfile: "dist/bundle.js",
    treeShaking: true,
    target: "es2015",
    watch: watchoptions,
  })
  .catch(() => process.exit(1));
