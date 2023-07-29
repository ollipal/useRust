import { createSignal, batch } from "solid-js";
import * as rustAll from "./wasm/wasm.js";

// Get 'rustRest', which does not have default() and initSync()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { default: _, initSync: __, ...rustRest } = rustAll;

const useRust = (config = { autoInit: true }) => {
  const [rust, setRust] = createSignal(undefined);
  const [error, setError] = createSignal(undefined);
  const [isLoading, setIsLoading] = createSignal(config.autoInit);

  // eslint-disable-next-line camelcase
  const init = async () => {
    setIsLoading(true);
    let returnValue;
    try {
      returnValue = await rustAll.default();
    } catch (e) {
      batch(() => {
        setRust(undefined);
        setError(e);
        setIsLoading(false);
      });
      return;
    }
    batch(() => {
      setRust(rustRest);
      setError(undefined);
      setIsLoading(false);
    });
    return returnValue;
  };

  if (config.autoInit) init();

  return { rust, error, isLoading, init };
};

export default useRust;