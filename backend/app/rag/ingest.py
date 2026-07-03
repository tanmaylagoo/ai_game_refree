
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from app.rag.embeddings import get_embeddings

def ingest_game_rules(game_id: str, raw_text: str):
    text_splitter= RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.split_text(raw_text)
    documents=[]
    for chunk in chunks:
        doc = Document(
            page_content=chunk,
            metadata={"game":game_id} #binding metadata tag to retriever filter

        )
        documents.append(doc)

    embeddings = get_embeddings()
    persist_dir="./chroma_db"
    Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        collection_name="game-rulebooks",
        persist_directory=persist_dir
    )

    print(f"Successfully processed and saved {len(documents)} text records for: '{game_id}'.")
