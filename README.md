# LifeStage Finance MVP

This repository contains a minimal proof‑of‑concept application for delivering life‑stage financial guidance.  It consists of a Next.js (React) frontend and a FastAPI backend.  The goal of this MVP is to demonstrate a clean separation between client and server code, a responsive user experience with Tailwind CSS and a deterministic rules engine for generating financial plans.

## Project structure

```
lifestage-finance/
├── backend/        # FastAPI application
│   ├── app/        # Python package with API, schemas and rules
│   └── requirements.txt
└── frontend/       # Next.js application (App Router with TypeScript)
    ├── app/        # Top‑level pages and layouts
    ├── components/ # React components (empty for now)
    ├── public/     # Static assets
    ├── styles/     # Global CSS (Tailwind)
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── next.config.js
```

## Running the backend

From a terminal in the `backend` folder:

```bash
python -m venv .venv
source .venv/bin/activate  # Use `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  A health check endpoint lives at `/health` and the plan generator endpoint is `/api/plan`.

## Running the frontend

From a separate terminal in the `frontend` folder:

```bash
cp .env.example .env.local  # or create .env.local manually
npm install
npm run dev
```

The development server will start at `http://localhost:3000`.  Make sure the backend is running on port `8000` or update `NEXT_PUBLIC_API_BASE_URL` in your environment file.

## Deployment notes

For production you can build the frontend with `npm run build` and serve it statically or with `next start`.  The backend can be deployed on any Python‑friendly hosting platform.  CORS is currently wide open for development but should be restricted in production.