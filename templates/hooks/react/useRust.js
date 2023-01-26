import { useEffect, useState } from "react";
import * as rustAll from "./wasm/wasm.js";

// Get 'rustRest', which does not have default() and initSync()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { default: _, initSync: __, ...rustRest } = rustAll;

const useRust = (config = { autoInit: true }) => {
  const [rust, setRust] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [isLoading, setIsLoading] = useState(config.autoInit);

  // eslint-disable-next-line camelcase
  const init = async () => {
    setIsLoading(true);
    let returnValue;
    try {
      returnValue = await rustAll.default();
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

  useEffect(() => {
    if (config.autoInit) init();
  }, []);

  return { rust, error, isLoading, init };
};

export default useRust;