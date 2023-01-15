// Check here if pkg exists, if not give instructions
// userust-install
// userust-build


import { useEffect, useState } from 'react';
import * as rustAll from '__REPLACE_NAME_rust'

// Remove default (which is init) and initSync from rust functions
// And the tupes 
const rustInit = rustAll.default;
const rustInitSync = rustAll.initSync;
const {default: _, initSync: __, ...rustRest} = rustAll;
//interface Rust extends Omit<typeof t, "default" | "initSync"> {}


const useRust = (config = {autoInit: true}) => {
  const [rust, setRust] = useState<typeof rustRest | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const init = async (module_or_path) => {
    setIsLoading(true);
    let returnValue
    try {
      returnValue = await rustInit(module_or_path);
    } catch(e) {
      setRust(undefined);
      setError(e);
      setIsLoading(false);
      return;
    }
    setRust(rustRest);
    setError(undefined);
    setIsLoading(false);
    return returnValue
  }

  const initSync = (module) => {
    setIsLoading(true);
    let returnValue
    try {
      returnValue = rustInitSync(module)
    } catch(e) {
      setRust(undefined);
      setError(e);
      setIsLoading(false);
      return;
    }
    setRust(rustRest);
    setError(undefined);
    setIsLoading(false);
    return returnValue
  }


  useEffect(() => {
    if (config.autoInit) init()
  },[])

  return { rust, error, isLoading, init, initSync }
}

export default useRust;