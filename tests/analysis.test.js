import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import {
  analyzeGame,
  classifyMove,
  whiteScore,
  formatScore,
  pvToSan,
} from "../src/analysis.js";
import { parseInfo } from "../src/engine.js";
const cp = (value) => ({ type: "cp", value });
test("UCI parsing extracts score, depth and PV and ignores bound scores", () => {
  assert.deepEqual(
    parseInfo("info depth 15 seldepth 18 score cp -42 nodes 1200 pv e7e5 g1f3"),
    { score: cp(-42), depth: 15, pv: ["e7e5", "g1f3"] },
  );
  assert.equal(parseInfo("info depth 5 score cp 30 lowerbound pv e2e4"), null);
  assert.equal(parseInfo("info string NNUE loaded"), null);
  assert.equal(parseInfo("info depth 5 score mate -3 pv a1a2").score.value, -3);
});
test("scores and move loss are consistent from either color", () => {
  assert.deepEqual(whiteScore(cp(100), "b"), cp(-100));
  assert.equal(
    classifyMove(cp(30), cp(-200), "w", "e2e4", "d2d4").label,
    "Blunder",
  );
  assert.equal(
    classifyMove(cp(-30), cp(200), "b", "e7e5", "d7d5").label,
    "Blunder",
  );
  assert.equal(classifyMove(cp(20), cp(10), "w", "e2e4", "e2e4").label, "Best");
  assert.equal(classifyMove(cp(0), cp(50), "w", "e2e4", "d2d4").loss, 0);
});
test("mate transitions are not falsely reported as centipawn loss", () => {
  assert.deepEqual(
    classifyMove(cp(0), { type: "mate", value: -3 }, "w", "a", "b"),
    { label: "Allows mate", loss: null },
  );
  assert.equal(
    classifyMove({ type: "mate", value: -3 }, cp(-200), "b", "a", "b").label,
    "Missed mate",
  );
  assert.equal(formatScore(cp(125)), "+1.25");
  assert.equal(formatScore({ type: "mate", value: -3 }), "M-3");
});
test("analysis sends full move prefixes, evaluates every position, converts PV to SAN", async () => {
  const chess = new Chess();
  ["e4", "e5"].forEach((m) => chess.move(m));
  const calls = [];
  const engine = {
    async search(options) {
      calls.push(options);
      return {
        score: cp(30),
        bestmove: ["e2e4", "e7e5", "g1f3"][calls.length - 1],
        depth: 12,
        pv: [],
      };
    },
  };
  const analysis = await analyzeGame(chess.history({ verbose: true }), engine);
  assert.equal(analysis.positions.length, 3);
  assert.equal(analysis.reviews.length, 2);
  assert.deepEqual(
    calls.map((c) => c.moves),
    [[], ["e2e4"], ["e2e4", "e7e5"]],
  );
  assert.equal(analysis.positions[1].score.value, -30);
  assert.equal(analysis.reviews[0].best, "e4");
  assert.equal(analysis.reviews[1].best, "e5");
  assert.ok(calls.every((c) => c.skill === 20));
  assert.deepEqual(pvToSan(new Chess().fen(), ["e2e4", "e7e5", "bad"]), [
    "e4",
    "e5",
  ]);
});
test("checkmated final position is scored without requesting another engine move", async () => {
  const chess = new Chess();
  ["f3", "e5", "g4", "Qh4#"].forEach((m) => chess.move(m));
  let calls = 0;
  const result = await analyzeGame(chess.history({ verbose: true }), {
    async search() {
      calls++;
      return { score: cp(0), bestmove: null, pv: [], depth: 1 };
    },
  });
  assert.equal(calls, 4);
  assert.equal(result.positions.length, 5);
  assert.equal(result.positions[4].terminal, true);
  assert.equal(result.positions[4].score.value, -1);
});
