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

- **Frontend**: Ethan Yao (React + TypeScript + Tailwind + shadcn/ui)
- **Backend/DB**: Jarvis Wang (Express.js + TypeScript + PostgreSQL + Prisma)

Coordination approach:

- Define an API contract early (endpoint list + request/response shapes) and keep it stable.
- Develop in parallel using mocked responses on the frontend until backend endpoints are ready.
- Integrate continuously (at least 2 integration sessions per week) to avoid a “big-bang” merge near the end.

### Week 1 — Foundations + API contract

- Ethan (Frontend)
	- Set up React + TypeScript project with Tailwind + shadcn/ui base layout and routing.
	- Build static UI skeletons for: Recipe Library (card grid), Recipe Detail page, Meal Planner calendar view.
	- Define shared TypeScript types for Recipe/Ingredient/MealPlanEntry in a small “API types” module.

- Jarvis (Backend/DB)
	- Initialize Express.js TypeScript server structure and REST API documentation approach.
	- Set up PostgreSQL + Prisma schema and migrations for the core tables (User, Recipe, Ingredient, Tag/RecipeTag, MealPlan, MealPlanEntry).
	- Implement minimal CRUD endpoints for recipes (create/list/get/update/delete), scoped by authenticated user (auth can be temporarily stubbed in week 1).

### Week 2 — Core CRUD + file upload path

- Ethan (Frontend)
	- Implement full Recipe Management UI flows: create/edit forms, recipe list search by keyword/tag, recipe detail rendering.
	- Wire up API calls for recipe CRUD; show loading/error states.
	- Implement cover photo selection UI and upload trigger (client-to-backend upload endpoint).

- Jarvis (Backend/DB)
	- Implement authentication with Better Auth (register/login/logout) using HTTP-only session cookies.
	- Add authorization middleware and ensure all data access is user-scoped.
	- Implement photo upload integration with AWS S3 (or DigitalOcean Spaces): generate upload flow, store `imageUrl` on the Recipe.

### Week 3 — Meal planner + AI endpoints

- Ethan (Frontend)
	- Build weekly meal planner UI: 7-day grid with breakfast/lunch/dinner slots.
	- Implement drag-and-drop assignment from recipe library into slots; support clearing and reassignment.
	- Connect meal plan UI to backend: load/save meal plan entries for the selected week.

- Jarvis (Backend/DB)
	- Implement MealPlan + MealPlanEntry endpoints (get/create week plan, upsert entries, clear entries).
	- Implement OpenAI integration endpoints:
		- Recipe-level “Analyze Nutrition” (send ingredient list; return macro estimates + dietary notes).
		- Meal-plan-level “AI Diet Suggestions” (send planned meals; return weekly balance recommendations).
	- Add basic rate limiting / request validation for AI routes (to control cost and avoid invalid payloads).

### Week 4 — Integration, polish, and demo readiness

- Ethan (Frontend)
	- Integrate AI result panels on Recipe Detail + Meal Planner views.
	- Improve responsiveness and UX polish (empty states, validation, consistent layout).
	- Do end-to-end testing of core user flows (auth → recipe CRUD → upload photo → meal planning → AI analysis).

- Jarvis (Backend/DB)
	- Harden API behavior: consistent error responses, input validation, and clear API docs.
	- Verify database constraints and cascading behavior (e.g., recipe delete cleans up ingredients/tags/entries as appropriate).
	- Support integration testing with seeded data for development.

Deliverable at end of week 4: a stable, demo-ready application where an authenticated user can manage recipes (with photos), create a weekly meal plan, and request AI-powered nutrition analysis and weekly diet suggestions.

---

## 4. Initial Independent Reasoning (Before Using AI)

This section records our team’s initial thinking before consulting AI tools.

1) **Application structure and architecture**

We initially chose a separate frontend and backend (React SPA + Express.js REST API) because it allows clean separation of responsibilities and parallel development. With two team members, this structure lets Ethan focus on UI/UX and client state, while Jarvis focuses on database design and API correctness. A REST API also provides a clear integration boundary and makes it easier to test components independently.

2) **Data and state design**

From the start, we expected most state to be server-owned because the application is multi-user and user-scoped: recipes, meal plans, and AI analysis results should be tied to accounts and persist across sessions/devices. We planned to store core entities in a shared cloud-hosted PostgreSQL database so both developers could test against the same schema and realistic data early in development.

On the client, we expected mostly “view state” (form inputs, selected week, drag-and-drop interactions) plus cached server data fetched from the API, rather than complex global client-side state.

3) **Feature selection and scope decisions**

We selected the core features (recipe library + weekly planner + photo upload) because they form a coherent product loop: save recipes → plan meals → reduce decision fatigue and waste. For advanced features, authentication was essential because recipes and plans are personal data. External API integration via an LLM was a natural fit for our goal of “nutrition awareness with actionable suggestions,” and it cleanly satisfies the course’s external API / cloud-based AI category.

We deliberately avoided adding unrelated features (e.g., social feeds, real-time collaboration) to keep scope realistic for a two-person team.

4) **Anticipated challenges**

Before implementation, we expected the most difficult parts would be:

- Designing reliable LLM prompts/output formats for both recipe-level nutrition estimates and week-level diet suggestions (ensuring responses are structured enough for UI display).
- Frontend–backend integration risk (mismatched types, authentication cookie handling, and coordinating evolving endpoints while both layers are under active development).
- Drag-and-drop meal planning interactions (ensuring usability and correct persistence to the backend).

5) **Early collaboration plan**

Our initial collaboration plan was to divide ownership by layer (frontend vs. backend/DB) and coordinate via an API contract and shared data models. We planned to:

- Write down endpoint definitions early and update them when scope changes.
- Use short, frequent integration checkpoints rather than waiting until “everything is done.”
- Keep responsibilities clear: Ethan owns UI behavior and client-side state; Jarvis owns data modeling, authentication, and API behavior.

---

## 5. AI Assistance Disclosure

1) **Which parts were developed without AI assistance?**

We came up with the overall project idea, product motivation, core feature set, database schema concept (entities + relationships), and the high-level collaboration split without AI assistance. These parts reflect our own preferences and what we believe is feasible for a two-person team.

2) **If AI was used, what specific tasks or drafts did it help with?**

We used AI tools to help interpret the course project requirements and to sanity-check our technical stack choices against those requirements (e.g., confirming that Option B with React + Express.js is acceptable, and identifying commonly used libraries that fit the constraints such as Prisma for PostgreSQL and Better Auth for cookie-based sessions). We also used AI for wording/structure edits to make the proposal more concise and rubric-aligned.

3) **One idea where AI input influenced the proposal (and how we evaluated it)**

AI suggested using Better Auth for authentication (with HTTP-only session cookies) to match the course’s recommended tooling and to reduce the likelihood of implementing an insecure custom auth flow. We discussed tradeoffs:

- **Pros**: faster implementation, standard session-cookie patterns, easier to protect REST endpoints.
- **Cons/constraints**: learning curve, integration details (cookie handling, CORS), and ensuring all recipe/meal plan data is correctly scoped to the authenticated user.

We adopted Better Auth because it directly supports our requirement for authenticated, user-scoped data and reduces risk compared to building authentication from scratch.