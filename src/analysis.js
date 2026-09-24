import { Chess } from "chess.js";

export function whiteScore(score, turn) {
  return score
    ? { ...score, value: score.value * (turn === "w" ? 1 : -1) }
    : null;
}
export function formatScore(score) {
  if (!score) return "—";
  if (score.type === "mate")
    return `M${score.value > 0 ? "+" : ""}${score.value}`;
  const value = score.value / 100;
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}
export function numericScore(score) {
  if (!score) return null;
  return score.type === "mate" ? Math.sign(score.value) * 10000 : score.value;
}
export function classifyMove(before, after, color, played, best) {
  if (!before || !after) return { label: "Unscored", loss: null };
  if (played === best) return { label: "Best", loss: 0 };
  const sign = color === "w" ? 1 : -1;
  if (before.type === "mate" || after.type === "mate") {
    const a = Math.sign(numericScore(before) * sign);
    const b = Math.sign(numericScore(after) * sign);
    if (before.type === "mate" && a > 0 && (after.type !== "mate" || b < 0))
      return { label: "Missed mate", loss: null };
    if (after.type === "mate" && b < 0 && (before.type !== "mate" || a > 0))
      return { label: "Allows mate", loss: null };
    return { label: "Mate line", loss: null };
  }
  const loss = Math.max(0, (before.value - after.value) * sign);
  return {
    label:
      loss >= 200
        ? "Blunder"
        : loss >= 100
          ? "Mistake"
          : loss >= 50
            ? "Inaccuracy"
            : "Good",
    loss,
  };
}
export function pvToSan(fen, pv) {
  const board = new Chess(fen);
  const result = [];
  for (const uci of pv.slice(0, 6)) {
    try {
      result.push(board.move(uci).san);
    } catch {
      break;
    }
  }
  return result;
}

// Every prefix is sent to Stockfish, preserving repetition and fifty-move context.
export async function analyzeGame(moves, engine, onProgress = () => {}) {
  const positions = [];
  const board = new Chess();
  const uci = [];
  for (let i = 0; i <= moves.length; i++) {
    let evaluation;
    if (board.isCheckmate()) {
      evaluation = {
        score: { type: "mate", value: board.turn() === "w" ? -1 : 1 },
        depth: 0,
        bestmove: null,
        pv: [],
        terminal: true,
      };
    } else if (board.isGameOver()) {
      evaluation = {
        score: { type: "cp", value: 0 },
        depth: 0,
        bestmove: null,
        pv: [],
        terminal: true,
      };
    } else {
      const info = await engine.search({
        moves: [...uci],
        skill: 20,
        movetime: 350,
        depth: 16,
      });
      if (!info.score)
        throw new Error(
          "Engine returned no evaluation. Please retry the review.",
        );
      evaluation = {
        ...info,
        score: whiteScore(info.score, board.turn()),
        line: pvToSan(board.fen(), info.pv),
      };
    }
    positions.push(evaluation);
    onProgress(i + 1, moves.length + 1);
    if (i < moves.length) {
      board.move(moves[i].lan);
      uci.push(moves[i].lan);
    }
  }
  const reviews = moves.map((move, i) => ({
    ...classifyMove(
      positions[i].score,
      positions[i + 1].score,
      move.color,
      move.lan,
      positions[i].bestmove,
    ),
    best: positions[i].bestmove
      ? pvToSan(move.before, [positions[i].bestmove])[0]
      : null,
    line: positions[i].line || [],
  }));
  return { positions, reviews };
}
