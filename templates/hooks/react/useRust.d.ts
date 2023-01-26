/* tslint:disable */
/* eslint-disable */
// @ts-ignore
import type { InitInput, InitOutput, SyncInitInput } from "template_name_rust"
import rustRest from "./typeHelper";

/**
* Usage: `const { rust, error, isLoading } = useRust()`
*
* @see https://github.com/ollipal/useRust
*/
export default function useRust(config?: { autoInit: boolean }): {
  rust: typeof rustRest | undefined;
  error: any;
  isLoading: boolean;
  init: () => Promise<InitOutput> | Promise<undefined>;
}