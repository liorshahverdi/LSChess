import { Chess, DEFAULT_POSITION } from "chess.js";
import { Engine } from "./engine.js";
import { Match, colorName, opposite, formatClock } from "./game.js";
import { analyzeGame, formatScore, numericScore } from "./analysis.js";
import "./style.css";

const app = document.querySelector("#app");
const pieceNames = {
  p: "pawn",
  n: "horse",
  b: "bishop",
  r: "castle",
  q: "queen",
  k: "king",
};
const accessibleNames = { ...pieceNames, n: "knight", r: "rook" };
const base = import.meta.env.BASE_URL;
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let match = new Match();
let phase = "setup";
let engine = null;
let generation = 0;
let selected = null;
let promotion = null;
let flipped = false;
let reviewIndex = 0;
let analysis = null;
let progress = "";
let error = "";
let analyzing = false;
let savedId = null;
let storageWarning = "";
let archive = [];
try {
  const value = JSON.parse(localStorage.getItem("lschess.games.v1") || "[]");
  if (Array.isArray(value)) archive = value.slice(0, 20);
} catch {
  storageWarning = "Local game storage is unavailable.";
}

function pieceImage(piece) {
  return `<img draggable="false" alt="" src="${base}pieces/${piece.color === "w" ? "white" : "black"}-${pieceNames[piece.type]}.png">`;
}
function resultText() {
  if (!match.result) return "";
  if (match.result.interrupted) return "Game interrupted";
  return match.result.winner
    ? `${colorName(match.result.winner)} wins`
    : "Draw";
}
function statusText() {
  if (phase === "setup") return "Your next good decision starts here.";
  if (phase === "loading") return "Preparing your opponent…";
  if (phase === "review") return `${resultText()} · ${match.result.reason}`;
  return `${match.chess.turn() === match.settings.color ? "Your move" : "Stockfish is thinking…"}${match.chess.inCheck() ? " · Check" : ""}`;
}
function shownBoard() {
  if (phase !== "review") return match.chess;
  return new Chess(
    reviewIndex === 0 ? DEFAULT_POSITION : match.moves[reviewIndex - 1].after,
  );
}
function renderBoard() {
  const board = shownBoard();
  const files = flipped ? "hgfedcba" : "abcdefgh";
  const ranks = flipped ? "12345678" : "87654321";
  const legal =
    selected && phase === "playing"
      ? match.chess.moves({ square: selected, verbose: true })
      : [];
  const last =
    phase === "review" ? match.moves[reviewIndex - 1] : match.moves.at(-1);
  let html = "";
  for (const [ri, rank] of [...ranks].entries())
    for (const [fi, file] of [...files].entries()) {
      const square = file + rank;
      const piece = board.get(square);
      const dark = (file.charCodeAt(0) - 97 + Number(rank)) % 2 === 1;
      const allowed = legal.some((m) => m.to === square);
      const check =
        piece?.type === "k" && piece.color === board.turn() && board.inCheck();
      html += `<button class="square ${dark ? "dark" : "light"} ${selected === square ? "selected" : ""} ${last && (last.from === square || last.to === square) ? "last" : ""} ${check ? "check" : ""}" data-square="${square}" aria-label="${square}${piece ? ` ${colorName(piece.color)} ${accessibleNames[piece.type]}` : " empty"}${allowed ? ", legal destination" : ""}" aria-pressed="${selected === square}">${fi === 0 ? `<span class="rank">${rank}</span>` : ""}${ri === 7 ? `<span class="file">${file}</span>` : ""}${piece ? pieceImage(piece) : ""}${allowed ? `<span class="move-dot ${piece ? "capture" : ""}"></span>` : ""}</button>`;
    }
  return html;
}
function playerBar(color) {
  const human = color === match.settings.color;
  return `<div class="player"><div class="avatar ${human ? "" : "bot"}">${human ? "Y" : "S"}</div><div class="player-name"><strong>${human ? "You" : "Stockfish"}</strong><span>${colorName(color)}${human ? " · Find your rhythm" : ` · Skill ${match.settings.skill}/20`}</span></div><div class="clock ${phase === "playing" && match.chess.turn() === color ? "active" : ""}" data-clock="${color}">${formatClock(match.remaining[color])}</div></div>`;
}
function moveList() {
  const moves = match.moves;
  if (!moves.length)
    return '<p class="empty-state">A clean board. A fresh start.<br>Your moves will appear here.</p>';
  let html = "";
  for (let i = 0; i < moves.length; i += 2) {
    html += `<div class="move-row"><span class="move-number">${i / 2 + 1}.</span>`;
    for (let j = i; j < Math.min(i + 2, moves.length); j++) {
      const tag = analysis?.reviews[j];
      html += `<button data-ply="${j + 1}" ${phase !== "review" ? "disabled" : ""} class="move ${reviewIndex === j + 1 && phase === "review" ? "current" : ""}"><span>${escape(moves[j].san)}</span>${tag ? `<span class="move-tag ${tag.label.toLowerCase().replaceAll(" ", "-")}">${escape(tag.label)}</span>` : `<small>${(match.times[j] / 1000).toFixed(1)}s</small>`}</button>`;
    }
    html += "</div>";
  }
  return html;
}
function setupPanel() {
  return `<section class="card setup-card"><div class="section-heading"><span class="eyebrow">YOUR SESSION</span><span class="pill">Local & private</span></div><h2>Make every second count.</h2><p class="muted">Play the position. Trust your decision.<br>Review the whole game when it’s over.</p><form id="setup-form"><label for="time">Time control</label><div class="select-wrap"><select id="time" name="time"><option value="1+0">Bullet · 1 min</option><option value="3+2" selected>Blitz · 3 min + 2 sec</option><option value="5+0">Blitz · 5 min</option><option value="10+5">Rapid · 10 min + 5 sec</option></select></div><label for="strength">Computer strength</label><select id="strength" name="strength"><option value="0">Gentle · Skill 0</option><option value="5" selected>Casual · Skill 5</option><option value="10">Challenging · Skill 10</option><option value="15">Strong · Skill 15</option><option value="20">Maximum · Skill 20</option></select><p class="field-note">Relative engine levels, not calibrated Elo ratings.</p><label for="color">Play as</label><select id="color" name="color"><option value="w">White · You move first</option><option value="b">Black · Computer moves first</option><option value="random">Surprise me</option></select><button class="primary start" type="submit">Start a game <span>↗</span></button></form><div class="quiet-note"><span>◷</span> No evaluations or takebacks during play.<br>Just you, the board, and the clock.</div></section>`;
}
function chart() {
  if (!analysis) return "";
  const points = analysis.positions
    .map(
      (p, i) =>
        `${(i / Math.max(1, analysis.positions.length - 1)) * 300},${50 - Math.max(-800, Math.min(800, numericScore(p.score) ?? 0)) / 20}`,
    )
    .join(" ");
  return `<div class="eval-chart" aria-label="Evaluation through the game, positive means White is ahead"><svg viewBox="0 0 300 100" role="img"><title>White’s advantage over the course of the game</title><line x1="0" y1="50" x2="300" y2="50" class="zero-line"/><polyline points="${points}"/><line x1="${(reviewIndex / Math.max(1, match.moves.length)) * 300}" y1="0" x2="${(reviewIndex / Math.max(1, match.moves.length)) * 300}" y2="100" class="cursor-line"/></svg><div class="chart-caption"><span>Opening</span><span>White + / Black −</span><span>Finish</span></div></div>`;
}
function reviewPanel() {
  const move = match.moves[reviewIndex - 1];
  const entry = analysis?.reviews[reviewIndex - 1];
  const evaluation = analysis?.positions[reviewIndex];
  const ownReviews = analysis?.reviews.filter(
    (_, i) => match.moves[i].color === match.settings.color,
  );
  return `<section class="card review-card"><div class="section-heading"><span class="eyebrow">AFTER THE CLOCK</span><span class="pill">Game review</span></div><h2>${resultText()}.</h2><p class="muted">${escape(match.result.reason)}</p>${!analysis ? `<button class="primary" data-action="analyze" ${analyzing || !match.moves.length ? "disabled" : ""}>${analyzing ? escape(progress || "Preparing analysis…") : "Analyze full game ↗"}</button><p class="field-note">Stockfish reviews every position locally. You can browse the moves while it works.</p>` : `<div class="review-summary"><div><strong>${ownReviews.filter((r) => ["Blunder", "Allows mate", "Missed mate"].includes(r.label)).length}</strong><span>Your major misses</span></div><div><strong>${ownReviews.filter((r) => r.label === "Best").length}</strong><span>Your best moves</span></div></div>${chart()}`}
    <div class="review-position"><div class="section-heading"><strong>${move ? `${Math.ceil(reviewIndex / 2)}${move.color === "w" ? "." : "…"} ${escape(move.san)}` : "Starting position"}</strong><span class="evaluation">${evaluation?.terminal && evaluation.score.type === "mate" ? "Mate" : formatScore(evaluation?.score)}</span></div>${entry ? `<p><span class="badge ${entry.label.toLowerCase().replaceAll(" ", "-")}">${entry.label}</span> <span class="muted">${entry.loss === null ? "" : `${(entry.loss / 100).toFixed(2)} pawns lost`}</span></p><p class="review-detail">${entry.best ? `Engine’s choice: <strong>${escape(entry.best)}</strong>` : ""}${move ? ` · ${colorName(move.color)} used ${(match.times[reviewIndex - 1] / 1000).toFixed(1)}s` : ""}</p>${entry.line.length ? `<p class="pv">Suggested line: ${escape(entry.line.join(" "))}</p>` : ""}` : `<p class="muted">${move ? `${colorName(move.color)} moved · ${(match.times[reviewIndex - 1] / 1000).toFixed(1)}s thinking time` : "Step through the decisions that shaped this game."}</p>`}</div>
    <div class="navigation"><button data-action="first" aria-label="Starting position" ${reviewIndex === 0 ? "disabled" : ""}>|←</button><button data-action="prev" aria-label="Previous move" ${reviewIndex === 0 ? "disabled" : ""}>←</button><span>${reviewIndex} / ${match.moves.length}</span><button data-action="next" aria-label="Next move" ${reviewIndex === match.moves.length ? "disabled" : ""}>→</button><button data-action="last" aria-label="Final position" ${reviewIndex === match.moves.length ? "disabled" : ""}>→|</button></div>
    <p class="field-note">${analysis ? "Quick analysis, up to depth 16 / 350ms per position. Labels use approximate evaluation loss (0.5 / 1 / 2 pawns); they are not a definitive accuracy rating. Scores favor White when positive." : "Use ← → keys to step through the game."}</p><div class="button-row"><button class="secondary" data-action="export">Export PGN ↓</button><button class="secondary" data-action="new">New game ↗</button></div></section>`;
}
function render() {
  const oldScroll = document.querySelector(".moves")?.scrollTop;
  const top = flipped ? "w" : "b";
  app.innerHTML = `<div class="shell"><header><a class="brand" href="${base}" aria-label="LSChess home"><span class="brand-icon">♞</span>LS<span>Chess</span><span class="edition">/ REIMAGINED</span></a><span class="header-note"><span class="status-dot"></span> Browser-local chess</span></header><main><div class="intro"><div><span class="eyebrow">A LITTLE PRESSURE. A BETTER PLAYER.</span><h1>Play fast. <em>Think after.</em></h1></div><p>A handmade game from 2015.<br>A new place to sharpen your instincts.</p></div>${error ? `<div class="error" role="alert">${escape(error)} <button data-action="dismiss">Dismiss</button></div>` : ""}<div class="workspace"><section class="board-column" aria-label="Chess game">${playerBar(top)}<div class="board-frame"><div class="board" role="group" aria-label="Chess board">${renderBoard()}</div></div>${playerBar(opposite(top))}<div class="board-toolbar"><p id="status" role="status">${escape(statusText())}</p><button class="icon-button" data-action="flip" aria-label="Flip board" title="Flip board">⇅</button></div>${phase === "playing" ? '<div class="training-note"><span>●</span> Play first. Analysis unlocks when the game ends.</div>' : '<div class="training-note">2015 pieces. Modern rules. Same love of the game.</div>'}</section><aside>${phase === "setup" ? setupPanel() : phase === "loading" ? '<section class="card"><span class="eyebrow">GETTING READY</span><h2>Meet your opponent.</h2><p class="muted" role="status">Loading Stockfish on your device…</p><button class="secondary" data-action="new">Cancel</button></section>' : phase === "review" ? reviewPanel() : `<section class="card live-card"><span class="eyebrow">TRAINING IN PROGRESS</span><h2>${match.chess.turn() === match.settings.color ? "Find your move." : "Over to Stockfish."}</h2><p class="muted">${escape(match.settings.preset)} · ${colorName(match.settings.color)} · Skill ${match.settings.skill}</p><div class="live-message">The best feedback comes after<br>you’ve made your own decisions.</div><button class="secondary" data-action="resign">Resign game</button></section>`}${phase !== "setup" && phase !== "loading" ? `<section class="card history-card"><div class="section-heading"><span class="eyebrow">MOVE HISTORY</span><span class="muted">${match.moves.length} ply</span></div><div class="moves">${moveList()}</div></section>` : ""}</aside></div>${archive.length && phase === "setup" ? `<section class="archive"><div class="section-heading"><h2>Recently played</h2><span class="muted">Saved on this browser · Last 20 games</span></div><div class="archive-list">${archive.map((g, i) => `<button class="archive-item" data-archive="${i}"><span>${escape(new Date(g.date).toLocaleDateString())}</span><strong>${escape(g.title)}</strong><span>${escape(g.settings?.preset || "")} · ${g.plies} ply ↗</span></button>`).join("")}</div></section>` : ""}</main><footer><span>LSChess · Originally handmade in Java, 2015</span><span>${storageWarning ? escape(storageWarning) : "No account. No server. Your games stay here."} · <a href="${base}engine/SOURCE.txt" target="_blank" rel="noopener">Stockfish source</a> · <a href="${base}engine/COPYING.txt" target="_blank" rel="noopener">GPLv3</a></span></footer></div>${promotion ? `<div class="modal-backdrop"><section class="promotion-dialog" role="dialog" aria-modal="true" aria-labelledby="promotion-title"><span class="eyebrow">PAWN PROMOTION</span><h2 id="promotion-title">Choose your piece.</h2><p class="muted">Your clock is still running.</p><div class="promotion-options">${["q", "r", "b", "n"].map((p) => `<button data-promote="${p}" aria-label="Promote to ${accessibleNames[p]}">${pieceImage({ type: p, color: match.settings.color })}<span>${accessibleNames[p]}</span></button>`).join("")}</div><button data-action="cancel-promotion" class="secondary">Cancel</button></section></div>` : ""}`;
  bindEvents();
  const movesElement = document.querySelector(".moves");
  if (movesElement)
    movesElement.scrollTop =
      phase === "playing" ? movesElement.scrollHeight : oldScroll || 0;
  if (promotion) document.querySelector("[data-promote]")?.focus();
}
function bindEvents() {
  document.querySelector("#setup-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const chosen = data.get("color");
    startGame({
      preset: data.get("time"),
      skill: Number(data.get("strength")),
      color: chosen === "random" ? (Math.random() < 0.5 ? "w" : "b") : chosen,
    });
  });
  document
    .querySelectorAll("[data-square]")
    .forEach((el) =>
      el.addEventListener("click", () => clickSquare(el.dataset.square)),
    );
  document
    .querySelectorAll("[data-action]")
    .forEach((el) =>
      el.addEventListener("click", () => action(el.dataset.action)),
    );
  document.querySelectorAll("[data-ply]").forEach((el) =>
    el.addEventListener("click", () => {
      if (phase === "review") {
        reviewIndex = Number(el.dataset.ply);
        render();
      }
    }),
  );
  document.querySelectorAll("[data-promote]").forEach((el) =>
    el.addEventListener("click", () => {
      const move = { ...promotion, promotion: el.dataset.promote };
      promotion = null;
      playMove(move);
    }),
  );
  document
    .querySelectorAll("[data-archive]")
    .forEach((el) =>
      el.addEventListener("click", () =>
        openArchive(Number(el.dataset.archive)),
      ),
    );
  document.querySelector(".brand")?.addEventListener("click", (event) => {
    event.preventDefault();
    action("new");
  });
}
async function startGame(settings) {
  const token = ++generation;
  engine?.dispose();
  engine = new Engine();
  match = new Match(settings);
  flipped = settings.color === "b";
  selected = promotion = analysis = savedId = null;
  error = "";
  analyzing = false;
  phase = "loading";
  render();
  try {
    await engine.init();
    if (token !== generation) return;
    phase = "playing";
    match.start();
    render();
    if (window.innerWidth <= 720)
      document
        .querySelector(".board-column")
        ?.scrollIntoView({ block: "start", behavior: "instant" });
    if (match.chess.turn() !== settings.color) await computerMove();
  } catch (e) {
    if (token !== generation) return;
    engine?.dispose();
    phase = "setup";
    error = e.message;
    render();
  }
}
function clickSquare(square) {
  if (
    phase !== "playing" ||
    match.chess.turn() !== match.settings.color ||
    promotion
  )
    return;
  match.tick();
  if (match.result) return finishGame();
  if (selected) {
    const candidates = match.chess
      .moves({ square: selected, verbose: true })
      .filter((m) => m.to === square);
    if (candidates.length) {
      if (candidates.some((m) => m.promotion)) {
        promotion = { from: selected, to: square };
        render();
        return;
      }
      playMove({ from: selected, to: square });
      return;
    }
  }
  selected =
    selected !== square &&
    match.chess.get(square)?.color === match.settings.color
      ? square
      : null;
  render();
  document
    .querySelector(`[data-square="${square}"]`)
    ?.focus({ preventScroll: true });
}
function playMove(input) {
  if (phase !== "playing" || match.chess.turn() !== match.settings.color)
    return;
  const moved = match.move(input);
  selected = null;
  if (match.result) return finishGame();
  render();
  if (moved) computerMove();
}
async function computerMove() {
  const token = generation;
  try {
    const remaining = match.remaining[match.chess.turn()];
    const response = await engine.search({
      moves: match.uci,
      skill: match.settings.skill,
      movetime: Math.min(650, Math.max(20, remaining / 25)),
    });
    if (token !== generation || phase !== "playing") return;
    const moved = match.move(response.bestmove);
    if (match.result) return finishGame();
    if (!moved)
      throw new Error(
        "The engine returned an invalid move. This game was stopped without a result.",
      );
    render();
  } catch (e) {
    if (token !== generation || phase !== "playing") return;
    error = e.message;
    match.finish({ winner: null, reason: "Engine error", interrupted: true });
    finishGame();
  }
}
function finishGame() {
  if (phase === "review") return;
  generation++;
  engine?.dispose();
  engine = null;
  phase = "review";
  selected = promotion = null;
  reviewIndex = match.moves.length;
  saveGame();
  render();
}
function saveGame() {
  if (!match.result || !match.moves.length) return;
  savedId ||= crypto.randomUUID();
  const game = {
    id: savedId,
    date: match.date,
    title: `${resultText()} · ${match.result.reason}`,
    settings: match.settings,
    pgn: match.pgn,
    times: match.times,
    remaining: match.remaining,
    result: match.result,
    plies: match.moves.length,
    analysis,
  };
  archive = [game, ...archive.filter((g) => g.id !== savedId)].slice(0, 20);
  try {
    localStorage.setItem("lschess.games.v1", JSON.stringify(archive));
  } catch {
    storageWarning = "Could not save this game. Export PGN to keep it.";
  }
}
function openArchive(index) {
  try {
    const saved = archive[index];
    const restored = new Match(saved.settings);
    restored.chess.loadPgn(saved.pgn);
    restored.times = saved.times;
    restored.remaining = saved.remaining;
    restored.result = saved.result;
    restored.date = saved.date;
    if (!Array.isArray(restored.times) || !restored.result)
      throw new Error("Invalid saved game");
    match = restored;
    savedId = saved.id;
    analysis = saved.analysis || null;
    phase = "review";
    reviewIndex = match.moves.length;
    flipped = match.settings.color === "b";
    error = "";
    render();
  } catch {
    error = "This saved game could not be opened.";
    render();
  }
}
async function runAnalysis() {
  if (phase !== "review" || analyzing || !match.moves.length) return;
  const token = ++generation;
  engine?.dispose();
  engine = new Engine();
  analyzing = true;
  error = "";
  progress = "Preparing analysis…";
  render();
  try {
    await engine.init();
    if (token !== generation) return;
    const data = await analyzeGame(match.moves, engine, (done, total) => {
      if (token !== generation) return;
      progress = `Analyzing ${done} / ${total} positions…`;
      const button = document.querySelector('[data-action="analyze"]');
      if (button) button.textContent = progress;
    });
    if (token !== generation) return;
    analysis = data;
    saveGame();
  } catch (e) {
    if (token === generation) error = e.message;
  } finally {
    if (token === generation) {
      analyzing = false;
      engine?.dispose();
      engine = null;
      render();
    }
  }
}
function action(name) {
  if (name === "flip") {
    flipped = !flipped;
    render();
  }
  if (name === "dismiss") {
    error = "";
    render();
  }
  if (name === "cancel-promotion") {
    promotion = null;
    render();
  }
  if (
    name === "resign" &&
    phase === "playing" &&
    confirm("Resign this game and move to review?")
  ) {
    match.resign();
    finishGame();
  }
  if (name === "new") {
    if (
      phase === "playing" &&
      !confirm("End this game as a resignation and start a new session?")
    )
      return;
    if (phase === "playing") {
      match.resign();
      saveGame();
    }
    generation++;
    engine?.dispose();
    engine = null;
    analyzing = false;
    match = new Match();
    phase = "setup";
    selected = promotion = analysis = savedId = null;
    flipped = false;
    error = "";
    render();
  }
  if (name === "analyze") runAnalysis();
  if (phase === "review" && ["first", "prev", "next", "last"].includes(name)) {
    reviewIndex =
      name === "first"
        ? 0
        : name === "last"
          ? match.moves.length
          : Math.max(
              0,
              Math.min(
                match.moves.length,
                reviewIndex + (name === "next" ? 1 : -1),
              ),
            );
    render();
  }
  if (name === "export" && phase === "review") {
    const url = URL.createObjectURL(
      new Blob([match.pgn], { type: "application/x-chess-pgn" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `lschess-${match.date.slice(0, 10)}.pgn`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
function tick() {
  if (phase !== "playing") return;
  match.tick();
  if (match.result) return finishGame();
  for (const color of ["w", "b"]) {
    const clock = document.querySelector(`[data-clock="${color}"]`);
    if (clock) {
      clock.textContent = formatClock(match.remaining[color]);
      clock.classList.toggle("low", match.remaining[color] < 20000);
    }
  }
}
setInterval(tick, 100);
document.addEventListener("visibilitychange", tick);
window.addEventListener("beforeunload", (event) => {
  if (phase === "playing") {
    event.preventDefault();
    event.returnValue = "";
  }
});
document.addEventListener("keydown", (event) => {
  if (promotion && event.key === "Tab") {
    const buttons = [...document.querySelectorAll(".promotion-dialog button")];
    const next =
      buttons.indexOf(document.activeElement) + (event.shiftKey ? -1 : 1);
    event.preventDefault();
    buttons[(next + buttons.length) % buttons.length]?.focus();
    return;
  }
  if (event.key === "Escape") {
    selected = promotion = null;
    render();
  }
  if (phase !== "review" || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName))
    return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    action(event.key === "ArrowLeft" ? "prev" : "next");
  }
});
render();
