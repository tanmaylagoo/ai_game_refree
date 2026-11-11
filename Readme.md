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

## Production deployment

The backend needs MongoDB Atlas, a Groq API key, and persistent storage for Monopoly sessions and the Chroma rulebook index. The Render Blueprint attaches a 5 GB persistent disk, so its API service uses a paid Render plan. The frontend is static and can be hosted on Render or Vercel. Never put backend secrets in frontend environment variables: `VITE_*` values are included in the public browser bundle.

### Prepare the database and keys

1. Create a MongoDB Atlas database and a dedicated database user with access only to the FairPlay database. Restrict Atlas network access to the addresses required by your hosting provider. If broad outbound access is required, use a separate least-privilege database user and a strong password.
2. Create a Groq API key. The deployed application calls Groq for referee answers; `GOOGLE_API_KEY` is not required by the current code.
3. Generate a unique JWT secret of at least 32 characters. For example: `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Never commit real keys or put them in `frontend/`.

### Deploy the full app on Render

1. Push the repository to GitHub and choose **New + → Blueprint** in Render. Connect the repository and let Render read [`render.yaml`](./render.yaml).
2. Provide `MONGO_URI`, `GROQ_API_KEY`, and `CORS_ORIGINS` when prompted. Set `CORS_ORIGINS` to the exact frontend origin, such as `https://fairplay-ai-frontend.onrender.com` (no trailing slash). The Blueprint generates `JWT_SECRET` and configures production mode and persistent paths.
3. Set the frontend's `VITE_API_BASE_URL` to the backend origin, such as `https://fairplay-ai-backend.onrender.com` (no trailing slash), then deploy. If the Blueprint does not accept this value before the service URL exists, deploy once, add it in the frontend service's **Environment** page, and redeploy the static site.
4. Wait for the backend's first startup to finish. It downloads the embedding model and ingests the tracked PDFs into the attached disk. Check `https://<backend-host>/health` for `{"status":"healthy"}`.
5. Confirm `CORS_ORIGINS` exactly matches the browser-visible frontend origin. For a custom domain or a Vercel frontend, add that origin to the comma-separated list in the backend service's **Environment** settings and redeploy the backend.

Keep the backend on one instance while it uses the attached disk: local SQLite and Chroma files are not shared across instances. Back up the disk and MongoDB separately. Initial Chroma ingestion can take several minutes; later starts reuse the persistent index.

### Deploy the frontend on Vercel

1. Import the repository in Vercel and set **Root Directory** to `frontend`.
2. Use the Vite defaults: build command `npm run build`, output directory `dist`, and install command `npm install` (or `npm ci`). The checked-in [`vercel.json`](./frontend/vercel.json) configures SPA routing and basic browser security headers.
3. In **Project Settings → Environment Variables**, add `VITE_API_BASE_URL` with the full Render backend origin, such as `https://fairplay-ai-backend.onrender.com`. Add it to Production and Preview only if previews should call the live API, then redeploy. This URL is public configuration, not a secret.
4. Add the deployed Vercel domain (and any custom domain) to the backend's `CORS_ORIGINS`, comma-separated with no trailing slash, then redeploy the Render backend. Keep the Render static frontend or remove it if Vercel is your only frontend host.

### Before public launch

- Verify registration, login, logout, authenticated chat, and that one account cannot read or change another account's Monopoly session.
- Keep MongoDB credentials and LLM keys in hosting provider secret settings. Rotate any key that was ever committed or shared.
- Referee queries and Monopoly moves are limited to 10 per account per minute using MongoDB-backed counters. Add monitoring and provider-side spending limits; registration and login also benefit from a dedicated edge rate limit before broad public launch.

## License

MIT License. See [LICENSE](./LICENSE) if applicable.
