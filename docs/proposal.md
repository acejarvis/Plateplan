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