import chalk from "chalk";
import { sync } from "command-exists";
import { useRustTag } from "./common.js";

const isWindows = process.platform === "win32";
const hasCurl = sync("curl");
const hasRustUp = sync("rustup");
const hasWasmPack = sync("wasm-pack");

const logRustupInstallInstructions = () => {
  if (!isWindows && hasCurl) {
    console.log("\nInstall rustup by running:");
    console.log(chalk.bold.cyan("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"));
    console.log("(more instructions: https://rustup.rs)");
  } else {
    console.log(`\nrustup install instructions: ${chalk.bold.cyan("https://rustup.rs")}`);
  }
};

const logWasmPackInstallInstructions = () => {
  if (!isWindows && hasCurl) {
    console.log("\nInstall wasm-pack by running:");
    console.log(chalk.bold.cyan("curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"));
    console.log("(more instructions: https://rustwasm.github.io/wasm-pack/installer)");
  } else {
    console.log(`\nwasm-pack install instructions: ${chalk.bold.cyan("https://rustwasm.github.io/wasm-pack/installer")}`);
  }
};

export const hasNecessaryDeps = () => {
  if (hasRustUp && hasWasmPack) {
    console.log(`${useRustTag} rustup and wasm-pack detected ${chalk.green("✓")}`);
    return true;
  } else {
    if (hasRustUp) {
      console.log(`${useRustTag} rustup detected ${chalk.green("✓")}`);
      console.log(`${useRustTag} ${chalk.red(`wasm-pack missing, cannot build '${name}'`)}`);
      logWasmPackInstallInstructions();
    } else if (hasWasmPack) {
      console.log(`${useRustTag} wasm-pack detected ${chalk.green("✓")}`);
      console.log(`${useRustTag} ${chalk.red(`rustup missing, cannot build '${name}'`)}`);
      logRustupInstallInstructions();
    } else {
      console.log(`${useRustTag} ${chalk.red(`rustup and wasm-pack missing, cannot build '${name}'`)}`);
      logRustupInstallInstructions();
      logWasmPackInstallInstructions();
    }

    return false;
  }
};