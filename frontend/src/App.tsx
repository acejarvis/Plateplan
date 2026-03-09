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
import {
  apiCreateFolder,
  apiCreateRecipe,
  apiDeleteRecipe,
  apiListFolders,
  apiListRecipes,
  apiUpdateRecipe,
  apiUploadRecipeImage,
  type RecipeUpsertInput,
} from "@/lib/api";
import type { Folder, Recipe, RecipeFormValues } from "@/types";

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const names = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => names.add(tag.name));
    });
    return Array.from(names).sort();
  }, [recipes]);

  const loadLibraryData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);

    try {
      const [recipeList, folderList] = await Promise.all([
        apiListRecipes(),
        apiListFolders(),
      ]);

      setRecipes(recipeList);
      setFolders(folderList);

      setSelectedFolderId((current) =>
        current && !folderList.some((folder) => folder.id === current)
          ? null
          : current
      );
    } catch (err) {
      setDataError(toErrorMessage(err, "Failed to load data from backend."));
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setFolders([]);
      setSelectedFolderId(null);
      setSelectedTags([]);
      setDataError(null);
      setDataLoading(false);
      return;
    }

    void loadLibraryData();
  }, [user, loadLibraryData]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDark]);

  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const handleSaveRecipe = useCallback(
    async (id: string | null, values: RecipeFormValues) => {
      const existingRecipe = id
        ? recipes.find((recipe) => recipe.id === id) ?? null
        : null;

      let imageUrl = existingRecipe?.imageUrl ?? null;
      if (values.imageFile) {
        imageUrl = await apiUploadRecipeImage(values.imageFile);
      }

      const payload: RecipeUpsertInput = {
        title: values.title.trim(),
        description: values.description,
        instructions: values.instructions,
        prepTime: values.prepTime,
        cookTime: values.cookTime,
        servings: values.servings,
        folderId: values.folderId,
        imageUrl,
        ingredients: values.ingredients.map((ingredient) => ({
          name: ingredient.name.trim(),
          quantity: ingredient.quantity.trim(),
          unit: ingredient.unit.trim(),
        })),
        tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
      };

      const savedRecipe = id
        ? await apiUpdateRecipe(id, payload)
        : await apiCreateRecipe(payload);

      setRecipes((prev) => {
        if (id) {
          return prev.map((recipe) =>
            recipe.id === savedRecipe.id ? savedRecipe : recipe
          );
        }

        return [savedRecipe, ...prev];
      });
    },
    [recipes]
  );

  const handleDeleteRecipe = useCallback((id: string) => {
    void (async () => {
      try {
        await apiDeleteRecipe(id);
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
      } catch (err) {
        window.alert(toErrorMessage(err, "Failed to delete recipe."));
      }
    })();
  }, []);

  const handleCreateFolder = useCallback(() => {
    const rawName = window.prompt("Folder name:");
    const name = rawName?.trim() ?? "";
    if (!name) return;

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

    void (async () => {
      try {
        const folder = await apiCreateFolder({ name, color });
        setFolders((prev) => [...prev, folder]);
      } catch (err) {
        window.alert(toErrorMessage(err, "Failed to create folder."));
      }
    })();
  }, [folders.length]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      window.alert(toErrorMessage(err, "Failed to sign out."));
    }
  }, [logout]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <span className="text-[var(--text-secondary)] text-sm animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[var(--bg-app)] transition-colors duration-200">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <span className="text-[var(--text-secondary)] text-sm animate-pulse">
          Syncing your recipes…
        </span>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 space-y-4">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Could not load app data
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{dataError}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                void handleLogout();
              }}
              className="px-4 py-2 rounded-xl border border-[var(--border-mid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={() => {
                void loadLibraryData();
              }}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)] transition-colors duration-200">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
        onToggleTheme={() => setIsDark((value) => !value)}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
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
            <Route path="/meal-plan" element={<MealPlan recipes={recipes} folders={folders} />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
