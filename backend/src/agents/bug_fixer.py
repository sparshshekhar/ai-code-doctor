import os
from groq import Groq

class BugFixerAgent:

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def fix_code(
        self,
        broken_code: str,
        error_output: str,
        task: str,
        file_path: str
    ) -> str:
        """Given broken code + error output, return fixed code."""

        print(f"\n🔧 Attempting to fix bug...")

        prompt = f"""You are an expert Python debugger.

## Original Task
{task}

## File Being Fixed
{file_path}

## Current Broken Code
{broken_code}

## Error Output From Tests
{error_output}

## Instructions
- Read the error carefully
- Find the exact cause of the bug
- Fix ONLY what is broken — don't rewrite everything
- Keep all existing working functionality intact
- Return ONLY the complete fixed Python code
- No markdown, no backticks, no explanation — just raw Python code

Write the fixed code now:"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert Python debugger. Return ONLY raw Python code. No markdown, no backticks, no explanation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=4096
        )

        fixed_code = response.choices[0].message.content
        fixed_code = self._clean_code(fixed_code)  # strip backticks
        print(f"✅ Fix generated")
        return fixed_code

    def _clean_code(self, code: str) -> str:
        """Remove markdown backticks that the AI sometimes adds."""

        if code.startswith("```python"):
            code = code[len("```python"):]

        if code.startswith("```"):
            code = code[3:]

        if code.strip().endswith("```"):
            code = code.strip()[:-3]

        return code.strip()