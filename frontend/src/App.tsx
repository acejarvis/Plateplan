import { useState, useCallback, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Menu, Utensils } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Home from "@/routes/Home";
import RecipeDetail from "@/routes/RecipeDetail";
import EditRecipe from "@/routes/EditRecipe";
import MealPlan from "@/routes/MealPlan";
import Login from "@/routes/Login";
import Register from "@/routes/Register";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { Folder, MealPlanEntry, Recipe, RecipeFormValues } from "@/types";
import {
  MOCK_FOLDERS,
  MOCK_MEAL_PLAN_ENTRIES,
  MOCK_RECIPES,
} from "@/mockData";

/**
 * Root application component.
 *
 * Wraps the app in BrowserRouter + AuthProvider, then delegates to
 * AppShell which reads auth state and renders either the authenticated
 * layout (sidebar + routes) or the public auth pages (login / register).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * Inner shell component — all app state lives here so that useAuth()
 * can be called safely (it must be inside <AuthProvider>).
 *
 * Manages top-level state: recipes, folders, meal plan entries.
 * All data mutations here should eventually call the backend API.
 * Hardcoded mock data is used for frontend development — search for
 * "TODO" comments throughout this file and the API reference in
 * GETTING_STARTED.md for the corresponding endpoints.
 */
function AppShell() {
  const { user, isLoading: authLoading, logout } = useAuth();

  // ─── State ─────────────────────────────────────────────────────────────────

  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [mealPlanEntries, setMealPlanEntries] = useState<MealPlanEntry[]>(
    MOCK_MEAL_PLAN_ENTRIES
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive sorted unique tag names from all recipes
  const allTags = useMemo(() => {
    const names = new Set<string>();
    recipes.forEach((r) => r.tags.forEach((t) => names.add(t.name)));
    return Array.from(names).sort();
  }, [recipes]);

  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  }, []);

  const handleClearTags = useCallback(() => setSelectedTags([]), []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDark]);

  // ─── Recipe mutations ───────────────────────────────────────────────────────

  /**
   * Save (create or update) a recipe.
   * TODO: Connect to backend:
   *   Create: POST /api/recipes
   *   Update: PUT  /api/recipes/:id
   */
  const handleSaveRecipe = useCallback(
    async (id: string | null, values: RecipeFormValues) => {
      // TODO: If values.imageFile is set, upload it first:
      //   POST /api/upload/recipe-image  (multipart/form-data)
      //   Returns { url: string } → use as imageUrl below

      if (id === null) {
        // Create
        const newRecipe: Recipe = {
          id: `r${Date.now()}`,
          userId: "u1",
          title: values.title,
          description: values.description,
          instructions: values.instructions,
          prepTime: values.prepTime,
          cookTime: values.cookTime,
          servings: values.servings,
          folderId: values.folderId,
          imageUrl: values.imageFile
            ? URL.createObjectURL(values.imageFile)
            : null,
          ingredients: values.ingredients.map((ing, i) => ({
            id: `i${Date.now()}-${i}`,
            ...ing,
          })),
          tags: values.tags.map((name, i) => ({
            id: `t${Date.now()}-${i}`,
            name,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setRecipes((prev) => [newRecipe, ...prev]);
        console.log("[TODO] POST /api/recipes →", newRecipe);
      } else {
        // Update
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  title: values.title,
                  description: values.description,
                  instructions: values.instructions,
                  prepTime: values.prepTime,
                  cookTime: values.cookTime,
                  servings: values.servings,
                  folderId: values.folderId,
                  ingredients: values.ingredients.map((ing, i) => ({
                    id: `i${Date.now()}-${i}`,
                    ...ing,
                  })),
                  tags: values.tags.map((name, i) => ({
                    id: `t${Date.now()}-${i}`,
                    name,
                  })),
                  imageUrl: values.imageFile
                    ? URL.createObjectURL(values.imageFile)
                    : r.imageUrl,
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        console.log(`[TODO] PUT /api/recipes/${id} →`, values);
      }
    },
    []
  );

  /**
   * Delete a recipe.
   * TODO: DELETE /api/recipes/:id
   */
  const handleDeleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setMealPlanEntries((prev) => prev.filter((e) => e.recipeId !== id));
    console.log(`[TODO] DELETE /api/recipes/${id}`);
  }, []);

  // ─── Folder mutations ───────────────────────────────────────────────────────

  /**
   * Create a new folder with a prompt.
   * TODO: POST /api/folders  Body: { name, color }
   */
  const handleCreateFolder = useCallback(() => {
    const name = window.prompt("Folder name:");
    if (!name?.trim()) return;
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#F7DC6F",
      "#82E0AA",
      "#BB8FCE",
      "#F0A500",
      "#E74C3C",
    ];
    const color = colors[folders.length % colors.length];
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      userId: "u1",
      name: name.trim(),
      color,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
    console.log("[TODO] POST /api/folders →", newFolder);
  }, [folders.length]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Wait for AuthProvider to rehydrate the session from localStorage before
  // deciding which layout to render (avoids a flash of the login page).
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <span className="text-[var(--text-secondary)] text-sm animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  // ── Unauthenticated: show only login / register pages ──────────────────────
  if (!user) {
    return (
      <div className="bg-[var(--bg-app)] transition-colors duration-200">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Any other path → redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // ── Authenticated: full app layout ─────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)] transition-colors duration-200">
      {/* Mobile backdrop — closes the sidebar when tapped */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — persistent on desktop, drawer on mobile */}
      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onFolderSelect={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allTags={allTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearTags={handleClearTags}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
        user={user}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area: mobile top bar + route content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile-only top bar */}
        <header className="flex lg:hidden items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-sidebar)] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Utensils className="w-5 h-5 text-orange-400" />
          <span className="font-bold text-[var(--text-primary)] text-base tracking-tight">
            PlatePlan
          </span>
        </header>

        {/* Route content */}
        <main className="flex-1 overflow-hidden">
          <Routes>
          <Route
            path="/"
            element={
              <Home
                recipes={recipes}
                folders={folders}
                selectedFolderId={selectedFolderId}
                searchQuery={searchQuery}
                selectedTags={selectedTags}
                onDelete={handleDeleteRecipe}
              />
            }
          />
          <Route
            path="/recipe/new"
            element={
              <EditRecipe
                recipes={recipes}
                folders={folders}
                onSave={handleSaveRecipe}
              />
            }
          />
          <Route
            path="/recipe/:id"
            element={<RecipeDetail recipes={recipes} folders={folders} />}
          />
          <Route
            path="/recipe/:id/edit"
            element={
              <EditRecipe
                recipes={recipes}
                folders={folders}
                onSave={handleSaveRecipe}
              />
            }
          />
          <Route
            path="/meal-plan"
            element={
              <MealPlan
                recipes={recipes}
                folders={folders}
                entries={mealPlanEntries}
                onEntriesChange={setMealPlanEntries}
              />
            }
          />
          {/* Redirect /login and /register to home when already signed in */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </main>
      </div>
    </div>
  );
}
