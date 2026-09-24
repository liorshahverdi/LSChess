import test from "node:test";
import assert from "node:assert/strict";
import { Engine } from "../src/engine.js";
function readyEngine() {
  const engine = new Engine();
  const commands = [];
  engine.ready = true;
  engine.worker = {
    postMessage: (command) => commands.push(command),
    terminate() {
      this.terminated = true;
    },
  };
  return { engine, commands };
}
test("search uses complete UCI history and returns the last exact evaluation", async () => {
  const { engine, commands } = readyEngine();
  const search = engine.search({
    moves: ["e2e4", "e7e5"],
    skill: 5,
    movetime: 250,
  });
  assert.deepEqual(commands, [
    "setoption name Skill Level value 5",
    "position startpos moves e2e4 e7e5",
    "go movetime 250",
  ]);
  engine.pending.onLine("info depth 10 score cp 25 pv g1f3 b8c6");
  engine.pending.onLine("bestmove g1f3 ponder b8c6");
  const result = await search;
  assert.equal(result.bestmove, "g1f3");
  assert.equal(result.depth, 10);
  assert.equal(result.score.value, 25);
  assert.equal(engine.pending, null);
  engine.dispose();
});
test("concurrent requests cannot overwrite an existing search", async () => {
  const { engine, commands } = readyEngine();
  const first = engine.search();
  await assert.rejects(engine.search(), /already searching/);
  assert.equal(commands.length, 3);
  engine.pending.onLine("bestmove e2e4");
  await first;
  engine.dispose();
});
test("disposing rejects pending work and terminates its worker", async () => {
  const { engine } = readyEngine();
  const worker = engine.worker;
  const pending = engine.search();
  const rejected = assert.rejects(pending, /Engine stopped/);
  engine.dispose();
  await rejected;
  assert.equal(worker.terminated, true);
  assert.equal(engine.ready, false);
});
test("request watchdog rejects stalled workers", async () => {
  const { engine } = readyEngine();
  await assert.rejects(
    engine.request("isready", () => undefined, 5),
    /timed out/,
  );
  assert.equal(engine.worker, null);
});
