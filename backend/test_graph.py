from app.graph.graph import referee_agent

state = {
    "game_id": "chess",
    "user_query": "Nf3",
    "game_state": {
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    },
    "retrieved_rules": [],
    "engine_validation": {},
    "final_decision": ""
}

result = referee_agent.invoke(state)

print("\n========================")
print(result["final_decision"])
print("========================")