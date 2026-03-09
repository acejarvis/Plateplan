import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { openai } from "../lib/openai.js";
import { authGuard } from "../middleware/authGuard.js";

const router = Router();

// POST /api/recipes/:id/nutrition-analysis
router.post(
  "/api/recipes/:id/nutrition-analysis",
  authGuard,
  async (req, res, next) => {
    try {
      const recipe = await prisma.recipe.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
        include: { ingredients: true },
      });

      if (!recipe) {
        res.status(404).json({ error: "Recipe not found" });
        return;
      }

      const ingredientList = recipe.ingredients
        .map((i) => `${i.quantity} ${i.unit} ${i.name}`)
        .join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a nutritionist. Estimate the nutritional content per serving for a recipe.
Return a JSON object with these exact fields:
- calories (number, kcal per serving)
- protein (number, grams per serving)
- fat (number, grams per serving)
- carbohydrates (number, grams per serving)
- fibre (number, grams per serving)
- summary (string, 2-3 sentence dietary assessment)
- suggestions (array of strings, 2-4 actionable ingredient substitution suggestions)
Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Recipe: "${recipe.title}" (${recipe.servings} servings)

Ingredients:
${ingredientList}

Analyse the nutrition per serving and return the JSON.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        res.status(500).json({ error: "AI returned no response" });
        return;
      }

      const analysis = JSON.parse(content);
      res.json(analysis);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/meal-plans/:id/diet-suggestions
router.post(
  "/api/meal-plans/:id/diet-suggestions",
  authGuard,
  async (req, res, next) => {
    try {
      const mealPlan = await prisma.mealPlan.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
        include: {
          entries: {
            include: {
              recipe: { include: { ingredients: true } },
            },
          },
        },
      });

      if (!mealPlan) {
        res.status(404).json({ error: "Meal plan not found" });
        return;
      }

      if (mealPlan.entries.length === 0) {
        res
          .status(400)
          .json({ error: "Meal plan has no entries to analyse" });
        return;
      }

      const mealSummary = mealPlan.entries
        .map((entry) => {
          const ingredients = entry.recipe.ingredients
            .map((i) => `${i.quantity} ${i.unit} ${i.name}`)
            .join(", ");
          return `${entry.dayOfWeek} ${entry.mealType}: ${entry.recipe.title} (Ingredients: ${ingredients})`;
        })
        .join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a nutritionist evaluating a weekly meal plan.
Return a JSON object with these exact fields:
- overallAssessment (string, 2-3 sentence overall dietary assessment)
- recommendations (array of strings, 3-5 actionable recommendations)
- nutritionHighlights (object with two fields):
  - strength (array of strings, 2-3 positive aspects)
  - improvement (array of strings, 2-3 areas to improve)
Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Weekly Meal Plan:\n${mealSummary}\n\nAnalyse this weekly meal plan and return the JSON.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        res.status(500).json({ error: "AI returned no response" });
        return;
      }

      const suggestions = JSON.parse(content);
      res.json(suggestions);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
