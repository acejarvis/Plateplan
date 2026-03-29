# PlatePlan: Final Project Report

## Team Information

| Name                | Student Number | Email                          |
|---------------------|----------------|--------------------------------|
| Jarvis Wang         | [1004071602]   | [jarvis.wang@mail.utoronto.ca] |
| Yicheng (Ethan) Yao | [1004001778]   | [yicheng.yao@mail.utoronto.ca] |

---

## 1. Motivation

### 1.1 Problem Statement
Planning meals at home is usually fragmented across multiple apps and manual steps. A user might discover recipes on one platform, track nutrition on another, keep meal plans in a calendar, and store food photos somewhere else. This disconnect causes repeated problems:

- People spend too much time deciding what to cook.
- Weekly planning is inconsistent, leading to repetitive meals and wasted ingredients.
- Users cannot easily estimate nutrition quality of meals they actually plan to eat.
- Existing nutrition tools often require tedious manual logging and do not provide recipe-specific, contextual suggestions.

Our team identified this as a practical daily pain point for students, families, and health-conscious home cooks. We therefore designed PlatePlan as an integrated, full-stack web app that unifies recipe management, meal planning, cloud image handling, and AI-assisted nutrition insight.

### 1.2 Significance
The significance of this project is not only convenience, but decision quality:

- Users can organize recipes and meal plans in one workflow instead of switching tools.
- A weekly view improves planning discipline and makes grocery/meal-prep habits more realistic.
- AI-powered nutritional analysis turns raw ingredient data into actionable dietary guidance.
- Structured user-scoped data ensures each person has a private, persistent meal planning system.

From a course perspective, this project demonstrates complete end-to-end integration of frontend, backend, relational data modeling, authentication, cloud file storage, and external AI API usage.

### 1.3 Target Audience
PlatePlan is designed for:

1. Students managing meal prep on a budget.
2. Busy professionals who want quick weekly planning.
3. Health-conscious users seeking better macro and dietary awareness.
4. Families planning balanced meals across the week.

---

## 2. Objectives

### 2.1 Primary Objectives
The project aimed to build a production-style full-stack web application where authenticated users can:

- Create, edit, browse, search, and delete recipes.
- Organize recipes into folders and tag categories.
- Upload recipe photos to cloud object storage.
- Build and adjust weekly meal plans through drag-and-drop interactions.
- Request AI-generated nutrition analysis at recipe level and recommendation analysis at weekly meal plan level.

### 2.2 Core Technical Objectives
Aligned with course requirements, we targeted:

- TypeScript across both frontend and backend.
- React frontend with Tailwind-based styling.
- Express REST backend with clear API boundaries.
- PostgreSQL persistence with Prisma ORM.
- Cloud file handling (upload and URL association).
- Responsive UI behavior across desktop and mobile widths.

### 2.3 Advanced Features Implemented
We implemented at least two advanced features from the approved list:

1. User Authentication and Authorization
   - Better Auth with session cookies.
   - Protected API routes and user-scoped data access.

2. Integration with External APIs/Services
   - OpenAI API integration for nutrition analysis and weekly diet suggestions.

Note: Cloud file upload is implemented as a core requirement (DigitalOcean Spaces via S3-compatible API), not counted as an advanced feature.

---

## 3. Technical Stack

### 3.1 Architecture Overview
We implemented Option B: Separate Frontend and Backend.

```text
┌──────────────────────────┐
│ React + Vite Frontend    │
│ TypeScript, Tailwind CSS │
│ localhost:5173           │
└──────────────┬───────────┘
               │ /api proxy (dev)
               │
┌──────────────▼───────────┐
│ Express.js Backend       │
│ TypeScript + REST API    │
│ localhost:3000           │
└───────┬───────────┬──────┘
        │           │
        │           └───────────────┐
        │                           │
┌───────▼──────────┐       ┌────────▼───────────────┐
│ PostgreSQL       │       │ External Services      │
│ Prisma ORM       │       │ OpenAI + DO Spaces S3 │
└──────────────────┘       └────────────────────────┘
```

This separation enabled parallel frontend/backend development with a stable integration boundary defined by REST contracts.

### 3.2 Frontend
- React 19 + TypeScript
- Vite 7 build tool
- React Router 7
- Tailwind CSS v4
- Radix UI primitives for modal/menu UX
- dnd-kit for drag-and-drop meal planning

Frontend responsibilities include routing, auth session UX, recipe/folder state orchestration, meal planner interactions, and rendering AI result panels.

How the frontend is organized and why:

- Routing model:
   - The app uses route-based views for Home (library), Recipe Detail, Edit/New Recipe, Meal Plan, Login, and Register.
   - Authenticated pages are rendered only when the session context has a valid user.
- Session lifecycle:
   - On application bootstrap, the auth context requests the current session from the backend.
   - If a session exists, the user is restored and protected routes are enabled.
   - If not, the app redirects to auth routes.
- API integration layer:
   - The frontend uses a centralized API module that wraps fetch, attaches credentials, parses JSON/text payloads, and normalizes errors.
   - This design avoids duplicated request logic and keeps route/components focused on UI behavior.
- State strategy:
   - App-level state stores recipes and folders to keep data consistent across screens.
   - Route/component state handles view-specific behavior: form editing, drag state, loading state, and AI panel expansion.
- Planner UI behavior:
   - dnd-kit drives drag-and-drop interactions.
   - Dragging either creates new meal entries or updates existing entry positions through backend APIs.

### 3.3 Backend
- Express 5 + TypeScript
- Prisma 6 ORM
- PostgreSQL datasource
- Better Auth for session-based authentication
- Zod for request validation
- multer for multipart image processing
- OpenAI Node SDK
- AWS S3 client for DigitalOcean Spaces

Backend responsibilities include auth verification, resource authorization, CRUD operations, weekly meal plan upsert logic, file upload, and AI response generation.

How backend layers work together:

- Request pipeline:
   - CORS is configured to trust the frontend origin and permit credentialed requests.
   - JSON body parsing handles REST payloads.
   - Routes are mounted by domain (auth, recipes, folders, meal plans, upload, AI).
   - A global error handler standardizes validation, upload, and upstream API failures.
- Authentication/authorization flow:
   - Better Auth handles session cookie creation and verification endpoints.
   - authGuard resolves session user from request headers/cookies.
   - Protected routes enforce user-scoped access by filtering with req.user.id.
- Validation and data integrity:
   - Zod schemas validate incoming route payloads.
   - Prisma transactional updates are used for complex recipe updates (ingredients/tags replacement).
   - DB constraints and foreign keys enforce referential integrity.
- Domain route design:
   - Recipe endpoints provide CRUD + search filtering.
   - Meal plan endpoints provide week upsert + entry-level mutation.
   - Upload endpoint bridges browser files to object storage.
   - AI endpoints convert stored recipe/plan data into structured nutrition outputs.

### 3.4 Database
Schema implemented in Prisma includes auth tables and application tables.

Core application entities:

- Recipe, Ingredient
- Tag, RecipeTag (many-to-many)
- Folder
- MealPlan, MealPlanEntry

Important constraints:

- meal_plan has unique (userId, weekStartDate), ensuring exactly one weekly plan per user.
- Cascading and set-null relationships preserve data integrity.
- Enum constraints enforce valid values for dayOfWeek and mealType.

How database design supports product behavior:

- User data isolation:
   - recipe, folder, and meal_plan all reference userId.
   - Backend queries include userId predicates to guarantee account-level data separation.
- Recipe composition model:
   - Ingredients are normalized into a child table to support variable ingredient counts.
   - Tags are normalized and linked through recipe_tag, enabling multi-tag querying and reuse.
- Week planner model:
   - meal_plan is the weekly container.
   - meal_plan_entry models each assignment (dayOfWeek, mealType, recipeId).
   - Unique userId + weekStartDate ensures one canonical plan per week.
- Lifecycle policies:
   - Deleting a recipe cascades dependent records (ingredients/tag links/plan entries).
   - Deleting a folder keeps recipes and sets folderId to null.

### 3.5 Cloud Image Storage Architecture

PlatePlan uses DigitalOcean Spaces (S3-compatible object storage) for recipe cover images.

Detailed upload flow:

1. User selects an image in the recipe form.
2. Frontend sends multipart/form-data with image field.
3. Backend validates file type and max size (5MB).
4. Backend generates a UUID filename under recipe-images/ path.
5. Backend uploads file bytes through S3 PutObjectCommand.
6. Backend returns a public URL string.
7. Frontend includes the URL in recipe create/update payload.
8. Stored imageUrl is reused by card, detail, and planner UI components.

Why object storage is important:

- It decouples media storage from application server disk.
- It scales independently and avoids large binary data in PostgreSQL.
- It simplifies media rendering by storing a stable URL in relational records.

### 3.6 Frontend-Backend Integration Contract

The frontend and backend communicate through a stable REST contract under /api.

Integration details:

- In development, Vite proxies /api to backend so cookie auth works reliably without manual CORS complexity.
- The frontend API wrapper always sends credentials and consistently parses success/error payloads.
- Auth flow sequence:
   1. Login/register endpoint call.
   2. Session cookie set by backend.
   3. get-session call returns user object.
   4. UI updates to authenticated route tree.
- Data flow sequence (example recipe create):
   1. Form validates locally.
   2. Optional image upload returns imageUrl.
   3. Recipe payload posts to backend.
   4. Backend validates + persists relational data.
   5. Canonical response updates frontend state.
- Data flow sequence (meal planner drag):
   1. Drag source and target slot detected in UI.
   2. Backend create/update endpoint called.
   3. Response entry object updates local slot map.

### 3.7 API Design
The backend exposes typed JSON REST endpoints under /api, including:

- Auth routes (Better Auth handler)
- Recipes: list/get/create/update/delete
- Folders: list/create/update/delete
- Meal plans: get/upsert + entry create/update/delete
- Upload: recipe image upload
- AI: recipe nutrition analysis + weekly suggestions

---

## 4. Features

### 4.1 Core Technical Requirements (Guideline Mapping)

This section maps each core requirement from guidelines.md to concrete implementation evidence.

1. Frontend must use TypeScript
   - Implemented: All frontend app code is TypeScript/TSX.
   - Evidence: typed interfaces for recipes, meal plans, auth payloads, and API responses.

2. Frontend must use React or Next.js
   - Implemented: React SPA with React Router.

3. Frontend styling must use Tailwind CSS
   - Implemented: Tailwind CSS v4 integrated in global styles and component class composition.

4. Use shadcn/ui or similar component library
   - Implemented: Radix UI primitives (dialog, dropdown, etc.) with utility-driven styling.

5. Responsive design implementation
   - Implemented: responsive grids, mobile drawer sidebar, fluid layout behavior on planner/library/detail pages.

6. Backend/server must use TypeScript
   - Implemented: Express server, middleware, routes, and service libs in TypeScript.

7. Relational data storage must use PostgreSQL or SQLite
   - Implemented: PostgreSQL with Prisma ORM schema and relational constraints.

8. Cloud storage for basic file handling
   - Implemented: DigitalOcean Spaces image upload + URL persistence in recipe records.

9. Architecture Option B requirements
   - Implemented: React frontend + Express REST backend + documented endpoints and integration contract.

### 4.2 Advanced Features (Guideline Mapping)

Advanced Feature 1: User Authentication and Authorization

- Better Auth registration/login/session/logout endpoints.
- Cookie-based session authentication.
- Protected APIs via authGuard middleware.
- User-scoped data access in all core routes.

Advanced Feature 2: Integration with External APIs or Services

- OpenAI API integration for recipe nutrition analysis.
- OpenAI API integration for weekly meal plan diet recommendations.
- Structured JSON AI outputs consumed directly by frontend panels.

### 4.3 Authentication and Session Management
- Users can register and login with email/password.
- Session cookie is maintained by Better Auth.
- Auth context on frontend rehydrates session at app startup.
- Protected backend routes reject missing/invalid sessions with 401.

### 4.4 Recipe Library and Organization
- Full recipe CRUD with fields: title, description, instructions, prep/cook time, servings.
- Ingredient rows support quantity and units.
- Tags are created/upserted and attached to recipes.
- Recipes can be assigned to folders.
- Home view supports search and multi-tag filtering.

### 4.5 Weekly Meal Planner
- Weekly grid with 7 days x 3 meal slots.
- Recipes can be dragged from recipe panel into meal slots.
- Existing entries can be moved between slots.
- Entries can be removed from cells.
- Week switching loads/creates meal plan via backend upsert.

### 4.6 Cloud Recipe Photo Upload
- Images uploaded as multipart/form-data.
- Backend validates type and size (max 5MB).
- Images stored to DigitalOcean Spaces and returned as public URL.
- URL is persisted in recipe.imageUrl and rendered in cards/details.

### 4.7 AI Nutrition Features
Two AI workflows are implemented:

1. Recipe-level nutrition analysis:
   - User clicks Analyze Nutrition on recipe detail.
   - Backend sends ingredient list and serving context to OpenAI.
   - Returns structured JSON: calories, macros, fibre, summary, suggestions.

2. Weekly meal-plan diet suggestions:
   - User clicks AI suggestions on planner page.
   - Backend aggregates all planned meals with ingredients.
   - Returns overall assessment, strengths, improvements, recommendations.

---

## 5. User Guide

### 5.1 Getting Started
1. Open the app at the frontend URL.
2. Register a new account or login with an existing account.
3. On success, you are redirected to the recipe library.

Test account:

| Role | Email            | Password    |
|------|------------------|-------------|
| User | test@example.com | password123 |

### 5.2 Create and Manage Recipes
1. Click New Recipe.
2. Fill recipe fields and add ingredient rows.
3. Optionally upload cover image.
4. Add tags and assign a folder.
5. Save and return to library.
6. Use search/folder/tag filters in sidebar.

### 5.3 Use Weekly Meal Planner
1. Open Weekly Meal Plan from sidebar.
2. Navigate to target week with left/right controls.
3. Drag recipes into slots (day + meal type).
4. Move entries by dragging existing planner cards.
5. Remove entries via remove icon.

### 5.4 Use AI Panels
1. Recipe detail page:
   - Click Analyze Nutrition.
   - Review macro cards, summary, and substitutions.
2. Meal planner page:
   - Click Get Diet Suggestions.
   - Review strengths, improvements, and weekly recommendations.

---

## 6. Development Guide

### 6.1 Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL database
- OpenAI API key
- DigitalOcean Spaces (or S3-compatible bucket)

### 6.2 Run Services
Option A (recommended):

```bash
./start-dev.sh
```

Option B (manual):

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Expected endpoints:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: GET http://localhost:3000/api/health

### 6.3 Build

```bash
# backend build
cd backend && npm run build

# frontend build
cd frontend && npm run build
```

---

## 7. Individual Contributions

### Jarvis Wang
- Implemented backend architecture and routing.
- Designed Prisma schema and relational constraints.
- Integrated Better Auth with session middleware and protected APIs.
- Implemented meal-plan and AI endpoints.
- Implemented cloud image upload pipeline.
- Authored seed script and backend environment templates.

### Yicheng (Ethan) Yao
- Implemented frontend app shell, routes, and state orchestration.
- Built recipe list/card/detail/edit UI workflows.
- Built sidebar filters, folder and tag interactions.
- Built drag-and-drop meal planner UI with weekly navigation.
- Integrated frontend API client and auth context session handling.
- Integrated AI display panels for recipe and weekly analysis.

---

## 8. Lessons Learned and Concluding Remarks

### 8.1 Lessons Learned
1. Full-stack reliability requires strict API contracts.
   - Shared types and normalized payload parsing reduced integration bugs.
2. Session-auth UX depends on infrastructure details.
   - Cookie auth required correct proxy, origin, and credentials handling.
3. AI features need constrained output shapes.
   - JSON-only response requirements made frontend rendering stable.
4. Database constraints simplify application logic.
   - unique(userId, weekStartDate) guarantees deterministic week planning behavior.
5. Reproducibility is an engineering feature.
   - startup scripts, env templates, and seed data significantly improved onboarding.

### 8.2 Conclusion
PlatePlan achieved the planned goal of delivering a coherent meal-planning platform with recipe management, cloud image support, and practical AI nutrition guidance. The project satisfies core technical requirements and implements two meaningful advanced features (auth/authorization and external API integration). Most importantly, the final codebase and documentation support full local reproducibility for grading and future extension.

---

## 9. Demo

### 9.1 Video Demo
URL: [insert 1-5 min video link]

---

## 10. Documentation and Resources

- Getting Started: ../GETTING_STARTED.md
- Project Proposal: ./proposal.md
- Backend Technical Notes: ./backend.md

---
