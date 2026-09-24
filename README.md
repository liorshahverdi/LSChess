# LSChess

**Play fast. Think after.**

A browser-local chess trainer, rebuilt from the handmade 2015 Java Swing game. Play timed games against Stockfish, then review every move without getting engine assistance during the match. The original Java implementation remains untouched in [`LSChess/`](LSChess/), and the browser board preserves its piece artwork.

## Run locally

Requires **Node.js 22.12+** and a modern browser with WebAssembly and Web Workers.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`). No API key, account, backend, or external engine service is needed. Engine and image assets are served from the same local app, not a CDN.

## Play and train

- Choose White, Black, or a random side.
- Time controls: **1+0, 3+2, 5+0, 10+5**. Clocks start after the engine loads, not during loading; increment is added only after a legal move.
- Five Stockfish skill settings, 0–20. These are relative engine levels, **not Elo ratings**; even the lowest setting can be challenging.
- Click/tap a piece, then a highlighted square. Keyboard users can Tab to squares and press Enter/Space. Choose queen, rook, bishop, or knight on promotion.
- Castling, en passant, promotion, check, checkmate, stalemate, repetition, and fifty-move/insufficient-material draws use `chess.js`.
- Board flipping changes only the view, never the game position.
- No live evaluations or takebacks. Resign to end a game early and unlock review.

## Review the full game

Once the game ends, select **Analyze full game**. Stockfish evaluates the opening position and every subsequent position at maximum skill, with a budget of 350ms / depth 16 per position. Each search receives the complete move prefix, preserving repetition context.

Review includes:

- Clickable move history and arrow-key navigation through the board.
- White-relative evaluations and an evaluation chart.
- Best alternatives and short suggested lines in algebraic notation.
- Time spent on each move, including time spent choosing a promotion.
- Approximate best/good/inaccuracy/mistake/blunder labels; mate transitions are labeled separately.
- PGN export with player, date, clock, and result headers.
- The last 20 finished games and their completed reviews saved in this browser’s `localStorage`.

**Interpretation:** positive scores favor White; negative scores favor Black. Labels use evaluation-loss thresholds of 0.5, 1, and 2 pawns, not a calibrated accuracy model. These are quick engine estimates, not definitive judgments or tactical explanations. Depth and speed vary by device.

## Build and test

```sh
npm test                  # Rules integration, clocks, analysis, UCI lifecycle
npm run test:browser      # Chrome: real Stockfish + deterministic UI edge cases
npm run build            # Static production output in dist/
npm run preview          # Serve the production build
npm run format:check
```

The browser suite uses installed Google Chrome locally. In CI, install Playwright Chromium with `npx playwright install --with-deps chromium` and set `CI=1`.

To run the same browser tests against the production bundle on macOS/Linux:

```sh
npm run build
TEST_PREVIEW=1 npm run test:browser
```

Screenshots and failure traces are written to the ignored `test-results/` directory. Tests cover real WASM engine moves, playing either color, review, export, persistence, mobile layout, load failure, cancellation, timeout, and promotion. Scripted-worker tests are explicitly separate from the real-engine tests.

## Architecture

Plain JavaScript ES modules, CSS, and Vite; no frontend framework or server state.

| Path | Responsibility |
| --- | --- |
| `src/game.js` | Rules adapter, match lifecycle, elapsed-time clocks, PGN |
| `src/engine.js` | Stockfish worker, UCI parsing, request timeouts/cancellation |
| `src/analysis.js` | Full-history review, score normalization, move labels |
| `src/main.js` | Browser UI, input, session coordination, local archive |
| `src/style.css` | Responsive board and training/review presentation |
| `scripts/copy-engine.mjs` | Prepare the lite single-threaded WASM build and notices |
| `public/pieces/` | Artwork carried forward from the Java game |
| `LSChess/` | Original Java source and images, preserved for history |

An engine runs in a dedicated Worker. Ending a game or leaving a review terminates that worker; session-generation checks discard stale async results. UI clocks tick from elapsed wall time rather than interval counts, and expiry is checked again before accepting a move.

## Static hosting

Deploy `dist/` to an HTTP(S) static host that serves `.wasm` as `application/wasm`. The single-threaded engine does not need cross-origin-isolation headers. For a subdirectory deployment, build with the appropriate Vite base, for example:

```sh
npm run build -- --base=/LSChess/
```

Keep the `engine/` directory and its license/source notices with the build. Opening `index.html` through `file://` is unsupported. There is no service worker/offline install yet; local computation does not mean the website itself is cached for offline visits.

## Deliberate limits

- This is a local trainer, not online multiplayer or an anti-cheat/tournament clock.
- Threefold repetition and fifty-move draws are automatic rather than claim-based. Arbitrary dead-position adjudication is not implemented. On timeout, a bare opposing king is recognized as unable to mate; exotic non-bare-king positions where mate is impossible are not exhaustively adjudicated.
- Games in progress are not restored after refresh. Completed games are browser-local; clearing site data removes them. Export PGN for a portable copy.
- Interrupted engine-error games retain `*` as the PGN result, not a fabricated draw.
- No premoves, drag-and-drop, opening database, PGN import, or long-form coaching yet.

## Third-party notices

See [`THIRD_PARTY.md`](THIRD_PARTY.md), particularly the Stockfish GPLv3 source-distribution obligations before publishing a hosted build. No new project-wide license has been selected for the original code or this modernization.
