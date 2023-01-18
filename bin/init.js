import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import chalk from "chalk";
import { hasNecessaryDeps } from "./checkDeps.js";
import { useRustTag, useRustVersion } from "./common.js";
import inquirer from "inquirer";
import { build } from "./build.js";
import { spawnSync } from "child_process";

const replaceAll = (text, wordsToReplace) => (
  Object.keys(wordsToReplace).reduce(
    (f, s) =>
      `${f}`.replace(new RegExp(s, "ig"), wordsToReplace[s]),
    text
  )
);

const detectFramework = (packageJsonPath) => {
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8"); // Should exist, already checked
  
  const wordCount = (word) => {
    return packageJsonContent.split(word).length - 1;
  };
  
  return wordCount("react") > wordCount("solid-js")
    ? "React"
    : "SolidJS"
  ;
};

const filePath = (filename) => path.join(process.cwd(), filename);

const detectPackageManager = () => {
  if (fs.existsSync(filePath("package-lock.json"))) {
    return "npm";
  }

  if (fs.existsSync(filePath("pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(filePath("yarn.lock"))) {
    return "yarn (v2+)"; // Version not detected
  }

  // Default
  return "npm";
};


export const init = async (name, { typescript, verbose, y }) => {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`${useRustTag} package.json detected ${chalk.red("✖")}`);
    console.log("\n'userust init' should be used inside an existing project");
    process.exit(1);
  } else {
    if (verbose) console.log(`${useRustTag} package.json detected ${chalk.green("✓")}`);
  }

  if (!(await hasNecessaryDeps(verbose))) {
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
    if (verbose) console.log(`${useRustTag} .${path.sep}${name} available ${chalk.green("✓")}`);
  }

  const answers = y
    ? {
      framework: detectFramework(packageJsonPath),
      gitignoreCompiled: "Yes",
      packageManager: detectPackageManager(),
    }
    : await inquirer.prompt([
      {
        name: "framework",
        message: "Framework?",
        type: "list",
        choices: ["React", "SolidJS"],
        default: detectFramework(packageJsonPath),
      },
      {
        name: "gitignoreCompiled",
        message: ".gitignore compiled WASM and bindings?",
        type: "list",
        choices: ["Yes", "No"],
      },
      { // TODO check tool availability first
        name: "packageManager",
        message: "Install generated package with",
        type: "list",
        choices: ["npm", "pnpm", "yarn (v2+)", "I'll install manually later"],
        default: detectPackageManager(),
      },
    ]);

  const hookPath = answers["framework"] === "React" ? reactPath : solidjsPath;

  // Copy template, and save the copied paths
  const copiedPaths = [];
  const filter = (_, dest) => {
    if (!typescript && dest.endsWith(".ts")) {
      return false;
    }
    copiedPaths.push(dest);
    return true;
  };
  await fs.copy(commonPath, targetPath, { overwrite: false, errorOnExist: true, filter });
  await fs.copy(hookPath, targetPath, { overwrite: false, errorOnExist: true, filter });

  const useRustConfig = {useRustVersion, typeScript: typescript, ...answers};
  if (useRustConfig["packageManager"] == "I'll install manually later") {
    useRustConfig["packageManager"] = "manual";
  }
  fs.writeFileSync(path.join(targetPath, "useRustConfig.json"), JSON.stringify(useRustConfig, null, 2));

  // Replace words from the copied template
  const wordsToReplace = {
    "template_name": name,
    "template_pkg_path": `.${path.sep}${path.join("rust", "pkg")}`
  };

  for (const p of copiedPaths) {
    if (fs.lstatSync(p).isDirectory()) {
      continue;
    }
    let contents = fs.readFileSync(p, "utf8");
    contents = replaceAll(contents, wordsToReplace);
    fs.writeFileSync(p, contents);
  }

  if (verbose) console.log(`${useRustTag} .${path.sep}${name} useRust hook generated ${chalk.green("✓")}`);

  await build(name);

  const rustSource = `.${path.sep}${path.join(name, "rust", "src", "lib.rs")}`;
  const installCommandNPM = `npm install .${path.sep}${name}`;
  //const installCommandPNPM = `pnpm install .${path.sep}${path.join(name, "react")}`;
  //const installCommandYarn = `yarn add .${path.sep}${path.join(name, "react")}`;
  const buildCommand = `npx userust build ${name}`;

  console.log(`${useRustTag} Executing ${chalk.bold(installCommandNPM)}...`);
  spawnSync(
    installCommandNPM,
    [],
    { shell: true, stdio: "inherit" }
  );
  console.log(`${useRustTag} .${path.sep}${name} useRust hook initialized succesfully ${chalk.green("✓")}`);


  // TODO show install command if skipped
  console.log(`
${chalk.cyan.bold("How to use")}:
import useRust from '${name}'

const Calculator = () => {
  const { rust, error } = useRust()

  if (error) return <div>failed to load</div>
  if (!rust) return <div>loading...</div>
  return <div>1+1={rust.add(1,1)}!</div>
}

${chalk.cyan.bold("How to modify Rust:")}:
1. Make changes at       \t${chalk.bold(rustSource)}
2. Rebuild the hook with \t${chalk.bold(buildCommand)}

More info at: https://github.com/ollipal/useRust`
  );
};