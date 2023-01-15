import path from "path";
import { sync } from "command-exists";
import fs from "fs-extra";
import chalk from "chalk";
import { execSync } from "child_process";

const isWindows = process.platform === "win32";
const hasCurl = sync("curl");
const hasRustUp = sync("rustup");
const hasWasmPack = sync("wasm-pack");
const useRustTag = `${chalk.bold.grey("[userust]")}:`;

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

export const build = (name) => {
  process.stdout.write(`${useRustTag} Building '${name}'... `);
  const targetPath = path.join(process.cwd(), name);
  const shortGitignorePath = `.${path.sep}${path.join(name, "pkg", ".gitignore")}`;
  const gitignorePath = path.join(process.cwd(), name, "pkg", ".gitignore");

  // Make sure dir exists
  if (!fs.existsSync(targetPath) || !fs.lstatSync(targetPath).isDirectory()) {
    console.log(chalk.red(`Cannot build '${name}' because the directory does not exist`));
    process.exit(1);
  } else {
    console.log(`\n${useRustTag} '${name}' found ${chalk.green("✓")}`);
  }

  if (hasRustUp && hasWasmPack) {
    console.log(`${useRustTag} rustup and wasm-pack detected ${chalk.green("✓")}`);
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

    process.exit(1);
  }

  // Build
  const buildCommand = `wasm-pack build --target web .${path.sep}${name}`;
  console.log(`${useRustTag} Executing ${chalk.bold(buildCommand)}...\n`);
  execSync(
    buildCommand,
    {stdio: "inherit"}
  );

  // Handle .gitignore
  console.log(`\n${useRustTag} Overwriting the default ${shortGitignorePath}`);
  fs.writeFileSync(gitignorePath, "package-lock.json\nnode_modules/");

  // Success
  console.log(`${useRustTag} '${name}' built successfully ${chalk.green("✓")}`);
};