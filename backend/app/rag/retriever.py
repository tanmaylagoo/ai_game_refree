import os
from langchain_chroma import Chroma
from app.rag.embeddings import get_embeddings

def get_rulebook_retriever(game_id: str):
    embeddings = get_embeddings()
    # Resolve relative to the backend directory, or use CHROMA_PERSIST_DIR env var
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    default_persist_dir = os.path.join(backend_root, "chroma_db")
    persist_dir = os.getenv("CHROMA_PERSIST_DIR", default_persist_dir)

    vectorstore = Chroma(
        collection_name="game-rulebooks",
        embedding_function=embeddings,
        persist_directory=persist_dir
    )
    return vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 5,
            "fetch_k": 15,
            "filter": {"game": game_id}
        }
    )
