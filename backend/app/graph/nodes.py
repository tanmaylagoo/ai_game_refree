from app.rag.retriever import get_rulebook_retriever
from app.games.chess_engine import ChessRefereeEngine
from app.games.uno_engine import UnoRefereeEngine
from app.games.monopoly_engine import (
    MonopolyRefereeEngine,
    MonopolyGameState,
)
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.graph.state import RefereeState
from dotenv import load_dotenv
load_dotenv()

def retrieve_rules_node(state: RefereeState)->dict: #rulebook fetching node
    retriever=get_rulebook_retriever(state["game_id"])
    docs = retriever.invoke(state["user_query"])
    context_strings = [doc.page_content for doc in docs]
    return {"retrieved_rules": context_strings}


def validate_move_node(state: RefereeState)-> dict:
    game_id = state["game_id"]
    game_ctx=state.get("game_state", {})
    query = state["user_query"].strip()
    validation = {"legal": True, "reason": "General rule query. No deterministic move executed"}
    if game_id == "chess" and "fen" in game_ctx:
        validation = ChessRefereeEngine.validate_move(
            game_ctx["fen"], query
        )
    elif game_id=="uno" and "current_card" in game_ctx:
        validation=UnoRefereeEngine.validate_move(game_ctx, query)
    elif game_id == "monopoly" and "properties" in game_ctx:

        monopoly_state = MonopolyGameState(**game_ctx)

        if query.lower().startswith("buy "):

            prop_name = query[4:].strip()

            player_name = monopoly_state.current_turn

            validation = MonopolyRefereeEngine.validate_purchase(
                monopoly_state,
                player_name,
                prop_name
            )

            if validation["legal"]:

                updated_state = MonopolyRefereeEngine.execute_purchase(
                    monopoly_state,
                    player_name,
                    prop_name
                )

                game_ctx = updated_state.model_dump()
    return {
    "engine_validation": validation,
    "game_state": game_ctx
}
    


def generate_explanation_node(state: RefereeState) -> dict:
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature = 0.3)

    prompt = ChatPromptTemplate.from_template("""
You are an official board game referee. Your task is to rule on rules inquiries using validation metrics and official texts.

Context Requirements:
1. Always state clearly whether the action is Legally Allowed or Illegal based on the Provided Validation Engine Data.
2. Rely heavily on the retrieved Rulebook Snippets to validate the decision. Quote or explicitly paraphrase the rule.
3. Keep the logic direct, friendly, and indisputable. 

Game Type: {game_id}
User Inquiry: {user_query}
Validation Engine Data: {engine_validation}
Retrieved Rulebook Snippets:
{retrieved_rules}

Official Adjudication:
""")
    
    chain = prompt | llm
    response = chain.invoke({
        "game_id": state["game_id"],
        "user_query": state["user_query"],
        "engine_validation": str(state["engine_validation"]),
        "retrieved_rules": "\n\n".join(state["retrieved_rules"])
    })
    
    return {"final_decision": response.content}