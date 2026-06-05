from src.memory.code_store import CodeStore

class ContextBuilder:

    def __init__(self, store: CodeStore):
        self.store = store

    def build_context(self, task: str) -> str:
        """
        Given a task, find the most relevant code chunks
        and build a context string to send to the AI.
        """

        print(f"\n🔍 Building context for task: {task}")

        # search for relevant chunks
        results = self.store.search(task, top_k=5)

        if not results:
            return "No relevant code found in the codebase."

        # build a clean context string
        context_parts = []

        for result in results:
            meta = result["metadata"]
            context_parts.append(
                f"### File: {meta['file_path']} | {meta['chunk_type']}: {meta['name']}\n"
                f"```python\n{result['code']}\n```"
            )

        context = "\n\n".join(context_parts)

        print(f"✅ Built context from {len(results)} relevant chunks")
        return context