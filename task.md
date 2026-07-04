# Tasks — AI Destination Discovery & Cultural Experiences Platform
**Derived from:** `travel-with-gemini-spec.md` v1.0 + `technical-design-doc.md`  
**Approach:** Spec-Driven Development (SDD)  
**Event:** Google Build with AI – PromptWars  
**Total Estimated Time:** ~2 hours

---

## Phase 1 — Project Setup (15 min)

### 1.1 Next.js Project Bootstrap
- `[ ]` Run `npx create-next-app@latest ./ --typescript --app --tailwind=false --eslint` inside `travel-with-gemini/`
- `[ ]` Verify `app/`, `components/`, `lib/`, `public/` directories are created
- `[ ]` Delete default boilerplate content from `app/page.tsx` and `app/globals.css`
- `[ ]` Set `output: 'standalone'` in `next.config.ts` (required for Docker)

### 1.2 Install Dependencies
- `[ ]` Install production dependencies:
  ```
  npm install @google/generative-ai firebase firebase-admin react-markdown rehype-sanitize remark-gfm
  ```
- `[ ]` Install dev dependencies:
  ```
  npm install -D @types/node
  ```
- `[ ]` Verify `package.json` contains all required packages

### 1.3 Firebase Project Configuration
- `[ ]` Create Firebase project in Firebase Console
- `[ ]` Enable **Email/Password** authentication provider
- `[ ]` Create **Firestore** database (production mode)
- `[ ]` Generate **Firebase Admin SDK** service account key (JSON)
- `[ ]` Copy Firebase client config keys

### 1.4 Environment Variables
- `[ ]` Create `.env.local` at project root with:
  - `GEMINI_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY`
- `[ ]` Add `.env.local` to `.gitignore`

### 1.5 Firebase SDK Initialization
- `[ ]` Create `lib/firebase/client.ts` — Firebase client SDK init (`initializeApp`, `getAuth`, `getFirestore`)
- `[ ]` Create `lib/firebase/admin.ts` — Firebase Admin SDK init (singleton pattern, `cert()` from env vars)
- `[ ]` Verify both files compile without errors (`npx tsc --noEmit`)

### 1.6 Folder Structure Scaffold
- `[ ]` Create `components/auth/` directory
- `[ ]` Create `components/chat/` directory
- `[ ]` Create `components/ui/` directory
- `[ ]` Create `components/layout/` directory
- `[ ]` Create `lib/gemini/` directory
- `[ ]` Create `lib/firestore/` directory
- `[ ]` Create `lib/auth/` directory
- `[ ]` Create `prompts/` directory at root
- `[ ]` Create `specs/` directory and move spec docs in

---

## Phase 2 — Authentication UI & API (30 min)

### 2.1 Auth Context
- `[ ]` Create `lib/auth/AuthContext.tsx` with:
  - `AuthContextType` interface (`user`, `idToken`, `loading`, `logout`)
  - `AuthProvider` component wrapping `onAuthStateChanged`
  - `useAuth()` custom hook
- `[ ]` Wrap root `app/layout.tsx` with `<AuthProvider>`

### 2.2 UI Primitives
- `[ ]` Create `components/ui/Input.tsx` — accessible input with `id`, `aria-label`, `aria-describedby` support
- `[ ]` Create `components/ui/Button.tsx` — accessible button with loading state, disabled state
- `[ ]` Create `components/ui/Spinner.tsx` — loading spinner with `aria-label="Loading"`

### 2.3 Login Page
- `[ ]` Create `app/(auth)/login/page.tsx` — page wrapper with `<title>Login</title>`
- `[ ]` Create `components/auth/LoginForm.tsx` with:
  - Email input (`id="login-email"`, `type="email"`, `required`)
  - Password input (`id="login-password"`, `type="password"`, `required`)
  - Submit button (`id="login-submit"`)
  - Register link (`id="register-link"`) navigating to `/register`
  - Error display (`<p role="alert" id="login-error">`)
  - Firebase `signInWithEmailAndPassword` on submit
  - Redirect to `/chat` on success

### 2.4 Register Page
- `[ ]` Create `app/(auth)/register/page.tsx` — page wrapper with `<title>Register</title>`
- `[ ]` Create `components/auth/RegisterForm.tsx` with:
  - Email input (`id="register-email"`)
  - Password input (`id="register-password"`)
  - Submit button (`id="register-submit"`)
  - Login link (`id="login-link"`) navigating to `/login`
  - Calls `POST /api/auth/register`
  - Redirect to `/chat` on success

### 2.5 Register API Route
- `[ ]` Create `app/api/auth/register/route.ts`:
  - Accept `{ email, password }` from request body
  - Call Firebase Admin `auth().createUser({ email, password })`
  - Create `users/{uid}` Firestore document with `{ uid, email, createdAt }`
  - Initialize empty `conversation_memory/{uid}` document with `{ uid, messages: [] }`
  - Return `201 { uid, email }` on success
  - Return `400 { error }` on failure (e.g., "Email already in use")

### 2.6 Login API Route (optional server-side wrapper)
- `[ ]` Create `app/api/auth/login/route.ts` as a passthrough (login handled client-side via Firebase SDK)

### 2.7 Auth Middleware
- `[ ]` Create `lib/auth/middleware.ts` with `verifyIdToken(request: Request): Promise<string>`:
  - Extracts `Authorization: Bearer <token>` header
  - Calls Firebase Admin `auth().verifyIdToken(token)`
  - Returns `uid` or throws `401`

### 2.8 Root Page Redirect
- `[ ]` Update `app/page.tsx` to redirect: authenticated → `/chat`, unauthenticated → `/login`

### 2.9 Protected Route Guard
- `[ ]` Add auth guard in `app/(dashboard)/chat/layout.tsx` — redirect unauthenticated users to `/login`

---

## Phase 3 — Chat UI & Gemini Integration (35 min)

### 3.1 Prompt Files
- `[ ]` Create `prompts/system_prompt.md` — expert travel guide persona, factual-only, Markdown output, Google Search grounding instruction
- `[ ]` Create `prompts/destination_prompt.md` — template with `{{destination}}`, `{{budget}}`, `{{days}}`, `{{season}}` placeholders; all 7 section headers
- `[ ]` Create `prompts/story_prompt.md` — cultural storytelling prompt with `{{destination}}` placeholder
- `[ ]` Create `prompts/hidden_gems_prompt.md` — 5 lesser-known places prompt with `{{destination}}` placeholder
- `[ ]` Verify all prompt files exist and contain placeholder variables

### 3.2 Gemini Library
- `[ ]` Create `lib/gemini/client.ts` — init `GoogleGenerativeAI` with `GEMINI_API_KEY`, configure `gemini-2.5-flash` model with `tools: [{ googleSearch: {} }]` and `generationConfig`
- `[ ]` Create `lib/gemini/generate.ts` with:
  - `loadPrompt(filename: string): string` — reads from `prompts/` via `fs.readFileSync`
  - `buildPrompt(req: ChatRequest, history: Message[]): string` — assembles system + destination prompt + history context + current message
  - `callGemini(prompt: string): Promise<string>` — calls Gemini API, returns markdown string

### 3.3 Firestore Conversation Library
- `[ ]` Create `lib/firestore/users.ts`:
  - `createUser(uid, email): Promise<void>`
  - `getUser(uid): Promise<UserDocument | null>`
- `[ ]` Create `lib/firestore/conversation.ts`:
  - `saveMessage(uid, message: Message): Promise<void>` — uses `arrayUnion`
  - `getHistory(uid): Promise<Message[]>`
  - `initConversation(uid): Promise<void>` — creates empty doc if not exists

### 3.4 Chat API Route
- `[ ]` Create `app/api/chat/route.ts`:
  1. Verify Firebase ID token via `verifyIdToken()` → get `uid`
  2. Call `getHistory(uid)` from Firestore
  3. Call `buildPrompt(req, history)`
  4. Call `callGemini(prompt)`
  5. Call `saveMessage(uid, userMessage)` and `saveMessage(uid, assistantMessage)`
  6. Return `200 { response: markdownString }`
  7. Return `401` if token invalid, `500` on Gemini error

### 3.5 History API Route
- `[ ]` Create `app/api/history/route.ts`:
  - Verify Firebase ID token
  - Call `getHistory(uid)`
  - Return `200 { messages: [] }`

### 3.6 Layout Components
- `[ ]` Create `components/layout/Header.tsx`:
  - App title: "AI Destination Discovery" (`<h1>` or logo in `<header>`)
  - Logout button (`id="logout-btn"`, calls `auth().signOut()`, redirects to `/login`)
  - Semantic `<header>` element
- `[ ]` Create `components/layout/Footer.tsx` (optional — minimal)

### 3.7 Destination Form Component
- `[ ]` Create `components/chat/DestinationForm.tsx`:
  - Destination text input (`id="destination-input"`, `aria-label="Destination"`, `placeholder="e.g. Paris"`)
  - Budget text input (`id="budget-input"`, `aria-label="Budget"`, `placeholder="e.g. $1500"`)
  - Days number input (`id="days-input"`, `aria-label="Number of days"`, `min=1`, `max=30`)
  - Season select/input (`id="season-input"`, options: Spring/Summer/Autumn/Winter)
  - Discover button (`id="discover-btn"`, triggers `onSubmit` prop)
  - Validation: all fields required before submit

### 3.8 Chat Window Component
- `[ ]` Create `components/chat/ChatWindow.tsx`:
  - Scrollable container (`overflow-y: auto`)
  - `aria-live="polite"` for new message announcements
  - Renders list of `<ChatBubble>` components
  - Auto-scrolls to bottom on new message (`useEffect` + `scrollIntoView`)
  - Shows `<Spinner>` when `isLoading` is true

### 3.9 Chat Bubble Component
- `[ ]` Create `components/chat/ChatBubble.tsx`:
  - `role: "user" | "assistant"` prop
  - User bubble: right-aligned, distinct background color
  - Assistant bubble: left-aligned, uses `<MarkdownRenderer>`
  - Semantic `<article>` wrapper

### 3.10 Markdown Renderer Component
- `[ ]` Create `components/chat/MarkdownRenderer.tsx`:
  - Uses `react-markdown` with `remarkGfm` plugin
  - Uses `rehype-sanitize` to prevent XSS
  - Styles headings, lists, code blocks appropriately

### 3.11 Chat Input Component
- `[ ]` Create `components/chat/ChatInput.tsx`:
  - Follow-up text input (`id="chat-input"`, `aria-label="Ask a follow-up question"`, `placeholder="Ask a follow-up question..."`)
  - Send button (`id="send-btn"`, `aria-label="Send message"`)
  - Submit on `Enter` key (keyboard support)
  - Disabled when `isLoading`

### 3.12 Chat Page
- `[ ]` Create `app/(dashboard)/chat/page.tsx`:
  - Mounts `<Header>`, `<DestinationForm>`, `<ChatWindow>`, `<ChatInput>`
  - Manages `ChatState` via `useState`
  - On "Discover": calls `POST /api/chat`, appends response to `messages[]`
  - On load: calls `GET /api/history` to restore conversation
  - On follow-up "Send": calls `POST /api/chat` with same destination context

---

## Phase 4 — Accessibility, Testing & Bug Fixes (20 min)

### 4.1 Accessibility Audit
- `[ ]` Verify single `<h1>` per page (Login, Register, Chat)
- `[ ]` Add `aria-label` to all icon-only or ambiguous buttons
- `[ ]` Add `role="alert"` to all error message elements
- `[ ]` Add `aria-live="polite"` to `ChatWindow`
- `[ ]` Verify all form inputs have associated `<label>` or `aria-label`
- `[ ]` Verify semantic HTML: `<main>`, `<header>`, `<nav>`, `<section>`, `<article>` used appropriately
- `[ ]` Check color contrast ratio >= 4.5:1 (use browser DevTools or axe)

### 4.2 Keyboard Navigation Test
- `[ ]` Tab through Login page — all fields and buttons reachable in logical order
- `[ ]` Tab through Register page
- `[ ]` Tab through Chat page — DestinationForm, Discover button, ChatInput, Send button, Logout
- `[ ]` Verify Enter key submits forms and sends follow-up messages

### 4.3 Manual Acceptance Criteria Testing
- `[ ]` **AC-01:** Register with new email → user created in Firebase Auth + Firestore
- `[ ]` **AC-02:** Login with registered credentials → redirected to `/chat`
- `[ ]` **AC-03:** Enter destination "Paris", $1500, 4 days, Spring → click Discover
- `[ ]` **AC-04:** Verify response contains **Hidden Gems** section
- `[ ]` **AC-05:** Verify response contains **Cultural Story** section
- `[ ]` **AC-06:** Verify response contains **Day-wise Itinerary** (Day 1, Day 2, ...)
- `[ ]` **AC-07:** Verify response contains **Festivals** section
- `[ ]` **AC-08:** Verify response contains **Local Food** section
- `[ ]` **AC-09:** Verify response contains **Traditional Dance** section
- `[ ]` **AC-10:** Verify response contains **Local Markets** section
- `[ ]` **AC-11:** Send follow-up "Best vegetarian food?" → response is context-aware
- `[ ]` **AC-12:** Check Firestore console — `conversation_memory/{uid}` has messages stored
- `[ ]` **AC-13:** Refresh page → conversation history restored from Firestore

### 4.4 Performance Check
- `[ ]` Measure AI initial response time in browser DevTools Network tab
- `[ ]` Verify response time < 10 seconds (spec NFR target)

### 4.5 Bug Fixes
- `[ ]` Fix any UI/UX issues found during testing
- `[ ]` Fix any type errors (`npx tsc --noEmit`)
- `[ ]` Fix any ESLint warnings (`npx eslint .`)

---

## Phase 5 — Docker & Deployment (20 min)

### 5.1 Firestore Security Rules
- `[ ]` Create `firestore.rules` at project root:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /conversation_memory/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
  ```
- `[ ]` Deploy rules: `firebase deploy --only firestore:rules`

### 5.2 Dockerfile
- `[ ]` Create `Dockerfile` at project root (multi-stage build):
  - Stage 1 (`builder`): `node:20-alpine`, `npm ci`, `npm run build`
  - Stage 2 (`runner`): copy `.next/standalone`, `.next/static`, `public/`, `prompts/`
  - `EXPOSE 3000` and `CMD ["node", "server.js"]`
- `[ ]` Add `.dockerignore` excluding `node_modules`, `.env.local`, `.next`
- `[ ]` Test Docker build locally: `docker build -t destination-discovery .`
- `[ ]` Test Docker run locally: `docker run -p 3000:3000 --env-file .env.local destination-discovery`

### 5.3 Google Cloud Setup
- `[ ]` Ensure `gcloud` CLI is authenticated: `gcloud auth login`
- `[ ]` Set project: `gcloud config set project PROJECT_ID`
- `[ ]` Enable APIs: Cloud Run, Cloud Build, Artifact Registry, Secret Manager
- `[ ]` Store secrets in Secret Manager:
  - `gemini-api-key` → value of `GEMINI_API_KEY`
  - `firebase-admin-key` → value of `FIREBASE_ADMIN_PRIVATE_KEY`
  - `firebase-admin-email` → value of `FIREBASE_ADMIN_CLIENT_EMAIL`

### 5.4 Cloud Run Deployment
- `[ ]` Build and push container image:
  ```
  gcloud builds submit --tag gcr.io/PROJECT_ID/destination-discovery
  ```
- `[ ]` Deploy to Cloud Run:
  ```
  gcloud run deploy destination-discovery \
    --image gcr.io/PROJECT_ID/destination-discovery \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
    --set-secrets FIREBASE_ADMIN_PRIVATE_KEY=firebase-admin-key:latest \
    --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  ```
- `[ ]` Copy the public HTTPS URL from Cloud Run output
- `[ ]` Smoke test the deployed URL — login, discover, chat

### 5.5 GitHub Repository
- `[ ]` Create public GitHub repository named `travel-with-gemini` (or similar)
- `[ ]` Ensure `.gitignore` excludes `.env.local`, `node_modules`, `.next`
- `[ ]` Push all code: `git add . && git commit -m "feat: initial MVP" && git push origin main`
- `[ ]` Verify repository is public and accessible

### 5.6 README
- `[ ]` Create `README.md` with:
  - Project title and description
  - Tech stack summary
  - Local setup instructions (clone → `.env.local` → `npm install` → `npm run dev`)
  - Deployment instructions (Docker + Cloud Run)
  - Live demo URL (Cloud Run public URL)
  - Link to spec document
  - Acceptance criteria checklist (all ✅)

---

## Final Verification Checklist

| # | Acceptance Criterion | Status |
|---|---|---|
| 1 | User can register | `[ ]` |
| 2 | User can login | `[ ]` |
| 3 | User can search destination | `[ ]` |
| 4 | Gemini returns hidden gems | `[ ]` |
| 5 | Gemini returns factual cultural story | `[ ]` |
| 6 | Gemini returns itinerary | `[ ]` |
| 7 | Gemini returns festivals | `[ ]` |
| 8 | Gemini returns food | `[ ]` |
| 9 | Gemini returns dance | `[ ]` |
| 10 | Gemini returns markets | `[ ]` |
| 11 | User can continue chatting | `[ ]` |
| 12 | Conversation stored in Firestore | `[ ]` |
| 13 | Application deployed on Google Cloud Run | `[ ]` |
| 14 | Source code published on GitHub | `[ ]` |

---

> **Legend:** `[ ]` Not started · `[/]` In progress · `[x]` Complete  
> **Spec Reference:** [travel-with-gemini-spec.md](file:///c:/Users/AnkitGarg/OneDrive%20-%20IBM/Desktop/H2S/travel-with-gemini/travel-with-gemini-spec.md)  
> **Design Reference:** [technical-design-doc.md](file:///c:/Users/AnkitGarg/OneDrive%20-%20IBM/Desktop/H2S/travel-with-gemini/technical-design-doc.md)
