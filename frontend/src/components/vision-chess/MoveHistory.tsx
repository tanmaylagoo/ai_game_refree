import { motion } from "framer-motion";
import type { Move } from "chess.js";
import { useEffect, useRef } from "react";

type Props = {
  history: Move[];
  viewIndex: number;
  onGoTo: (index: number) => void;
};

export function MoveHistory({ history, viewIndex, onGoTo }: Props) {
  const rows: { num: number; white?: Move; black?: Move; wIdx?: number; bIdx?: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      num: i / 2 + 1,
      white: history[i],
      black: history[i + 1],
      wIdx: i,
      bIdx: i + 1 < history.length ? i + 1 : undefined,
    });
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[280px] overflow-y-auto rounded-xl bg-black/20 border border-white/5 p-2 font-mono text-sm"
    >
      {rows.length === 0 && (
        <p className="text-muted-foreground/60 text-xs italic px-2 py-4 text-center">
          No moves yet — make your first move.
        </p>
      )}
      {rows.map((r) => (
        <div
          key={r.num}
          className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2 py-0.5"
        >
          <span className="text-muted-foreground/60 text-xs text-right">{r.num}.</span>
          {r.white && (
            <MoveCell san={r.white.san} active={viewIndex === r.wIdx} onClick={() => onGoTo(r.wIdx!)} />
          )}
          {r.black ? (
            <MoveCell san={r.black.san} active={viewIndex === r.bIdx} onClick={() => onGoTo(r.bIdx!)} />
          ) : (
            <span />
          )}
        </div>
      ))}
    </div>
  );
}

function MoveCell({ san, active, onClick }: { san: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={
        "text-left rounded-md px-2 py-1 transition-colors " +
        (active
          ? "bg-primary/30 text-foreground ring-1 ring-primary/50"
          : "hover:bg-white/5 text-foreground/90")
      }
    >
      {san}
    </motion.button>
  );
}
