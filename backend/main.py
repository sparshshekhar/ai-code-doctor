from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from pipeline import analyze_and_fix
import os
import json
from groq import Groq

load_dotenv()

app = FastAPI(title="AI Code Doctor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    user_context: str = ""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    original_code: str
    fixed_code: str
    language: str
    errors: list = []
    fixes: list = []

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

@app.post("/chat")
async def chat(request: ChatRequest):
    """AI chat with full context of the fix."""

    # build system prompt with full fix context
    system_prompt = f"""You are an expert {request.language} developer and teacher.
You just debugged and fixed some code for the user.

## Original Broken Code
```{request.language}
{request.original_code}
```

## Fixed Code
```{request.language}
{request.fixed_code}
```

## Bugs That Were Found
{json.dumps(request.errors, indent=2)}

## Fixes That Were Applied
{json.dumps(request.fixes, indent=2)}

You have full context of what was wrong and how it was fixed.
Answer the user's questions about the code clearly and helpfully.
If they ask for beginner explanations, use simple language and analogies.
If they ask for advanced explanations, go deep into technical details.
Keep responses concise but complete."""

    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    def stream_response():
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=True
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    return StreamingResponse(
        stream_response(),
        media_type="text/plain"
    )

@app.get("/")
def root():
    return {"status": "AI Code Doctor is running 🩺"}