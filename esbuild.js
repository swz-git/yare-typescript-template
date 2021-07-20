const fs = require("fs");
const path = require("path");
const sync = require("yare-sync");
const esbuild = require("esbuild");
const watch = require("node-watch");
const usingts = fs.existsSync(path.join(__dirname, "src/main.ts"));
const usingjs = fs.existsSync(path.join(__dirname, "src/main.js"));

require("colors");

const flags = process.argv.splice(2);

const shouldwatch = flags.includes("-w") || flags.includes("--watch");
const shouldsync = flags.includes("-s") || flags.includes("--sync");

if (!usingjs && !usingts) {
  console.log("You don't have a main file smh");
  process.exit(0);
}

let mainfile = usingjs ? "src/main.js" : "src/main.ts";

const esbuildConfig = {
  entryPoints: [mainfile],
  bundle: true,
  minify: true,
  outfile: "dist/bundle.js",
  treeShaking: true,
  target: "es2015",
};

function build() {
  let result = esbuild.buildSync(esbuildConfig);

  let code = fs.readFileSync(esbuildConfig.outfile, "utf-8");

  if (result.errors.length > 0)
    return console.error("Build failed ):".red.bold);
  else console.log("Built successfully".green.bold);

  if (!shouldsync) return;
  sync
    .updateCode(code)
    .then(() => {
      console.log("Uploaded to yare!".green.bold);
    })
    .catch((e) => {
      console.error(
        "Upload to yare failed. Do you have a yare game open with the tampermonkey userscript?\nhttps://raw.githubusercontent.com/swz-gh/yare-sync/main/dist/client.js"
          .red.bold
      );
    });
}

if (shouldwatch) {
  build();
  watch(
    path.dirname(mainfile),
    {
      recursive: true,
    },
    (_, file) => {
      console.log("File change".yellow, file);
      build();
    }
  );
} else {
  build();
}
