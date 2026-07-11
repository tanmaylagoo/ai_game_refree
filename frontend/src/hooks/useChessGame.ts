import { useCallback, useMemo, useRef, useState } from "react";
import { Chess, type Move, type Square, type PieceSymbol, type Color } from "chess.js";

export type CapturedPieces = {
  white: PieceSymbol[]; // pieces captured BY white (i.e., black pieces taken)
  black: PieceSymbol[]; // pieces captured BY black (i.e., white pieces taken)
};

export type GameStatus =
  | "in_progress"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "threefold"
  | "insufficient";

export type ChessGameState = {
  fen: string;
  pgn: string;
  history: Move[];
  lastSan: string | null;
  turn: Color;
  inCheck: boolean;
  gameStatus: GameStatus;
  gameOver: boolean;
  capturedPieces: CapturedPieces;
  viewIndex: number; // index into history for board view (-1 = start position, history.length-1 = latest)
  boardFen: string; // fen at current view
};

export type UseChessGame = ChessGameState & {
  makeMove: (from: string, to: string, promotion?: string) => Move | null;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  goToMove: (index: number) => void;
  loadFen: (fen: string) => boolean;
  loadPgn: (pgn: string) => boolean;
  isViewingLatest: boolean;
};

function computeCaptured(history: Move[]): CapturedPieces {
  const captured: CapturedPieces = { white: [], black: [] };
  for (const m of history) {
    if (m.captured) {
      if (m.color === "w") captured.white.push(m.captured);
      else captured.black.push(m.captured);
    }
  }
  return captured;
}

function computeStatus(chess: Chess): { status: GameStatus; gameOver: boolean } {
  if (chess.isCheckmate()) return { status: "checkmate", gameOver: true };
  if (chess.isStalemate()) return { status: "stalemate", gameOver: true };
  if (chess.isThreefoldRepetition()) return { status: "threefold", gameOver: true };
  if (chess.isInsufficientMaterial()) return { status: "insufficient", gameOver: true };
  if (chess.isDraw()) return { status: "draw", gameOver: true };
  if (chess.inCheck()) return { status: "check", gameOver: false };
  return { status: "in_progress", gameOver: false };
}

export function useChessGame(initialFen?: string): UseChessGame {
  const chessRef = useRef<Chess>(new Chess(initialFen));
  const redoStackRef = useRef<Move[]>([]);
  const [, forceTick] = useState(0);
  const [viewIndex, setViewIndex] = useState<number>(-1); // sync with latest by default

  const bump = useCallback(() => forceTick((t) => t + 1), []);

  const state = useMemo<ChessGameState>(() => {
    const chess = chessRef.current;
    const history = chess.history({ verbose: true }) as Move[];
    const { status, gameOver } = computeStatus(chess);
    const effectiveViewIndex = viewIndex === -1 || viewIndex >= history.length - 1
      ? history.length - 1
      : viewIndex;

    // compute board FEN at view index
    let boardFen = chess.fen();
    if (effectiveViewIndex < history.length - 1) {
      const tmp = new Chess();
      if (initialFen) tmp.load(initialFen);
      for (let i = 0; i <= effectiveViewIndex; i++) {
        tmp.move(history[i].san);
      }
      boardFen = tmp.fen();
    }

    return {
      fen: chess.fen(),
      pgn: chess.pgn(),
      history,
      lastSan: history.length > 0 ? history[history.length - 1].san : null,
      turn: chess.turn(),
      inCheck: chess.inCheck(),
      gameStatus: status,
      gameOver,
      capturedPieces: computeCaptured(history),
      viewIndex: effectiveViewIndex,
      boardFen,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewIndex, chessRef.current.fen()]);

  const makeMove = useCallback(
    (from: string, to: string, promotion = "q"): Move | null => {
      const chess = chessRef.current;
      // If viewing past position, snap to latest before moving
      try {
        const move = chess.move({ from: from as Square, to: to as Square, promotion });
        if (move) {
          redoStackRef.current = [];
          setViewIndex(-1);
          bump();
          return move;
        }
      } catch {
        return null;
      }
      return null;
    },
    [bump],
  );

  const undo = useCallback(() => {
    const chess = chessRef.current;
    const undone = chess.undo();
    if (undone) {
      redoStackRef.current.push(undone);
      setViewIndex(-1);
      bump();
    }
  }, [bump]);

  const redo = useCallback(() => {
    const chess = chessRef.current;
    const move = redoStackRef.current.pop();
    if (move) {
      chess.move(move.san);
      setViewIndex(-1);
      bump();
    }
  }, [bump]);

  const reset = useCallback(() => {
    chessRef.current = new Chess(initialFen);
    redoStackRef.current = [];
    setViewIndex(-1);
    bump();
  }, [bump, initialFen]);

  const goToMove = useCallback((index: number) => {
    setViewIndex(index);
  }, []);

  const loadFen = useCallback(
    (fen: string): boolean => {
      try {
        const test = new Chess();
        test.load(fen);
        chessRef.current = test;
        redoStackRef.current = [];
        setViewIndex(-1);
        bump();
        return true;
      } catch {
        return false;
      }
    },
    [bump],
  );

  const loadPgn = useCallback(
    (pgn: string): boolean => {
      try {
        const test = new Chess();
        test.loadPgn(pgn);
        chessRef.current = test;
        redoStackRef.current = [];
        setViewIndex(-1);
        bump();
        return true;
      } catch {
        return false;
      }
    },
    [bump],
  );

  return {
    ...state,
    makeMove,
    undo,
    redo,
    reset,
    goToMove,
    loadFen,
    loadPgn,
    isViewingLatest: state.viewIndex === state.history.length - 1,
  };
}
