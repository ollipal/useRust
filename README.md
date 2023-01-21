# useRust

Custom Rust WebAssembly hooks for React and SolidJS projects

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
  return <div>{"1+1=" + rust?.add(1,1))}</div>
}
```

## How it works

1. Have an existing React, NextJS or SolidJS project
2. `npx userust init <MY_NAME>` will generate, compile and install a custom `useRust`-hook to your project
3. Make changes to `./<MY_NAME>/rust/`
4. `npx userust build <MY_NAME>` will recompile the `useRust`-hook

## Features

- Blazingly fast Wasm code to speed up critical parts of your frontend
- Fully typed TypeScript functions, uses wasm-bindgen inside (Works in JavaScript projects as well)
- Handles the initial code generation and compilation after changes via CLI
- Generates a minimal custom Rust library, which you can tweak as much as you want
- Supports npm, pnpm and yarn

Leverages [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/). Simple interface heavily inspired by [SWR](https://swr.vercel.app/) library.

## Docs

init, build, uninstall

-y, --verbose, --no-typescript, manual delayed init with {autInit: false}

## Licence 

The MIT License.