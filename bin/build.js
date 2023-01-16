import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { spawnSync } from "child_process";
import { useRustTag } from "./common.js";
import { hasNecessaryDeps } from "./checkDeps.js";

export const build = async (name) => {
  process.stdout.write(`${useRustTag} Building '${name}'... `);
  const targetPath = path.join(process.cwd(), name, "rust");
  const shortGitignorePath = `.${path.sep}${path.join(name, "rust", "pkg", ".gitignore")}`;
  const gitignorePath = path.join(process.cwd(), name, "rust", "pkg", ".gitignore");

  // Make sure dir exists
  if (!fs.existsSync(targetPath) || !fs.lstatSync(targetPath).isDirectory()) {
    console.log(chalk.red(`✖\n\nCannot build '${name}' because the directory does not exist`));
    process.exit(1);
  } else {
    console.log(`\n${useRustTag} '${name}' found ${chalk.green("✓")}`);
  }

  if (!(await hasNecessaryDeps())) {
    process.exit(1);
  }

  // Build
  const buildCommand = `wasm-pack build --target web .${path.sep}${path.join(name, "rust")}`;
  console.log(`${useRustTag} Executing ${chalk.bold(buildCommand)}...\n`);
  spawnSync(
    buildCommand,
    [],
    { shell: true, stdio: "inherit", stdin: "inherit" }
  );

  // Handle .gitignore
  console.log(`\n${useRustTag} Overwriting the default ${shortGitignorePath}`);
  fs.writeFileSync(gitignorePath, "package-lock.json\nnode_modules/");

  // Success
  console.log(`${useRustTag} '${name}' built successfully ${chalk.green("✓")}`);
};