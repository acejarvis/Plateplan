# PlatePlan — Getting Started

This document explains how to run the frontend, what backend API endpoints it expects, and everything needed for frontend–backend integration.

---

## Table of Contents

- [PlatePlan — Getting Started](#plateplan--getting-started)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Prerequisites](#prerequisites)
  - [Running the Frontend](#running-the-frontend)
  - [Authentication (Frontend)](#authentication-frontend)
    - [How the mock works](#how-the-mock-works)
    - [Test account](#test-account)
    - [Connecting to the real Better Auth backend](#connecting-to-the-real-better-auth-backend)
  - [Folder Structure](#folder-structure)
  - [Backend API Reference](#backend-api-reference)
    - [Authentication](#authentication)
    - [Recipes](#recipes)
    - [Recipe Photo Upload](#recipe-photo-upload)
    - [Folders](#folders)
    - [Meal Plans](#meal-plans)
    - [AI Features](#ai-features)
  - [Environment Variables](#environment-variables)
  - [Mock Data \& TODOs](#mock-data--todos)
  - [Running Tests](#running-tests)

---

## Project Overview

PlatePlan is a full-stack Recipe & Meal Planning web application.

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix UI), React Router v6 |
| Backend (separate repo) | Express.js, TypeScript, Prisma, PostgreSQL |
| Auth | Better Auth (HTTP-only session cookies) |
| Cloud Storage | AWS S3 / DigitalOcean Spaces |
| AI | OpenAI API (GPT-4o) |

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

No database or backend is required to run the frontend in mock-data mode.

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

The frontend includes full login and registration UI backed by a **mock auth layer** that simulates the eventual Better Auth backend. No backend is required to sign in.

### How the mock works

| Step | Behaviour |
|---|---|
| Register (`/register`) | Creates a new in-memory user and persists the session to `localStorage` under the key `plateplan_session`. Any email + name + password ≥ 8 characters is accepted. |
| Login (`/login`) | Validates the same rules and writes the session to `localStorage`. **No password is actually checked against a stored hash** — the mock accepts any credentials that pass format validation. |
| Session rehydration | On page load, `AuthContext` reads `plateplan_session` from `localStorage` and restores the user without a round-trip. |
| Logout | Removes `plateplan_session` from `localStorage` and redirects to `/login`. |

### Test account

There is no pre-seeded test account. **Register a new account on your first visit** — use any values you like:

| Field | Example value |
|---|---|
| Full name | `Test User` |
| Email | `test@example.com` |
| Password | `password123` |

Because credentials are not persisted to a database, **clearing `localStorage` (or using a private window) will log you out and you will need to register again**.

### Connecting to the real Better Auth backend

All mock logic is isolated in `src/context/AuthContext.tsx`. Each function (`login`, `register`, `logout`) has a `// TODO:` comment showing the exact Better Auth client call to substitute:

```ts
// TODO: Replace body with a Better Auth client call:
import { authClient } from "@/lib/authClient";
await authClient.signIn.email({ email, password });
```

Once the backend is live:
1. Install `better-auth` — `npm install better-auth`
2. Create `src/lib/authClient.ts` and initialise the Better Auth client pointing at `VITE_API_BASE_URL`.
3. Replace the three mock bodies in `AuthContext.tsx` with the real calls.
4. Remove the `localStorage` session persistence — Better Auth manages the HTTP-only cookie automatically.

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
│   │   └── AuthContext.tsx       # Auth state, login/register/logout (mock → Better Auth)
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
│   │   └── utils.ts              # cn() helper (Tailwind merge)
│   ├── App.tsx             # Root component: routing + global state
│   ├── mockData.ts         # Hardcoded data (replace with API calls)
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
```

---

## Backend API Reference

All endpoints are prefixed with `/api`. The frontend expects the backend to run on **http://localhost:3000** (configure `VITE_API_BASE_URL` to change this — see [Environment Variables](#environment-variables)).

Authentication uses **HTTP-only session cookies** managed by Better Auth. All endpoints below require a valid session unless stated otherwise.

---

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive a session cookie |
| `POST` | `/api/auth/logout` | Destroy the session cookie |
| `GET` | `/api/auth/session` | Return the current authenticated user |

**Register / Login request body:**
```json
{
  "email": "user@example.com",
  "password": "secret",
  "name": "Alice"        // register only
}
```

**Session response:**
```json
{
  "id": "u1",
  "email": "user@example.com",
  "name": "Alice",
  "createdAt": "2026-01-01T00:00:00Z"
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
  "id": "r1",
  "userId": "u1",
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta…",
  "instructions": "1. Cook pasta…",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 4,
  "imageUrl": "https://bucket.example.com/images/r1.jpg",
  "folderId": "f3",
  "ingredients": [
    { "id": "i1", "name": "Spaghetti", "quantity": "400", "unit": "g" }
  ],
  "tags": [
    { "id": "t1", "name": "Italian" }
  ],
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**Create / Update request body:**
```json
{
  "title": "Spaghetti Carbonara",
  "description": "…",
  "instructions": "…",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 4,
  "folderId": "f3",
  "imageUrl": "https://…",
  "ingredients": [
    { "name": "Spaghetti", "quantity": "400", "unit": "g" }
  ],
  "tags": ["Italian", "Pasta"]
}
```

---

### Recipe Photo Upload

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/recipe-image` | Upload a recipe cover photo to cloud storage |

**Request:** `multipart/form-data`, field name `image`.

**Response:**
```json
{ "url": "https://bucket.example.com/images/abc123.jpg" }
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
  "id": "f1",
  "userId": "u1",
  "name": "Breakfast",
  "color": "#FF6B6B",
  "createdAt": "2026-01-01T00:00:00Z"
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

**MealPlan response:**
```json
{
  "id": "mp1",
  "userId": "u1",
  "weekStartDate": "2026-03-02",
  "entries": [
    {
      "id": "me1",
      "mealPlanId": "mp1",
      "recipeId": "r2",
      "recipe": { /* Recipe object */ },
      "dayOfWeek": "MONDAY",
      "mealType": "BREAKFAST"
    }
  ]
}
```

**Create entry request body:**
```json
{
  "recipeId": "r1",
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
| `POST` | `/api/recipes/:id/nutrition-analysis` | Analyse a recipe's nutrition with OpenAI |
| `POST` | `/api/meal-plans/:id/diet-suggestions` | Get weekly dietary recommendations |

**Nutrition analysis response:**
```json
{
  "calories": 520,
  "protein": 28,
  "fat": 18,
  "carbohydrates": 62,
  "fibre": 4,
  "summary": "This recipe provides a solid balance…",
  "suggestions": [
    "Swap regular pasta for whole-wheat to increase fibre…"
  ]
}
```

**Diet suggestions response:**
```json
{
  "overallAssessment": "Your weekly plan is moderately balanced…",
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

Create a `.env` file in the `frontend/` directory:

```env
# Base URL of the Express.js backend (no trailing slash)
VITE_API_BASE_URL=http://localhost:3000

# Optional: Override the OpenAI model used (set on the backend, not here)
```

> Variables prefixed with `VITE_` are exposed to the browser bundle.
> Never put secrets in environment variables that start with `VITE_`.

---

## Mock Data & TODOs

The frontend currently uses **hardcoded mock data** defined in `src/mockData.ts`. Anywhere a real API call is needed, you will find a `// TODO:` comment with the exact endpoint, method, and request/response shape.

To find all pending integration points:

```bash
grep -rn "TODO" src/ --include="*.tsx" --include="*.ts"
```

Key files to update when connecting the backend:

| File | What to replace |
|---|---|
| `src/context/AuthContext.tsx` | `login`, `register`, `logout` — replace mock bodies with Better Auth client calls; remove `localStorage` session |
| `src/App.tsx` | `handleSaveRecipe`, `handleDeleteRecipe`, `handleCreateFolder` — add `fetch()` calls |
| `src/routes/MealPlan.tsx` | Week navigation — fetch meal plan entries per week |
| `src/components/NutritionPanel.tsx` | Replace simulated delay with `POST /api/recipes/:id/nutrition-analysis` |
| `src/components/MealPlannerGrid.tsx` | DnD drag end, remove entry — call PATCH / DELETE endpoints |
| `src/mockData.ts` | Remove entirely once API calls are in place |

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
