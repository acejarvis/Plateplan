# Hoppscotch Import Guide (PlatePlan)

## Files

- Collection: `docs/api/PlatePlan.postman_collection.json`

## Import into Hoppscotch

1. Open Hoppscotch.
2. Go to **Collections**.
3. Click **Import**.
4. Choose **Postman Collection**.
5. Select `docs/api/PlatePlan.postman_collection.json`.

## Recommended request order

1. `Health / Health Check`
2. `Auth / Sign In (Email)`
3. `Auth / Get Session`
4. Any protected route (`Recipes`, `Folders`, `Meal Plans`, `AI`, `Upload`)

## Variables to set after first calls

Collection variables included:

- `baseUrl` default: `http://localhost:3000`
- `recipeId`
- `folderId`
- `mealPlanId`
- `mealPlanEntryId`
- `weekStartDate` default: `2026-03-02`

Use IDs from API responses to fill these variables before calling ID-based endpoints.

## Notes

- Most endpoints require Better Auth session cookies.
- Sign in first to establish session, then run protected endpoints.
- Upload endpoint expects multipart form-data with field name `image`.
