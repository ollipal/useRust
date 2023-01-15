import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs-extra'
import chalk from 'chalk';

const replaceAll = (text, wordsToReplace) => (
  Object.keys(wordsToReplace).reduce(
    (f, s) =>
      `${f}`.replace(new RegExp(s, 'ig'), wordsToReplace[s]),
      text
  )
)

export const init = async (name) => {
  process.stdout.write(`Generating '${name}' useRust hook... `)

  const sourcePath = path.join(fileURLToPath(import.meta.url), "..", "..", "useRustTemplate");
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`Cannot init '${name}' because it already exists`))
    process.exit(1);
  }

  // Copy template, and save the copied paths
  const copiedPaths = []
  const filter = (_, dest) => {
    copiedPaths.push(dest)
    return true;
  }
  await fs.copy(sourcePath, targetPath, { overwrite: false, errorOnExist: true, filter })

  // Replace words from the copied template
  const wordsToReplace = {
    "__REPLACE_NAME": name,
    "__REPLACE_PKG_PATH": path.join("..", "pkg")
  }
  
  for (const p of copiedPaths) {
    if (fs.lstatSync(p).isDirectory()) {
      continue
    }
    let contents = fs.readFileSync(p)
    contents = replaceAll(contents, wordsToReplace)
    fs.writeFileSync(p, contents);
  }

  const rustSource = `.${path.sep}${path.join(name, "src", "lib.rs")}`
  const installCommand = `npm install .${path.sep}${path.join(name, "react")}`
  const buildCommand = `npx userust build ${name}`
  console.log(`${chalk.green("✓")}

${chalk.cyan.bold("How to use")}:
1. Build the Rust package:\t${chalk.bold(buildCommand)}
2. Install package with:  \t${chalk.bold(installCommand)}
3. Use in your components:

${chalk.italic(`import useRust from '${name}'
//...
const { rust, error } = useRust()
console.log(rust?.add(1, 1))`)}

${chalk.cyan.bold("How to modify Rust code:")}:
1. Modify the source at    \t${chalk.bold(rustSource)}
2. Rebuild the package with\t${chalk.bold(buildCommand)}

More info at: https://github.com/ollipal/useRust`
  )
}