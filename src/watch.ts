import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { toSafe, useRustTag, useRustVersion } from "./common.js";
import { hasNecessaryDeps } from "./checkDeps.js";
import { spawnSync } from "child_process";
import { sync } from "command-exists";
import inquirer from "inquirer";
import { fileURLToPath } from "url";

const hasCargoWatch = () => sync("cargo-watch");

const tryInstallCargoWatch = async () => {
  console.log(`${useRustTag} cargo-watch missing (https://github.com/watchexec/cargo-watch)`);
  const answer = await inquirer.prompt([
    {
      name: "installCargoWatch",
      message: "Install cargo-watch?",
      type: "confirm",
    }]);
  if (answer["installCargoWatch"]) {
    spawnSync(
      "cargo install cargo-watch",
      [],
      { shell: true, stdio: "inherit" }
    );
    return hasCargoWatch(); // might fail
  }
  return false;
};

export const checkCargoWatch = async (verbose: boolean) => {
  if (!hasCargoWatch() && !(await tryInstallCargoWatch())) {
    console.log(`${useRustTag} ${chalk.red("cargo-watch not detected ✕")}`);
    console.log(`\ncargo-watch install instructions: ${chalk.bold.cyan("https://github.com/watchexec/cargo-watch")}`);
    return false;
  } else {
    if (verbose) console.log(`${useRustTag} cargo-watch detected ${chalk.green("✓")}`);
    return true;
  }
};

export const watch = async (name: string, { verbose, clear, poll, gitignore }: { verbose: boolean, clear: boolean, poll: boolean, gitignore: boolean}) => {
  name = toSafe(name);
  const targetPath = path.join(process.cwd(), name, "rust");

  // Make sure dir exists
  if (!fs.existsSync(targetPath) || !fs.lstatSync(targetPath).isDirectory()) {
    console.log(chalk.red(`Cannot watch '${name}' because the directory does not exist`));
    console.log(`Maybe call 'userust init ${name}' first?`);
    process.exit(1);
  } else {
    if (verbose) console.log(`${useRustTag} '${name}' found ${chalk.green("✓")}`);
  }

  // Make sure has rustup and wasm-pack
  if (!(await hasNecessaryDeps(verbose) && await checkCargoWatch(verbose))) {
    process.exit(1);
  }

  const watchCommand = `cargo watch${clear ? " --clear" : ""}${poll ? " --poll" : ""}${gitignore ? "" : " --no-gitignore"} --watch "${targetPath}" --workdir "${process.cwd()}" --shell "node ${path.join(fileURLToPath(import.meta.url), "..", "index.js")} build ${name}"`;

  console.log(`${useRustTag} Executing ${chalk.bold(watchCommand)}`);
  spawnSync(
    watchCommand,
    [],
    { cwd: targetPath, shell: true, stdio: "inherit" }
  );
};