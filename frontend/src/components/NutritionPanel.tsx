import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { apiGetNutritionAnalysis } from "@/lib/api";
import type { NutritionAnalysis } from "@/types";

interface NutritionPanelProps {
  recipeId: string;
}

/**
 * AI-powered nutritional analysis panel for a recipe.
 *
 * Clicking "Analyse Nutrition" triggers the backend endpoint:
 * POST /api/recipes/:id/nutrition-analysis
 */
export default function NutritionPanel({ recipeId }: NutritionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function handleAnalyse() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGetNutritionAnalysis(recipeId);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyse recipe");
    } finally {
      setLoading(false);
    }
  }

  const macros = analysis
    ? [
        { label: "Calories", value: `${analysis.calories} kcal`, color: "text-orange-400" },
        { label: "Protein", value: `${analysis.protein}g`, color: "text-blue-400" },
        { label: "Fat", value: `${analysis.fat}g`, color: "text-yellow-400" },
        { label: "Carbs", value: `${analysis.carbohydrates}g`, color: "text-green-400" },
        { label: "Fibre", value: `${analysis.fibre}g`, color: "text-purple-400" },
      ]
    : [];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">AI Nutrition Analysis</h3>
        </div>
        {analysis && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {!analysis && !loading && (
          <div className="text-center py-3">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Get AI-powered nutritional estimates and dietary suggestions for this recipe.
            </p>
            <button
              onClick={handleAnalyse}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Analyse Nutrition
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">Analysing recipe with AI…</p>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg p-3">
            {error}
            <button
              onClick={handleAnalyse}
              className="block mt-2 text-xs text-red-300 hover:text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {analysis && expanded && (
          <div className="space-y-4">
            {/* Macro pills */}
            <div className="flex flex-wrap gap-2.5">
              {macros.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 min-w-[80px]"
                >
                  <span className={`text-base font-bold ${m.color}`}>{m.value}</span>
                  <span className="text-xs text-[var(--text-secondary)] mt-1">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                Assessment
              </h4>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                Suggestions
              </h4>
              <ul className="space-y-2.5">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-[var(--text-primary)]">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Re-analyse */}
            <button
              onClick={handleAnalyse}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] underline transition-colors"
            >
              Re-analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
