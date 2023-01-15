import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs-extra'

const replaceAll = (text, wordsToReplace) => (
  Object.keys(wordsToReplace).reduce(
    (f, s) =>
      `${f}`.replace(new RegExp(s, 'ig'), wordsToReplace[s]),
      text
  )
)

export const init = async (name) => {
  const sourcePath = path.join(fileURLToPath(import.meta.url), "..", "..", "useRustTemplate");
  const targetPath = path.join(process.env.INIT_CWD, name);

  if (fs.existsSync(targetPath)) {
    console.log(`Cannot initialize '${name}' because it already exists`)
    process.exit(1);
  }

  // Copy template, and save the copied paths
  console.log(`Generating useRust hook for a new Rust package '${name}'...`)
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

  const installCommand = `.${path.sep}${path.join(".", name, "react")}`
  console.log(`...'${name}' generated successfully!\n\nInstall package with:\nnpm install ${installCommand}`)
}