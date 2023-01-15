/* tslint:disable */
/* eslint-disable */
import type { InitInput, InitOutput, SyncInitInput } from "__REPLACE_NAME_rust"
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
  init: (module_or_path?: InitInput | Promise<InitInput>) => Promise<InitOutput> | Promise<undefined>;
  initSync: (module: SyncInitInput) => InitOutput | undefined;
}
