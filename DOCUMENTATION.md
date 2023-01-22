# useRust docs

## CLI

Use `npx userust <COMMAND> --help` to get more info about each command

Commands:

**init**: generate a new useRust hook

**build**: compile existing useRust hook

**watch**: compile hook after every code change

**uninstall**: remove installed useRust hook

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

## Known issues

If you are using SolidJS and pnpm, you might need to add

```js
  optimizeDeps: {
    exclude: ["<MY_NAME>_rust"]
  },
```
where `<MY_NAME>` is the name of your useRust package, into your `vite.config.ts`.

Otherwise the WebAssembly fails to load.