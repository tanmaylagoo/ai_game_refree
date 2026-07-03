import chess
import chess
class ChessRefereeEngine:
    @staticmethod
    #fen stands for forsyth edwards notation
    def validate_move(fen: str, move_san: str)->dict:
        try:
            board = chess.Board(fen)
            move = board.parse_san(move_san)
            is_legal = move in board.legal_moves
            if not is_legal:
                return{
                    "legal": False,
                    "reason":f"Move {move_san} is illegal in the current position",
                    "fen_after": fen

                }
            board.push(move)

            return{
                "legal":True,
                "reason":"Move executed successfully",
                "fen_after":board.fen(),
                "is_check":board.is_check(),
                "is_checkmate":board.is_checkmate(),
                "is_stalemate":board.is_stalemate()


            }
        except ValueError as e:
            return{
                "legal":False,
                "reason":f"Invalid Move notation or FEN string: {str(e)}",
                "fen_after":fen
            }
