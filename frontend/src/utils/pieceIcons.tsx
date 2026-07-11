import type { PieceSymbol } from "chess.js";

// Unicode chess symbols used as compact captured-piece indicators.
const WHITE: Record<PieceSymbol, string> = {
  p: "♙",
  n: "♘",
  b: "♗",
  r: "♖",
  q: "♕",
  k: "♔",
};
const BLACK: Record<PieceSymbol, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function pieceGlyph(piece: PieceSymbol, color: "w" | "b"): string {
  return color === "w" ? WHITE[piece] : BLACK[piece];
}
