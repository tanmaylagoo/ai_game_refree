import { motion } from "framer-motion";
import type { PieceSymbol } from "chess.js";
import { pieceGlyph, PIECE_VALUES } from "../../utils/pieceIcons";

type Props = {
  pieces: PieceSymbol[];
  // color of the pieces displayed (i.e., which side lost them)
  color: "w" | "b";
  opponentPieces: PieceSymbol[];
  label: string;
};

export function CapturedPieces({ pieces, color, opponentPieces, label }: Props) {
  const myScore = pieces.reduce((s, p) => s + PIECE_VALUES[p], 0);
  const oppScore = opponentPieces.reduce((s, p) => s + PIECE_VALUES[p], 0);
  const diff = oppScore - myScore;

  // sort by value desc for tidy display
  const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);

  return (
    <div className="flex items-center gap-2 min-h-8">
      <span className="text-xs uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-0.5">
        {sorted.map((p, i) => (
          <motion.span
            key={`${p}-${i}`}
            initial={{ opacity: 0, y: -6, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={
              color === "w"
                ? "text-lg leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
                : "text-lg leading-none text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.15)]"
            }
          >
            {pieceGlyph(p, color)}
          </motion.span>
        ))}
      </div>
      {diff > 0 && (
        <span className="text-xs font-semibold text-accent-foreground/80">+{diff}</span>
      )}
    </div>
  );
}
