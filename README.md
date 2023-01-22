# useRust

Add custom Rust WebAssembly hooks for React and SolidJS projects

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

`$ npx userust build my-rust-code`

```js
import useRust from 'my-rust-code'

const Calculator = () => {
  const { rust, error } = useRust()
  return <div>1+1={rust?.add(1,1))}</div>
}
```

## How it works

1. Have an existing React or SolidJS project
2. `npx userust init <MY_NAME>` will compile and install a custom useRust hook to your project
3. Make changes to `./<MY_NAME>/rust/`
4. `npx userust build <MY_NAME>` will recompile the `useRust`-hook

Alternatively you can use `npx userust watch <MY_NAME>` to automatically recompile after changes to Rust code

Uses [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/) to compile WebAssembly. See Rust code examples at its [documentation page](https://rustwasm.github.io/wasm-bindgen/).

## Features

- Leverage Rust and Wasm to speed up critical parts of your frontend
- Fully typed TypeScript interface, works in JavaScript projects as well
- Generate and compile Rust via CLI, the Rust code can be freely tweaked
- npm, pnpm and yarn supported
- Simple interface inspired by [SWR](https://swr.vercel.app/) library.

[Full documentation](DOCUMENTATION.md)
## Licence 

The MIT License.