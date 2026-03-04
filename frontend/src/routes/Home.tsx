import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, Tag } from "lucide-react";
import type { Folder, Recipe } from "@/types";
import RecipeList from "@/components/RecipeList";

interface HomeProps {
  recipes: Recipe[];
  folders: Folder[];
  selectedFolderId: string | null;
  searchQuery: string;
  selectedTags: string[];
  onDelete: (id: string) => void;
}

/**
 * Home / Recipe Library view.
 *
 * Shows the filtered recipe grid for the selected folder and search query.
 * The "+ New Recipe" button opens the EditRecipe route in create mode.
 *
 * Recipes are currently loaded from mock data.
 * TODO: Replace with API call GET /api/recipes?folderId=...&search=...
 */
export default function Home({
  recipes,
  folders,
  selectedFolderId,
  searchQuery,
  selectedTags,
  onDelete,
}: HomeProps) {
  const navigate = useNavigate();

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);
  const viewTitle = selectedFolder ? selectedFolder.name : "All Recipes";

  // Filter recipes by folder, search query, and selected tags
  const filtered = recipes.filter((r) => {
    const matchesFolder =
      selectedFolderId === null || r.folderId === selectedFolderId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.name.toLowerCase().includes(q));
    // Every selected tag must appear on the recipe (AND logic)
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((sel) => r.tags.some((t) => t.name === sel));
    return matchesFolder && matchesSearch && matchesTags;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span className="text-[var(--text-primary)] font-bold text-xl">{viewTitle}</span>
          {searchQuery && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#a0a0a0]">"{searchQuery}"</span>
            </>
          )}
          <span className="ml-2 text-xs bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full text-[var(--text-secondary)]">
            {filtered.length}
          </span>
        </div>

        <button
          onClick={() => navigate("/recipe/new")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Recipe
        </button>
      </div>

      {/* Active tag filter chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-8 py-2.5 border-b border-[var(--border)] bg-[var(--bg-surface)]">         
          <span className="text-xs text-[var(--text-muted)] shrink-0">Filtering by:</span>
          {selectedTags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/30"
            >
              <Tag className="w-2.5 h-2.5" />
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Recipe grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8">
        <RecipeList recipes={filtered} onDelete={onDelete} />
      </div>
    </div>
  );
}
