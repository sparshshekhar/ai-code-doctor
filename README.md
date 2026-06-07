# 🩺 AI Code Doctor

> Paste broken code → AI debugs it, fixes it, verifies it works, and explains every bug. Supports every major language.

![AI Code Doctor](https://img.shields.io/badge/AI-Code%20Doctor-violet?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 🌍 Live Demo

**[https://ai-code-doctor-five.vercel.app](https://ai-code-doctor-five.vercel.app)**

---

## ✨ Features

- 🐛 **Finds all bugs** — syntax errors, logic errors, runtime errors
- 🔧 **Fixes the code** — AI rewrites only what's broken
- ✅ **Verifies the fix** — actually runs the code to confirm it works
- 🔄 **Retries up to 5 times** — keeps fixing until tests pass
- 📝 **Side by side diff** — see exactly what changed line by line
- 💬 **Context aware** — tell the AI what you're building for smarter fixes
- 🌐 **Multi-language** — Python, JavaScript, TypeScript, Java, C, C++, Go, Rust, SQL, React
- 🔐 **Google Sign In** — save your fix history
- 📜 **Fix History** — revisit any past fix with full diff
- 🔗 **Shareable Links** — share any fix with a unique URL
- 💬 **AI Chat** — ask followup questions about your fix with streaming responses
- 🖥️ **VS Code Extension** — fix code without leaving your editor

---

## 🎥 How It Works

```
User pastes broken code + describes what they're building
                    ↓
        AI analyzes and finds all bugs
                    ↓
        AI fixes the broken code
                    ↓
        Actually runs the code to verify
                    ↓
        Still broken? Fix again (max 5 retries)
                    ↓
    Returns: fixed code + diff + bug explanations
                    ↓
    User can chat with AI about the fix
                    ↓
    Share the fix with a unique link
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS |
| **Code Editor** | Monaco Editor (VS Code in browser) |
| **Diff Viewer** | react-diff-viewer |
| **Backend** | FastAPI (Python) |
| **AI Brain** | Groq API (LLaMA 3.3 70B) |
| **Auth + Database** | Supabase |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Railway |
| **VS Code Extension** | TypeScript |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              React Dashboard (Vercel)                │
│                                                     │
│  Monaco Editor → Language Selector → Context Box    │
│  Diff Viewer → Error List → AI Chat → Share Button  │
└─────────────────────┬───────────────────────────────┘
                      │ API calls
                      ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend (Railway)               │
│                                                     │
│  POST /fix-code → Smart AI Pipeline                 │
│  POST /fix-file → Upload .py/.js etc                │
│  POST /chat     → Streaming AI responses            │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐   ┌──────────────────────┐
│   Groq API       │   │   Supabase           │
│   LLaMA 3.3 70B  │   │   Auth + Database    │
│   - Analyze bugs │   │   - Fix history      │
│   - Fix code     │   │   - Shared fixes     │
│   - AI Chat      │   │   - User accounts    │
└──────────────────┘   └──────────────────────┘
```

---

## 🚀 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key → free at [console.groq.com](https://console.groq.com)
- Supabase project → free at [supabase.com](https://supabase.com)

### 1. Clone the repo
```bash
git clone https://github.com/sparshshekhar/ai-code-doctor
cd ai-code-doctor
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_key_here
```

Run:
```bash
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🗄️ Database Setup (Supabase)

Run this SQL in your Supabase SQL editor:

```sql
-- Fix history (saved per user)
CREATE TABLE fix_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  original_code TEXT NOT NULL,
  fixed_code TEXT NOT NULL,
  what_code_does TEXT,
  errors JSONB,
  fixes JSONB,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fix_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fixes"
  ON fix_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fixes"
  ON fix_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fixes"
  ON fix_history FOR DELETE USING (auth.uid() = user_id);

-- Shared fixes (public, no auth needed)
CREATE TABLE shared_fixes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL,
  original_code TEXT NOT NULL,
  fixed_code TEXT NOT NULL,
  what_code_does TEXT,
  errors JSONB,
  fixes JSONB,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shared_fixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared fixes"
  ON shared_fixes FOR SELECT USING (true);

CREATE POLICY "Anyone can insert shared fixes"
  ON shared_fixes FOR INSERT WITH CHECK (true);
```

---

## 📁 Project Structure

```
ai-code-doctor/
├── backend/
│   ├── main.py              ← FastAPI server + all endpoints
│   ├── pipeline.py          ← Smart AI debug pipeline
│   ├── diff_engine.py       ← Line by line diff generator
│   ├── requirements.txt
│   └── src/
│       ├── agents/
│       │   └── bug_fixer.py ← AI bug fixing agent
│       └── tools/
│           └── repo_reader.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Main app
│   │   ├── main.jsx             ← Router setup
│   │   ├── supabase.js          ← Supabase client
│   │   ├── components/
│   │   │   ├── Header.jsx       ← Nav + auth buttons
│   │   │   ├── CodeInput.jsx    ← Monaco editor + upload
│   │   │   ├── DiffViewer.jsx   ← Side by side diff
│   │   │   ├── ErrorList.jsx    ← Bug explanations
│   │   │   ├── ShareButton.jsx  ← Generate share link
│   │   │   ├── AiChat.jsx       ← Streaming AI chat
│   │   │   ├── FixHistory.jsx   ← Past fixes dashboard
│   │   │   └── AuthModal.jsx    ← Login + Google OAuth
│   │   └── pages/
│   │       └── SharedFix.jsx    ← Public shared fix page
│   ├── vercel.json
│   └── package.json
│
└── vscode-extension/
    ├── src/
    │   └── extension.ts     ← VS Code extension
    └── package.json
```

---

## 🔌 API Reference

### Fix Code
```http
POST /fix-code
Content-Type: application/json

{
  "code": "def divide(a, b):\n    return a / b",
  "language": "python",
  "user_context": "I'm building a calculator"
}
```

Response:
```json
{
  "original_code": "...",
  "fixed_code": "...",
  "what_code_does": "A function that divides two numbers",
  "language": "python",
  "errors": [
    {
      "line": 2,
      "type": "ZeroDivisionError",
      "description": "No check for division by zero"
    }
  ],
  "fixes": [
    {
      "line": 2,
      "what": "Added guard clause for zero division",
      "why": "Without this check the code crashes when b=0"
    }
  ],
  "diff": [...],
  "verified": true,
  "attempts": 1
}
```

### Fix File
```http
POST /fix-file
Content-Type: multipart/form-data

file: your_file.py
language: python
user_context: optional context
```

### AI Chat
```http
POST /chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Explain this fix like I'm a beginner" }
  ],
  "original_code": "...",
  "fixed_code": "...",
  "language": "python",
  "errors": [...],
  "fixes": [...]
}
```

Returns a **streaming** text response.

---

## 🌐 Supported Languages

| Language | Execution Verified |
|---|---|
| Python | ✅ Actually runs |
| JavaScript | ✅ Actually runs (Node) |
| Go | ✅ Actually runs |
| Java | 🧠 AI verified |
| C / C++ | 🧠 AI verified |
| TypeScript | 🧠 AI verified |
| React (JSX) | 🧠 AI verified |
| Rust | 🧠 AI verified |
| SQL | 🧠 AI verified |

---

## 🗺️ Roadmap

- [x] Core AI debugger
- [x] Multi-language support
- [x] Context-aware debugging
- [x] Side by side diff viewer
- [x] Live deployment
- [x] Google Sign In
- [x] Fix history dashboard
- [x] Shareable fix links
- [x] AI chat with streaming
- [x] VS Code Extension
- [ ] Publish VS Code Extension to Marketplace
- [ ] Public API with API keys
- [ ] Rate limiting
- [ ] Fix streak / gamification
- [ ] Team workspaces

---

## 🖥️ VS Code Extension

Fix code without leaving your editor!

1. Select broken code
2. Right click → **"🩺 Fix with AI Code Doctor"**
3. Review the fix in the panel
4. Click **"Apply Fix"**

---

## 👨‍💻 Built By

**Sparsh Shekhar** — built from scratch using AI engineering concepts including:
- RAG (Retrieval Augmented Generation)
- Agent loops with feedback
- AST-level code parsing
- Streaming API responses
- Multi-agent debugging pipeline

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## ⭐ Support

If you find this useful, give it a ⭐ on GitHub!

**Live Demo → [ai-code-doctor-five.vercel.app](https://ai-code-doctor-five.vercel.app)**
