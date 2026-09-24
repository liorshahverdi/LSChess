import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { Match, boardResult, formatClock } from "../src/game.js";

function clocked(settings) {
  let now = 0;
  const match = new Match(settings, () => now);
  return {
    match,
    advance: (ms) => {
      now += ms;
    },
  };
}
test("clock starts only once engine is ready; increment and time per move", () => {
  const { match, advance } = clocked({ preset: "3+2" });
  advance(5000);
  match.tick();
  assert.equal(match.remaining.w, 180000);
  match.start();
  advance(1200);
  match.tick();
  advance(300);
  assert.equal(match.move("e4").san, "e4");
  assert.equal(match.remaining.w, 180500);
  assert.deepEqual(match.times, [1500]);
  advance(700);
  match.move("e5");
  assert.equal(match.remaining.b, 181300);
  assert.deepEqual(match.times, [1500, 700]);
});
test("illegal move does not change turn or gain increment", () => {
  const { match, advance } = clocked();
  match.start();
  advance(1000);
  assert.equal(match.move("e5"), null);
  assert.equal(match.remaining.w, 179000);
  assert.equal(match.chess.turn(), "w");
});
test("a move received after flag fall cannot rescue player with increment", () => {
  const { match, advance } = clocked({ preset: "3+2" });
  match.start();
  advance(181000);
  assert.equal(match.move("e4"), null);
  assert.equal(match.moves.length, 0);
  assert.equal(match.result.winner, "b");
  advance(10000);
  match.tick();
  assert.equal(match.remaining.b, 180000);
});
test("background elapsed time is charged without interval ticks", () => {
  const { match, advance } = clocked({ preset: "1+0" });
  match.start();
  advance(61000);
  match.tick();
  assert.equal(match.result.winner, "b");
  assert.equal(match.remaining.w, 0);
});
test("checkmate ends play and PGN includes result", () => {
  const { match } = clocked();
  match.start();
  ["f3", "e5", "g4", "Qh4#"].forEach((m) => match.move(m));
  assert.deepEqual(match.result, { winner: "b", reason: "Checkmate" });
  assert.match(match.pgn, /\[Result "0-1"\]/);
  assert.match(match.pgn, /Qh4# 0-1/);
  assert.equal(match.move("e4"), null);
});
test("resignation uses human color, including when computer is thinking", () => {
  const { match } = clocked({ color: "b" });
  match.start();
  match.resign();
  assert.equal(match.result.winner, "w");
});
test("repetition uses full history", () => {
  const { match } = clocked();
  match.start();
  ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"].forEach((m) =>
    match.move(m),
  );
  assert.equal(match.result.reason, "Threefold repetition");
});
test("stalemate and insufficient material are draws", () => {
  assert.equal(
    boardResult(new Chess("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")).reason,
    "Stalemate",
  );
  assert.equal(
    boardResult(new Chess("7k/8/6K1/8/8/8/8/8 w - - 0 1")).reason,
    "Insufficient material",
  );
});
test("castling, en passant and all four promotion choices", () => {
  const board = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  board.move("O-O");
  assert.equal(board.get("f1").type, "r");
  assert.equal(board.get("g1").type, "k");
  const ep = new Chess();
  ["e4", "a6", "e5", "d5", "exd6"].forEach((m) => ep.move(m));
  assert.equal(ep.get("d5"), undefined);
  assert.equal(ep.get("d6").color, "w");
  for (const promotion of ["q", "r", "b", "n"]) {
    const { match } = clocked();
    match.chess = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
    match.start();
    match.move({ from: "a7", to: "a8", promotion });
    assert.equal(match.chess.get("a8").type, promotion);
  }
});
test("timeout against a bare king is a draw", () => {
  const { match, advance } = clocked({ preset: "1+0" });
  match.chess = new Chess("7k/8/8/8/8/8/P7/7K w - - 0 1");
  match.start();
  advance(60000);
  match.tick();
  assert.equal(match.result.winner, null);
});
test("clock formatting never shows a negative value", () => {
  assert.equal(formatClock(180000), "3:00");
  assert.equal(formatClock(1), "0:01");
  assert.equal(formatClock(-5), "0:00");
});
