import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import chalk from "chalk";
import { hasNecessaryDeps } from "./checkDeps.js";
import { useRustTag } from "./common.js";
import inquirer from "inquirer";
import { build } from "./build.js";

const replaceAll = (text, wordsToReplace) => (
  Object.keys(wordsToReplace).reduce(
    (f, s) =>
      `${f}`.replace(new RegExp(s, "ig"), wordsToReplace[s]),
    text
  )
);

export const init = async (name) => {
  if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
    console.log(`${useRustTag} package.json detected ${chalk.red("✖")}`);
    console.log("\n'userust init' should be used inside an existing project");
    process.exit(1);
  } else {
    console.log(`${useRustTag} package.json detected ${chalk.green("✓")}`);
  }

  if (!(await hasNecessaryDeps())) {
    process.exit(1);
  }

  const commonPath = path.join(fileURLToPath(import.meta.url), "..", "..", "templates", "common");
  const reactPath = path.join(fileURLToPath(import.meta.url), "..", "..", "templates", "hooks", "react");
  const solidjsPath = path.join(fileURLToPath(import.meta.url), "..", "..", "templates", "hooks", "solidjs");
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(`${useRustTag} .${path.sep}${name} available ${chalk.red("✖")}`);
    console.log(`\nCannot init because '${targetPath}' already exists`);
    process.exit(1);
  } else {
    console.log(`${useRustTag} .${path.sep}${name} available ${chalk.green("✓")}`);
  }

  const answers = await inquirer.prompt([
    {
      name: "framework",
      message: "Framework?",
      type: "list",
      choices: ["React", "SolidJS"],
    },
    {
      name: "language",
      message: "Language?",
      type: "list",
      choices: ["TypeScript", "JavaScript"],
    },
    {
      name: "gitignore",
      message: ".gitignore compiled WASM and bindings?",
      type: "list",
      choices: ["Yes", "No"],
    },
    { // TODO check tool availability first
      name: "install",
      message: "Install generated package with",
      type: "list",
      choices: ["npm", "pnpm", "yarn (v1)", "yarn (v2+)", "I'll install manually later"],
    },
  ]);

  const hookPath = answers["framework"] === "React" ? reactPath : solidjsPath;

  // Copy template, and save the copied paths
  const copiedPaths = [];
  const filter = (_, dest) => {
    copiedPaths.push(dest);
    return true;
  };
  await fs.copy(commonPath, targetPath, { overwrite: false, errorOnExist: true, filter });
  await fs.copy(hookPath, targetPath, { overwrite: false, errorOnExist: true, filter });

  // Replace words from the copied template
  const wordsToReplace = {
    "__REPLACE_NAME": name,
    "__REPLACE_PKG_PATH": `.${path.sep}${path.join("rust", "pkg")}`
  };

  for (const p of copiedPaths) {
    if (fs.lstatSync(p).isDirectory()) {
      continue;
    }
    let contents = fs.readFileSync(p);
    contents = replaceAll(contents, wordsToReplace);
    fs.writeFileSync(p, contents);
  }

  console.log(`${useRustTag} .${path.sep}${name} useRust hook generated ${chalk.green("✓")}`);

  await build(name);

  const rustSource = `.${path.sep}${path.join(name, "rust", "src", "lib.rs")}`;
  const installCommandNPM = `npm install .${path.sep}${path.join(name, "react")}`;
  //const installCommandPNPM = `pnpm install .${path.sep}${path.join(name, "react")}`;
  //const installCommandYarn = `yarn add .${path.sep}${path.join(name, "react")}`;
  const buildCommand = `npx userust build ${name}`;

  console.log(`
${chalk.cyan.bold("How to use")}:
1. Install package with:  \t${chalk.bold(installCommandNPM)}
2. Build the Rust package:\t${chalk.bold(buildCommand)}
3. Use in your components:

${chalk.italic(`import useRust from '${name}'
//...
const { rust, error } = useRust()
console.log(rust?.add(1, 1))`)}

${chalk.cyan.bold("How to modify Rust code:")}:
1. Modify the source at    \t${chalk.bold(rustSource)}
2. Rebuild the package with\t${chalk.bold(buildCommand)}

More info at: https://github.com/ollipal/useRust`
  );
};