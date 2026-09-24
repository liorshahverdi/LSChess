export function parseInfo(line) {
  const score = line.match(/\bscore (cp|mate) (-?\d+)/);
  if (!score || /\b(?:upperbound|lowerbound)\b/.test(line)) return null;
  return {
    score: { type: score[1], value: Number(score[2]) },
    depth: Number(line.match(/\bdepth (\d+)/)?.[1] || 0),
    pv:
      line
        .match(/\bpv (.+)$/)?.[1]
        .trim()
        .split(/\s+/) || [],
  };
}

export class Engine {
  constructor() {
    this.worker = null;
    this.pending = null;
    this.ready = false;
  }

  async init() {
    if (this.ready) return;
    this.worker = new Worker(
      `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`,
    );
    this.worker.onmessage = ({ data }) => {
      for (const line of String(data).split("\n"))
        this.pending?.onLine(line.trim());
    };
    this.worker.onerror = () =>
      this.fail(
        new Error("The chess engine could not load. Try reloading this page."),
      );
    await this.request(
      "uci",
      (line) => (line === "uciok" ? true : undefined),
      20000,
    );
    this.worker.postMessage("setoption name Hash value 32");
    await this.request(
      "isready",
      (line) => (line === "readyok" ? true : undefined),
      10000,
    );
    this.ready = true;
  }

  request(command, parse, timeout) {
    if (!this.worker)
      return Promise.reject(new Error("Engine is not available."));
    if (this.pending)
      return Promise.reject(new Error("Engine is already searching."));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () =>
          this.fail(new Error("Engine timed out. Please start a new game.")),
        timeout,
      );
      this.pending = {
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
        onLine: (line) => {
          const value = parse(line);
          if (value !== undefined) {
            clearTimeout(timer);
            this.pending = null;
            resolve(value);
          }
        },
      };
      this.worker.postMessage(command);
    });
  }

  async search({ moves = [], skill = 10, movetime = 400, depth } = {}) {
    if (!this.ready) throw new Error("Engine is not ready.");
    if (this.pending) throw new Error("Engine is already searching.");
    this.worker.postMessage(`setoption name Skill Level value ${skill}`);
    this.worker.postMessage(
      `position startpos${moves.length ? ` moves ${moves.join(" ")}` : ""}`,
    );
    let info = { score: null, depth: 0, pv: [] };
    return this.request(
      `go movetime ${Math.max(1, Math.floor(movetime))}${depth ? ` depth ${depth}` : ""}`,
      (line) => {
        const parsed = parseInfo(line);
        if (parsed) info = parsed;
        if (line.startsWith("bestmove "))
          return { ...info, bestmove: line.split(/\s+/)[1] };
      },
      Math.max(10000, movetime + 5000),
    );
  }

  fail(error) {
    const pending = this.pending;
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    pending?.reject(error);
  }

  dispose() {
    this.fail(new Error("Engine stopped."));
  }
}
