import difflib
import os

class DiffGenerator:

    def generate_diff(
        self,
        original_code: str,
        new_code: str,
        file_path: str
    ) -> str:
        """Generate a readable diff between original and new code."""

        original_lines = original_code.splitlines(keepends=True)
        new_lines = new_code.splitlines(keepends=True)

        diff = difflib.unified_diff(
            original_lines,
            new_lines,
            fromfile=f"a/{file_path}",
            tofile=f"b/{file_path}",
            lineterm=""
        )

        diff_text = "\n".join(diff)

        if not diff_text:
            return "⚠️  No changes detected."

        return diff_text

    def apply_and_save(
        self,
        new_code: str,
        file_path: str
    ) -> bool:
        """Write the new code to disk."""

        try:
            # create directories if they don't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_code)

            print(f"✅ Saved to {file_path}")
            return True

        except Exception as e:
            print(f"❌ Failed to save: {e}")
            return False