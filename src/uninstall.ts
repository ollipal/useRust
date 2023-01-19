import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { useRustTag } from "./common.js";
import inquirer from "inquirer";
import { spawnSync } from "child_process";

export const uninstall = async (name: string, { verbose, y }: {verbose: boolean, y: boolean}) => {
  if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
    console.log(`${useRustTag} package.json detected ${chalk.red("✖")}`);
    console.log("\n'userust uninstall' should be used inside an existing project");
    process.exit(1);
  } else {
    if (verbose) console.log(`${useRustTag} package.json detected ${chalk.green("✓")}`);
  }

  const targetPath = path.join(process.cwd(), name);

  const answer = y
    ? { uninstall: true }
    : await inquirer.prompt([
      {
        name: "uninstall",
        message: `Uninstall '${name}' and delete EVERYTHING from ${targetPath}?`,
        type: "confirm",
      }]);
  if (!answer["uninstall"]) {
    console.log(`${useRustTag} 'userust uninstall' skipped`);
    process.exit(0);
  }

  /* if (!fs.existsSync(targetPath)) {
    console.log(`${useRustTag} .${path.sep}${name} available ${chalk.red("✖")}`);
    console.log(`\nCannot init because '${targetPath}' already exists`);
    process.exit(1);
  } else {
    console.log(`${useRustTag} .${path.sep}${name} available ${chalk.green("✓")}`);
  } */

  // TODO read the install command from the repo

  const uninstallCommandNPM = `npm uninstall .${path.sep}${name}`;

  console.log(`${useRustTag} Executing ${chalk.bold(uninstallCommandNPM)}...`);
  spawnSync(
    uninstallCommandNPM,
    [],
    { shell: true, stdio: "inherit" }
  );

  console.log(`${useRustTag} Removing everything from .${path.sep}${name}...`);
  fs.removeSync(targetPath);
  console.log(`${useRustTag} ${name} uninstalled and removed successfully ${chalk.green("✓")}`);
  console.log(`${useRustTag} (rustup and wasm-pack were not uninstalled)`);
};