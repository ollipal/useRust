#! /usr/bin/env node
import { program } from 'commander'
import { init } from "./init.js"

const build = (name) => {
  console.log("hello" + name)
}

program
  .name('userust')
  .description('Generate WASM based Rust hooks for React and SolidJS')
  .version(process.env.npm_package_version);

program
  .command('init')
  .description('generate a new useRust hook')
  .argument('<name>', 'Rust package name')
  //.option('--react', 'Generate a useRust hook for React only')
  //.option('--solidjs', 'Generate a useRust hook for SolidJS only')
  .action(init)

program
  .command('build')
  .description('compile existing useRust hook')
  .argument('<name>', 'Rust package name')
  .action(build)

program.parse()