import path from 'path'
import { sync } from "command-exists"
import fs from 'fs-extra'
import chalk from 'chalk';
import { execSync } from 'child_process';

const isWindows = process.platform === "win32";
const hasCurl = sync("curl")
const hasRustUp = sync("rustup")
const hasWasmPack = sync("wasm-pack")
const useRustTag = `${chalk.green("[userust]")}:`

export const build = (name) => {
  process.stdout.write(`${useRustTag} Building '${name}'... `)
  const targetPath = path.join(process.cwd(), name);
  const shortGitignorePath = `.${path.sep}${path.join(name, "pkg", ".gitignore")}`
  const gitignorePath = path.join(process.cwd(), name, "pkg", ".gitignore");

  // Make sure dir exists
  if (!fs.existsSync(targetPath) || !fs.lstatSync(targetPath).isDirectory()) {
    console.log(chalk.red(`Cannot build '${name}' because the directory does not exist`))
    process.exit(1);
  } else {
    console.log(`\n${useRustTag} '${name}' found ${chalk.green("✓")}`)
  }

  if (hasRustUp && hasWasmPack) {
    console.log(`${useRustTag} rustup and wasm-pack detected ${chalk.green("✓")}`)
  } else {
    console.log(chalk.red(`rustup or wasm-pack missing`))
    process.exit(1);
  }

  // Build
  const buildCommand = `wasm-pack build --target web .${path.sep}${name}`
  console.log(`${useRustTag} Executing ${chalk.bold(buildCommand)}...\n`)
  execSync(
    buildCommand,
    {stdio: 'inherit'}
  );

  // Handle .gitignore
  console.log(`\n${useRustTag} Overwriting the default ${shortGitignorePath}`)
  fs.writeFileSync(gitignorePath, "package-lock.json\nnode_modules/")

  // Success
  console.log(`${useRustTag} '${name}' built successfully ${chalk.green("✓")}`)
}