const fs = require("fs");
const os = require("os");
const path = require("path");
const sync = require("yare-sync");
const esbuild = require("esbuild");
const watch = require("node-watch");

require("colors");

function input() {
  return new Promise((r) => {
    process.stdin.once("data", (d) => {
      r(d);
    });
  });
}

const flags = process.argv.splice(2);

const shouldwatch = flags.includes("-w") || flags.includes("--watch");
const shouldsync = flags.includes("-s") || flags.includes("--sync");
const switchacc = flags.includes("-a") || flags.includes("--switch-acc");
const nominify = flags.includes("-nm") || flags.includes("--no-minify");
const custommain = // sorry for ugly code, this is so terrible
  (
    flags.find((arg) => {
      return (arg.match(/(?<=--main=).+/) ?? [])[0] ?? false;
    }) ?? ""
  ).replace("--main=", "") || false;

// const usingts = fs.existsSync(path.join(__dirname, "src/main.ts"));
const usingjs = fs.existsSync(path.join(__dirname, "src/main.js"));

let mainfile = usingjs ? "src/main.js" : "src/main.ts";

custommain && (mainfile = custommain);

if (!fs.existsSync(mainfile)) {
  console.log("You don't have a main file".red.underline);
  process.exit(0);
}

const esbuildConfig = {
  entryPoints: [mainfile],
  bundle: true,
  minify: !nominify,
  outfile: "dist/bundle.js",
  treeShaking: true,
  target: "es2015",
};

let acc = null;

async function build() {
  let result = esbuild.buildSync(esbuildConfig);

  let code = fs.readFileSync(esbuildConfig.outfile, "utf-8");

  if (result.errors.length > 0)
    return console.error("Build failed ):".red.bold);
  else console.log("Built successfully".green.bold);

  if (!shouldsync) return;
  let games = await sync.getGames(acc.user_id);
  let successful = await sync.sendCode(code, games, acc);
  if (successful) {
    console.log(
      "Uploaded your code to these games:".green.bold,
      games.map((g) => (g ? `${g.server}/${g.id}` : g))
    );
  } else {
    console.error("Upload to yare failed.".red.bold);
  }
}
function login() {
  return new Promise(async (resolve) => {
    console.log("Log in to yare to enable yare-sync".bold);
    console.log("Username:");
    let username = ((await input()) + "").split("\n")[0].split("\r")[0];
    console.log("Password (SHOWN):");
    let password = ((await input()) + "").split("\n")[0].split("\r")[0];
    console.log("Trying to log in as".yellow, username);
    let acc = sync.login(username, password).catch(async (e) => {
      console.log("Invalid username or password, try again".red.bold);
      resolve(await login());
    });
    if (acc) resolve(acc);
  });
}

async function main() {
  if (shouldsync) {
    let savedSessionFilePath = path.join(
      os.tmpdir(),
      "yare-sync-last-session.json"
    );
    if (fs.existsSync(savedSessionFilePath) && !switchacc) {
      let savedSessionFile = JSON.parse(
        fs.readFileSync(savedSessionFilePath, "utf-8")
      );
      console.log("Found previous session".blue);
      if (sync.verifySession(savedSessionFile)) {
        console.log("Session was valid! Using that".green);
        acc = savedSessionFile;
      } else {
        console.log("Invalid session".red);
      }
    }
    if (acc === null) {
      acc = await login();
    }
    console.log("Logged in as".green.bold, acc.user_id, "\n");
    fs.writeFileSync(savedSessionFilePath, JSON.stringify(acc), "utf-8");
  }

  if (shouldwatch) {
    await build();
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
    await build();
  }
}

main();
