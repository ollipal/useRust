import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { spawnSync } from "child_process";
import { toSafe, useRustConfig, useRustTag } from "./common.js";
import { hasNecessaryDeps } from "./checkDeps.js";

export const build = async (name: string) => {
  // Build
  const shortGitignorePath = `.${path.sep}${path.join(name, ".useRust", "wasm", ".gitignore")}`;
  const shortPackageJsonPath = `.${path.sep}${path.join(name, ".useRust", "wasm", "package.json")}`;

  const { typeScript, gitignoreCompiled, packageManager } = useRustConfig(name);

  const buildCommand = `wasm-pack build --target web${!typeScript ? " --no-typescript" : ""} --out-dir .${path.sep}${path.join(".useRust", "wasm")} --out-name wasm .${path.sep}${name}`;
  console.log(`${useRustTag} Executing ${chalk.bold(buildCommand)}...`);
  spawnSync(
    buildCommand,
    [],
    { shell: true, stdio: "inherit" }
  );

  if (packageManager === "npm") {
    const npmVersionPatchCommand = "npm version patch --git-tag-version false";
    const cwd = `.${path.sep}${path.join(name, ".useRust")}`;
    console.log(`${useRustTag} Executing ${chalk.bold(npmVersionPatchCommand)} at  ${cwd} (required if npm version 9+)...`);
    spawnSync(
      npmVersionPatchCommand,
      [],
      { cwd, shell: true, stdio: "inherit" }
    );

    const npmInstallCommand = `npm install .${path.sep}${path.join(name, ".useRust")}`;
    console.log(`${useRustTag} Executing ${chalk.bold(npmInstallCommand)} (required if npm version 9+)...`);
    spawnSync(
      npmInstallCommand,
      [],
      { shell: true, stdio: "inherit" }
    );
  }

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
  const targetPath = path.join(process.cwd(), name);

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