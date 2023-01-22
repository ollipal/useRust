/* tslint:disable */
/* eslint-disable */
import type { Accessor } from "solid-js";
// @ts-ignore
import type { InitInput, InitOutput, SyncInitInput } from "template_name_rust"
import rustRest from "./typeHelper";

/**
* Usage: `const { rust, error, isLoading } = useRust()`
*
* @see https://github.com/ollipal/useRust
*/
declare module "template_name" {
  export default function useRust(config?: { autoInit: boolean }): {
    rust: Accessor<typeof rustRest | undefined>;
    error: Accessor<any>;
    isLoading: Accessor<boolean>;
    init: () => Promise<InitOutput> | Promise<undefined>;
  }
}
