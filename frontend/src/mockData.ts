/**
 * Mock data for frontend development.
 * TODO: Replace all of this with real API calls once the backend is ready.
 * See GETTING_STARTED.md → API Reference for the endpoint contracts.
 */

import type { Folder, MealPlan, MealPlanEntry, Recipe } from "@/types";

// ─── Mock Folders ────────────────────────────────────────────────────────────

export const MOCK_FOLDERS: Folder[] = [
  { id: "f1", userId: "u1", name: "Breakfast", color: "#FF6B6B", createdAt: "2026-01-01T00:00:00Z" },
  { id: "f2", userId: "u1", name: "Lunch", color: "#4ECDC4", createdAt: "2026-01-01T00:00:00Z" },
  { id: "f3", userId: "u1", name: "Dinner", color: "#45B7D1", createdAt: "2026-01-01T00:00:00Z" },
  { id: "f4", userId: "u1", name: "Dessert", color: "#F7DC6F", createdAt: "2026-01-01T00:00:00Z" },
  { id: "f5", userId: "u1", name: "Quick Meals", color: "#82E0AA", createdAt: "2026-01-01T00:00:00Z" },
  { id: "f6", userId: "u1", name: "Meal Prep", color: "#BB8FCE", createdAt: "2026-01-01T00:00:00Z" },
];

// ─── Mock Recipes ─────────────────────────────────────────────────────────────

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "r1",
    userId: "u1",
    title: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper.",
    instructions:
      "1. Cook pasta al dente.\n2. Fry pancetta until crispy.\n3. Mix eggs and cheese.\n4. Combine pasta, pancetta, egg mixture off heat.\n5. Season and serve.",
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&auto=format&fit=crop",
    ingredients: [
      { id: "i1", name: "Spaghetti", quantity: "400", unit: "g" },
      { id: "i2", name: "Pancetta", quantity: "150", unit: "g" },
      { id: "i3", name: "Eggs", quantity: "3", unit: "whole" },
      { id: "i4", name: "Parmesan", quantity: "100", unit: "g" },
      { id: "i5", name: "Black pepper", quantity: "1", unit: "tsp" },
    ],
    tags: [{ id: "t1", name: "Italian" }, { id: "t2", name: "Pasta" }],
    folderId: "f3",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "r2",
    userId: "u1",
    title: "Avocado Toast",
    description: "Creamy avocado on toasted sourdough with poached eggs.",
    instructions:
      "1. Toast bread.\n2. Mash avocado with lemon, salt.\n3. Spread on toast.\n4. Top with poached eggs.\n5. Season with chilli flakes.",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    imageUrl: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&auto=format&fit=crop",
    ingredients: [
      { id: "i6", name: "Sourdough bread", quantity: "2", unit: "slices" },
      { id: "i7", name: "Avocado", quantity: "1", unit: "whole" },
      { id: "i8", name: "Eggs", quantity: "2", unit: "whole" },
      { id: "i9", name: "Lemon juice", quantity: "1", unit: "tbsp" },
    ],
    tags: [{ id: "t3", name: "Vegetarian" }, { id: "t4", name: "Breakfast" }],
    folderId: "f1",
    createdAt: "2026-02-05T00:00:00Z",
    updatedAt: "2026-02-05T00:00:00Z",
  },
  {
    id: "r3",
    userId: "u1",
    title: "Chicken Stir Fry",
    description: "Quick and healthy chicken and vegetable stir fry with soy-ginger sauce.",
    instructions:
      "1. Marinate chicken in soy, ginger, garlic.\n2. Stir fry chicken until golden.\n3. Add vegetables.\n4. Add sauce and toss.\n5. Serve over rice.",
    prepTime: 15,
    cookTime: 15,
    servings: 3,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop",
    ingredients: [
      { id: "i10", name: "Chicken breast", quantity: "500", unit: "g" },
      { id: "i11", name: "Bell peppers", quantity: "2", unit: "whole" },
      { id: "i12", name: "Soy sauce", quantity: "3", unit: "tbsp" },
      { id: "i13", name: "Ginger", quantity: "1", unit: "tsp" },
    ],
    tags: [{ id: "t5", name: "Asian" }, { id: "t6", name: "Quick" }],
    folderId: "f5",
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "r4",
    userId: "u1",
    title: "Chocolate Lava Cake",
    description: "Indulgent warm chocolate cake with a molten centre.",
    instructions:
      "1. Melt chocolate and butter.\n2. Mix eggs and sugar.\n3. Combine and fold in flour.\n4. Bake at 200°C for 12 min.\n5. Unmould and serve immediately.",
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&auto=format&fit=crop",
    ingredients: [
      { id: "i14", name: "Dark chocolate", quantity: "200", unit: "g" },
      { id: "i15", name: "Butter", quantity: "100", unit: "g" },
      { id: "i16", name: "Eggs", quantity: "4", unit: "whole" },
      { id: "i17", name: "Sugar", quantity: "80", unit: "g" },
      { id: "i18", name: "Flour", quantity: "50", unit: "g" },
    ],
    tags: [{ id: "t7", name: "Dessert" }, { id: "t8", name: "Baking" }],
    folderId: "f4",
    createdAt: "2026-02-12T00:00:00Z",
    updatedAt: "2026-02-12T00:00:00Z",
  },
  {
    id: "r5",
    userId: "u1",
    title: "Greek Salad",
    description: "Fresh Mediterranean salad with tomatoes, cucumber, olives, and feta.",
    instructions:
      "1. Chop tomatoes, cucumber, and onion.\n2. Add olives and feta.\n3. Drizzle with olive oil and lemon.\n4. Season and toss gently.",
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
    ingredients: [
      { id: "i19", name: "Tomatoes", quantity: "3", unit: "whole" },
      { id: "i20", name: "Cucumber", quantity: "1", unit: "whole" },
      { id: "i21", name: "Feta cheese", quantity: "100", unit: "g" },
      { id: "i22", name: "Kalamata olives", quantity: "50", unit: "g" },
    ],
    tags: [{ id: "t9", name: "Vegetarian" }, { id: "t10", name: "Salad" }],
    folderId: "f2",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "r6",
    userId: "u1",
    title: "Overnight Oats",
    description: "Healthy, no-cook prep-ahead breakfast with oats, milk, and berries.",
    instructions:
      "1. Mix oats with milk and yoghurt.\n2. Add honey and vanilla.\n3. Refrigerate overnight.\n4. Top with fresh berries to serve.",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop",
    ingredients: [
      { id: "i23", name: "Rolled oats", quantity: "80", unit: "g" },
      { id: "i24", name: "Milk", quantity: "200", unit: "ml" },
      { id: "i25", name: "Greek yoghurt", quantity: "50", unit: "g" },
      { id: "i26", name: "Mixed berries", quantity: "100", unit: "g" },
    ],
    tags: [{ id: "t11", name: "Vegetarian" }, { id: "t12", name: "Meal Prep" }],
    folderId: "f6",
    createdAt: "2026-02-18T00:00:00Z",
    updatedAt: "2026-02-18T00:00:00Z",
  },
];

// ─── Mock Meal Plan ───────────────────────────────────────────────────────────

// Week of March 3, 2026 (Monday)
export const MOCK_MEAL_PLAN: MealPlan = {
  id: "mp1",
  userId: "u1",
  weekStartDate: "2026-03-02",
};

export const MOCK_MEAL_PLAN_ENTRIES: MealPlanEntry[] = [
  {
    id: "me1",
    mealPlanId: "mp1",
    recipeId: "r2",
    recipe: MOCK_RECIPES[1],
    dayOfWeek: "MONDAY",
    mealType: "BREAKFAST",
  },
  {
    id: "me2",
    mealPlanId: "mp1",
    recipeId: "r5",
    recipe: MOCK_RECIPES[4],
    dayOfWeek: "MONDAY",
    mealType: "LUNCH",
  },
  {
    id: "me3",
    mealPlanId: "mp1",
    recipeId: "r1",
    recipe: MOCK_RECIPES[0],
    dayOfWeek: "TUESDAY",
    mealType: "DINNER",
  },
  {
    id: "me4",
    mealPlanId: "mp1",
    recipeId: "r3",
    recipe: MOCK_RECIPES[2],
    dayOfWeek: "WEDNESDAY",
    mealType: "DINNER",
  },
  {
    id: "me5",
    mealPlanId: "mp1",
    recipeId: "r6",
    recipe: MOCK_RECIPES[5],
    dayOfWeek: "THURSDAY",
    mealType: "BREAKFAST",
  },
  {
    id: "me6",
    mealPlanId: "mp1",
    recipeId: "r4",
    recipe: MOCK_RECIPES[3],
    dayOfWeek: "FRIDAY",
    mealType: "DINNER",
  },
];
