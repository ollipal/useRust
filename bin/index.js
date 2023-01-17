#! /usr/bin/env node
import { program } from "commander";
import { init } from "./init.js";
import { checkDepsAndBuild } from "./build.js";

program
  .name("userust")
  .description("Generate custom Rust hooks for React and SolidJS projects")
  .version(process.env.npm_package_version);

program
  .command("init")
  .description("generate a new useRust hook")
  .argument("<name>", "hook package name")
  .option("--no-typescript", "do not generate d.ts files")
  .option("--verbose", "log more information")
  .action(init);

program
  .command("build")
  .description("compile existing useRust hook")
  .argument("<name>", "hook package name")
  .option("--verbose", "log more information")
  .action(checkDepsAndBuild);

program.parse();