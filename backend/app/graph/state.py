from typing import TypedDict, Optional, List, Dict, Any
#this file defines what data our graph keeps tracks of as it moves from one node to another in the graph. This is the shared memory that all nodes can read from and write to.

class RefereeState(TypedDict):
    game_id:str #game 
    user_query:str #user query related to the game
    game_state:Dict[str, Any] #current state of the game, e.g., FEN for chess, hands for card games, balances for board games

    retrieved_rules : List[str] #rules retrieved from the rules engine
    engine_validation:Dict[str, Any]#validation results from the rules engine

    final_decision:str #final decision made by the referee, e.g., "valid move", "invalid move", "game over"


#the purpose of this file is to define the structure of the state that is passed between nodes in the graph. Each node can read from and write to this state, allowing for a shared understanding of the game and user query as it progresses through the graph.