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
    console.log(`${useRustTag} package.json not detected ${chalk.red("✕")}`);
    console.log(`${chalk.red("\n'userust init' should be used inside an existing project")}`);
    process.exit(1);
  } else {
    if (verbose) console.log(`${useRustTag} package.json detected ${chalk.green("✓")}`);
  }

  if (!(await hasNecessaryDeps(verbose))) {
    process.exit(1);
  }

  const rustPath = path.join(fileURLToPath(import.meta.url), "..", "..", "templates", "rust");
  const reactPath = path.join(fileURLToPath(import.meta.url), "..", "..", "templates", "hooks", "react");
  const solidjsPath = path.join(fileURLToPath(import.meta.url), "..", "..", "templates", "hooks", "solidjs");
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(`${useRustTag} .${path.sep}${name} not available ${chalk.red("✕")}`);
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
  await fs.copy(rustPath, targetPath, { overwrite: false, errorOnExist: true, filter });
  await fs.copy(hookPath, path.join(targetPath, ".useRust"), { overwrite: false, errorOnExist: true, filter });

  const useRustConfig = {useRustVersion, ...frameworkAndPackageManager, gitignoreCompiled: gitignoreCompiled === "Yes" , typeScript: typescript};
  fs.writeFileSync(path.join(targetPath, ".useRust", "useRustConfig.json"), JSON.stringify(useRustConfig, null, 2));

  // Replace words from the copied template
  const wordsToReplace : {[key:string]: string} = {
    "template_name": name,
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

  const rustSource = `.${path.sep}${path.join(name, "src", "lib.rs")}`;

  const installCommands : {[key:string]: string} = {
    "npm": `npm install .${path.sep}${path.join(name, ".useRust")}`,
    "pnpm": `pnpm add .${path.sep}${path.join(name, ".useRust")}`,
    "yarn": `yarn add ${name}@portal:.${path.sep}${path.join(name, ".useRust")}`,
  };

  const installCommand = installCommands[frameworkAndPackageManager.packageManager];

  if (frameworkAndPackageManager.packageManager === "npm") {
    if (verbose) console.log(`${useRustTag} npm, already installed`);
  } else {
    console.log(`${useRustTag} Executing ${chalk.bold(installCommand)}...`);
    spawnSync(
      installCommand,
      [],
      { shell: true, stdio: "inherit" }
    );
  }

  const useRustInstallCommands : {[key:string]: string} = {
    "npm": "npm install userust --save-dev",
    "pnpm": "pnpm add userust --save-dev",
    "yarn": "yarn add userust --dev",
  };
  const useRustInstallCommand = useRustInstallCommands[frameworkAndPackageManager.packageManager];
  console.log(`${useRustTag} Executing ${chalk.bold(useRustInstallCommand)}...`);
  spawnSync(
    useRustInstallCommand,
    [],
    { shell: true, stdio: "inherit" }
  );

  console.log(`${useRustTag} Writing scripts to package.json...`);
  const contents = JSON.parse(fs.readFileSync(filePath("package.json"), "utf8"));
  if (!("scripts" in contents) || typeof contents["scripts"] !== "object") {
    contents["scripts"] = {};
  }
  contents["scripts"][`${name}:build`] = `userust build ${name}`;
  contents["scripts"][`${name}:watch`] = `userust watch ${name}`;
  fs.writeFileSync(filePath("package.json"), JSON.stringify(contents, null, 2));

  const buildCommands : {[key:string]: string} = {
    "npm": `npm run ${name}:build`,
    "pnpm": `pnpm run ${name}:build`,
    "yarn": `yarn ${name}:build`,
  };
  const watchCommands : {[key:string]: string} = {
    "npm": `npm run ${name}:watch`,
    "pnpm": `pnpm run ${name}:watch`,
    "yarn": `yarn ${name}:watch`,
  };

  console.log(`${useRustTag} ${chalk.green.bold(`${name} useRust hook initialized succesfully ✓`)}`);  

  // TODO show install command if skipped
  console.log(`
${chalk.yellow.bold("Instructions:")}

${chalk.cyan.bold("How to modify Rust")}:
1. Make changes at ${chalk.bold(rustSource)}
2. Rebuild the hook with ${chalk.bold(buildCommands[frameworkAndPackageManager.packageManager])}

Alternatively use ${chalk.bold(watchCommands[frameworkAndPackageManager.packageManager])} to automatically
recompile after Rust changes

${chalk.cyan("wasm-bindgen docs")}: https://rustwasm.github.io/wasm-bindgen/examples/index.html

${chalk.cyan.bold("Component example")}:
${ frameworkAndPackageManager.framework === "React"
    ? `import React from 'react'
import useRust from '${name}'

const App = () => {
  const { rust, error } = useRust()

  if (error) return <div>failed to load</div>
  if (!rust) return <div>loading...</div>
  return <div>1+1={rust.add(1,1)}</div>
}

export default App`
    : `import useRust from '${name}'
import { Show } from "solid-js";

const Counter = () => {
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

export default Counter`}
${fs.existsSync(filePath("vite.config.ts")) ?
    (
      frameworkAndPackageManager.framework === "React"
        ? `
${chalk.cyan.bold("Vite detected!")}
Recommended vite.config.ts:

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  ${frameworkAndPackageManager.packageManager === "npm" && `// Fix page reloads after 'userust build/watch' during 'npm run dev'
// More info: https://github.com/vitejs/vite/issues/8619
  ${chalk.cyan( `server: {
    watch: {
      ignored: ["!**/node_modules/**"],
    },
  },`)}`}
  // Serve .wasm files properly
  ${chalk.cyan(`optimizeDeps: {
    exclude: ["${name}"],
  },`)}
});
`
        : `
${chalk.cyan.bold("Vite detected!")}
Recommended vite.config.ts:

import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid()],
  ${frameworkAndPackageManager.packageManager === "npm" && `// Fix page reloads after 'userust build/watch' during 'npm run dev'
// More info: https://github.com/vitejs/vite/issues/8619
  ${chalk.cyan( `server: {
    watch: {
      ignored: ["!**/node_modules/**"],
    },
  },`)}`}
  // Serve .wasm files properly
  ${chalk.cyan(`optimizeDeps: {
    exclude: ["${name}"],
  },`)}
});`
    )
    : ""
}
${chalk.yellow.bold("Check the instructions above!")}`);
};