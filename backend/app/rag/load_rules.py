

from langchain_community.document_loaders import PyPDFLoader

def load_rulebook(pdf_path: str):
    """Loads a PDF and returns a list of LangChain Documents. Each Page becomes a Document."""
    loader = PyPDFLoader(pdf_path)
    return loader.load()


