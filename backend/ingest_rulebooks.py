from app.rag.load_rules import load_rulebook
from app.rag.ingest import ingest_documents

rulebooks = {
    "chess": "app/rulebooks/chess/Chess.pdf",
    "uno": "app/rulebooks/uno/uno.pdf",
    "monopoly": "app/rulebooks/monopoly/monopoly.pdf",
}

for game, pdf in rulebooks.items():
    docs = load_rulebook(pdf)
    ingest_documents(game, docs)

print("All rulebooks ingested successfully!")