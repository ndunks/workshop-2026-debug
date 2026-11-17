import "./style.css";
import signalUrl from "./wasm/signal.png";

const form = document.querySelector<HTMLFormElement>("#password-form")!;
const password = document.querySelector<HTMLInputElement>("#password")!;
const visibility = document.querySelector<HTMLButtonElement>("#visibility")!;
const submit = document.querySelector<HTMLButtonElement>("#submit")!;
const feedback = document.querySelector<HTMLParagraphElement>("#feedback")!;
const challenge = document.querySelector<HTMLElement>(".challenge")!;
const resultMark = document.querySelector<HTMLElement>("#result-mark")!;
const signalImage = document.querySelector<HTMLImageElement>("#signal-image")!;

visibility.addEventListener("click", () => {
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  visibility.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  visibility.title = isHidden ? "Hide password" : "Show password";
  visibility.textContent = isHidden ? "Hide" : "Show";
});

function showResult(state: "error" | "success", message: string) {
  challenge.classList.remove("result-error", "result-success");
  void challenge.offsetWidth;
  challenge.dataset.result = state;
  challenge.classList.add(`result-${state}`);
  resultMark.textContent = state === "success" ? "✓" : "!";
  feedback.textContent = message;
  feedback.dataset.state = state;
}

password.addEventListener("input", () => {
  delete challenge.dataset.result;
  challenge.classList.remove("result-error", "result-success");
  resultMark.textContent = "?";
  feedback.textContent = "";
  delete feedback.dataset.state;
});

async function initialize() {
  const validator = await import("./wasm/validator.wasm");
  signalImage.src = signalUrl;
  await signalImage.decode();
  const canvas = document.createElement("canvas");
  canvas.width = signalImage.naturalWidth;
  canvas.height = signalImage.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context || canvas.width !== 256 || canvas.height !== 256) throw new Error("Could not read image");
  context.drawImage(signalImage, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  new Uint8Array(validator.memory.buffer, validator.imagePointer(), pixels.length).set(pixels);
  password.disabled = false;
  visibility.disabled = false;
  submit.disabled = false;
  feedback.textContent = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const bytes = new TextEncoder().encode(password.value);
    if (bytes.length > 128) {
      showResult("error", "Password must be 128 bytes or less.");
      return;
    }
    new Uint8Array(validator.memory.buffer, validator.inputPointer(), bytes.length).set(bytes);
    const valid = validator.validatePassword(bytes.length) === 1;
    showResult(valid ? "success" : "error", valid ? "Access granted. You found it." : "Not quite. Try again.");
  });
}

initialize().catch(() => {
  feedback.textContent = "Validator could not be loaded. Refresh to try again.";
  feedback.dataset.state = "error";
});