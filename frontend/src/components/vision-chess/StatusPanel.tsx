import { motion } from "framer-motion";
import { AlertTriangle, Crown, Handshake } from "lucide-react";
import type { GameStatus } from "../../hooks/useChessGame";

type Props = {
  turn: "w" | "b";
  status: GameStatus;
  gameOver: boolean;
  inCheck: boolean;
};

const LABELS: Record<GameStatus, string> = {
  in_progress: "In progress",
  check: "Check",
  checkmate: "Checkmate",
  stalemate: "Stalemate",
  draw: "Draw",
  threefold: "Draw · threefold",
  insufficient: "Draw · insufficient material",
};

export function StatusPanel({ turn, status, gameOver, inCheck }: Props) {
  const turnColor = turn === "w" ? "White" : "Black";

  return (
    <div className="flex items-center gap-3">
      <motion.div
        key={turn}
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5"
      >
        <span
          className={
            "h-2.5 w-2.5 rounded-full " +
            (turn === "w" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" : "bg-slate-800 ring-1 ring-white/40")
          }
        />
        <span className="text-sm font-medium">{turnColor} to move</span>
      </motion.div>

      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border " +
          (gameOver
            ? "bg-purple-500/15 border-purple-400/30 text-purple-200"
            : inCheck
              ? "bg-red-500/15 border-red-400/30 text-red-200"
              : "bg-white/5 border-white/10 text-foreground/80")
        }
      >
        {status === "checkmate" && <Crown className="h-4 w-4" />}
        {status === "check" && <AlertTriangle className="h-4 w-4" />}
        {(status === "stalemate" || status === "draw" || status === "threefold" || status === "insufficient") && (
          <Handshake className="h-4 w-4" />
        )}
        <span>{LABELS[status]}</span>
      </motion.div>
    </div>
  );
}
