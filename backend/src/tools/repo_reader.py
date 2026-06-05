import os
from pathlib import Path
from dataclasses import dataclass

@dataclass
class CodeFile:
    path: str           # e.g. "src/auth/login.py"
    content: str        # the actual code
    language: str       # "python", "javascript" etc.

class RepoReader:
    
    # file types we care about
    SUPPORTED = {
        ".py": "python",
        ".js": "javascript",
        ".ts": "typescript",
    }

    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)

    def read_all_files(self) -> list[CodeFile]:
        """Walk the repo and return all code files."""
        files = []

        for file_path in self.repo_path.rglob("*"):

            # skip hidden folders like .git, __pycache__
            if any(part.startswith(".") or part == "__pycache__"
                   for part in file_path.parts):
                continue

            # skip node_modules
            if "node_modules" in file_path.parts:
                continue

            # only process supported file types
            suffix = file_path.suffix
            if suffix not in self.SUPPORTED:
                continue

            try:
                content = file_path.read_text(encoding="utf-8")
                relative_path = str(file_path.relative_to(self.repo_path))

                files.append(CodeFile(
                    path=relative_path,
                    content=content,
                    language=self.SUPPORTED[suffix]
                ))

            except Exception as e:
                print(f"Could not read {file_path}: {e}")

        print(f"✅ Found {len(files)} code files")
        return files