# 🎮 Playoo Backend

This is the Node.js / Express backend with CouchDB and Supabase authentication for the Playoo application.

---

## 🚀 Local Setup & Installation

Follow these steps to get the server running locally:

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd P2Couch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
1. Create a `.env` file in the root directory by copying the example template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   COUCHDB_URL=http://your_couchdb_user:your_couchdb_password@127.0.0.1:5984
   COUCHDB_NAME=match_data
   ```

### 4. Setup CouchDB Locally
1. Ensure your local **CouchDB** server is running.
2. Open Fauxton (usually at `http://127.0.0.1:5984/_utils/`).
3. Create a new database named **`match_data`** (or whatever name you set for `COUCHDB_NAME` in your `.env`).

### 5. Start the Server
```bash
npm start
```
The server will start on port `3000` and output:
```text
Server running on port 3000
```

---

## 🔌 API Endpoints Reference

All endpoints (except the root check `/`) require a valid Supabase JWT Bearer token in the `Authorization` header.

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `GET /` | `GET` | Health check (returns "Backend is running") |
| `POST /api/match-log` | `POST` | Records a new match log. |
| `GET /api/player/:id/journal` | `GET` | Fetches match logs for a specific player ID. |
| `POST /api/reviews` | `POST` | Records a new arena review and rating. |

### Header Format:
```http
Authorization: Bearer <SUPABASE_JWT_TOKEN>
Content-Type: application/json
```
