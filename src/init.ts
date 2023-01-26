import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import chalk from "chalk";
import { hasNecessaryDeps } from "./checkDeps.js";
import { toSafe, useRustTag, useRustVersion } from "./common.js";
import inquirer from "inquirer";
import { build } from "./build.js";
import { spawnSync } from "child_process";
import { sync } from "command-exists";

const replaceAll = (text: string, wordsToReplace: {[key:string]: string}) => (
  Object.keys(wordsToReplace).reduce(
    (f, s) =>
      `${f}`.replace(new RegExp(s, "ig"), wordsToReplace[s]),
    text
  )
);

const detectFramework = (packageJsonPath: string, verbose: boolean) => {
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8"); // Should exist, already checked
  
  const wordCount = (word: string) => {
    return packageJsonContent.split(word).length - 1;
  };

  const framework = wordCount("react") > wordCount("solid-js")
    ? "React"
    : "SolidJS"
  ;

  if (verbose) console.log(`${useRustTag} ${framework} detected ${chalk.green("✓")}`);
  return framework;
};

const filePath = (filename: string) => path.join(process.cwd(), filename);

const yarnOverV2 = () => {
  const ver = spawnSync(
    "yarn --version",
    [],
    { shell: true, encoding: "utf-8" }
  ).stdout;
  const over = Number(ver.split(".")[0]) > 1;
  if (!over) {
    console.log(`${useRustTag} ${chalk.red(`yarn version needs to be over 2 (version ${ver.trim()} detected)`)}`);
    console.log(`${useRustTag} Migration guide: https://yarnpkg.com/getting-started/migration`);
  }
  return over;
};

const detectPackageManager = (verbose: boolean) => {
  if (fs.existsSync(filePath("package-lock.json")) && sync("npm")) {
    if (verbose) console.log(`${useRustTag} npm detected ${chalk.green("✓")}`);
    return "npm";
  }

  if (fs.existsSync(filePath("pnpm-lock.yaml")) && sync("pnpm")) {
    if (verbose) console.log(`${useRustTag} pnpm detected ${chalk.green("✓")}`);
    return "pnpm";
  }

  if (fs.existsSync(filePath("yarn.lock")) && sync("yarn")) {
    if (verbose) console.log(`${useRustTag} yarn detected ${chalk.green("✓")}`);
    
    if (!yarnOverV2()) {
      return undefined;
    }
    return "yarn"; // Version not detected
  }

  // Default
  if (verbose) console.log(`${useRustTag} defaulting to npm`);
  return "npm";
};


export const init = async (name: string, { typescript, verbose, y }: {typescript: boolean, verbose: boolean, y: boolean}) => {
  name = toSafe(name);
  console.log(`${useRustTag} Analyzing the current directory...`);
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`${useRustTag} package.json not detected ${chalk.red("✖")}`);
    console.log(`${chalk.red("\n'userust init' should be used inside an existing project")}`);
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
    console.log(`${useRustTag} .${path.sep}${name} not available ${chalk.red("✖")}`);
    console.log(`${chalk.red(`\nCannot init because '${targetPath}' already exists`)}`);
    process.exit(1);
  } else {
    if (verbose) console.log(`${useRustTag} .${path.sep}${name} available ${chalk.green("✓")}`);
  }

  const defaultFramework = detectFramework(packageJsonPath, verbose);
  const defaultPackageManger = detectPackageManager(verbose);

  if (defaultPackageManger === undefined) {
    process.exit(1);
  }

  const { defaults } = y
    ? { defaults: true }
    : await inquirer.prompt([
      {
        name: "defaults",
        message: `Initialize a ${chalk.cyan(defaultFramework)} useRust hook and install it with ${chalk.cyan(defaultPackageManger)}?`,
        type: "confirm",
      }]);


  if (!defaults) {
    console.log("Choosing the framework and package manager manually...");
  }
      

  const frameworkAndPackageManager = defaults
    ? {
      framework: defaultFramework,
      packageManager: defaultPackageManger,
    }
    : await inquirer.prompt([
      {
        name: "framework",
        message: "Framework?",
        type: "list",
        choices: ["React", "SolidJS"],
        default: defaultFramework,
      },
      { // TODO check tool availability first
        name: "packageManager",
        message: "Install generated package with",
        type: "list",
        choices: ["npm", "pnpm", "yarn"],
        default: defaultPackageManger,
      },
    ]);

  const { gitignoreCompiled } = y
    ? { gitignoreCompiled: true }
    : await inquirer.prompt([
      {
        name: "gitignoreCompiled",
        message: ".gitignore compiled Wasm and bindings?",
        type: "list",
        choices: ["Yes", "No"],
      },
    ]);

  const hookPath = frameworkAndPackageManager["framework"] === "React" ? reactPath : solidjsPath;

  console.log(`${useRustTag} Initializing .${path.sep}${name}...`);
  // Copy template, and save the copied paths
  const copiedPaths: string[] = [];
  const filter = (_: string, dest: string) => {
    if (!typescript && dest.endsWith(".ts")) {
      return false;
    }
    copiedPaths.push(dest);
    return true;
  };
  await fs.copy(commonPath, targetPath, { overwrite: false, errorOnExist: true, filter });
  await fs.copy(hookPath, targetPath, { overwrite: false, errorOnExist: true, filter });

  const useRustConfig = {useRustVersion, ...frameworkAndPackageManager, gitignoreCompiled: gitignoreCompiled === "Yes" , typeScript: typescript};
  fs.writeFileSync(path.join(targetPath, "useRustConfig.json"), JSON.stringify(useRustConfig, null, 2));

  // Replace words from the copied template
  const wordsToReplace : {[key:string]: string} = {
    "template_name": name,
    //"template_pkg_path": `.${path.sep}${path.join("rust", "pkg")}`,
    //"template_path_prefix": frameworkAndPackageManager.packageManager === "npm" ? "file" : "link",
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

  const installCommands : {[key:string]: string} = {
    "npm": `npm install .${path.sep}${name}`,
    "pnpm": `pnpm add .${path.sep}${name}`,
    "yarn": `yarn add ${name}@portal:.${path.sep}${name}`,
  };

  const installCommand = installCommands[frameworkAndPackageManager.packageManager];
  const buildCommand = `npx userust build ${name}`;
  const watchCommand = `npx userust watch ${name}`;

  console.log(`${useRustTag} Executing ${chalk.bold(installCommand)}...`);
  spawnSync(
    installCommand,
    [],
    { shell: true, stdio: "inherit" }
  );
  console.log(`${useRustTag} ${name} useRust hook initialized succesfully ${chalk.green("✓")}`);


  // TODO show install command if skipped
  console.log(`
${chalk.cyan.bold("Component example")}:
${ frameworkAndPackageManager.framework === "React"
    ? `import useRust from '${name}'

const Calculator = () => {
  const { rust, error } = useRust()

  if (error) return <div>failed to load</div>
  if (!rust) return <div>loading...</div>
  return <div>1+1={rust.add(1,1)}</div>
}

export default Calculator`
    : `import useRust from '${name}'
import { Show } from "solid-js";

const Calculator = () => {
  const { rust, error } = useRust()

  return (
    <Show
      when={rust()}
      fallback={<div>{error()?"failed to load":"loading..."}</div>}
    >
      <div>1+1={rust().add(1,1)}</div>
    </Show>
  );
}

export default Calculator`
}

${chalk.cyan.bold("How to modify Rust")}:
1. Make changes at ${chalk.bold(rustSource)}
2. Rebuild the hook with ${chalk.bold(buildCommand)}

Alternatively use ${chalk.bold(watchCommand)} to automatically recompile after Rust changes

${chalk.cyan("useRust docs")}: https://github.com/ollipal/useRust
${chalk.cyan("wasm-bindgen docs")}: https://rustwasm.github.io/wasm-bindgen/examples/index.html
`
  );
};