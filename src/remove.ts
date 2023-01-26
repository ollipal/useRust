import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { toSafe, useRustConfig, useRustTag } from "./common.js";
import inquirer from "inquirer";
import { spawnSync } from "child_process";

export const remove = async (name: string, { verbose, y }: {verbose: boolean, y: boolean}) => {
  name = toSafe(name);
  if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
    console.log(`${useRustTag} package.json detected ${chalk.red("✖")}`);
    console.log("\n'userust remove' should be used inside an existing project");
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

  const uninstallCommands : {[key:string]: string} = {
    "npm": `npm uninstall ${name}`,
    "pnpm": `pnpm uninstall ${name}`,
    "yarn": `yarn remove ${name}`,
  };

  const uninstallCommand = uninstallCommands[useRustConfig(name).packageManager];

  console.log(`${useRustTag} Executing ${chalk.bold(uninstallCommand)}...`);
  spawnSync(
    uninstallCommand,
    [],
    { shell: true, stdio: "inherit" }
  );

  console.log(`${useRustTag} Removing everything from .${path.sep}${name}...`);
  fs.removeSync(targetPath);
  console.log(`${useRustTag} ${name} uninstalled and removed successfully ${chalk.green("✓")}`);
  console.log(`${useRustTag} (rustup and wasm-pack were not uninstalled)`);
};