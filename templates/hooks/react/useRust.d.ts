/* tslint:disable */
/* eslint-disable */
import type { InitInput, InitOutput, SyncInitInput } from "./wasm/wasm"
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
