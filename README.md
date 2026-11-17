# WASM Debug Workshop

A deliberately insecure client-side password challenge for practicing Chrome DevTools. Nothing in this project should be used for real authentication: a secret sent to the browser is not secret.

## Run

Requires Node.js 24+, Clang, and `wasm-ld` (on Debian/Ubuntu: `sudo apt install clang lld`). No Emscripten or WASI SDK is required.

```sh
npm install
npm run dev
```

Vite 8.1+ imports the compiled WASM as an ES module. Open the URL printed by Vite in Chrome. `npm run build` creates a production-style build in `dist` with a JavaScript source map and WASM DWARF debug information; `npm run preview` serves it locally. The WASM uses DWARF for source mapping, not a separate `.wasm.map` file.

## Change Password

Run `npm run password` to generate and print a random password, or `npm run password -- 'your password'` to set one. Passwords must be between 1 and 128 UTF-8 bytes. The command updates the challenge image; run `npm run build` before serving the production build. Shell history may retain passwords supplied as command arguments.

## Exercise

Find the password using Chrome DevTools. Try a guess, trace it from the TypeScript submit handler into the WebAssembly validator, and inspect the validator's memory after the expected bytes have been decoded.

## Presenter notes

- Enable JavaScript source maps in DevTools Settings > Sources. The TypeScript handler appears in Sources as `src/main.ts`.
- Install the [C/C++ DevTools Support (DWARF)](https://goo.gle/wasm-debugging-extension) Chrome extension for C source and local-variable debugging. Open DevTools before loading the page.
- Clang compiles `src/wasm/validator.c` with `-g -O0`. In Sources, find `validator.c`, set a breakpoint on the length comparison after the decoding loop, and submit any non-empty guess. The C source is served alongside the WASM so DevTools can resolve it.
- Inspect the `expected` local in Scope, or open it in the Memory Inspector. Its first `expectedLength` bytes contain the UTF-8 password. The extension's settings allow source path mapping if Chrome cannot locate the file.
- DWARF and memory inspection support varies by Chrome version. The WASM disassembly and Memory Inspector provide a lower-level fallback.
- The input is UTF-8 encoded and limited to 128 bytes. TypeScript copies all image pixels into WASM memory; the validator reads the encoded material from the first row and reconstructs the expected bytes on every attempt, including incorrect guesses. This is obfuscation, not encryption: all inputs and instructions are available to the browser.