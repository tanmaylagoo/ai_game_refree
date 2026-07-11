import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (fen: string) => boolean;
};

export function ImportFenDialog({ open, onClose, onImport }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const ok = onImport(value.trim());
    if (ok) {
      setValue("");
      setError(null);
      onClose();
    } else {
      setError("That FEN string is invalid.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Import FEN</h2>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Paste a Forsyth–Edwards Notation string to load a position.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-muted-foreground/70 hover:bg-white/10 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              className="mt-4 w-full h-24 rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            {error && (
              <p className="mt-2 text-xs text-red-300">{error}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="rounded-lg bg-gradient-to-r from-primary to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90"
              >
                Load position
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
