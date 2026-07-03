from pydantic import BaseModel
from typing import List

class UnoGameState(BaseModel):
    current_card: str
    current_color:str
    player_hand: List[str]

class UnoRefereeEngine:
    @staticmethod
    def validate_move(state: UnoGameState, played_card: str)-> dict:
        if played_card not in state.player_hand:
            return {"legal": False, "reason":f"Card {played_card} is not in player's hand"}
        card_parts = played_card.split("-")
        played_color = card_parts[0]
        played_value=card_parts[1] if len(card_parts)> 1 else ""
        curr_parts = state.current_card.split("-")
        curr_color = state.current_color
        curr_val = curr_parts[1] if len(curr_parts) > 1 else ""

        if played_color ==  "Wild":
            return {
            "legal":True, "reason":"Wild cards can be played on any card"
        }

        if played_color == curr_color or (played_value and played_value==curr_val):
            return {"legal": True, "reason": "Color or Number match of the cards"}
        
        return{
            "legal":False,
            "reason": f"Cannot play {played_card} on {state.current_card}(Current match color is {curr_color}) and (Current match number is {curr_val})"
        }

        


      