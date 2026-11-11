# FairPlay AI

FairPlay AI is a full-stack application that combines deterministic game engines, rulebook retrieval-augmented generation (RAG), and generative AI to act as an intelligent referee for tabletop games.

The project supports:

- **Chess**: validates moves using a deterministic chess engine and explains outcomes using rulebook context.
- **UNO**: answers rule questions from official rulebooks as an intelligent rules assistant.
- **Monopoly**: answers Monopoly rule queries and supports game session management.

---

## Features

- **Deterministic Game Engines**: Strict rule validation powered by `python-chess`.
- **RAG Rule Retrieval**: ChromaDB vector store loaded with official rulebooks for instant context.
- **LangGraph & GROQ Orchestration**: Context-aware explanations synthesized with high-speed LLMs.
- **Full Authentication & Route Protection**:
  - Secure registration with **automatic login**.
  - JWT session management with **server-side token revocation** on logout (MongoDB TTL auto-expiring blacklist).
  - Protected route guards preventing unauthorized access to game chambers and APIs.
- **Modern React + Vite Frontend**: Cosmic theme, Tailwind CSS, animated starfield, and responsive layout.
- **One-Click Render Deployment**: Ready-to-deploy configuration using [`render.yaml`](./render.yaml).

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, LangChain, LangGraph, ChromaDB, Motor (MongoDB), SQLAlchemy
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, React Router, Axios
- **AI / Retrieval**: GROQ (`langchain_groq`), ChromaDB, HuggingFace embeddings (`all-MiniLM-L6-v2`)
- **Database**: MongoDB Atlas (Users & Token Blacklist), SQLite (Monopoly Game Sessions)

---

## Repository Structure

- `backend/` — FastAPI application, LangGraph agents, and game engines
- `frontend/` — React client, game panels, and auth flows
- `backend/app/rulebooks/` — Source PDFs for Chess, UNO, and Monopoly
- `backend/chroma_db/` — Persisted Chroma vector store
- `render.yaml` — Blueprint for automated Render deployment

---

## Local Setup

### 1. Backend

Navigate to `backend/` and set up the virtual environment:

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (refer to `.env.example`):

```env
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
MONGO_DB_NAME=ai_game_referee
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Ingest rulebooks into ChromaDB (if not already built):

```bash
python ingest_rulebooks.py
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

Navigate to `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new user and automatically receive a JWT session token
- `POST /api/auth/login` — Authenticate and receive a JWT session token
- `POST /api/auth/logout` — Revoke the current token and add it to the server blacklist
- `GET /api/auth/me` — Retrieve the current authenticated user's profile *(Protected)*
- `GET /api/auth/status` — Diagnostic endpoint verifying database connectivity

### AI Referee (`/api/chat`) *(Protected)*
- `POST /api/chat/query` — Submit a player query, move notation, or game state for validation and explanation

```json
{
  "game_id": "chess",
  "user_query": "Nf3",
  "game_state": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
}
```

### Monopoly Sessions (`/api/monopoly`) *(Protected)*
- `POST /api/monopoly/create` — Initialize a new Monopoly session
- `POST /api/monopoly/move` — Validate a move, buy properties, and update game state
- `GET /api/monopoly/{session_id}` — Fetch saved game state
- `DELETE /api/monopoly/{session_id}` — Clear a session

---

## Deployment (Render)

This repository includes a [`render.yaml`](./render.yaml) file for one-click deployment on Render:

1. **Backend Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python ingest_rulebooks.py`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Required Env Vars**: `MONGO_URI`, `GROQ_API_KEY`, `JWT_SECRET`, `CORS_ORIGINS`
2. **Frontend Static Site**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **SPA Rewrite Rule**: `/*` → `/index.html`
   - **Required Env Var**: `VITE_API_BASE_URL` (Points to backend URL)

---

## License

MIT License. See [LICENSE](./LICENSE) if applicable.
