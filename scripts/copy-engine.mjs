import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
const pkg = JSON.parse(
  await readFile(
    new URL("../node_modules/stockfish/package.json", import.meta.url),
  ),
);
const root = new URL("../public/engine/", import.meta.url);
await mkdir(root, { recursive: true });
for (const file of [
  "stockfish-19-lite-single.js",
  "stockfish-19-lite-single.wasm",
]) {
  await copyFile(
    new URL(`../node_modules/stockfish/bin/${file}`, import.meta.url),
    new URL(file, root),
  );
}
await copyFile(
  new URL("../node_modules/stockfish/Copying.txt", import.meta.url),
  new URL("COPYING.txt", root),
);
await copyFile(
  new URL("../node_modules/chess.js/LICENSE", import.meta.url),
  new URL("CHESSJS-LICENSE.txt", root),
);
await copyFile(
  new URL("../THIRD_PARTY.md", import.meta.url),
  new URL("THIRD_PARTY.txt", root),
);
await writeFile(
  new URL("SOURCE.txt", root),
  `Stockfish.js ${pkg.version}, unmodified lite single-threaded build by Nathan Rugg.\nGNU GPL v3. License: COPYING.txt\nCorresponding source and build instructions: https://github.com/nmrugg/stockfish.js/tree/v${pkg.version}\nSource archive: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v${pkg.version}.tar.gz\n`,
);
console.log(`Prepared Stockfish.js ${pkg.version} browser assets.`);
