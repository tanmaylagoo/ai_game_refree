from pydantic import BaseModel
from typing import Dict, Optional

class Player(BaseModel):
    name:str
    position: int #board squares from 0 to 39
    balance: int 

class Property(BaseModel):
    name: str
    price: int
    owner: Optional[str]=None #none means the bank owns it

class MonopolyGameState(BaseModel):
    players: Dict[str, Player] #Nested Pydantic Model
    properties: Dict[str, Property]
    current_turn: str #whose turn it is

class MonoployRefereeEngine:
    @staticmethod
    def validate_purchase(state: MonopolyGameState, player_name: str, property_name: str)->dict:
        if state.current_turn != player_name:
            return {"legal": False,
                    "reason":f"It is not {player_name}'s turn",

                }
        player = state.players.get(player_name)
        prop = state.properties.get(property_name)
        if not player or not prop:
            return {
                "legal":False,
                "reason":"There is no such player or property so invalid player or property name"
            }
        
        if prop.owner is not None:
            return {
                "legal":False,
                "reason":f"{property_name} is already owned by {prop.owner}, you must pay RENT instead"
            }
        if player.balance < prop.price:
            return{
                "legal": False,
                "reason": f"Insuffcient funds. {property_name} costs ${prop.price} but {player_name} only has $ {player.balance}"
            }
        return {
            "legal": True,
            "reason":f"Purchase is legal. {player_name} may buy {property_name} for $ {prop.price}"
        }

            
        
      