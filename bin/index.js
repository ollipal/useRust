#! /usr/bin/env node
import { program } from "commander";
import { init } from "./init.js";
import { checkDepsAndBuild } from "./build.js";
import { uninstall } from "./uninstall.js";
import { useRustVersion } from "./common.js";

program
  .name("userust")
  .description("Generate custom Rust hooks for React and SolidJS projects")
  .version(useRustVersion);

program
  .command("init")
  .description("generate a new useRust hook")
  .argument("<name>", "hook package name")
  .option("--no-typescript", "do not generate d.ts files")
  .option("--verbose", "log more information")
  .option("-y", "yes to everything (rustup/wasm-pack required)")
  .action(init);

program
  .command("build")
  .description("compile existing useRust hook")
  .argument("<name>", "hook package name")
  .option("--verbose", "log more information")
  .action(checkDepsAndBuild);

program
  .command("uninstall")
  .description("remove installed useRust hook")
  .argument("<name>", "hook package name")
  .option("--verbose", "log more information")
  .option("-y", "yes to everything")
  .action(uninstall);

program.parse();