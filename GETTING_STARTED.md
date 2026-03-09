# PlatePlan — Getting Started

This document explains how to run both the frontend and backend, what backend API endpoints are available, and everything needed for frontend–backend integration.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Running the Backend](#running-the-backend)
  - [Initial setup](#initial-setup)
  - [Seed the database](#seed-the-database)
  - [Start the dev server](#start-the-dev-server)
  - [Test account](#test-account)
- [Running the Frontend](#running-the-frontend)
- [Authentication (Frontend)](#authentication-frontend)
- [Folder Structure](#folder-structure)
- [Backend API Reference](#backend-api-reference)
  - [Authentication](#authentication)
  - [Recipes](#recipes)
  - [Recipe Photo Upload](#recipe-photo-upload)
  - [Folders](#folders)
  - [Meal Plans](#meal-plans)
  - [AI Features](#ai-features)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Frontend Integration Status](#frontend-integration-status)
- [Running Tests](#running-tests)

---

## Project Overview

PlatePlan is a full-stack Recipe & Meal Planning web application.

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix UI), React Router v7 |
| Backend | Express.js 5, TypeScript, Prisma 6, PostgreSQL (DigitalOcean) |
| Auth | Better Auth (HTTP-only session cookies) |
| Cloud Storage | DigitalOcean Spaces (S3-compatible) |
| AI | OpenAI API (gpt-5-mini) |

---

## Prerequisites

- Node.js >= 18
- npm >= 9

The backend requires the PostgreSQL database and environment variables configured.

---

## Running the Backend

### Initial setup

```bash
# From the repository root
cd backend

# Install dependencies
npm install

# Push the Prisma schema to the database
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

### Seed the database

The seed script creates a test user (via Better Auth), 6 folders, 10 tags, 6 recipes with ingredients and tags, and 1 meal plan with 6 entries.

```bash
npx tsx prisma/seed.ts
```

### Start the dev server

```bash
npm run dev
```

The backend will be available at **http://localhost:3000**.

Other scripts:

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run db:push` | Push schema changes to PostgreSQL |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Run the seed script |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

### Test account

After running the seed script, a test account is available:

| Field | Value |
|---|---|
| Email | `test@example.com` |
| Password | `password123` |
| Name | `Test User` |

---

## Running the Frontend

```bash
# From the repository root
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

Other scripts:

| Command | Description |
|---|---|
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

---

## Authentication (Frontend)

The frontend is wired to the real Better Auth backend and uses HTTP-only session cookies.

| Step | Behaviour |
|---|---|
| Register (`/register`) | Calls `POST /api/auth/sign-up/email`, then checks `GET /api/auth/get-session`. |
| Login (`/login`) | Calls `POST /api/auth/sign-in/email`, then checks `GET /api/auth/get-session`. |
| Session rehydration | On app load, `AuthContext` calls `GET /api/auth/get-session`. |
| Logout | Calls `POST /api/auth/sign-out` and clears client auth state. |

The backend's Better Auth endpoints are:

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/sign-up/email` | Register a new user |
| `POST` | `/api/auth/sign-in/email` | Log in and receive a session cookie |
| `POST` | `/api/auth/sign-out` | Destroy the session cookie |
| `GET` | `/api/auth/get-session` | Return the current authenticated user + session |

Cookie notes:
- `frontend/src/lib/api.ts` sends all requests with `credentials: "include"`.
- In development, Vite proxies `/api` to the backend (`frontend/vite.config.ts`) to avoid common CORS/cookie issues.

---

## Folder Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── MealPlannerGrid.tsx   # Weekly drag-and-drop planner
│   │   ├── NutritionPanel.tsx    # AI nutrition analysis UI
│   │   ├── RecipeCard.tsx        # Recipe card for the grid
│   │   ├── RecipeForm.tsx        # Create / edit recipe form
│   │   ├── RecipeList.tsx        # Responsive recipe card grid
│   │   └── Sidebar.tsx           # Left navigation sidebar
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state via Better Auth session endpoints
│   ├── routes/             # Page-level route components
│   │   ├── EditRecipe.tsx        # Create / edit recipe page
│   │   ├── Home.tsx              # Recipe library (default view)
│   │   ├── Login.tsx             # Sign-in page
│   │   ├── MealPlan.tsx          # Weekly meal plan page
│   │   ├── RecipeDetail.tsx      # Recipe detail + nutrition analysis
│   │   └── Register.tsx          # Registration page
│   ├── styles/
│   │   └── global.css            # Tailwind v4 entry + CSS variables
│   ├── lib/
│   │   ├── api.ts                # Typed API client (credentials: include)
│   │   └── utils.ts              # cn() helper (Tailwind merge)
│   ├── App.tsx             # Root component: routing + global state
│   ├── main.tsx            # React entry point
│   └── types.ts            # Shared TypeScript interfaces
├── tests/
│   └── sample.test.ts      # Vitest unit tests
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

backend/
├── src/
│   ├── index.ts              # Server entry point (dotenv + listen on :3000)
│   ├── app.ts                # Express app factory (CORS, JSON, route mounting)
│   ├── lib/
│   │   ├── auth.ts           # Better Auth instance (Prisma adapter, email+password)
│   │   ├── prisma.ts         # PrismaClient singleton
│   │   ├── s3.ts             # S3Client for DigitalOcean Spaces
│   │   └── openai.ts         # OpenAI client singleton
│   ├── middleware/
│   │   ├── authGuard.ts      # Session-based auth middleware (req.user or 401)
│   │   └── errorHandler.ts   # Global error handler (Zod, Prisma, multer errors)
│   └── routes/
│       ├── auth.ts           # Better Auth catch-all handler (/api/auth/*)
│       ├── recipes.ts        # Recipe CRUD with ingredients + tags
│       ├── folders.ts        # Folder CRUD
│       ├── mealPlans.ts      # Meal plan upsert + entry CRUD
│       ├── upload.ts         # Image upload to DigitalOcean Spaces
│       └── ai.ts             # Nutrition analysis + diet suggestions (OpenAI)
├── prisma/
│   ├── schema.prisma         # Database schema (12 models, 2 enums)
│   └── seed.ts               # Seed script (test user + sample data)
├── .env                      # Environment variables (gitignored)
├── .env.example              # Template for .env
├── package.json
└── tsconfig.json
```

---

## Backend API Reference

All endpoints are prefixed with `/api`. The backend runs on **http://localhost:3000** (configure `VITE_API_BASE_URL` on the frontend to change this — see [Environment Variables](#environment-variables)).

Authentication uses **HTTP-only session cookies** managed by Better Auth. All endpoints below require a valid session unless stated otherwise.

---

### Authentication

Managed by Better Auth. These routes are handled automatically by mounting `toNodeHandler(auth)` on `/api/auth/*`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/sign-up/email` | Register a new user |
| `POST` | `/api/auth/sign-in/email` | Log in and receive a session cookie |
| `POST` | `/api/auth/sign-out` | Destroy the session cookie |
| `GET` | `/api/auth/get-session` | Return the current authenticated user |

**Sign up request body:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "name": "Alice"
}
```

**Sign in request body:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Sign in response:**
```json
{
  "token": "session-token-string",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "Alice",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

**Get session response:**
```json
{
  "session": { "id": "...", "token": "...", "userId": "...", "expiresAt": "..." },
  "user": { "id": "...", "email": "...", "name": "...", "createdAt": "..." }
}
```

---

### Recipes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/recipes` | List all recipes for the current user |
| `GET` | `/api/recipes?folderId=<id>` | Filter by folder |
| `GET` | `/api/recipes?search=<query>` | Filter by keyword (title, description, tags) |
| `GET` | `/api/recipes/:id` | Get a single recipe with ingredients & tags |
| `POST` | `/api/recipes` | Create a new recipe |
| `PUT` | `/api/recipes/:id` | Update an existing recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |

**Recipe object (response):**
```json
{
  "id": "cuid-string",
  "userId": "user-id",
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta...",
  "instructions": "1. Cook pasta...",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 4,
  "imageUrl": "https://bucket.region.digitaloceanspaces.com/recipe-images/uuid.jpg",
  "folderId": "folder-cuid",
  "ingredients": [
    { "id": "i1", "name": "Spaghetti", "quantity": "400", "unit": "g" }
  ],
  "tags": [
    { "id": "t1", "name": "Italian" }
  ],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**Create / Update request body:**
```json
{
  "title": "Spaghetti Carbonara",
  "description": "...",
  "instructions": "...",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 4,
  "folderId": "folder-cuid",
  "imageUrl": "https://...",
  "ingredients": [
    { "name": "Spaghetti", "quantity": "400", "unit": "g" }
  ],
  "tags": ["Italian", "Pasta"]
}
```

Request body is validated with Zod. `title` is required; `servings` must be >= 1.

---

### Recipe Photo Upload

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/recipe-image` | Upload a recipe cover photo to DigitalOcean Spaces |

**Request:** `multipart/form-data`, field name `image`. Max file size: 5 MB. Accepted formats: JPG, JPEG, PNG, WebP, GIF.

**Response:**
```json
{ "url": "https://plate-plan-files.tor1.digitaloceanspaces.com/recipe-images/uuid.jpg" }
```

The returned URL should be stored in the recipe's `imageUrl` field.

---

### Folders

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/folders` | List all folders for the current user |
| `POST` | `/api/folders` | Create a new folder |
| `PUT` | `/api/folders/:id` | Rename or recolour a folder |
| `DELETE` | `/api/folders/:id` | Delete a folder (recipes become unfoldered) |

**Folder object:**
```json
{
  "id": "cuid-string",
  "userId": "user-id",
  "name": "Breakfast",
  "color": "#FF6B6B",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Create / Update request body:**
```json
{
  "name": "Breakfast",
  "color": "#FF6B6B"
}
```

---

### Meal Plans

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/meal-plans` | Get meal plan for the current week (defaults to this week) |
| `GET` | `/api/meal-plans?week=YYYY-MM-DD` | Get meal plan for specific week (week start = Monday) |
| `POST` | `/api/meal-plans/:id/entries` | Add a recipe to the meal plan |
| `PATCH` | `/api/meal-plans/:id/entries/:entryId` | Move entry to a different day/meal |
| `DELETE` | `/api/meal-plans/:id/entries/:entryId` | Remove an entry from the plan |

The GET endpoint uses upsert logic: if no meal plan exists for the given user+week, one is created automatically.

**MealPlan response:**
```json
{
  "id": "mp-cuid",
  "userId": "user-id",
  "weekStartDate": "2026-03-02",
  "entries": [
    {
      "id": "me-cuid",
      "mealPlanId": "mp-cuid",
      "recipeId": "recipe-cuid",
      "recipe": { "...full Recipe object..." },
      "dayOfWeek": "MONDAY",
      "mealType": "BREAKFAST"
    }
  ]
}
```

**Create entry request body:**
```json
{
  "recipeId": "recipe-cuid",
  "dayOfWeek": "TUESDAY",
  "mealType": "DINNER"
}
```

**Patch entry request body:**
```json
{
  "dayOfWeek": "WEDNESDAY",
  "mealType": "LUNCH"
}
```

---

### AI Features

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/recipes/:id/nutrition-analysis` | Analyse a recipe's nutrition with OpenAI gpt-5-mini |
| `POST` | `/api/meal-plans/:id/diet-suggestions` | Get weekly dietary recommendations |

Both endpoints require a valid session. The backend fetches the recipe/meal plan data from the database and sends it to OpenAI with `response_format: { type: "json_object" }` for structured output.

**Nutrition analysis response:**
```json
{
  "calories": 520,
  "protein": 28,
  "fat": 18,
  "carbohydrates": 62,
  "fibre": 4,
  "summary": "This recipe provides a solid balance...",
  "suggestions": [
    "Swap regular pasta for whole-wheat to increase fibre..."
  ]
}
```

**Diet suggestions response:**
```json
{
  "overallAssessment": "Your weekly plan is moderately balanced...",
  "recommendations": [
    "Add a green vegetable side on Wednesday."
  ],
  "nutritionHighlights": {
    "strength": ["Consistent protein intake"],
    "improvement": ["Low fibre mid-week"]
  }
}
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
DO_SPACES_BUCKET="plate-plan-files"
DO_SPACES_ENDPOINT="https://tor1.digitaloceanspaces.com"
DO_SPACES_KEY="your-access-key-id"
DO_SPACES_SECRET="your-secret-access-key"
DO_SPACES_REGION="tor1"
OPENAI_API_KEY="your-openai-api-key"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

A `.env.example` template is provided in the backend directory. Copy it and fill in real values.

### Frontend (`frontend/.env`)

```env
# Optional: backend origin (no trailing /api). Leave empty to use Vite /api proxy.
VITE_API_BASE_URL=

# Dev-only proxy target for /api requests
VITE_API_PROXY_TARGET=http://localhost:3000
```

> Variables prefixed with `VITE_` are exposed to the browser bundle.
> Never put secrets in environment variables that start with `VITE_`.

---

## Database Schema

The database uses PostgreSQL (hosted on DigitalOcean) with Prisma ORM. The schema is defined in `backend/prisma/schema.prisma`.

### Tables

| Table | Description |
|---|---|
| `user` | User accounts (managed by Better Auth) |
| `session` | Active sessions (managed by Better Auth) |
| `account` | Auth provider accounts (managed by Better Auth) |
| `verification` | Email verification tokens (managed by Better Auth) |
| `recipe` | User recipes with metadata |
| `ingredient` | Recipe ingredients (belongs to Recipe) |
| `tag` | Unique tag names |
| `recipe_tag` | Many-to-many join between Recipe and Tag |
| `folder` | User-created folders for organizing recipes |
| `meal_plan` | Weekly meal plan header (unique per user per week) |
| `meal_plan_entry` | Individual meal slots in a plan (day + meal type + recipe) |

### Key relationships

- All user-owned data (`recipe`, `folder`, `meal_plan`) cascades on user deletion
- Deleting a folder sets `recipe.folderId` to `null` (recipes are preserved)
- Deleting a recipe cascades to its ingredients, tags, and meal plan entries
- `meal_plan` has a unique constraint on `(userId, weekStartDate)` — one plan per user per week

### Enums

- `DayOfWeek`: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
- `MealType`: BREAKFAST, LUNCH, DINNER

---

## Frontend Integration Status

The frontend is integrated with the backend API and no longer uses `src/mockData.ts` (file removed).

Implemented integrations:
- Authentication: `src/context/AuthContext.tsx` uses Better Auth endpoints (`sign-up`, `sign-in`, `get-session`, `sign-out`)
- Core data: `src/App.tsx` loads and mutates recipes/folders through `src/lib/api.ts`
- Meal plans: `src/routes/MealPlan.tsx` + `src/components/MealPlannerGrid.tsx` load and persist weekly entries via `/api/meal-plans` endpoints
- AI features: `src/components/NutritionPanel.tsx` and `MealPlannerGrid.tsx` call backend AI routes
- Uploads: recipe image upload goes through `/api/upload/recipe-image`

If you want to audit remaining implementation notes, search the frontend for comments:

```bash
rg -n "TODO|FIXME|XXX" frontend/src
```

---

## Running Tests

```bash
cd frontend

# Run once
npm test

# Watch mode
npm run test:watch
```

Tests are in `tests/` and use [Vitest](https://vitest.dev/).
