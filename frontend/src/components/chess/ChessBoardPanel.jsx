import React, { useState, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { motion } from 'framer-motion';
import { RotateCcw, Undo2, FlipVertical, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChat } from '../../contexts/ChatContext';
import { queryChess } from '../../services/chatService';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const ChessBoardPanel = () => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const { addMessage, clearChat, setIsLoading } = useChat();

  const safeGameMutate = useCallback((modify) => {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }, []);

  const onPieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    const gameCopy = new Chess(game.fen());
    let move = null;
    try {
      move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece?.[1]?.toLowerCase() || 'q',
      });
    } catch (e) {
      move = null;
    }

    if (move === null) {
      toast.error('Illegal move');
      return false;
    }

    const san = move.san;
    const fen = gameCopy.fen();

    // Optimistically update the board
    setGame(gameCopy);
    setIsThinking(true);
    setIsLoading(true);

    addMessage('chess', { role: 'user', content: `Move: **${san}**` });

    queryChess(san, fen)
      .then((response) => {
        if (response.engine_validation?.legal === false) {
          // Backend says illegal - undo
          safeGameMutate((g) => g.undo());
          toast.error(response.engine_validation?.reason || 'Move rejected by referee');
          addMessage('chess', {
            role: 'ai',
            content: `❌ **Illegal Move**\n\n${response.decision || response.engine_validation?.reason || 'Move was rejected.'}`,
          });
        } else {
          // Legal move - sync with backend FEN
          if (response.engine_validation?.fen_after) {
            setGame(new Chess(response.engine_validation.fen_after));
          }
          setMoveHistory((prev) => [...prev, { san, fen: response.engine_validation?.fen_after || fen }]);

          let aiContent = response.decision || 'Move accepted.';
          if (response.engine_validation?.is_check) aiContent += '\n\n♔ **Check!**';
          if (response.engine_validation?.is_checkmate) aiContent += '\n\n🏆 **Checkmate!**';
          if (response.engine_validation?.is_stalemate) aiContent += '\n\n🤝 **Stalemate!**';

          addMessage('chess', { role: 'ai', content: aiContent });
          toast.success('Move validated');
        }
      })
      .catch((err) => {
        safeGameMutate((g) => g.undo());
        toast.error(err.message || 'Failed to validate move');
        addMessage('chess', {
          role: 'ai',
          content: `⚠️ **Error**: ${err.message || 'Could not reach the AI Referee. Is the backend running?'}`,
        });
      })
      .finally(() => {
        setIsThinking(false);
        setIsLoading(false);
      });

    return true;
  }, [game, addMessage, setIsLoading, safeGameMutate]);

  const undoMove = () => {
    safeGameMutate((g) => g.undo());
    setMoveHistory((prev) => prev.slice(0, -1));
  };

  const resetBoard = () => {
    setGame(new Chess());
    setMoveHistory([]);
    clearChat('chess');
    toast.success('Board reset');
  };

  const flipBoard = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const copyFEN = () => {
    navigator.clipboard.writeText(game.fen());
    toast.success('FEN copied to clipboard');
  };

  const status = useMemo(() => {
    if (game.isCheckmate()) return '🏆 Checkmate!';
    if (game.isStalemate()) return '🤝 Stalemate';
    if (game.isDraw()) return '🤝 Draw';
    if (game.isCheck()) return '♔ Check!';
    return `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
  }, [game]);

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="glass-card p-3 text-center">
        <span className="text-sm font-medium text-cosmic-50">{status}</span>
      </div>

      {/* Board */}
      <div className="relative glass-card p-4 flex justify-center">
        {isThinking && (
          <div className="absolute inset-0 bg-cosmic-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <LoadingSpinner size="lg" text="AI Referee is reviewing..." />
          </div>
        )}
        <Chessboard
          position={game.fen()}
          onPieceDrop={onPieceDrop}
          boardOrientation={boardOrientation}
          boardWidth={Math.min(480, typeof window !== 'undefined' ? window.innerWidth - 380 : 480)}
          customBoardStyle={{ borderRadius: '12px' }}
          customDarkSquareStyle={{ backgroundColor: '#1e1b4b' }}
          customLightSquareStyle={{ backgroundColor: '#312e81' }}
          animationDuration={200}
          arePiecesDraggable={!isThinking}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={undoMove} disabled={isThinking || moveHistory.length === 0}>
          <Undo2 size={14} /> Undo
        </Button>
        <Button variant="secondary" size="sm" onClick={resetBoard} disabled={isThinking}>
          <RotateCcw size={14} /> Reset
        </Button>
        <Button variant="secondary" size="sm" onClick={flipBoard}>
          <FlipVertical size={14} /> Flip
        </Button>
        <Button variant="secondary" size="sm" onClick={copyFEN}>
          <Copy size={14} /> FEN
        </Button>
      </div>

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider mb-2">Move History</h3>
          <div className="flex flex-wrap gap-1.5">
            {moveHistory.map((m, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-xs text-cosmic-100 font-mono"
              >
                {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'} {m.san}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoardPanel;
