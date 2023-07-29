import { fileURLToPath } from "url";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";

export const useRustTag = `${chalk.bold.grey("[userust]")}:`;
export const useRustVersion = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), "..", "..", "package.json"), "utf8")).version;
export const useRustConfig = (name: string) => JSON.parse(fs.readFileSync(`.${path.sep}${path.join(name, ".useRust", "useRustConfig.json")}`, "utf8"));
export const toSafe = (str: string) => {
  return str
    .split(".").join("") // remove all "."
    .split("/").join("") // remove all "/"
    .split("\\").join(""); // remove all "\"
};