/* tslint:disable */
/* eslint-disable */
import type { InitInput, InitOutput, SyncInitInput } from "__REPLACE_NAME_rust"
import * as rustAll from "__REPLACE_NAME_rust"

// Get 'rustRest', which does not have default() and initSync()
const {default: _, initSync: __, ...rustRest} = rustAll;

/**
* Usage: `const { rust, error, isLoading } = useRust()`
*
* @see https://github.com/ollipal/useRust
*/
export default function useRust(config?: { autoInit: boolean }): {
  rust?: typeof rustRest;
  error: any;
  isLoading: any;
  init: (module_or_path?: InitInput | Promise<InitInput>) => Promise<InitOutput> | Promise<undefined>;
  initSync: (module: SyncInitInput) => InitOutput | undefined;
}
