# Backend Implementation Summary

This document summarizes the backend work completed for PlatePlan, including the architecture, technology choices, database design, and all implemented API endpoints.

---

## What Was Built

A complete Express.js backend in TypeScript that serves as the API layer for the PlatePlan recipe and meal planning application. The backend connects to a DigitalOcean-hosted PostgreSQL database, uses Better Auth for session-based authentication, DigitalOcean Spaces for image storage, and OpenAI `gpt-5-mini` for AI-powered nutrition analysis.

---

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | >= 18 |
| Framework | Express.js | 5.x |
| Language | TypeScript | 5.9 |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | DigitalOcean managed |
| Auth | Better Auth | 1.x |
| Cloud Storage | DigitalOcean Spaces | via AWS SDK v3 |
| AI | OpenAI | gpt-5-mini |
| Validation | Zod | 4.x |
| File Upload | Multer | 2.x |

---

## Architecture

The backend follows a layered architecture:

```
src/
├── index.ts          ← Entry point (dotenv, listen)
├── app.ts            ← Express app (CORS, JSON, route mounting, error handler)
├── lib/              ← Shared service singletons
│   ├── auth.ts       ← Better Auth instance (Prisma adapter)
│   ├── prisma.ts     ← PrismaClient
│   ├── s3.ts         ← S3Client for DO Spaces
│   └── openai.ts     ← OpenAI client
├── middleware/
│   ├── authGuard.ts  ← Extracts user from session cookie or returns 401
│   └── errorHandler.ts ← Catches Zod, Prisma, multer, and generic errors
└── routes/
    ├── auth.ts       ← Better Auth catch-all (/api/auth/*)
    ├── recipes.ts    ← Recipe CRUD with nested ingredients + tags
    ├── folders.ts    ← Folder CRUD
    ├── mealPlans.ts  ← Meal plan upsert + entry management
    ├── upload.ts     ← Image upload to DO Spaces
    └── ai.ts         ← Nutrition analysis + diet suggestions
```

### Key design decisions

- **Better Auth** handles all authentication logic (registration, login, logout, session management) via HTTP-only cookies. The backend mounts Better Auth's handler as a catch-all on `/api/auth/*`.
- **Auth middleware** (`authGuard`) calls `auth.api.getSession()` with the request headers, extracts the user, and attaches it to `req.user`. All application routes use this middleware.
- **CORS** is configured with `credentials: true` and `origin = FRONTEND_URL` (default `http://localhost:5173`) to allow cookie-based auth from the frontend.
- **Zod** validates all incoming request bodies before they reach the database layer.
- **Recipe tags** use a many-to-many join table (`recipe_tag`). Tags are upserted by name — if a tag already exists, it is reused rather than duplicated.
- **Recipe updates** use a transaction to delete old ingredients/tags and recreate them, keeping the logic simple and avoiding partial update complexity.
- **Meal plan GET** uses upsert logic — if no plan exists for the requested week, one is auto-created, so the frontend never gets a 404.
- **Image uploads** go through multer (memory storage, 5MB limit, image-only filter) to DigitalOcean Spaces, returning a public URL.
- **AI routes** send recipe ingredient lists (or full weekly meal plans) to `gpt-5-mini` with `response_format: { type: "json_object" }`, `reasoning_effort: "minimal"`, and `max_completion_tokens`, then return structured nutritional data.
- **Error handling** surfaces upstream API errors (including OpenAI errors) with their HTTP status/message instead of always returning a generic 500.

---

## Database Schema

**12 models** defined in `backend/prisma/schema.prisma`, pushed to DigitalOcean PostgreSQL.

### Better Auth tables (managed by Better Auth)

| Model | Table Name | Purpose |
|---|---|---|
| User | `user` | User accounts |
| Session | `session` | Active login sessions |
| Account | `account` | Auth provider records (stores hashed passwords) |
| Verification | `verification` | Email verification tokens |

### Application tables

| Model | Table Name | Purpose |
|---|---|---|
| Recipe | `recipe` | User recipes (title, description, instructions, times, servings, imageUrl) |
| Ingredient | `ingredient` | Recipe ingredients (name, quantity, unit) — belongs to Recipe |
| Tag | `tag` | Unique tag names (e.g., "Italian", "Vegetarian") |
| RecipeTag | `recipe_tag` | Many-to-many join between Recipe and Tag |
| Folder | `folder` | User-created folders with name and color |
| MealPlan | `meal_plan` | Weekly meal plan header — unique per (userId, weekStartDate) |
| MealPlanEntry | `meal_plan_entry` | Individual slots: dayOfWeek + mealType + recipeId |

### Key constraints

- `User.email` is unique
- `Tag.name` is unique
- `RecipeTag` has a composite primary key `(recipeId, tagId)`
- `MealPlan` has a unique constraint on `(userId, weekStartDate)`
- Deleting a Folder sets `Recipe.folderId` to null (OnDelete: SetNull)
- Deleting a Recipe cascades to Ingredient, RecipeTag, and MealPlanEntry

---

## API Endpoints

All routes are prefixed with `/api`. Authenticated routes require a valid Better Auth session cookie.

### Authentication (Better Auth)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sign-up/email` | No | Register a new user |
| POST | `/api/auth/sign-in/email` | No | Log in and receive session cookie |
| POST | `/api/auth/sign-out` | Yes | Destroy the session |
| GET | `/api/auth/get-session` | Yes | Return current user + session |

### Recipes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/recipes` | Yes | List user's recipes (supports `?folderId=` and `?search=` query params) |
| GET | `/api/recipes/:id` | Yes | Get single recipe with ingredients + tags |
| POST | `/api/recipes` | Yes | Create recipe with nested ingredients + tags |
| PUT | `/api/recipes/:id` | Yes | Update recipe (full replace of ingredients + tags) |
| DELETE | `/api/recipes/:id` | Yes | Delete recipe (cascades to ingredients, tags, meal plan entries) |

### Folders

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/folders` | Yes | List user's folders |
| POST | `/api/folders` | Yes | Create folder (name + color) |
| PUT | `/api/folders/:id` | Yes | Update folder name/color |
| DELETE | `/api/folders/:id` | Yes | Delete folder (recipes become unfoldered) |

### File Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/recipe-image` | Yes | Upload image (multipart/form-data, field: "image", max 5MB) |

Returns: `{ "url": "https://plate-plan-files.tor1.digitaloceanspaces.com/recipe-images/uuid.ext" }`

### Meal Plans

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/meal-plans?week=YYYY-MM-DD` | Yes | Get/create meal plan for a week (upsert) |
| POST | `/api/meal-plans/:id/entries` | Yes | Add entry (recipeId, dayOfWeek, mealType) |
| PATCH | `/api/meal-plans/:id/entries/:entryId` | Yes | Move entry to different day/meal |
| DELETE | `/api/meal-plans/:id/entries/:entryId` | Yes | Remove entry |

### AI Features

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/recipes/:id/nutrition-analysis` | Yes | Estimate nutrition per serving via gpt-5-mini |
| POST | `/api/meal-plans/:id/diet-suggestions` | Yes | Get weekly dietary recommendations via gpt-5-mini |

### Utility

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check — returns `{ "status": "ok" }` |

---

## Seed Data

The seed script (`prisma/seed.ts`) populates the database with sample development data:

| Data | Count | Details |
|---|---|---|
| Users | 1 | test@example.com / password123 |
| Folders | 6 | Breakfast, Lunch, Dinner, Dessert, Quick Meals, Meal Prep |
| Tags | 10 | Italian, Pasta, Vegetarian, Breakfast, Asian, Quick, Dessert, Baking, Salad, Meal Prep |
| Recipes | 6 | Spaghetti Carbonara, Avocado Toast, Chicken Stir Fry, Chocolate Lava Cake, Greek Salad, Overnight Oats |
| Meal Plan | 1 | Week of 2026-03-02 with 6 entries |

Each recipe includes its full ingredient list and tag associations. The meal plan maps recipes to specific day/meal slots used by development and API verification flows.

---

## Files Created

```
backend/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── lib/auth.ts
│   ├── lib/prisma.ts
│   ├── lib/s3.ts
│   ├── lib/openai.ts
│   ├── middleware/authGuard.ts
│   ├── middleware/errorHandler.ts
│   ├── routes/auth.ts
│   ├── routes/recipes.ts
│   ├── routes/folders.ts
│   ├── routes/mealPlans.ts
│   ├── routes/upload.ts
│   └── routes/ai.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Verification Results

The following were verified after implementation:

1. Server starts on port 3000 and responds to `/api/health`
2. User registration via `POST /api/auth/sign-up/email` creates a user and returns a session cookie
3. `POST /api/auth/sign-in/email` authenticates and returns user data + cookie
4. `GET /api/auth/get-session` returns the current user from the session cookie
5. `GET /api/folders` returns all 6 seeded folders
6. `GET /api/recipes` returns all 6 seeded recipes with nested ingredients and flattened tags
7. `GET /api/meal-plans?week=2026-03-02` returns the meal plan with 6 entries, each with a fully populated recipe
8. Unauthenticated requests to protected endpoints return `401 Unauthorized`
9. Seed script runs successfully, populating all tables with sample data
10. `POST /api/recipes/:id/nutrition-analysis` returns structured JSON after updating OpenAI parameters for `gpt-5-mini` (`reasoning_effort` + `max_completion_tokens`)
