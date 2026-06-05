from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pipeline import analyze_and_fix

load_dotenv()

app = FastAPI(title="AI Code Doctor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    user_context: str = ""

@app.post("/fix-code")
async def fix_code(request: CodeRequest):
    result = analyze_and_fix(
        code=request.code,
        language=request.language,
        user_context=request.user_context
    )
    return result

@app.post("/fix-file")
async def fix_file(
    file: UploadFile = File(...),
    language: str = Form("python"),
    user_context: str = Form("")
):
    content = await file.read()
    code = content.decode("utf-8")
    result = analyze_and_fix(
        code=code,
        language=language,
        user_context=user_context
    )
    return result

@app.get("/")
def root():
    return {"status": "AI Code Doctor is running 🩺"}