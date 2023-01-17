#! /usr/bin/env node
import { program } from "commander";
import { init } from "./init.js";
import { checkDepsAndBuild } from "./build.js";

program
  .name("userust")
  .description(`Generate WASM based Rust hooks for React and SolidJS
Start bu running 'npx userust init <name>' inside your project
More info: https://github.com/ollipal/useRust
`)
  .version(process.env.npm_package_version);

program
  .command("init")
  .description("generate a new useRust hook")
  .argument("<name>", "Rust package name")
  .action(init);

program
  .command("build")
  .description("compile existing useRust hook")
  .argument("<name>", "Rust package name")
  .action(checkDepsAndBuild);

program.parse();