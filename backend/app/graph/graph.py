from langgraph.graph import StateGraph, START, END

from app.graph.state import RefereeState
from app.graph.nodes import (
    retrieve_rules_node,
    validate_move_node,
    generate_explanation_node,
)


def route_after_retrieval(state: RefereeState):
    """
    Decide whether deterministic validation is required.

    Chess:
        Retrieve -> Validate -> Explain

    UNO:
        Retrieve -> Explain

    Monopoly:
        Retrieve -> Explain
    """

    if state["game_id"].lower() == "chess":
        return "validate"

    return "explain"


def build_referee_workflow():

    workflow = StateGraph(RefereeState)

    # -----------------------------
    # Nodes
    # -----------------------------
    workflow.add_node(
        "retrieve_rules",
        retrieve_rules_node,
    )

    workflow.add_node(
        "validate_move",
        validate_move_node,
    )

    workflow.add_node(
        "generate_explanation",
        generate_explanation_node,
    )

    # -----------------------------
    # Entry
    # -----------------------------
    workflow.add_edge(
        START,
        "retrieve_rules",
    )

    # -----------------------------
    # Conditional Routing
    # -----------------------------
    workflow.add_conditional_edges(
        "retrieve_rules",
        route_after_retrieval,
        {
            "validate": "validate_move",
            "explain": "generate_explanation",
        },
    )

    # Chess path
    workflow.add_edge(
        "validate_move",
        "generate_explanation",
    )

    # Finish
    workflow.add_edge(
        "generate_explanation",
        END,
    )

    return workflow.compile()


referee_agent = build_referee_workflow()