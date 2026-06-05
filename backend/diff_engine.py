import difflib

def generate_diff(original: str, fixed: str) -> list[dict]:
    """
    Compare original and fixed code line by line.
    Returns a list of lines with their status: added, removed, unchanged.
    """

    original_lines = original.splitlines()
    fixed_lines = fixed.splitlines()

    diff = list(difflib.ndiff(original_lines, fixed_lines))

    result = []

    for line in diff:
        if line.startswith("- "):
            result.append({
                "type": "removed",
                "content": line[2:]
            })
        elif line.startswith("+ "):
            result.append({
                "type": "added",
                "content": line[2:]
            })
        elif line.startswith("  "):
            result.append({
                "type": "unchanged",
                "content": line[2:]
            })
        # skip "? " lines — they're just markers

    return result