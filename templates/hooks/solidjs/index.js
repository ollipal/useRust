import { createSignal } from "solid-js";
import * as rustAll from "__REPLACE_NAME_rust";

// Get 'rustRest', which does not have default() and initSync()
// eslint-disable-next-line no-unused-vars
const { default: _, initSync: __, ...rustRest } = rustAll;

const useRust = (config = { autoInit: true }) => {
  const [rust, setRust] = createSignal(undefined);
  const [error, setError] = createSignal(undefined);
  const [isLoading, setIsLoading] = createSignal(false);

  // eslint-disable-next-line camelcase
  const init = async (module_or_path) => {
    setIsLoading(true);
    let returnValue;
    try {
      returnValue = await rustAll.default(module_or_path);
    } catch (e) {
      setRust(undefined);
      setError(e);
      setIsLoading(false);
      return;
    }
    setRust(rustRest);
    setError(undefined);
    setIsLoading(false);
    return returnValue;
  };

  const initSync = (module) => {
    setIsLoading(true);
    let returnValue;
    try {
      returnValue = rustAll.initSync(module);
    } catch (e) {
      setRust(undefined);
      setError(e);
      setIsLoading(false);
      return;
    }
    setRust(rustRest);
    setError(undefined);
    setIsLoading(false);
    return returnValue;
  };

  if (config.autoInit) init();

  return { rust, error, isLoading, init, initSync };
};

export default useRust;