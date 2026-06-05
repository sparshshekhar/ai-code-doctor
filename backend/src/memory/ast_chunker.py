import ast
from dataclasses import dataclass
from src.tools.repo_reader import CodeFile

@dataclass
class CodeChunk:
    file_path: str      # which file this came from
    chunk_type: str     # "function" or "class"
    name: str           # function/class name
    code: str           # the actual code
    start_line: int     # where it starts
    end_line: int       # where it ends

class ASTChunker:

    def chunk_file(self, code_file: CodeFile) -> list[CodeChunk]:
        """Split a Python file into function/class chunks using AST."""

        chunks = []

        try:
            # parse the file into an AST tree
            tree = ast.parse(code_file.content)
            lines = code_file.content.splitlines()

        except SyntaxError as e:
            print(f"⚠️  Could not parse {code_file.path}: {e}")
            return chunks

        # walk through the tree, find functions and classes
        for node in ast.walk(tree):

            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                chunk_type = "function"

            elif isinstance(node, ast.ClassDef):
                chunk_type = "class"

            else:
                continue  # skip everything else

            # extract the lines for this function/class
            start = node.lineno - 1        # AST is 1-indexed
            end = node.end_lineno          # end line number
            code = "\n".join(lines[start:end])

            chunks.append(CodeChunk(
                file_path=code_file.path,
                chunk_type=chunk_type,
                name=node.name,
                code=code,
                start_line=node.lineno,
                end_line=node.end_lineno
            ))

        return chunks

    def chunk_repo(self, code_files: list[CodeFile]) -> list[CodeChunk]:
        """Chunk all files in the repo."""
        all_chunks = []

        for file in code_files:
            if file.language == "python":  # AST only for Python in Phase 1
                chunks = self.chunk_file(file)
                all_chunks.extend(chunks)

        print(f"✅ Created {len(all_chunks)} chunks from {len(code_files)} files")
        return all_chunks