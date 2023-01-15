/* tslint:disable */
/* eslint-disable */
import type { Accessor } from "solid-js";
import type { InitInput, InitOutput, SyncInitInput } from "__REPLACE_NAME_rust"
import * as rustAll from "__REPLACE_NAME_rust"

// Get 'rustRest', which does not have default() and initSync()
const {default: _, initSync: __, ...rustRest} = rustAll;

/**
* Usage: `const { rust, error, isLoading } = useRust()`
*
* @see https://github.com/ollipal/useRust
*/
declare module "aa-test" {
  function useRust(config?: { autoInit: boolean }): {
    rust?: Accessor<typeof rustRest>;
    error: Accessor<any>;
    isLoading: Accessor<boolean>;
    init: (module_or_path?: InitInput | Promise<InitInput>) => Promise<InitOutput> | Promise<undefined>;
    initSync: (module: SyncInitInput) => InitOutput | undefined;
  }
  export default useRust;
}
