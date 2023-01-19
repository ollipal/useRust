# useRust


```js
import useRust from 'my-rust-calculator'

const Calculator = () => {
  const { rust, error } = useRust()

  if (error) return <div>failed to load</div>
  if (!rust) return <div>loading...</div>
  return <div>1+1={rust.add(1,1)}!</div>
}
```

```js
import useRust from 'my-rust-calculator'
import { Show } from "solid-js";

const Calculator = () => {
  const { rust, error } = useRust()

  return (
    <Show
      when={rust()}
      fallback={<div>{error()?"failed to load":"loading..."}</div>}
    >
      <div>1+1={rust().add(1,1)}!</div>
    </Show>
  );
}
```