import { useNavigate } from "react-router-dom";
import { Clock, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

/**
 * A recipe card displayed in the library grid.
 * Shows the cover photo, title, tags, servings, and total cook time.
 * Clicking the card navigates to the recipe detail page.
 * The ••• menu (Radix DropdownMenu) provides Edit and Delete actions.
 * Delete is confirmed via a Radix Dialog before executing.
 */
export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalTime = recipe.prepTime + recipe.cookTime;
  const timeLabel =
    totalTime >= 60
      ? `${Math.floor(totalTime / 60)} hr${Math.floor(totalTime / 60) > 1 ? "s" : ""}${
          totalTime % 60 > 0 ? ` ${totalTime % 60} min` : ""
        }`
      : `${totalTime} min`;

  // Show up to 2 tags on the card; the rest are visible on the detail page
  const visibleTags = recipe.tags.slice(0, 2);

  return (
    <>
      {/* ── Delete confirmation (Radix Dialog) ────────────────────────────── */}
      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 focus:outline-none">
            <Dialog.Title className="text-base font-semibold text-[var(--text-primary)] mb-1">
              Delete recipe?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-[var(--text-secondary)] mb-5">
              <strong className="text-[var(--text-primary)]">{recipe.title}</strong>{" "}
              will be permanently deleted. This cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => {
                  onDelete(recipe.id);
                  setConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer group bg-[var(--bg-elevated)] shadow-lg hover:shadow-xl hover:ring-2 hover:ring-white/20 transition-all duration-200"
        style={{ aspectRatio: "3/2" }}
        onClick={() => navigate(`/recipe/${recipe.id}`)}
      >
        {/* Cover image */}
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Card footer — tags, title, meta */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-2 mb-2">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 text-white/75 text-xs">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {timeLabel}
            </span>
          </div>
        </div>

        {/* Three-dot action menu (Radix DropdownMenu) */}
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors focus:outline-none">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-30 min-w-[140px] bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl shadow-xl py-1.5 px-1"
              >
                <DropdownMenu.Item
                  onSelect={() => navigate(`/recipe/${recipe.id}/edit`)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)] outline-none rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit recipe
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => setConfirmOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 cursor-pointer hover:bg-[var(--bg-hover)] outline-none rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </>
  );
}
