# useRust

Example
https://cmdcolin.github.io/posts/2022-08-22-rustwasm


wasm-pack build --target web ./localrust

## TODO

- inquirer
    - React / SolidJS
    - TypeScript / JavaScript (save response)
    - .gitignore compiled wasm code and bindings yes/no (save response)
    - run: npm install ./name  / run later by myself (or I use yarn/pnpm)   (CHANGE DIR STRUCTURE)
    (check if has all)
    - run: npx build name / run later by myself
    - show code example!

- --no-typescript option
- autodetect react, solidjs
- detect package-lock.json, pnpm.lock, yarn.lock (multiple versions)

- test yarn 1 and 2, does it update when rebuild?

- Generated using useRust version .....
- make sure there is a package.json before start

--verbose, hide default logs which successfull

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

const Calculator = () => {
  const { rust, error } = useRust()

  if (error()) return <div>failed to load</div>
  return <div>1+1={rust()?.add(1,1) || "loading..."}!</div>
}
```