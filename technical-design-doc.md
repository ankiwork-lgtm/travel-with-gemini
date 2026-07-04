# Technical Design Document
## AI Destination Discovery & Cultural Experiences Platform

**Derived from:** `travel-with-gemini-spec.md` v1.0  
**Approach:** Spec-Driven Development (SDD)  
**Event:** Google Build with AI – PromptWars  
**Date:** 2026-07-04  
**Status:** Draft

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Component Design](#2-system-component-design)
3. [Directory & File Structure](#3-directory--file-structure)
4. [Data Model Design](#4-data-model-design)
5. [API Contract](#5-api-contract)
6. [Authentication Flow](#6-authentication-flow)
7. [AI & Prompt Engineering Design](#7-ai--prompt-engineering-design)
8. [UI Component Breakdown](#8-ui-component-breakdown)
9. [State Management](#9-state-management)
10. [Security Model](#10-security-model)
11. [Environment Configuration](#11-environment-configuration)
12. [Deployment Pipeline](#12-deployment-pipeline)
13. [Testing Strategy](#13-testing-strategy)
14. [Acceptance Criteria Mapping](#14-acceptance-criteria-mapping)
15. [Development Phases](#15-development-phases)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                    Next.js 15 App Router                     │
│   ┌─────────────┐   ┌──────────────────┐   ┌────────────┐   │
│   │  Auth Pages  │   │   Chat Interface │   │  History   │   │
│   └──────┬──────┘   └────────┬─────────┘   └─────┬──────┘   │
└──────────┼────────────────────┼───────────────────┼──────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│              Next.js Route Handlers  (API Layer)              │
│   POST /api/auth/register    POST /api/auth/login             │
│   POST /api/chat             GET  /api/history                │
└───────────┬─────────────────────┬────────────────────────────┘
            │                     │
      ┌─────▼──────┐     ┌────────▼──────────┐
      │  Firebase  │     │   Gemini 2.5 Flash │
      │  Auth +    │     │   (Google AI API)  │
      │  Firestore │     │   + Search Ground. │
      └────────────┘     └───────────────────┘
```

### Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack in one repo; no separate FastAPI needed |
| AI Provider | Gemini 2.5 Flash | Spec-mandated; fast inference, search grounding |
| Auth | Firebase Authentication | Spec-mandated; handles email/password out of box |
| DB | Firestore | Spec-mandated; NoSQL fits conversation message arrays |
| Deploy | Docker → Cloud Run | Spec-mandated; simple container-based deploy |
| State | React Context + useState | MVP complexity; no Redux overhead needed |

---

## 2. System Component Design

### 2.1 Frontend Components

```
app/
├── (auth)/
│   ├── login/page.tsx          ← Login screen
│   └── register/page.tsx       ← Register screen
├── (dashboard)/
│   └── chat/page.tsx           ← Main chat interface
├── layout.tsx                  ← Root layout with AuthProvider
└── page.tsx                    ← Root redirect (→ /login or /chat)

components/
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── chat/
│   ├── DestinationForm.tsx     ← Destination/Budget/Days/Season inputs
│   ├── ChatWindow.tsx          ← Scrollable conversation display
│   ├── ChatBubble.tsx          ← User / Assistant message bubble
│   ├── ChatInput.tsx           ← Follow-up message input + Send
│   └── MarkdownRenderer.tsx    ← Renders Gemini markdown response
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Spinner.tsx
└── layout/
    ├── Header.tsx              ← App title + Logout
    └── Footer.tsx
```

### 2.2 Backend Route Handlers

```
app/api/
├── auth/
│   ├── register/route.ts       ← POST: create Firebase user + Firestore doc
│   └── login/route.ts          ← POST: sign in via Firebase Admin SDK
├── chat/route.ts               ← POST: call Gemini, store to Firestore
└── history/route.ts            ← GET: fetch conversation_memory for uid
```

### 2.3 Library Layer

```
lib/
├── firebase/
│   ├── client.ts               ← Firebase client SDK init
│   └── admin.ts                ← Firebase Admin SDK init (server-side)
├── gemini/
│   ├── client.ts               ← Gemini API client init
│   └── generate.ts             ← buildPrompt(), callGemini() helpers
├── firestore/
│   ├── users.ts                ← createUser(), getUser()
│   └── conversation.ts         ← saveMessage(), getHistory()
└── auth/
    └── middleware.ts           ← Verify Firebase ID token on API routes
```

---

## 3. Directory & File Structure

```
destination-discovery/
│
├── app/                            # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   └── chat/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── chat/route.ts
│   │   └── history/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                     # Reusable React components
│   ├── auth/
│   ├── chat/
│   ├── ui/
│   └── layout/
│
├── lib/                            # Server & client utilities
│   ├── firebase/
│   ├── gemini/
│   ├── firestore/
│   └── auth/
│
├── prompts/                        # AI prompt files (no hardcoding)
│   ├── system_prompt.md
│   ├── destination_prompt.md
│   ├── story_prompt.md
│   └── hidden_gems_prompt.md
│
├── specs/                          # Spec & design docs
│   ├── travel-with-gemini-spec.md
│   └── technical-design-doc.md
│
├── public/                         # Static assets
│
├── .env.local                      # Local environment variables
├── .gitignore
├── Dockerfile
├── firestore.rules
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Data Model Design

### 4.1 Firestore Collection: `users`

**Document ID:** Firebase UID

```typescript
interface UserDocument {
  uid: string;          // Firebase Auth UID
  email: string;        // User email address
  createdAt: Timestamp; // Firestore server timestamp
}
```

**Firestore Path:** `users/{uid}`

---

### 4.2 Firestore Collection: `conversation_memory`

**Document ID:** Firebase UID — one document per user

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;       // Plain text (user) or Markdown (assistant)
  timestamp: Timestamp;  // Firestore server timestamp
}

interface ConversationDocument {
  uid: string;
  messages: Message[];   // Array of all messages, ordered by timestamp
}
```

**Firestore Path:** `conversation_memory/{uid}`

> **Design Note:** A single document per user is chosen for MVP simplicity. The `messages` array is appended via `arrayUnion`. For production, sub-collections per session would be preferred.

---

### 4.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own user doc
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Users can only read/write their own conversation memory
    match /conversation_memory/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 5. API Contract

All API routes require a valid Firebase ID token in the `Authorization: Bearer <token>` header (except `/api/auth/*`).

---

### POST `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response `201`:**
```json
{
  "uid": "firebase-uid",
  "email": "user@example.com"
}
```

**Error Response `400`:**
```json
{ "error": "Email already in use" }
```

**Implementation Notes:**
- Uses Firebase Admin SDK to create user
- Creates `users/{uid}` Firestore document on success
- Initializes empty `conversation_memory/{uid}` document

---

### POST `/api/auth/login`

> **Design Note:** Login is handled client-side via Firebase client SDK (`signInWithEmailAndPassword`). This route acts as an optional server-side wrapper. The ID token is stored in-memory for subsequent API calls.

---

### POST `/api/chat`

**Headers:** `Authorization: Bearer <firebase-id-token>`

**Request Body:**
```json
{
  "destination": "Paris",
  "budget": "1500",
  "days": 4,
  "season": "Spring",
  "message": "Plan my trip"
}
```

**Success Response `200`:**
```json
{
  "response": "# Paris\n\n## Hidden Gems\n\n- ...\n\n## Cultural Story\n\n..."
}
```

**Error Response `401`:**
```json
{ "error": "Unauthorized" }
```

**Internal Flow:**
```
1. Verify Firebase ID token → extract uid
2. Load conversation history from Firestore (conversation_memory/{uid})
3. Build full prompt from prompt files + user inputs + history context
4. Call Gemini 2.5 Flash API with Google Search Grounding
5. Append user message + assistant response to Firestore
6. Return markdown response
```

---

### GET `/api/history`

**Headers:** `Authorization: Bearer <firebase-id-token>`

**Success Response `200`:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Plan my trip to Paris for 4 days",
      "timestamp": "2026-07-04T06:00:00Z"
    },
    {
      "role": "assistant",
      "content": "# Paris\n\n## Hidden Gems\n...",
      "timestamp": "2026-07-04T06:00:05Z"
    }
  ]
}
```

---

## 6. Authentication Flow

```
Client                   Firebase Auth         Next.js API          Firestore
  │                            │                    │                    │
  │── signInWithEmailAndPwd ──►│                    │                    │
  │◄── idToken ────────────────│                    │                    │
  │                            │                    │                    │
  │── POST /api/chat (Bearer: idToken) ────────────►│                    │
  │                            │◄── verifyIdToken() │                    │
  │                            │──── uid ──────────►│                    │
  │                            │                    │── getHistory(uid) ►│
  │                            │                    │◄── messages ───────│
  │                            │                    │── callGemini() ────►(AI)
  │                            │                    │◄── response ───────│
  │                            │                    │── saveMessage(uid) ►│
  │◄── { response: markdown } ─────────────────────│                    │
```

**Token Refresh Strategy:** Firebase client SDK handles token refresh automatically. The fresh token is read before each API call via `user.getIdToken()`.

---

## 7. AI & Prompt Engineering Design

### 7.1 Prompt File Strategy

All prompts are stored as `.md` files under `/prompts/`. They are loaded at runtime using `fs.readFileSync` in the server-side Route Handler. **No prompt content is hardcoded in TypeScript/JavaScript files.**

```typescript
// lib/gemini/generate.ts
import fs from 'fs';
import path from 'path';

function loadPrompt(filename: string): string {
  const promptPath = path.join(process.cwd(), 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}
```

---

### 7.2 Prompt Files

#### `prompts/system_prompt.md`
```
You are an expert travel guide and cultural storyteller.
Your role is to help travelers discover authentic cultural experiences.
Always provide factual, accurate information. Never generate fictional content about real places.
Format all responses in Markdown.
Use Google Search when needed to ground your responses in real, current facts.
```

#### `prompts/destination_prompt.md`
```
The user wants to travel to: {{destination}}
Budget: {{budget}}
Duration: {{days}} days
Season: {{season}}

Generate a comprehensive travel guide with:
1. Hidden Gems (lesser-known places)
2. Cultural Story (history, heritage, traditions — factual only)
3. Day-wise Itinerary (Morning / Afternoon / Evening for each day)
4. Festivals (relevant to the season/destination)
5. Local Food (traditional dishes to try)
6. Traditional Dance (famous dance forms)
7. Local Markets (worth visiting)

Format with Markdown headings:
# {{destination}}
## Hidden Gems
## Cultural Story
## Day 1
## Festivals
## Local Food
## Traditional Dance
## Local Markets
```

#### `prompts/story_prompt.md`
```
Provide a factual cultural story about {{destination}} covering:
- Historical background
- Cultural heritage
- Local traditions and customs
- Significance to the local community
Do not include fictional or invented content.
```

#### `prompts/hidden_gems_prompt.md`
```
List 5 lesser-known, authentic places in {{destination}} that most tourists overlook.
For each place, explain what makes it special and who would enjoy visiting it.
```

---

### 7.3 Prompt Assembly

```typescript
interface ChatRequest {
  destination: string;
  budget: string;
  days: number;
  season: string;
  message: string;
}

function buildPrompt(req: ChatRequest, history: Message[]): string {
  const systemPrompt = loadPrompt('system_prompt.md');
  const destinationPrompt = loadPrompt('destination_prompt.md')
    .replace(/{{destination}}/g, req.destination)
    .replace(/{{budget}}/g, req.budget)
    .replace(/{{days}}/g, String(req.days))
    .replace(/{{season}}/g, req.season);

  const historyText = history
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return `${systemPrompt}\n\n${destinationPrompt}\n\n## Conversation History\n${historyText}\n\nUser: ${req.message}`;
}
```

---

### 7.4 Gemini API Configuration

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }],   // Google Search Grounding enabled
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 8192,
};
```

---

## 8. UI Component Breakdown

### 8.1 Page: Login (`/login`)

| Element | Component | ID | Behavior |
|---|---|---|---|
| Email field | `<Input>` | `login-email` | Controlled input |
| Password field | `<Input type="password">` | `login-password` | Controlled input |
| Login button | `<Button>` | `login-submit` | Triggers Firebase signIn |
| Register link | `<Link>` | `register-link` | Navigates to `/register` |
| Error display | `<p role="alert">` | `login-error` | Shows auth errors |

### 8.2 Page: Register (`/register`)

| Element | Component | ID | Behavior |
|---|---|---|---|
| Email field | `<Input>` | `register-email` | Controlled input |
| Password field | `<Input type="password">` | `register-password` | Controlled input |
| Register button | `<Button>` | `register-submit` | Calls `/api/auth/register` |
| Login link | `<Link>` | `login-link` | Navigates to `/login` |

### 8.3 Page: Chat Interface (`/chat`)

```
┌─────────────────────────────────────────────┐
│  Header: "AI Destination Discovery"  [Logout]│
├─────────────────────────────────────────────┤
│  DestinationForm                             │
│  ┌──────────┐ ┌────────┐ ┌────┐ ┌────────┐  │
│  │Destination│ │ Budget │ │Days│ │ Season │  │
│  └──────────┘ └────────┘ └────┘ └────────┘  │
│                          [  Discover  ]      │
├─────────────────────────────────────────────┤
│  ChatWindow (scrollable)                     │
│  ┌─────────────────────────────────────┐    │
│  │ User bubble (right-aligned)         │    │
│  │ Assistant bubble (left-aligned)     │    │
│  │     [Rendered Markdown]             │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  ChatInput                                   │
│  ┌──────────────────────────┐  [Send]        │
│  │ Ask a follow-up question │               │
│  └──────────────────────────┘               │
└─────────────────────────────────────────────┘
```

### 8.4 Accessibility Requirements

- All interactive elements have unique `id` attributes
- `aria-label` on icon-only buttons
- `role="alert"` on error messages
- Keyboard navigation: `Tab` through all focusable elements
- `aria-live="polite"` on `ChatWindow` for new message announcements
- Color contrast ratio >= 4.5:1 (WCAG AA)
- Semantic HTML: `<main>`, `<header>`, `<nav>`, `<section>`, `<article>`
- Single `<h1>` per page

---

## 9. State Management

### 9.1 Auth State (React Context)

```typescript
// lib/auth/AuthContext.tsx
interface AuthContextType {
  user: User | null;       // Firebase user object
  idToken: string | null;  // For API calls
  loading: boolean;
  logout: () => Promise<void>;
}
```

### 9.2 Chat State (Component-level useState)

```typescript
interface ChatState {
  messages: Message[];        // Full conversation history
  isLoading: boolean;         // Gemini API in flight
  destination: string;
  budget: string;
  days: number;
  season: string;
  followUpInput: string;
}
```

### 9.3 Data Flow

```
User fills DestinationForm → clicks "Discover"
  → POST /api/chat { destination, budget, days, season, message: "Plan my trip" }
  → Gemini response received
  → Append to messages[] (local state)
  → Save to Firestore (server-side in Route Handler)
  → ChatWindow re-renders with new ChatBubble

User types follow-up → clicks "Send"
  → POST /api/chat { destination (same), ..., message: followUpText }
  → Same flow
```

---

## 10. Security Model

| Threat | Mitigation |
|---|---|
| Unauthenticated API access | Firebase ID token verified on every `/api/chat` and `/api/history` call |
| Cross-user data access | Firestore rules enforce `request.auth.uid == uid` |
| API key exposure | `GEMINI_API_KEY` is server-only (no `NEXT_PUBLIC_` prefix) |
| Firebase config exposure | Firebase client config is safe to expose; security enforced via Auth + Rules |
| Prompt injection | Server-side prompt construction; user input substituted into template fields only |
| XSS via markdown | Use `react-markdown` with `rehype-sanitize` to sanitize rendered HTML |

---

## 11. Environment Configuration

### `.env.local` (local development — never committed)

```bash
# Gemini AI (server-only)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Client SDK (safe to expose to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (server-only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Cloud Run Secret Manager

All secrets are injected as environment variables via Cloud Run's Secret Manager integration — not baked into the Docker image.

---

## 12. Deployment Pipeline

### 12.1 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prompts ./prompts

EXPOSE 3000
CMD ["node", "server.js"]
```

### 12.2 Cloud Run Deployment

```bash
# Build and push container image
gcloud builds submit --tag gcr.io/PROJECT_ID/destination-discovery

# Deploy to Cloud Run
gcloud run deploy destination-discovery \
  --image gcr.io/PROJECT_ID/destination-discovery \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-secrets FIREBASE_ADMIN_PRIVATE_KEY=firebase-admin-key:latest
```

### 12.3 Deployment Topology

```
GitHub (source)
    │
    ▼
Cloud Build (CI)
    │  docker build + push
    ▼
Artifact Registry (container image)
    │
    ▼
Cloud Run (production)
    │
    ▼
Public HTTPS URL
(https://destination-discovery-xxxx.run.app)
```

---

## 13. Testing Strategy

### 13.1 Manual Test Cases

#### Authentication

| Test Case | Steps | Expected |
|---|---|---|
| Register new user | POST valid email+password | 201 + user created in Firestore |
| Register duplicate | POST existing email | 400 + "Email already in use" |
| Login valid | POST valid credentials | 200 + idToken returned |
| Login invalid | POST wrong password | 401 + error message |
| Logout | Click logout in header | Redirected to /login |

#### AI Response Validation

| Test Case | Expected |
|---|---|
| Discover Paris, 4 days, $1500, Spring | Response contains: Hidden Gems, Cultural Story, Day 1-4, Festivals, Local Food, Traditional Dance, Local Markets |
| Follow-up: "Best vegetarian food?" | Response is contextually aware of previous Paris conversation |
| Follow-up: "Places for kids?" | Response acknowledges Paris context |

#### Firestore Persistence

| Test Case | Expected |
|---|---|
| After first Discover | Firestore `conversation_memory/{uid}` has user + assistant messages |
| Refresh page | GET /api/history returns all previous messages |

#### Accessibility

| Test Case | Tool | Expected |
|---|---|---|
| Keyboard navigation | Manual Tab key | All buttons and inputs reachable |
| Screen reader | NVDA/VoiceOver | All form labels announced correctly |
| Color contrast | axe DevTools | >= 4.5:1 contrast ratio |

### 13.2 NFR Validation

| NFR | Target | Test Method |
|---|---|---|
| Initial AI response | < 10 seconds | Browser DevTools Network tab |
| Accessibility | WCAG AA | axe DevTools browser extension |

---

## 14. Acceptance Criteria Mapping

| Acceptance Criterion | Technical Implementation | File(s) |
|---|---|---|
| User can register | `/api/auth/register` + Firebase Admin createUser | `app/api/auth/register/route.ts` |
| User can login | Firebase client `signInWithEmailAndPassword` | `components/auth/LoginForm.tsx` |
| User can search destination | `DestinationForm.tsx` → POST `/api/chat` | `components/chat/DestinationForm.tsx` |
| Gemini returns hidden gems | `destination_prompt.md` section | `prompts/destination_prompt.md` |
| Gemini returns cultural story | `destination_prompt.md` section | `prompts/destination_prompt.md` |
| Gemini returns itinerary | `destination_prompt.md` day-wise section | `prompts/destination_prompt.md` |
| Gemini returns festivals | `destination_prompt.md` section | `prompts/destination_prompt.md` |
| Gemini returns food | `destination_prompt.md` section | `prompts/destination_prompt.md` |
| Gemini returns dance | `destination_prompt.md` section | `prompts/destination_prompt.md` |
| Gemini returns markets | `destination_prompt.md` section | `prompts/destination_prompt.md` |
| User can continue chatting | `ChatInput.tsx` follow-up → POST `/api/chat` with history | `components/chat/ChatInput.tsx` |
| Conversation stored in Firestore | `lib/firestore/conversation.ts` saveMessage | `lib/firestore/conversation.ts` |
| Deployed on Cloud Run | Dockerfile + gcloud run deploy | `Dockerfile` |
| Source code on GitHub | git push public repo | GitHub |

---

## 15. Development Phases

### Phase 1 — Project Setup (15 min)

- [ ] `npx create-next-app@latest ./ --typescript --app`
- [ ] Install: `@google/generative-ai`, `firebase`, `firebase-admin`, `react-markdown`, `rehype-sanitize`, `remark-gfm`
- [ ] Configure Firebase project (Auth + Firestore)
- [ ] Set up `.env.local`
- [ ] Initialize `lib/firebase/client.ts` and `lib/firebase/admin.ts`

### Phase 2 — Auth UI & API (30 min)

- [ ] Create `LoginForm.tsx` and `RegisterForm.tsx`
- [ ] Create `/app/(auth)/login/page.tsx` and `/register/page.tsx`
- [ ] Implement `AuthContext.tsx`
- [ ] Implement `POST /api/auth/register` route
- [ ] Implement protected route guard in `layout.tsx`

### Phase 3 — Chat UI & Gemini Integration (35 min)

- [ ] Create `DestinationForm.tsx`
- [ ] Create `ChatWindow.tsx`, `ChatBubble.tsx`, `MarkdownRenderer.tsx`
- [ ] Create `ChatInput.tsx` for follow-up messages
- [ ] Write all 4 prompt files in `/prompts/`
- [ ] Implement `lib/gemini/generate.ts` with prompt file loading
- [ ] Implement `POST /api/chat` route
- [ ] Implement `GET /api/history` route
- [ ] Implement `lib/firestore/conversation.ts`

### Phase 4 — Accessibility, Testing & Bug Fixes (20 min)

- [ ] Add `aria-label`, `aria-live`, `role="alert"` throughout
- [ ] Verify keyboard navigation
- [ ] Manual test all acceptance criteria
- [ ] Fix discovered bugs

### Phase 5 — Docker & Deployment (20 min)

- [ ] Write `Dockerfile` (multi-stage build)
- [ ] Write `firestore.rules`
- [ ] Build and push Docker image to Artifact Registry
- [ ] Deploy to Cloud Run with secrets
- [ ] Push to public GitHub repo
- [ ] Update `README.md`

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "@google/generative-ai": "^0.21.0",
    "firebase": "^10.x",
    "firebase-admin": "^12.x",
    "react-markdown": "^9.x",
    "rehype-sanitize": "^6.x",
    "remark-gfm": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^19.x"
  }
}
```

---

> **End of Technical Design Document**  
> Next step: Proceed to Phase 1 implementation per the development timeline above.
