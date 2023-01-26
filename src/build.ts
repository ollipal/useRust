import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { spawnSync } from "child_process";
import { toSafe, useRustConfig, useRustTag } from "./common.js";
import { hasNecessaryDeps } from "./checkDeps.js";

export const build = async (name: string) => {
  // Build
  const shortGitignorePath = `.${path.sep}${path.join(name, "wasm", ".gitignore")}`;
  const shortPackageJsonPath = `.${path.sep}${path.join(name, "wasm", "package.json")}`;

  const { typeScript, gitignoreCompiled } = useRustConfig(name);

  const buildCommand = `wasm-pack build --target web${!typeScript ? " --no-typescript" : ""} --out-dir ..${path.sep}${"wasm"} --out-name wasm .${path.sep}${path.join(name, "rust")}`;
  console.log(`${useRustTag} Executing ${chalk.bold(buildCommand)}...`);
  spawnSync(
    buildCommand,
    [],
    { shell: true, stdio: "inherit" }
  );

  // Handle .gitignore
  if (gitignoreCompiled) {
    console.log(`${useRustTag} Keeping the default ${shortGitignorePath} with '*'`);
  } else {
    console.log(`${useRustTag} removing unnecessary ${shortGitignorePath}...'`);
    fs.unlinkSync(shortGitignorePath);
  }

  console.log(`${useRustTag} removing unnecessary ${shortPackageJsonPath}...`);
  fs.unlinkSync(shortPackageJsonPath);

  // Success
  //console.log(chalk.green(`'${name}' built successfully ${chalk.green("✓")}`));
};

export const checkDepsAndBuild = async (name: string, { verbose }: { verbose: boolean}) => {
  name = toSafe(name);
  const targetPath = path.join(process.cwd(), name, "rust");

  // Make sure dir exists
  if (!fs.existsSync(targetPath) || !fs.lstatSync(targetPath).isDirectory()) {
    console.log(chalk.red(`Cannot build '${name}' because the directory does not exist`));
    console.log(`Maybe call 'userust init ${name}' first?`);
    process.exit(1);
  } else {
    console.log(`\n${useRustTag} '${name}' found ${chalk.green("✓")}`);
  }

  // Make sure has rustup and wasm-pack
  if (!(await hasNecessaryDeps(verbose))) {
    process.exit(1);
  }

  await build(name);
};