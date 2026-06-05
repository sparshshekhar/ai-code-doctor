import subprocess
import os
from dataclasses import dataclass

@dataclass
class TestResult:
    passed: bool          # True if all tests passed
    output: str           # full pytest output
    error: str            # error message if failed
    returncode: int       # 0 = passed, anything else = failed

class TestRunner:

    def __init__(self, repo_path: str):
        self.repo_path = repo_path

    def run_tests(self, target_file: str = None) -> TestResult:
        """
        Run pytest on the repo or a specific file.
        Returns a TestResult with pass/fail + full output.
        """

        print(f"\n🧪 Running tests...")

        # build the command
        if target_file:
            # run tests for a specific file
            cmd = ["python", "-m", "pytest", target_file, "-v", "--tb=short"]
        else:
            # run ALL tests in the repo
            cmd = ["python", "-m", "pytest", self.repo_path, "-v", "--tb=short"]

        try:
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,        # run from repo root
                capture_output=True,        # capture stdout + stderr
                text=True,                  # return strings not bytes
                timeout=60                  # max 60 seconds
            )

            passed = result.returncode == 0
            output = result.stdout + result.stderr

            if passed:
                print(f"✅ All tests passed!")
            else:
                print(f"❌ Tests failed!")

            return TestResult(
                passed=passed,
                output=output,
                error=result.stderr,
                returncode=result.returncode
            )

        except subprocess.TimeoutExpired:
            return TestResult(
                passed=False,
                output="Tests timed out after 60 seconds",
                error="Timeout",
                returncode=1
            )

        except Exception as e:
            return TestResult(
                passed=False,
                output=str(e),
                error=str(e),
                returncode=1
            )