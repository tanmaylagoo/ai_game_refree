from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

from app.rag.embeddings import get_embeddings


def ingest_documents(game_id: str, documents):
    """
    Takes LangChain Documents, chunks them,
    tags each chunk with the game name,
    and stores them inside Chroma.
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )

    chunks = splitter.split_documents(documents)

    for chunk in chunks:
        chunk.metadata["game"] = game_id

    Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        collection_name="game-rulebooks",
        persist_directory="./chroma_db",
    )

    print(f"Ingested {len(chunks)} chunks for {game_id}")