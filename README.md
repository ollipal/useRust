# useRust

Add custom Rust WebAssembly hooks to React and SolidJS projects

```rust
// my-rust-code/src/lib.rs
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

```js
import useRust from 'my-rust-code'

const Calculator = () => {
  const { rust, error } = useRust()
  return <div>1+1={rust?.add(1,1)}</div>
}
```

## How it works

1. Have an existing React or SolidJS project
2. `npx userust init NAME` will compile and install a custom useRust hook to your project
3. Use it in your project: `import useRust from 'NAME'` 
4. Make changes to `./NAME/src/lib.rs`
5. `npm run NAME:build` will recompile the useRust hook

Alternatively you can use `npm run NAME:watch` to automatically recompile after changes to Rust code

Uses [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/). See Rust code examples at its [documentation page](https://rustwasm.github.io/wasm-bindgen/).

## Features

- Leverage Rust and Wasm to speed up critical parts of your frontend
- Fully typed TypeScript interface, works in JavaScript projects as well
- No limitations for Rust code, provides a minimal, properly configured boilerplate to start with
- Develop frontend and Rust code from the same monorepo with a few simple commands
- Tested on Linux, MacOS and Windows
- npm, pnpm and yarn supported
- Simple interface inspired by [SWR](https://swr.vercel.app/) library

[Full documentation](DOCUMENTATION.md)

## Licence 

The MIT License.