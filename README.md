# AI Destination Discovery & Cultural Experiences

An AI-powered travel guide built with **Next.js**, **Google Gemini 2.5 Flash**, and **Firebase** — created for the Google Build with AI – PromptWars hackathon.

## Features

- 🔐 **Email/Password authentication** via Firebase Auth
- 🌍 **AI destination discovery** — hidden gems, cultural stories, itineraries, festivals, food, dance, markets
- 💬 **Conversational follow-ups** — ask follow-up questions in context
- 🧠 **Persistent memory** — conversation history stored in Firestore and restored on reload
- 🔍 **Google Search grounding** — Gemini uses live search for accurate, up-to-date travel info

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Auth | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore |
| Language | TypeScript |
| Deployment | Google Cloud Run (Docker) |

## Local Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/travel-with-gemini.git
   cd travel-with-gemini
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`** at the project root:
   ```
   GEMINI_API_KEY=your_gemini_api_key

   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=

   FIREBASE_ADMIN_PROJECT_ID=
   FIREBASE_ADMIN_CLIENT_EMAIL=
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

```bash
# Build image
docker build -t destination-discovery .

# Run locally with env file
docker run -p 3000:3000 --env-file .env.local destination-discovery
```

## Google Cloud Run Deployment

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/destination-discovery

# Deploy
gcloud run deploy destination-discovery \
  --image gcr.io/PROJECT_ID/destination-discovery \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-secrets FIREBASE_ADMIN_PRIVATE_KEY=firebase-admin-key:latest \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=...,NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

## Acceptance Criteria

| # | Criterion | Status |
|---|---|---|
| 1 | User can register | ✅ |
| 2 | User can login | ✅ |
| 3 | User can search destination | ✅ |
| 4 | Gemini returns hidden gems | ✅ |
| 5 | Gemini returns cultural story | ✅ |
| 6 | Gemini returns day-wise itinerary | ✅ |
| 7 | Gemini returns festivals | ✅ |
| 8 | Gemini returns local food | ✅ |
| 9 | Gemini returns traditional dance | ✅ |
| 10 | Gemini returns local markets | ✅ |
| 11 | User can continue chatting (follow-ups) | ✅ |
| 12 | Conversation stored in Firestore | ✅ |
| 13 | Application deployed on Google Cloud Run | ✅ |
| 14 | Source code published on GitHub | ✅ |

## Spec Documents

- [Product Spec](travel-with-gemini-spec.md)
- [Technical Design Doc](technical-design-doc.md)
