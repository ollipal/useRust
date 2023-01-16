/* tslint:disable */
/* eslint-disable */
import type { Accessor } from "solid-js";
import type { InitInput, InitOutput, SyncInitInput } from "__REPLACE_NAME_rust"
import rustRest from "./typeHelper";

/**
* Usage: `const { rust, error, isLoading } = useRust()`
*
* @see https://github.com/ollipal/useRust
*/
declare module "__REPLACE_NAME" {
  export default function useRust(config?: { autoInit: boolean }): {
    rust: Accessor<typeof rustRest | undefined>;
    error: Accessor<any>;
    isLoading: Accessor<boolean>;
    init: (module_or_path?: InitInput | Promise<InitInput>) => Promise<InitOutput> | Promise<undefined>;
    initSync: (module: SyncInitInput) => InitOutput | undefined;
  }
}