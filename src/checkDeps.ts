import chalk from "chalk";
import { spawnSync } from "child_process";
import { sync } from "command-exists";
import inquirer from "inquirer";
import { useRustTag } from "./common.js";


const isWindows = process.platform === "win32";
const hasCurl = sync("curl");
const hasRustUp = () => sync("rustup");
const hasWasmPack = () => sync("wasm-pack");

const tryInstallRustup = async () => {
  if (!isWindows && hasCurl) {
    console.log(`${useRustTag} rustup missing (https://rustup.rs)`);
    const answer = await inquirer.prompt([
      {
        name: "installRustup",
        message: "Install rustup?",
        type: "confirm",
      }]);
    if (answer["installRustup"]) {
      spawnSync(
        "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
        [],
        { shell: true, stdio: "inherit" }
      );
      return hasRustUp(); // might fail
    }
  }
};

const tryInstallWasmPack = async () => {
  if (!isWindows && hasCurl) {
    console.log(`${useRustTag} wasm-pack missing (https://rustwasm.github.io/wasm-pack/installer/)`);
    const answer = await inquirer.prompt([
      {
        name: "installWasmPack",
        message: "Install wasm-pack?",
        type: "confirm",
      }]);
    if (answer["installWasmPack"]) {
      spawnSync(
        "curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh",
        [],
        { shell: true, stdio: "inherit" }
      );
      return hasWasmPack(); // might fail
    }
  }
};

export const hasNecessaryDeps = async (verbose: boolean) => {
  if (!hasRustUp() && !(await tryInstallRustup())) {
    console.log(`${useRustTag} ${chalk.red("rustup not detected ✖")}`);
    console.log(`\nrustup install instructions: ${chalk.bold.cyan("https://rustup.rs")}`);
    return false;
  } else {
    if (verbose) console.log(`${useRustTag} rustup detected ${chalk.green("✓")}`);
  }

  if (!hasWasmPack() && !(await tryInstallWasmPack())) {
    console.log(`${useRustTag} ${chalk.red("wasm-pack not detected ✖")}`);
    console.log(`\nwasm-pack install instructions: ${chalk.bold.cyan("https://rustwasm.github.io/wasm-pack/installer")}`);
    return false;
  } else {
    if (verbose) console.log(`${useRustTag} wasm-pack detected ${chalk.green("✓")}`);
  }

  return true;
};