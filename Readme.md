# AI Game Referee

AI Game Referee is a full-stack application that combines deterministic game engines, rulebook retrieval, and generative AI to act as an intelligent referee for tabletop games.

The project supports:

- Chess: validates moves using a deterministic chess engine and explains outcomes using rulebook context.
- UNO: answers rule questions from official rulebooks as a UNO rules assistant.
- Monopoly: answers Monopoly rule queries and supports game session management.

## Features

- FastAPI backend with AI-assisted rule retrieval and deterministic validation
- React + Vite frontend with authentication and game-specific interfaces
- MongoDB authentication for user sign-up / login
- SQLite session persistence for Monopoly gameplay
- ChromaDB vector store for rulebook retrieval
- LangGraph workflow orchestrator with GROQ-based explanation generation

## Tech Stack

- Backend: Python, FastAPI, LangChain, LangGraph, ChromaDB, Motor, SQLAlchemy
- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- AI / Retrieval: GROQ (`langchain_groq`), Chroma vector store, HuggingFace embeddings
- Games: Chess engine, UNO rule engine, Monopoly session API

## Repository Structure

- `backend/` — Python API server and game rule retrieval
- `frontend/` — React interface and game clients
- `backend/app/rulebooks/` — source rulebooks for Chess, UNO, Monopoly
- `chroma_db/` — persisted Chroma vector store data

## Requirements

### Backend

- Python 3.11+ recommended
- `pip` to install dependencies
- MongoDB instance for auth
- (Optional) `.env` file for environment variables

### Frontend

- Node.js 20+ recommended
- `npm` or `pnpm` for installing frontend dependencies

## Setup

### Backend

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in `backend/` with the following values:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here
   ```

4. (Optional) If you want the frontend to point to a custom API host, set `VITE_API_BASE_URL` in `frontend/.env`.

### Rulebook ingestion

To load the rulebooks into the local Chroma vector store:

```bash
cd backend
python ingest_rulebooks.py
```

This will ingest the PDFs in `backend/app/rulebooks/` into `chroma_db/`.

### Frontend

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development frontend:
   ```bash
   npm run dev
   ```

## Running the application

### Start the backend

From `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend

From `frontend/`:

```bash
npm run dev
```

Then open the browser at the Vite dev URL (usually `http://localhost:5173`).

## API Endpoints

### Authentication

- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — authenticate and receive a JWT token
- `GET /api/auth/me` — get the current authenticated user

### Chat / AI referee

- `POST /api/chat/query`
  - `game_id`: `chess`, `uno`, or `monopoly`
  - `user_query`: move notation or rule question
  - `game_state`: current game state payload

Example payload:

```json
{
  "game_id": "chess",
  "user_query": "Nf3",
  "game_state": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
}
```

### Monopoly session APIs

- `POST /api/monopoly/create` — create a new Monopoly session
- `POST /api/monopoly/move` — submit a Monopoly move and update session state
- `GET /api/monopoly/{session_id}` — load a saved Monopoly session
- `DELETE /api/monopoly/{session_id}` — delete a session

## Notes

- Chess uses deterministic move validation via the Python `chess` library.
- UNO and Monopoly currently rely on rulebook retrieval and AI responses rather than deterministic move validation.
- The backend includes a lightweight SQLite session store for Monopoly and MongoDB for user authentication.
- Update `frontend/src/services/api.js` or set `VITE_API_BASE_URL` if the backend runs on a different host/port.

## License

This repository does not include a license file. Add one if you want to open-source the project.
