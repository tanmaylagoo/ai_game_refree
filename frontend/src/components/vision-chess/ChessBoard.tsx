import { motion } from "framer-motion";
import { Chessboard } from "react-chessboard";
import { useEffect, useMemo, useState } from "react";
import type { Move } from "chess.js";
import { Chess } from "chess.js";
import { toast } from "react-hot-toast";
import { useChessGame } from "../../hooks/useChessGame";
import type { CapturedPieces, GameStatus } from "../../hooks/useChessGame";
import { CapturedPieces as CapturedPiecesView } from "./CapturedPieces";
import { MoveHistory } from "./MoveHistory";
import { TopBar } from "./TopBar";
import { ChessControls } from "./ChessControls";
import { ImportFenDialog } from "./ImportFenDialog";

export type ChessBoardApi = {
  currentFen: string;
  currentPGN: string;
  moveHistory: Move[];
  capturedPieces: CapturedPieces;
  gameStatus: GameStatus;
  currentTurn: "w" | "b";
};

type Props = {
  initialFen?: string;
  onMove?: (move: Move, api: ChessBoardApi) => void;
  onFenChange?: (fen: string, api: ChessBoardApi) => void;
};

import { UseChessGame } from "../../hooks/useChessGame";

export function ChessBoard({ game, onMove, onFenChange }: Props & { game: UseChessGame }) {
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [importOpen, setImportOpen] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const api: ChessBoardApi = useMemo(
    () => ({
      currentFen: game.fen,
      currentPGN: game.pgn,
      moveHistory: game.history,
      capturedPieces: game.capturedPieces,
      gameStatus: game.gameStatus,
      currentTurn: game.turn,
    }),
    [game.fen, game.pgn, game.history, game.capturedPieces, game.gameStatus, game.turn],
  );

  // notify parent of FEN changes
  useEffect(() => {
    onFenChange?.(game.fen, api);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.fen]);

  // toast on game-ending status
  useEffect(() => {
    if (game.gameStatus === "checkmate") {
      const winner = game.turn === "w" ? "Black" : "White";
      toast.success(`Checkmate — ${winner} wins`);
    } else if (game.gameStatus === "stalemate") {
      toast("Stalemate — draw", { icon: "🤝" });
    } else if (game.gameStatus === "threefold") {
      toast("Draw by threefold repetition", { icon: "🤝" });
    } else if (game.gameStatus === "insufficient") {
      toast("Draw — insufficient material", { icon: "🤝" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameStatus]);

  const handleDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    piece: { pieceType: string };
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare) return false;
    // Only allow moves from the latest position
    if (!game.isViewingLatest && game.history.length > 0) {
      toast("Return to latest move to play", { icon: "⏭️" });
      return false;
    }
    const move = game.makeMove(sourceSquare, targetSquare, "q");
    if (move) {
      setSelectedSquare(null);
      onMove?.(move, api);
      return true;
    }
    return false;
  };

  const handleSquareClick = ({ square }: { square: string; piece: { pieceType: string } | null }) => {
    if (!game.isViewingLatest && game.history.length > 0) return;
    if (selectedSquare && selectedSquare !== square) {
      const move = game.makeMove(selectedSquare, square, "q");
      if (move) {
        onMove?.(move, api);
        setSelectedSquare(null);
        return;
      }
    }
    // toggle selection to a piece of the side to move
    try {
      const chess = new Chess(game.boardFen);
      const p = chess.get(square as never);
      if (p && p.color === game.turn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    } catch {
      setSelectedSquare(null);
    }
  };

  // Highlight legal targets from the selected square
  const squareStyles = useMemo<Record<string, React.CSSProperties>>(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: "inset 0 0 0 3px rgba(139,92,246,0.75)",
        background: "rgba(139,92,246,0.18)",
      };
      try {
        const chess = new Chess(game.boardFen);
        const moves = chess.moves({ square: selectedSquare as never, verbose: true }) as Move[];
        moves.forEach((m) => {
          styles[m.to] = m.captured
            ? {
                background:
                  "radial-gradient(circle, transparent 55%, rgba(244,63,94,0.55) 58%, rgba(244,63,94,0.55) 66%, transparent 68%)",
              }
            : {
                background:
                  "radial-gradient(circle, rgba(139,92,246,0.55) 22%, transparent 24%)",
              };
        });
      } catch {
        // ignore
      }
    }
    // highlight king square in check
    if (game.inCheck) {
      try {
        const chess = new Chess(game.boardFen);
        const board = chess.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === "k" && p.color === game.turn) {
              styles[p.square] = {
                ...(styles[p.square] || {}),
                background:
                  "radial-gradient(circle, rgba(239,68,68,0.65) 30%, rgba(239,68,68,0.15) 70%, transparent 75%)",
              };
            }
          }
        }
      } catch {
        // ignore
      }
    }
    // highlight last move
    const idx = game.viewIndex;
    if (idx >= 0 && game.history[idx]) {
      const m = game.history[idx];
      const highlight = { background: "rgba(139,92,246,0.25)" };
      styles[m.from] = { ...(styles[m.from] || {}), ...highlight };
      styles[m.to] = { ...(styles[m.to] || {}), ...highlight };
    }
    return styles;
  }, [selectedSquare, game.boardFen, game.inCheck, game.turn, game.viewIndex, game.history]);

  const copyFen = async () => {
    await navigator.clipboard.writeText(game.fen);
    toast.success("FEN copied successfully");
  };
  const copyPgn = async () => {
    await navigator.clipboard.writeText(game.pgn || "");
    toast.success("PGN copied successfully");
  };
  const exportPgn = () => {
    const blob = new Blob([game.pgn || ""], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game-${new Date().toISOString().slice(0, 10)}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("PGN exported");
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <TopBar
        turn={game.turn}
        status={game.gameStatus}
        gameOver={game.gameOver}
        inCheck={game.inCheck}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 sm:p-6 shadow-[0_20px_60px_-20px_rgba(90,60,200,0.5)]"
        >
          <CapturedPiecesView
            pieces={orientation === "white" ? game.capturedPieces.white : game.capturedPieces.black}
            color={orientation === "white" ? "b" : "w"}
            opponentPieces={orientation === "white" ? game.capturedPieces.black : game.capturedPieces.white}
            label={orientation === "white" ? "Black lost" : "White lost"}
          />

          <div className="my-3 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Chessboard
              options={{
                id: "analysis-board",
                position: game.boardFen,
                onPieceDrop: handleDrop,
                onSquareClick: handleSquareClick,
                boardOrientation: orientation,
                animationDurationInMs: 200,
                showAnimations: true,
                allowDragging: game.isViewingLatest || game.history.length === 0,
                squareStyles,
                darkSquareStyle: { backgroundColor: "#4c3f6b" },
                lightSquareStyle: { backgroundColor: "#dcd6f0" },
                boardStyle: { width: "100%", borderRadius: "12px" },
              }}
            />
          </div>

          <CapturedPiecesView
            pieces={orientation === "white" ? game.capturedPieces.black : game.capturedPieces.white}
            color={orientation === "white" ? "w" : "b"}
            opponentPieces={orientation === "white" ? game.capturedPieces.white : game.capturedPieces.black}
            label={orientation === "white" ? "White lost" : "Black lost"}
          />

          <div className="mt-4">
            <ChessControls
              onUndo={game.undo}
              onRedo={game.redo}
              onReset={() => {
                game.reset();
                toast.success("Board reset");
              }}
              onFlip={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
              onCopyPgn={copyPgn}
              onExportPgn={exportPgn}
              onImportFen={() => setImportOpen(true)}
            />
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_60px_-20px_rgba(90,60,200,0.5)]"
        >
          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/70">
              Move history
            </h3>
            <MoveHistory
              history={game.history}
              viewIndex={game.viewIndex}
              onGoTo={game.goToMove}
            />
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/70">
              Last move (SAN)
            </h3>
            <div className="rounded-xl bg-black/25 border border-white/5 px-3 py-2 font-mono text-sm">
              {game.lastSan ?? <span className="text-muted-foreground/50 italic">—</span>}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/70">
              FEN
            </h3>
            <div className="rounded-xl bg-black/25 border border-white/5 px-3 py-2 font-mono text-[11px] break-all text-foreground/85">
              {game.fen}
            </div>
            <button
              onClick={copyFen}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-neon-purple/20 hover:bg-neon-purple/35 border border-neon-purple/30 px-3 py-1.5 text-xs font-medium text-neon-purple transition-all duration-200"
            >
              📋 Copy FEN
            </button>
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/70">
              PGN
            </h3>
            <div className="max-h-32 overflow-y-auto rounded-xl bg-black/25 border border-white/5 px-3 py-2 font-mono text-[11px] whitespace-pre-wrap text-foreground/85">
              {game.pgn || <span className="text-muted-foreground/50 italic">No moves played</span>}
            </div>
          </section>
        </motion.aside>
      </div>

      <ImportFenDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(fen) => {
          const ok = game.loadFen(fen);
          if (ok) toast.success("Position loaded");
          return ok;
        }}
      />
    </div>
  );
}
