import os
from app.rag.load_rules import load_rulebook
from app.rag.ingest import ingest_documents

base_dir = os.path.dirname(os.path.abspath(__file__))
rulebooks = {
    "chess": os.path.join(base_dir, "app", "rulebooks", "chess", "Chess.pdf"),
    "uno": os.path.join(base_dir, "app", "rulebooks", "uno", "uno.pdf"),
    "monopoly": os.path.join(base_dir, "app", "rulebooks", "monopoly", "monopoly.pdf"),
}

for game, pdf in rulebooks.items():
    docs = load_rulebook(pdf)
    ingest_documents(game, docs)

print("All rulebooks ingested successfully!")
