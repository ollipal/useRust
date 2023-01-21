import useRust from "my-rust";

function App() {
  const { rust, error } = useRust();

  if (error) return <div>failed to load</div>;
  if (!rust) return <div>loading...</div>;
  return <div>1+1={rust.add(1,1)}</div>;
}

export default App;
