use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn double(a: i32) -> i32 {
    a + a
}
