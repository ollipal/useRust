import useRust from "my-rust";
import { Show } from "solid-js";

const Counter = () => {
  const { rust, error } = useRust();

  return (
    <Show
      when={rust()}
      fallback={<div>{error()?"failed to load":"loading..."}</div>}
    >
      <div>1+1={rust().add(1,1)}</div>
    </Show>
  );
};

export default Counter;