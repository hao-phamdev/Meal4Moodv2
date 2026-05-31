# Workflow: Auth & Recipe Saving

## Objective
Allow users to sign up / log in and save generated recipes to their account.

## Stack
- Supabase email/password auth
- Supabase PostgreSQL — `recipes` table
- `src/lib/supabase.ts` client

## Supabase Table: recipes
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, auto |
| user_id | uuid | FK → auth.users |
| title | text | |
| description | text | |
| cook_time | int | minutes |
| servings | int | |
| ingredients | jsonb | string[] |
| steps | jsonb | string[] |
| photo_url | text | |
| country | text | |
| cuisine | text | |
| mood | int | 0–100 |
| diet | jsonb | string[] |
| created_at | timestamptz | default now() |

## RLS Policy
- SELECT: user_id = auth.uid()
- INSERT: user_id = auth.uid()
- DELETE: user_id = auth.uid()

## Route
`GET/POST/DELETE /api/recipes`
