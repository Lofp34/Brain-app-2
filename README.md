# Brain App

## Functional & Technical Overview

### Functional vision
- **Purpose:** A lightweight cognitive training app with onboarding, daily dashboard, math and memory mini-games, and simple progress tracking.
- **User journey:**
  1. **Onboarding:** create or sign in with email/password.
  2. **Dashboard:** see greeting, streak, total sessions, and jump into games or results.
  3. **Games:**
     - **Mental Math:** timed question stream with configurable difficulty and duration.
     - **Memory:** card-matching puzzle with selectable deck size.
  4. **Results:** charts for recent math scores, badges, and recent history.
  5. **Settings:** manage OpenAI key for coaching, log out, or wipe local data.
- **AI coaching:** optional, uses an OpenAI key stored locally to generate brief post-session tips.

### Frontend architecture (Vite + React)
- **Entry:** `src/main.tsx` bootstraps `App` inside `BrowserRouter` and wraps children with `UserProvider` (global auth/state).
- **Routing:** `src/routes.tsx` guards routes; shows onboarding when no profile, otherwise exposes dashboard, math, memory, results, settings.
- **State management:**
  - `UserContext` holds `profile`, auth token, loading flag, and helpers (register/login, update settings, add session, reset profile).
  - Session/state persistence uses `StorageService` (localStorage) as a cache for profile, token, and sessions.
- **UI/styling:** Tailwind utility classes across screens; reusable components under `src/components/ui` (e.g., `Button`, `Input`, `WheelPicker`). Animations via Framer Motion on memory cards, icons via Lucide.

### Domain model
Defined in `src/types/index.ts`:
- **UserProfile:** `id`, `name`, `createdAt`, `settings` (theme, sound, math duration/difficulty, memory card count, optional `openAIKey`), and `stats` (total sessions/time, streak, last played).
- **GameSession:** generic session envelope with `gameType` (`math`/`memory`), timestamps, `score`, `mistakes`, and `details` payload (math or memory specific).
- **MathQuestion/MathEngine:** generates arithmetic questions by difficulty and checks answers.
- **MemoryCard/MemoryEngine:** builds shuffled pairs of emoji cards for the matching game.

### Feature breakdown
- **Onboarding (`features/onboarding/OnboardingScreen`):** email/password register or login, client-side validation, error banner, and mode toggle.
- **Dashboard (`features/dashboard/DashboardScreen`):** greets user, shows streak & total sessions, links to game modules, and quick link to results and settings.
- **Mental Math (`features/math/MathGameScreen`):**
  - Config screen for difficulty and duration (minutes).
  - Play state with timer, live score, numeric input, and immediate question cycling.
  - Finish state summarizing correct/mistake counts and (optionally) AI feedback using `AIService.getCoachFeedback` with the stored key.
  - Persists each session through `addSession` (UserContext).
- **Memory (`features/memory/MemoryGameScreen`):**
  - Configurable deck size (8–20 cards).
  - Play loop handles flips, matches, move counting, win detection, and timer.
  - Finish screen with move/time summary; session persisted via `addSession`.
- **Results (`features/results/ResultsScreen`):**
  - Uses cached sessions to draw a Recharts line chart of the last 10 math scores.
  - Simple badge rules (first session, 10 sessions, score ≥20) and recent history list.
- **Settings (`features/settings/SettingsScreen`):** manage OpenAI key (stored in profile settings), log out, or clear all local data.

### Data & API flow
- **Local cache:** `StorageService` stores auth token, profile, and sessions in `localStorage` for fast boot and offline tolerance.
- **Remote API:** `AuthService` wraps `apiRequest` (fetch with JSON & optional bearer token) targeting `/api/*` routes. `UserContext` loads profile/sessions on boot when a cached token exists, writes server responses back to local storage, and posts new sessions.
- **AI calls:** direct HTTPS call to `api.openai.com/v1/chat/completions` with user-supplied key; no backend proxy.

### Backend/serverless layer (`/api`)
Built for Vercel/Netlify-style serverless functions using Neon Postgres via `@neondatabase/serverless`.

- **Database bootstrap (`api/db.js`):**
  - Lazily creates a Neon SQL client from `DATABASE_URL`.
  - `ensureSchema` creates `users` and `game_sessions` tables with JSONB settings/stats defaults.
- **Utilities (`api/utils.js`):** password hashing/verification (PBKDF2), JWT creation/verification (secret from `AUTH_SECRET` or derived from `DATABASE_URL`), JSON parsing, and error handling wrapper.
- **Auth routes:**
  - `POST /api/auth-register`: validate payload, ensure unique email, insert user with default settings/stats, return JWT + empty sessions.
  - `POST /api/auth-login`: verify credentials, return JWT, profile, and last 50 sessions.
- **Profile route:**
  - `GET /api/profile`: bearer-authenticated profile + last 50 sessions.
- **Sessions route:**
  - `GET /api/sessions`: bearer-authenticated fetch of last 50 sessions.
  - `POST /api/sessions`: bearer-authenticated insert of a session record (id generated server-side); expects `gameType`, `startedAt`, `score`, `mistakes`, and `details`.

### Deployment & configuration notes
- **Environment:** requires `DATABASE_URL` for Neon connection; `AUTH_SECRET` or `STACK_SECRET_SERVER_KEY` for JWT signing (falls back to hash of `DATABASE_URL` with warning). Frontend uses Vite (`npm run dev`/`build`).
- **Client/server coupling:** API responses are cached client-side; if API is unreachable, gameplay still works locally but loses synchronization.
- **Data limits:** session endpoints cap results to 50 entries; adjust if long-term history or analytics are needed.

### Gaps & considerations for a rebuild
- No role-based auth or email verification; passwords are stored with PBKDF2 but without rate limiting or account recovery.
- Session metrics are minimal (no time-per-question or detailed memory accuracy); math engine lacks sprint/precision/custom modes beyond labels.
- AI key is stored in user settings and returned from the API; consider keeping it client-only or encrypting at rest.
- Offline/local cache is source-of-truth when the API is down, so conflict resolution is undefined.
