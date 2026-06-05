import chromadb
from chromadb.utils import embedding_functions
from src.memory.ast_chunker import CodeChunk

class CodeStore:

    def __init__(self):
        # runs locally, no server needed
        self.client = chromadb.Client()

        # uses a small local embedding model
        self.embedder = embedding_functions.DefaultEmbeddingFunction()

        # create a collection (like a table)
        self.collection = self.client.get_or_create_collection(
            name="codebase",
            embedding_function=self.embedder
        )

    def store_chunks(self, chunks: list[CodeChunk]):
        """Embed and store all code chunks."""

        if not chunks:
            print("⚠️  No chunks to store")
            return

        self.collection.add(
            ids=[f"{c.file_path}::{c.name}" for c in chunks],
            documents=[c.code for c in chunks],
            metadatas=[{
                "file_path": c.file_path,
                "chunk_type": c.chunk_type,
                "name": c.name,
                "start_line": c.start_line,
                "end_line": c.end_line,
            } for c in chunks]
        )

        print(f"✅ Stored {len(chunks)} chunks in memory")

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """Search the codebase with a plain English question."""

        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )

        # format results nicely
        output = []
        for i, doc in enumerate(results["documents"][0]):
            output.append({
                "code": doc,
                "metadata": results["metadatas"][0][i],
                "score": results["distances"][0][i]
            })

        return output