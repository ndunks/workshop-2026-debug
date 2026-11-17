import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

export function encodePassword(password) {
  const bytes = Buffer.from(password, "utf8");
  if (bytes.length < 1 || bytes.length > 128) {
    throw new Error("Password must be between 1 and 128 UTF-8 bytes.");
  }

  const material = Buffer.alloc(bytes.length + 8);
  randomBytes(8).copy(material);
  let state = 0x811c9dc5;
  let step = 7;
  for (;;) {
    let left = step;
    let right = bytes.length;
    while (right !== 0) {
      [left, right] = [right, left % right];
    }
    if (left === 1) break;
    step++;
  }
  for (let index = 0; index < 8; index++) {
    state = Math.imul(state ^ material[index], 16777619) >>> 0;
  }
  for (let index = 0; index < bytes.length; index++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    material[index + 8] = ((bytes[(index * step + 11) % bytes.length] + index * 29) & 255) ^ (state & 255);
  }
  return material.toString("base64");
}

export async function writeChallengeImage(encoded) {
  const material = Buffer.from(encoded, "base64");
  if (material.length < 9 || material.length > 136) throw new Error("Invalid challenge material.");
  const image = new PNG({ width: 256, height: 256 });
  for (let vertical = 0; vertical < image.height; vertical++) {
    for (let horizontal = 0; horizontal < image.width; horizontal++) {
      const offset = (vertical * image.width + horizontal) * 4;
      const distance = Math.hypot(horizontal - 127.5, vertical - 127.5);
      const ring = [43, 69, 95].some(radius => Math.abs(distance - radius) < 1.4);
      const cross = (Math.abs(horizontal - 127.5) < 1 || Math.abs(vertical - 127.5) < 1) && distance < 104;
      const center = distance < 11;
      const tick = distance > 108 && distance < 112 && (Math.abs(horizontal - 127.5) < 2 || Math.abs(vertical - 127.5) < 2);
      // const grid = horizontal % 32 === 0 || vertical % 32 === 0;
      // const color = center || tick ? [255, 171, 153] : ring || cross ? [215, 83, 80] : grid ? [73, 35, 40] : [255, 255, 255];
      const color = center || tick ? [255, 171, 153] : ring || cross ? [215, 83, 80] : [255, 255, 255];
      image.data.set([...color, 255], offset);
    }
  }
  image.data[0] = material.length;
  for (let index = 0; index < material.length; index++) image.data[(index + 1) * 4] = material[index];
  await writeFile(new URL("../public/favicon.png", import.meta.url), PNG.sync.write(image));
}

async function main() {
  const arguments_ = process.argv.slice(2);
  if (arguments_.length > 1) throw new Error("Provide at most one password argument.");
  const generated = arguments_.length === 0;
  const password = generated ? randomBytes(18).toString("base64url") : arguments_[0];
  const encoded = encodePassword(password);
  await writeChallengeImage(encoded);
  console.log(generated ? `Generated password: ${password}` : "Password updated.");
  console.log("Encoded: ", encoded);
  console.log("Run npm run build to update the production build.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}