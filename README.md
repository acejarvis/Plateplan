# Recipe & Meal Planning App — Project Proposal

## 1. Motivation

Deciding what to cook is a daily challenge for millions of people. Most individuals lack a system that ties together recipe organization, weekly meal planning, and dietary awareness — leading to repetitive meals, food waste, and poor nutritional choices. A deeper issue is that even when people cook at home, they have little visibility into the nutritional quality of what they prepare. Without recipe-level dietary feedback, it is hard to make intentional choices around caloric intake, macronutrient balance, or specific health goals.

Existing solutions fall short in different ways. Recipe platforms like Yummly offer discovery but no personal organization or planning. Meal kit services like HelloFresh require paid subscriptions with a fixed menu. Nutrition apps like MyFitnessPal demand tedious manual logging and are not recipe-centric. Critically, none provide intelligent, contextual dietary guidance — they may display raw numbers, but they do not interpret them or offer actionable suggestions tied to a specific recipe.

This project fills that gap with a full-stack Recipe & Meal Planning App that combines a personal recipe library, a weekly meal planner, cloud photo storage, and an AI-powered nutritional analysis feature. When a user requests an analysis, the backend sends the recipe's ingredient list to the **OpenAI API**, which estimates nutritional content and generates a concise dietary assessment — flagging concerns, suggesting substitutions, and noting alignment with common dietary goals. This provides genuinely useful advice without requiring nutrition expertise or manual logging.

**Target users** are home cooks of any experience level, including students managing meal prep on a budget, health-conscious individuals seeking dietary guidance, and families planning a week of balanced meals.

---

## 2. Objective and Key Features

### Project Objectives

Build a responsive full-stack web application where authenticated users can manage a personal recipe library, plan meals on a weekly calendar, receive AI-powered nutritional analysis, and upload recipe photos to cloud storage.

### Technical Implementation Approach

The application uses **Option B: Separate Frontend & Backend**. The frontend is a **React** SPA in **TypeScript**, styled with **Tailwind CSS** and **shadcn/ui**. The backend is an **Express.js** server in TypeScript exposing a documented **RESTful API**. This separation lets both team members work in parallel on their respective layers with a shared API contract as the integration boundary.

### Core Features

**Recipe Management** — Users create, edit, delete, and browse recipes with title, description, ingredients, instructions, cook time, serving size, tags (e.g., vegetarian, gluten-free), and a cover photo. Recipes are searchable by keyword or tag.

**Weekly Meal Planner** — A calendar interface lets users assign recipes to breakfast, lunch, or dinner slots across a 7-day week, with drag-and-drop reordering and the ability to clear or reassign slots.

**AI-Powered Nutritional Analysis and Diet Suggestions** — This feature operates at two levels. At the recipe level, users can click "Analyze Nutrition" on any recipe detail page; the backend sends the ingredient list to the **OpenAI API**, which estimates per-nutrient values (calories, protein, fat, carbohydrates) and returns a concise dietary assessment — flagging concerns and suggesting ingredient substitutions. At the meal plan level, users can click "AI Diet Suggestions" in the weekly calendar view; the backend sends the full set of planned meals for the week to OpenAI, which evaluates overall dietary balance across all days and returns actionable recommendations (e.g., adding more fibre, reducing sodium, diversifying protein sources). Both responses are displayed in clearly labelled panels alongside the relevant content.

**Recipe Photo Upload** — Cover photos are stored in **AWS S3** (or DigitalOcean Spaces) and linked to recipe records via a URL, satisfying the cloud storage requirement.

### Database Schema

**PostgreSQL** via Prisma ORM, with the following core tables:

- **User**: `id`, `email`, `name`, `passwordHash`, `createdAt`
- **Recipe**: `id`, `userId`, `title`, `description`, `instructions`, `prepTime`, `cookTime`, `servings`, `imageUrl`
- **Ingredient**: `id`, `recipeId`, `name`, `quantity`, `unit`
- **Tag** / **RecipeTag**: many-to-many tags per recipe
- **MealPlan**: `id`, `userId`, `weekStartDate`
- **MealPlanEntry**: `id`, `mealPlanId`, `recipeId`, `dayOfWeek`, `mealType`

### Planned Advanced Features

**Advanced Feature 1 — User Authentication and Authorization**
Registration and login via **Better Auth** with secure HTTP-only session cookies. All data is scoped to the authenticated user; protected API endpoints reject unauthenticated requests.

**Advanced Feature 2 — Cloud-Based AI Integration**
The **OpenAI API** is used to both estimate nutritional content from a recipe's ingredient list and generate actionable dietary recommendations. This fulfills the External API Integration requirement and the Cloud-Based AI sub-category, as OpenAI is a cloud-based AI data-processing API explicitly listed as an example in the guidelines.

### UI and Experience Design

**Home Page (Recipe Library)** — The default view is a card grid of all the user's recipes. Each card shows the recipe photo, title, tags, and cook time. Users can create a new recipe, or edit and delete existing ones directly from this view via card action buttons.

**Recipe Detail Page** — Clicking a recipe card opens a full detail view showing all recipe information: ingredients, instructions, prep/cook time, and serving size. A dedicated panel displays the AI-generated nutritional estimate and dietary assessment on demand, fetched when the user clicks an "Analyze Nutrition" button.

**Meal Planner (Calendar View)** — A button on the home page or navigation opens a weekly calendar view. Users can drag recipe cards from their library onto any day of the week to build a meal plan. Each day supports breakfast, lunch, and dinner slots. An "AI Diet Suggestions" button analyzes the full week's planned meals and returns recommendations for improving dietary balance across the week.

### Scope and Feasibility

For a 2-person team over ~5 weeks, this scope is realistic. One member owns the Express.js API and database layer; the other owns the React UI. Both advanced features use well-documented SDKs. The AI nutrition feature is a single isolated Express.js route that calls the OpenAI API, easy to build and test independently.

---

## 3. Tentative Plan (4 Weeks)

Team members:

- Ethan Yao — Frontend (React + TypeScript + Tailwind + shadcn/ui)
- Jarvis Wang — Backend/DB (Express.js + TypeScript + PostgreSQL + Prisma)

Coordination:

- Agree on an API contract early (endpoints + request/response shapes).
- Share TypeScript API types + example payloads to keep frontend/backend aligned.
- Work in parallel (frontend mocks while backend endpoints land).
- Integrate continuously (at least twice per week) to avoid late surprises.
- Track tasks in GitHub Issues and keep changes small via pull requests, with quick reviews before merging.

### Week 1 — Foundations + API contract

- Ethan (Frontend)
	- Scaffold React + TS + Tailwind + shadcn/ui + routing.
	- Build page skeletons (Library, Detail, Planner) and shared types.
	- Define reusable UI components (recipe card, form, planner slot).

- Jarvis (Backend/DB)
	- Scaffold Express + TS + Prisma + PostgreSQL.
	- Implement schema/migrations and initial recipe CRUD (user-scoped).
	- Draft REST endpoint list and example request/response bodies for early integration.

### Week 2 — Core CRUD + file upload path

- Ethan (Frontend)
	- Implement recipe create/edit, list search, and detail view.
	- Wire CRUD API calls + loading/error states + photo upload UI.
	- Add basic client-side validation for recipe form fields (required title, ingredient rows).

- Jarvis (Backend/DB)
	- Implement Better Auth (register/login/logout) with HTTP-only session cookies.
	- Add auth middleware + photo upload to Spaces; persist `imageUrl`.
	- Add request validation and consistent error response format for the main routes.

### Week 3 — Meal planner + AI endpoints

- Ethan (Frontend)
	- Build weekly planner grid (7 days × 3 meals) with drag-and-drop.
	- Connect planner to backend (load/save weekly entries).
	- Add clear/replace interactions for slots so the planner is easy to adjust.

- Jarvis (Backend/DB)
	- Implement MealPlan/MealPlanEntry endpoints (get/create week, upsert/clear).
	- Implement OpenAI routes for recipe nutrition + weekly suggestions (+ validation).
	- Ensure AI endpoints return structured, UI-friendly content (e.g., a short summary plus bullet suggestions).

### Week 4 — Integration, polish, and demo readiness

- Ethan (Frontend)
	- Integrate AI panels in Detail + Planner.
	- Polish responsiveness/validation; test end-to-end flows.

- Jarvis (Backend/DB)
	- Standardize error responses, validation, and API docs.
	- Verify DB constraints/cascades; add seed data for development.
	- Add basic safeguards on AI usage (timeouts, rate limiting, and prompt size constraints).

Definition of done by end of week 4: an authenticated user can (1) register/login, (2) create/edit/search recipes with a cover photo, (3) build a 7-day meal plan, and (4) request recipe-level nutrition analysis and week-level diet suggestions, with results displayed in the UI.

---

## 4. Initial Independent Reasoning (Before Using AI)

This section records our team’s initial thinking before consulting AI tools.

1) **Application structure and architecture**

We chose a separate frontend and backend to split responsibilities and enable parallel work. Ethan focuses on UI/UX and client logic, while Jarvis focuses on the database and API, with a REST contract as the integration boundary.

2) **Data and state design**

We expected most state to be server-owned because recipes/meal plans are user-scoped and must persist across sessions. We planned a shared cloud-hosted PostgreSQL database so both developers could test against the same schema early.

On the frontend, we expected to keep complex state minimal: most data would be fetched from the backend and cached for responsiveness, while local state would cover view-specific interactions (form drafts, selected week, drag-and-drop ordering).

3) **Feature selection and scope decisions**

We chose recipe library + weekly planner + photo upload as the core loop. Auth was necessary because the data is personal. LLM integration fit our “nutrition awareness with suggestions” goal and satisfies the external API requirement. We avoided unrelated features to keep scope realistic.

We also made an early scope decision to focus the AI feature on actionable, user-facing summaries rather than “perfect nutrition accuracy,” since ingredient quantities and brand-specific nutrition data can be ambiguous.

4) **Anticipated challenges**

Before implementation, we expected the most difficult parts would be:

- Designing structured LLM outputs suitable for UI display.
- Frontend–backend integration (types, cookie auth, evolving endpoints).

We also expected cloud photo upload to require careful handling of file size limits, CORS, and secure association between uploaded images and recipe records.

5) **Early collaboration plan**

We divided ownership by layer (frontend vs. backend/DB) and coordinated around an API contract and shared data models, with frequent integration checkpoints. Ethan owns UI behavior and client-side state; Jarvis owns data modeling, authentication, and API behavior.

Practically, we planned to coordinate via GitHub Issues and short PRs, and to resolve integration questions early by agreeing on types and sample payloads before both sides implement in detail.

---

## 5. AI Assistance Disclosure

1) **Which parts were developed without AI assistance?**
  
    We developed the project idea, motivation, core feature set, database schema concept (entities + relationships), and collaboration split without AI assistance.

2) **If AI was used, what specific tasks or drafts did it help with?**

    We used AI tools to interpret course requirements and sanity-check stack choices (e.g., Option B feasibility, Prisma, Better Auth). We also used AI for wording/structure edits.

    AI was also helpful for quickly enumerating what must be explicitly mentioned so we could cross-check this document against the rubric.

3) **One idea where AI input influenced the proposal (and how we evaluated it)**

    AI suggested using Better Auth (HTTP-only session cookies) to match the course’s recommended tooling and reduce risk vs. custom auth.

    We considered the faster implementation and standard session-cookie patterns against integration details (CORS/cookies) and the need to strictly scope all data to the authenticated user. We adopted Better Auth for lower security and schedule risk.

    Even after adopting the suggestion, we planned to validate the approach by ensuring protected routes truly reject unauthenticated requests, and by verifying that recipe/meal plan queries are always scoped by the current session user.