# Third-party components and artwork

## Stockfish.js 19.0.0

- Browser WebAssembly port by Nathan Rugg, based on Stockfish by the Stockfish contributors.
- Project: https://github.com/nmrugg/stockfish.js
- License: GNU General Public License, version 3.
- Installed artifact: `stockfish@19.0.0`, unmodified `stockfish-19-lite-single.js` and `.wasm`.
- Matching source: https://github.com/nmrugg/stockfish.js/tree/v19.0.0
- Source archive: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v19.0.0.tar.gz
- Build instructions and scripts are in that source release.

`npm run dev` / `npm run build` copies the engine binaries, the upstream `Copying.txt` license as `engine/COPYING.txt`, and versioned source references as `engine/SOURCE.txt`. The app footer links to these notices.

**Before public redistribution:** review GPLv3 requirements, provide the complete corresponding source and required build information alongside the distributed engine or through compliant equivalent access, and retain the license notices. A link is useful attribution, not a substitute for confirming the distributor's obligations. If modifying or replacing the engine, update the corresponding-source reference. Confirm licensing of the combined distribution before releasing it; this repository does not silently assign a project-wide license to the owner's code.

## chess.js 1.4.0

- Project: https://github.com/jhlywa/chess.js
- Copyright Jeff Hlywa and contributors.
- License: BSD-2-Clause. The full notice is in `node_modules/chess.js/LICENSE` and is reproduced below.

Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

## Piece artwork

The PNGs in `public/pieces/` are copied from the existing `LSChess/Images/` directory. No new external artwork was downloaded. Their original authorship/license is not recorded in the old repository; verify provenance before public redistribution.

## Development tooling

Vite, Playwright, and Prettier are development dependencies. Consult each installed package's license for its terms. Exact dependency versions are captured in `package-lock.json`.
