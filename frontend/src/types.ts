// ─────────────────────────────────────────────
// Core domain types for PlatePlan frontend
// ─────────────────────────────────────────────

/** A single ingredient within a recipe */
export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

/** Tag attached to a recipe (e.g. "Vegetarian", "Gluten-Free") */
export interface Tag {
  id: string;
  name: string;
}

/** A recipe stored in the user's library */
export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  instructions: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  imageUrl: string | null;
  ingredients: Ingredient[];
  tags: Tag[];
  folderId: string | null;
  createdAt: string; // ISO date string
  updatedAt: string;
}

/** A folder used to organise recipes */
export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string; // hex colour for the folder icon
  createdAt: string;
}

/** A weekly meal plan header record */
export interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: string; // ISO date string, always a Monday
}

/** Day-of-week options for meal plan entries */
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** Meal type options for meal plan entries */
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";

/** A single slot in the weekly meal plan */
export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId: string;
  recipe: Recipe; // populated on fetch
  dayOfWeek: DayOfWeek;
  mealType: MealType;
}

// ─────────────────────────────────────────────
// Authentication types
// ─────────────────────────────────────────────

/** Logged-in user returned by the auth session endpoint */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/** Login request body */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Registration request body */
export interface RegisterCredentials {
  email: string;
  name: string;
  password: string;
}

// ─────────────────────────────────────────────
// AI feature types
// ─────────────────────────────────────────────

/** Nutritional data returned by the AI analysis endpoint */
export interface NutritionAnalysis {
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbohydrates: number; // grams
  fibre: number; // grams
  summary: string; // concise AI-generated text assessment
  suggestions: string[]; // ingredient substitution suggestions
}

/** Dietary recommendations returned for a full weekly meal plan */
export interface WeeklyDietSuggestion {
  overallAssessment: string;
  recommendations: string[];
  nutritionHighlights: {
    strength: string[];
    improvement: string[];
  };
}

// ─────────────────────────────────────────────
// UI / form types
// ─────────────────────────────────────────────

/** Form values when creating or editing a recipe */
export interface RecipeFormValues {
  title: string;
  description: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  folderId: string | null;
  ingredients: Omit<Ingredient, "id">[];
  tags: string[]; // tag names
  imageFile?: File | null; // for photo upload
}

/** Sidebar navigation state */
export type SidebarView = "folder" | "meal-plan";
