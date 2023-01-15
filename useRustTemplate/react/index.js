import { useEffect, useState } from "react";
import * as rustAll from "__REPLACE_NAME_rust";

// Get 'rustRest', which does not have default() and initSync()
// eslint-disable-next-line no-unused-vars
const { default: _, initSync: __, ...rustRest } = rustAll;

const useRust = (config = { autoInit: true }) => {
  const [state, setState] = useState({
    rust: undefined,
    error: undefined,
    isLoading: false,
  });

  // eslint-disable-next-line camelcase
  const init = async (module_or_path) => {
    setState(state => ({...state, isLoading: true}));
    let returnValue;
    try {
      returnValue = await rustAll.default(module_or_path);
    } catch (e) {
      setState({
        rust: undefined,
        error: e,
        isLoading: false,
      });
      return;
    }
    setState({
      rust: rustRest,
      error: undefined,
      isLoading: false,
    });
    return returnValue;
  };

  const initSync = (module) => {
    setState(state => ({...state, isLoading: true}));
    let returnValue;
    try {
      returnValue = rustAll.initSync(module);
    } catch (e) {
      setState({
        rust: undefined,
        error: e,
        isLoading: false,
      });
      return;
    }
    setState({
      rust: rustRest,
      error: undefined,
      isLoading: false,
    });
    return returnValue;
  };

  useEffect(() => {
    if (config.autoInit) init();
  }, []);

  return { ...state, init, initSync };
};

export default useRust;
