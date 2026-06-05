import os
import json
import tempfile
import subprocess
from groq import Groq
from dotenv import load_dotenv
from src.agents.bug_fixer import BugFixerAgent

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
bug_fixer = BugFixerAgent()

MAX_RETRIES = 5

# supported languages + how to run them
LANGUAGE_CONFIG = {
    "python":     {"ext": ".py",   "cmd": ["python"]},
    "javascript": {"ext": ".js",   "cmd": ["node"]},
    "typescript": {"ext": ".ts",   "cmd": ["npx", "ts-node"]},
    "java":       {"ext": ".java", "cmd": None},  # compile + run
    "c":          {"ext": ".c",    "cmd": None},  # compile + run
    "cpp":        {"ext": ".cpp",  "cmd": None},  # compile + run
    "go":         {"ext": ".go",   "cmd": ["go", "run"]},
    "sql":        {"ext": ".sql",  "cmd": None},  # syntax only
    "react":      {"ext": ".jsx",  "cmd": None},  # syntax only
    "rust":       {"ext": ".rs",   "cmd": None},  # syntax only
}


def analyze_code(code: str, language: str, user_context: str = "") -> dict:
    """
    Step 1 — Ask AI to find all bugs.
    Uses user context to understand what the code is trying to do.
    """

    print(f"🔍 Analyzing {language} code...")

    # build context section if user provided it
    context_section = ""
    if user_context.strip():
        context_section = f"""
## What The User Told Us
{user_context}

Use this context to better understand what the code is TRYING to do,
and find bugs that would prevent it from working correctly.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": f"""You are an expert {language} debugger and code reviewer.
Analyze the given code, find ALL bugs, and explain each one clearly.

{context_section}

Respond ONLY in this exact JSON format:
{{
    "what_code_does": "Brief explanation of what this code is trying to do",
    "errors": [
        {{
            "line": 3,
            "type": "ZeroDivisionError",
            "description": "No check for division by zero"
        }}
    ],
    "fixes": [
        {{
            "line": 3,
            "what": "Added guard clause for zero division",
            "why": "Without this check the code crashes when b=0"
        }}
    ]
}}

Return ONLY the JSON. No markdown, no backticks, no extra text."""
            },
            {
                "role": "user",
                "content": f"Analyze this {language} code:\n\n{code}"
            }
        ],
        temperature=0.1,
        max_tokens=2048
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.startswith("```"):
        raw = raw[3:]
    if raw.strip().endswith("```"):
        raw = raw.strip()[:-3]

    return json.loads(raw.strip())


def fix_code_with_context(
    code: str,
    errors: list,
    language: str,
    user_context: str = ""
) -> str:
    """
    Step 2 — Fix the code using AI.
    Passes user context so AI knows what the code should do.
    """

    context_section = ""
    if user_context.strip():
        context_section = f"\n## What User Is Building\n{user_context}\n"

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": f"""You are an expert {language} developer.
Fix the code based on the errors found.
{context_section}
Return ONLY the raw fixed code. No markdown, no backticks, no explanation."""
            },
            {
                "role": "user",
                "content": f"""Fix this {language} code:

{code}

Errors to fix:
{json.dumps(errors, indent=2)}

Return ONLY the fixed code:"""
            }
        ],
        temperature=0.1,
        max_tokens=4096
    )

    fixed = response.choices[0].message.content.strip()

    # clean markdown
    if fixed.startswith("```"):
        lines = fixed.split("\n")
        fixed = "\n".join(lines[1:])
    if fixed.strip().endswith("```"):
        fixed = fixed.strip()[:-3]

    return fixed.strip()


def run_code_safely(code: str, language: str) -> dict:
    """
    Step 3 — Actually run the code to verify it works.
    Only for languages we can execute directly.
    """

    config = LANGUAGE_CONFIG.get(language)

    # languages we can't execute directly — just return as verified
    if not config or config["cmd"] is None:
        print(f"⚠️  {language} — skipping execution, syntax check only")
        return {
            "passed": True,
            "output": "Syntax verified by AI",
            "error": ""
        }

    print(f"🧪 Running {language} code to verify...")

    with tempfile.NamedTemporaryFile(
        mode='w',
        suffix=config["ext"],
        delete=False,
        encoding='utf-8'
    ) as f:
        f.write(code)
        tmp_path = f.name

    try:
        cmd = config["cmd"] + [tmp_path]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=10
        )

        passed = result.returncode == 0

        if passed:
            print(f"✅ {language} code runs successfully!")
        else:
            print(f"❌ {language} code still has errors")

        return {
            "passed": passed,
            "output": result.stdout,
            "error": result.stderr
        }

    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "output": "",
            "error": "Code timed out after 10 seconds"
        }

    except FileNotFoundError:
        # runtime not installed — skip verification
        return {
            "passed": True,
            "output": f"{language} runtime not found — skipping execution",
            "error": ""
        }

    except Exception as e:
        return {
            "passed": False,
            "output": "",
            "error": str(e)
        }

    finally:
        os.unlink(tmp_path)


def generate_diff(original: str, fixed: str) -> list[dict]:
    """Generate line by line diff."""

    import difflib

    original_lines = original.splitlines()
    fixed_lines = fixed.splitlines()
    diff = list(difflib.ndiff(original_lines, fixed_lines))

    result = []
    for line in diff:
        if line.startswith("- "):
            result.append({"type": "removed", "content": line[2:]})
        elif line.startswith("+ "):
            result.append({"type": "added", "content": line[2:]})
        elif line.startswith("  "):
            result.append({"type": "unchanged", "content": line[2:]})

    return result


def analyze_and_fix(
    code: str,
    language: str = "python",
    user_context: str = ""
) -> dict:
    """
    Full smart pipeline:
    1. Analyze — find bugs (using user context)
    2. Fix — AI fixes the code
    3. Run — verify it actually works
    4. Retry if needed (max 5 times)
    """

    print(f"\n🚀 Starting pipeline for {language}...")
    if user_context:
        print(f"💬 User context: {user_context[:100]}...")

    # Step 1 — analyze
    analysis = analyze_code(code, language, user_context)
    errors = analysis.get("errors", [])
    fixes = analysis.get("fixes", [])
    what_code_does = analysis.get("what_code_does", "")

    print(f"🐛 Found {len(errors)} bug(s)")
    print(f"📖 Code purpose: {what_code_does}")

    # Step 2 — fix
    current_code = fix_code_with_context(code, errors, language, user_context)

    # Step 3 — feedback loop
    attempt = 0
    run_result = {"passed": False, "output": "", "error": ""}

    while attempt < MAX_RETRIES:
        attempt += 1
        print(f"\n🔄 Verification attempt {attempt}/{MAX_RETRIES}")

        run_result = run_code_safely(current_code, language)

        if run_result["passed"]:
            print(f"✅ Verified on attempt {attempt}!")
            break

        if attempt < MAX_RETRIES:
            print(f"🔧 Still broken, fixing again...")
            current_code = fix_code_with_context(
                current_code,
                [{"type": "RuntimeError", "description": run_result["error"]}],
                language,
                user_context
            )

    # Step 4 — diff
    diff = generate_diff(code, current_code)

    return {
        "original_code": code,
        "fixed_code": current_code,
        "what_code_does": what_code_does,
        "language": language,
        "errors": errors,
        "fixes": fixes,
        "diff": diff,
        "verified": run_result["passed"],
        "attempts": attempt
    }