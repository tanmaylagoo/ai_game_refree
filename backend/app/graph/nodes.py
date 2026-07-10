from app.rag.retriever import get_rulebook_retriever
from app.games.chess_engine import ChessRefereeEngine

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.graph.state import RefereeState

from dotenv import load_dotenv
import os

# Load .env
env_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    ".env"
)
load_dotenv(dotenv_path=env_path)


# -----------------------------
# Retrieve Rulebook Chunks
# -----------------------------
def retrieve_rules_node(state: RefereeState) -> dict:

    retriever = get_rulebook_retriever(state["game_id"])

    docs = retriever.invoke(state["user_query"])

    context_strings = [doc.page_content for doc in docs]

    return {
        "retrieved_rules": context_strings
    }


# -----------------------------
# Chess Validation Only
# -----------------------------
def validate_move_node(state: RefereeState) -> dict:

    game_id = state["game_id"]

    game_ctx = state.get("game_state", {})

    query = state["user_query"].strip()

    validation = {
        "legal": True,
        "reason": "Rulebook query. No deterministic validation required."
    }

    # Chess uses deterministic validation
    if game_id == "chess" and "fen" in game_ctx:

        validation = ChessRefereeEngine.validate_move(
            game_ctx["fen"],
            query
        )

    # UNO intentionally skips validation

    # Monopoly intentionally skips validation

    return {
        "engine_validation": validation,
        "game_state": game_ctx
    }


# -----------------------------
# Gemini Explanation
# -----------------------------
def generate_explanation_node(state: RefereeState) -> dict:

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=0.3
    )

    prompt = ChatPromptTemplate.from_template(
"""
You are an official tabletop game referee.

Your job depends on the game.

----------------------------------------
CHESS
----------------------------------------

Use BOTH:

1. Validation Engine Data
2. Retrieved Rulebook Snippets

Determine whether the move is legal.

Explain WHY using the rulebook.

Mention

- check
- checkmate
- stalemate

whenever applicable.

----------------------------------------
UNO
----------------------------------------

Treat UNO as a rule assistant.

Do NOT validate cards.

Do NOT inspect player hands.

Do NOT assume a move has been made.

Simply answer the user's question using ONLY the retrieved rulebook snippets.

If the rulebook does not clearly answer the question, explicitly state that.

----------------------------------------
MONOPOLY
----------------------------------------

Treat Monopoly as a rule assistant.

Do NOT validate purchases.

Do NOT validate trades.

Do NOT validate rent.

Do NOT validate mortgages.

Do NOT assume any game state.

Answer ONLY using the retrieved Monopoly rulebook.

Never invent rules.

If the retrieved context is insufficient, clearly say that the official rulebook does not provide enough information.

----------------------------------------

Game:
{game_id}

User Question:
{user_query}

Validation Engine:
{engine_validation}

Retrieved Rulebook:

{retrieved_rules}

Official Response:
"""
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "game_id": state["game_id"],
            "user_query": state["user_query"],
            "engine_validation": str(state["engine_validation"]),
            "retrieved_rules": "\n\n".join(state["retrieved_rules"])
        }
    )

    return {
        "final_decision": response.content
    }