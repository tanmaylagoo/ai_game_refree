
from langchain_chroma import Chroma
from app.rag.embeddings import get_embeddings

def get_rulebook_retriever(game_id: str):
    embeddings = get_embeddings()
    persist_dir = "./chroma_db"
    vectorstore = Chroma(
        collection_name="game-rulebooks",
        embedding_function=embeddings,
        persist_directory=persist_dir
    )
    return vectorstore.as_retriever(
        search_type= "mmr",
        search_kwargs={
            "k":5,
            "fetch_k":15,
            "filter":{"game":game_id}
       
        }

    )

