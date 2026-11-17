# WASM Debug Workshop

A deliberately insecure client-side password challenge for practicing Chrome DevTools. Nothing in this project should be used for real authentication: a secret sent to the browser is not secret.

## Run

Requires Node.js 20.19+ or 22.12+, Clang, and `wasm-ld` (on Debian/Ubuntu: `sudo apt install clang lld`). No Emscripten or WASI SDK is required.

```sh
npm install
npm run dev
```

Open the URL printed by Vite in Chrome. `npm run build` creates a production-style build in `dist` with a JavaScript source map and WASM DWARF debug information; `npm run preview` serves it locally. The WASM uses DWARF for source mapping, not a separate `.wasm.map` file.

## Exercise

Find the password using Chrome DevTools. Try a guess, trace it from the TypeScript submit handler into the WebAssembly validator, and inspect the validator's memory after the expected bytes have been decoded.

## Presenter notes

- Enable JavaScript source maps in DevTools Settings > Sources. The TypeScript handler appears in Sources as `src/main.ts`.
- Install the [C/C++ DevTools Support (DWARF)](https://goo.gle/wasm-debugging-extension) Chrome extension for C source and local-variable debugging. Open DevTools before loading the page.
- Clang compiles `public/validator.c` with `-g -O0`. In Sources, find `validator.c`, set a breakpoint on the length comparison after the decoding loop, and submit any non-empty guess. The C source is served alongside the WASM so DevTools can resolve it.
- Inspect the `expected` local in Scope, or open it in the Memory Inspector. Its 20 bytes are the password in ASCII. The extension's settings allow source path mapping if Chrome cannot locate the file.
- DWARF and memory inspection support varies by Chrome version. The WASM disassembly and Memory Inspector provide a lower-level fallback.
- The input is UTF-8 encoded and limited to 128 bytes. The expected bytes are intentionally obfuscated, not encrypted. They are reconstructed in memory on every attempt, including incorrect guesses.