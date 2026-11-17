import { createIcons, Asterisk, ArrowUpRight, Eye, EyeOff, LockKeyhole } from "lucide";
import "./style.css";

createIcons({ icons: { Asterisk, ArrowUpRight, Eye, EyeOff, LockKeyhole } });

const form = document.querySelector<HTMLFormElement>("#password-form")!;
const password = document.querySelector<HTMLInputElement>("#password")!;
const visibility = document.querySelector<HTMLButtonElement>("#visibility")!;
const submit = document.querySelector<HTMLButtonElement>("#submit")!;
const feedback = document.querySelector<HTMLParagraphElement>("#feedback")!;

type Validator = WebAssembly.Exports & {
  memory: WebAssembly.Memory;
  inputPointer: () => number;
  validatePassword: (length: number) => number;
};

visibility.addEventListener("click", () => {
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  visibility.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  visibility.title = isHidden ? "Hide password" : "Show password";
  visibility.innerHTML = `<i data-lucide="${isHidden ? "eye-off" : "eye"}" aria-hidden="true"></i>`;
  createIcons({ icons: { Asterisk, ArrowUpRight, Eye, EyeOff, LockKeyhole } });
});

async function initialize() {
  const response = await fetch(`${import.meta.env.BASE_URL}validator.wasm`);
  if (!response.ok) throw new Error("Could not load validator");
  const { instance } = await WebAssembly.instantiateStreaming(response, {
    env: { abort: () => { throw new Error("WASM aborted"); } },
  });
  const validator = instance.exports as Validator;
  password.disabled = false;
  visibility.disabled = false;
  submit.disabled = false;
  feedback.textContent = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const bytes = new TextEncoder().encode(password.value);
    if (bytes.length > 128) {
      feedback.textContent = "Password must be 128 bytes or less.";
      feedback.dataset.state = "error";
      return;
    }
    new Uint8Array(validator.memory.buffer, validator.inputPointer(), bytes.length).set(bytes);
    const valid = validator.validatePassword(bytes.length) === 1;
    feedback.textContent = valid ? "Access granted. You found it." : "Not quite. Try again.";
    feedback.dataset.state = valid ? "success" : "error";
  });
}

initialize().catch(() => {
  feedback.textContent = "Validator could not be loaded. Refresh to try again.";
  feedback.dataset.state = "error";
});