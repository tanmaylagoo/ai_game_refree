from langgraph.graph import StateGraph, START, END
from app.graph.state import RefereeState
from app.graph.nodes import retrieve_rules_node, validate_move_node, generate_explanation_node

def build_referee_workflow():
    workflow=StateGraph(RefereeState)

    workflow.add_node("retrieve_rules", retrieve_rules_node)
    workflow.add_node("validate_move", validate_move_node)
    workflow.add_node("generate_explanation", generate_explanation_node)

    workflow.add_edge(START, "retrieve_rules")
    workflow.add_edge("retrieve_rules", "validate_move")
    workflow.add_edge( "validate_move", "generate_explanation")
    workflow.add_edge("generate_explanation", END)

    return workflow.compile()


referee_agent = build_referee_workflow()
