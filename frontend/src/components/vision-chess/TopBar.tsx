import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { StatusPanel } from "./StatusPanel";
import type { GameStatus } from "../../hooks/useChessGame";

type Props = {
  turn: "w" | "b";
  status: GameStatus;
  gameOver: boolean;
  inCheck: boolean;
};

export function TopBar(props: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-3 shadow-[0_8px_40px_-12px_rgba(80,60,200,0.35)]"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg">
          <Swords className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight leading-tight">
            Chess Analysis Board
          </h1>
          <p className="text-xs text-muted-foreground/70">
            Drag pieces to play · click history to review
          </p>
        </div>
      </div>
      <StatusPanel {...props} />
    </motion.header>
  );
}
