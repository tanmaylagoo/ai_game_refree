from app.rag.retriever import get_rulebook_retriever

game = input("enter game chess/uno/monopoly: ")
retriever = get_rulebook_retriever(game)

print("\n Enter question \n")
question = input("Enter question: ")

docs = retriever.invoke(question)

print(f"\nRetrieved {len(docs)} document(s)\n")

if not docs:
    print("No documents were retrieved.")
else:
    for i, doc in enumerate(docs, 1):
        print("=" * 80)
        print(f"Result {i}")
        print(doc.page_content)