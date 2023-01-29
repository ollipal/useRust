# useRust docs

## CLI

Use `npx userust <COMMAND> --help` to get more info about each command

Commands:

**init**: generate a new useRust hook

**build**: compile existing useRust hook

**watch**: compile hook after every code change

**remove**: remove installed useRust hook

## API

Create `useRust` hook by running `npx userust init <MY_NAME>`.

After that, the `useRust` will be available:

```js
import useRust from '<MY_NAME>'
//
const { rust, error, isLoading, init } = useRust({ autoInit })
```

**rust**: undefined until WebAssembly initializes. After initialization will contain all Rust functions with `#[wasm_bindgen]`.

**error**: undefined or error raised during the initialization of WebAssembly.

**isLoading**: boolean whether Rust is being initialized currently.

**init**: a promise function without parameters that should be used to initialize the useRust hook, if autoInit has been set to `false`

**autoInit**: optional boolean, defaults to true. If true, the WebAssembly will start to initialize immediately after the component mounts. Value `false` with `init()` can be used to delay this initialization.

## Hot Module Replacement (HMR)

- HMR works well, if [Vite](https://vitejs.dev/) is used and configured according to the instructions given during `npx userust init`
- [NextJS](https://nextjs.org/)'s `npm run dev` and [Create React App]()'s `npm start` do not refresh correctly after `userust build`, and might need a restart after each recompilation

## Known issues:

- If problems with Apple M1 installing wasm-pack: [this](https://github.com/rustwasm/wasm-pack/issues/1098#issuecomment-1226387426) might be helpful
- Yarn might have issues getting function type definitions, unknown reason so far