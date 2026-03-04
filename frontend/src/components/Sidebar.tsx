import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Search,
  Plus,
  Utensils,
  Sun,
  Moon,
  LogOut,
  UserCircle,
  X,
  Tag,
} from "lucide-react";
import type { Folder, User } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** All unique tag names derived from the recipe library */
  allTags: string[];
  /** Currently active tag filters */
  selectedTags: string[];
  /** Toggle a single tag on/off */
  onTagToggle: (tagName: string) => void;
  /** Clear all active tag filters */
  onClearTags: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Left sidebar navigation.
 * Contains:
 *  - Search bar
 *  - Weekly Meal Plan tab
 *  - Folders section (All Folders + user folders)
 */
export default function Sidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  searchQuery,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClearTags,
  isDark,
  onToggleTheme,
  user,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const isMealPlan = location.pathname === "/meal-plan";

  return (
    <aside
      className={cn(
        // Base: fixed drawer on mobile, part of flex row on desktop
        "fixed inset-y-0 left-0 z-50 flex flex-col w-72 min-w-72 h-full",
        "bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-hidden",
        "transition-transform duration-200",
        // On desktop always visible; on mobile slide in/out
        "lg:relative lg:z-auto lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* App logo / title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
        <Utensils className="w-6 h-6 text-orange-400" />
        <span className="text-[var(--text-primary)] font-bold text-lg tracking-tight flex-1">PlatePlan</span>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5 bg-[var(--bg-elevated)] rounded-xl px-4 py-2.5 border border-[var(--border-mid)]">
          <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
          <input
            type="text"
            placeholder="Search recipes…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] outline-none w-full"
          />
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {/* Weekly Meal Plan tab */}
        <button
          onClick={() => {
            navigate("/meal-plan");
            onClose();
          }}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors mb-1",
            isMealPlan
              ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          )}
        >
          <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
          <span>Weekly Meal Plan</span>
        </button>

        {/* Folders section */}
        <div className="mt-5">
          <button
            onClick={() => setFoldersOpen((v) => !v)}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {foldersOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Folders
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder();
              }}
              className="ml-auto text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
              title="New folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </button>

          {foldersOpen && (
            <div className="mt-2 space-y-0.5">
              {/* All Folders */}
              <button
                onClick={() => {
                  onFolderSelect(null);
                  if (isMealPlan) navigate("/");
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm transition-colors",
                  !isMealPlan && selectedFolderId === null
                    ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <FolderOpen className="w-4.5 h-4.5 text-[var(--text-dim)] shrink-0" />
                <span>All Folders</span>
              </button>

              {/* Individual folders */}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onFolderSelect(folder.id);
                    if (isMealPlan) navigate("/");
                    onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm transition-colors",
                    !isMealPlan && selectedFolderId === folder.id
                      ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {/* Folder colour dot */}
                  <span
                    className="w-3.5 h-3.5 rounded shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags filter section */}
        {allTags.length > 0 && (
          <div className="mt-5">
            <button
              onClick={() => setTagsOpen((v) => !v)}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {tagsOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Tags
              {selectedTags.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTags();
                  }}
                  className="ml-auto text-orange-400 hover:text-orange-300 transition-colors text-[10px] font-medium normal-case tracking-normal"
                  title="Clear tag filters"
                >
                  Clear
                </button>
              )}
            </button>

            {tagsOpen && (
              <div className="mt-2 px-2 flex flex-wrap gap-1.5">
                {allTags.map((tagName) => {
                  const active = selectedTags.includes(tagName);
                  return (
                    <button
                      key={tagName}
                      onClick={() => onTagToggle(tagName)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                        active
                          ? "bg-orange-500 text-white"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-[var(--border-mid)]"
                      )}
                    >
                      <Tag className="w-2.5 h-2.5 shrink-0" />
                      {tagName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer: user info + theme toggle + logout */}
      <div className="px-4 py-4 border-t border-[var(--border)] shrink-0 space-y-1">
        {/* Signed-in user */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-mid)] mb-2">
          <UserCircle className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          {isDark ? (
            <>
              <Sun className="w-5 h-5 text-yellow-400 shrink-0" />
              <span>Light mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Dark mode</span>
            </>
          )}
        </button>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
