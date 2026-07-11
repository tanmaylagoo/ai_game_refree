import { motion } from "framer-motion";
import {
  Undo2,
  Redo2,
  RotateCcw,
  FlipVertical2,
  Copy,
  ClipboardPaste,
  Download,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onFlip: () => void;
  onCopyPgn: () => void;
  onExportPgn: () => void;
  onImportFen: () => void;
};

export function ChessControls({
  onUndo,
  onRedo,
  onReset,
  onFlip,
  onCopyPgn,
  onExportPgn,
  onImportFen,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      <Btn icon={Undo2} label="Undo" onClick={onUndo} />
      <Btn icon={Redo2} label="Redo" onClick={onRedo} />
      <Btn icon={RotateCcw} label="Reset" onClick={onReset} />
      <Btn icon={FlipVertical2} label="Flip" onClick={onFlip} />
      <Btn icon={FileText} label="Copy PGN" onClick={onCopyPgn} />
      <Btn icon={Download} label="Export" onClick={onExportPgn} />
      <Btn icon={ClipboardPaste} label="Import" onClick={onImportFen} accent />
    </div>
  );
}

function Btn({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={
        "flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors " +
        (accent
          ? "bg-gradient-to-b from-primary/40 to-purple-500/30 border-primary/50 text-white hover:from-primary/60 hover:to-purple-500/50"
          : "bg-white/5 border-white/10 text-foreground/85 hover:bg-white/10 hover:text-foreground")
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );
}
