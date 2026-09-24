import { Chess } from "chess.js";

export const PRESETS = {
  "1+0": [60, 0],
  "3+2": [180, 2],
  "5+0": [300, 0],
  "10+5": [600, 5],
};
export const opposite = (color) => (color === "w" ? "b" : "w");
export const colorName = (color) => (color === "w" ? "White" : "Black");

export function boardResult(chess) {
  if (chess.isCheckmate())
    return { winner: opposite(chess.turn()), reason: "Checkmate" };
  if (chess.isStalemate()) return { winner: null, reason: "Stalemate" };
  if (chess.isThreefoldRepetition())
    return { winner: null, reason: "Threefold repetition" };
  if (chess.isInsufficientMaterial())
    return { winner: null, reason: "Insufficient material" };
  if (chess.isDrawByFiftyMoves())
    return { winner: null, reason: "Fifty-move rule" };
  return null;
}

export class Match {
  constructor(
    { color = "w", preset = "3+2", skill = 5 } = {},
    now = () => Date.now(),
  ) {
    this.chess = new Chess();
    this.settings = { color, preset, skill };
    const [seconds, increment] = PRESETS[preset];
    this.remaining = { w: seconds * 1000, b: seconds * 1000 };
    this.increment = increment * 1000;
    this.now = now;
    this.startedAt = null;
    this.turnSpent = 0;
    this.times = [];
    this.result = null;
    this.date = new Date().toISOString();
  }

  start() {
    if (!this.result && this.startedAt === null) this.startedAt = this.now();
  }

  tick() {
    if (this.startedAt === null || this.result) return;
    const now = this.now();
    const elapsed = Math.max(0, now - this.startedAt);
    this.startedAt = now;
    const turn = this.chess.turn();
    this.remaining[turn] = Math.max(0, this.remaining[turn] - elapsed);
    this.turnSpent += elapsed;
    if (this.remaining[turn] === 0) {
      const winner = opposite(turn);
      // Conservative timeout exception: a bare king can never give mate.
      const hasNonKing = this.chess
        .board()
        .flat()
        .some((p) => p && p.color === winner && p.type !== "k");
      this.finish({
        winner: hasNonKing ? winner : null,
        reason: hasNonKing
          ? `${colorName(turn)} ran out of time`
          : "Timeout · opponent has only a king",
      });
    }
  }

  move(input) {
    this.tick();
    if (this.result || this.startedAt === null) return null;
    let move;
    try {
      move = this.chess.move(input);
    } catch {
      return null;
    }
    this.times.push(this.turnSpent);
    this.turnSpent = 0;
    this.remaining[move.color] += this.increment;
    const result = boardResult(this.chess);
    if (result) this.finish(result);
    return move;
  }

  finish(result) {
    this.result = result;
    this.startedAt = null;
  }
  resign() {
    this.tick();
    if (!this.result)
      this.finish({
        winner: opposite(this.settings.color),
        reason: "Resignation",
      });
  }
  get moves() {
    return this.chess.history({ verbose: true });
  }
  get uci() {
    return this.moves.map((m) => m.lan);
  }
  get pgn() {
    const r =
      !this.result || this.result.interrupted
        ? "*"
        : this.result.winner === "w"
          ? "1-0"
          : this.result.winner === "b"
            ? "0-1"
            : "1/2-1/2";
    const headers = {
      Event: "LSChess training",
      Date: this.date.slice(0, 10).replaceAll("-", "."),
      White:
        this.settings.color === "w"
          ? "You"
          : `Stockfish skill ${this.settings.skill}`,
      Black:
        this.settings.color === "b"
          ? "You"
          : `Stockfish skill ${this.settings.skill}`,
      TimeControl: `${PRESETS[this.settings.preset][0]}+${PRESETS[this.settings.preset][1]}`,
      Result: r,
    };
    for (const [key, value] of Object.entries(headers))
      this.chess.setHeader(key, value);
    return this.chess.pgn();
  }
}

export function formatClock(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
