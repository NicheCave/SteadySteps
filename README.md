# SteadySteps

A habit tracker: log what you did today, set a weekly target per habit, and watch the
streaks and consistency build up over time. ASP.NET Core API, React front end, PostgreSQL.

## What it does

- **Today** — how much of the day is logged, this week's goals at a glance, a seven-day
  bar chart, a 28-day consistency grid, and the current streak.
- **Progress** — one card per goal: progress against target, days remaining, and a
  28-day trend for the habit behind it.
- **Habits** — create, edit and delete habits, each with a frequency, description,
  goal and per-habit streak.
- **Insights** — current and longest streak, consistency, best weekday, a calendar
  heatmap over 28/90/365 days, and a per-habit breakdown.
- **Settings** — account summary, profile and password changes, display preferences,
  a full JSON export of your data, sign out, and closing your account.

Deletes throughout are soft deletes: rows are flagged and filtered out by global query
filters rather than removed.

## Tech

| Layer     | Choice |
|-----------|--------|
| Front end | React 18, TypeScript, Vite, TanStack Router + Query, Zodios, Tailwind + shadcn/ui |
| API       | ASP.NET Core 8, ASP.NET Core Identity (cookie auth), AutoMapper |
| Data      | PostgreSQL via EF Core (Npgsql), code-first migrations |

The layout follows a three-project split — `SteadySteps.DAL` (entities, DbContext,
migrations), `SteadySteps.BLL` (DTOs, services, mapping) and `SteadySteps.WebHost`
(controllers, DI wiring, startup).

## Running it

**Requirements:** .NET 8 SDK, Node 18+, and a PostgreSQL instance.

1. Point the API at your database in
   `SteadySteps/SteadyStepsBackend/SteadySteps.WebHost/appsettings.Development.json`
   (`ConnectionStrings:DefaultConnection`).

2. Start the API — migrations are applied on startup:

```bash
dotnet run --project SteadySteps/SteadyStepsBackend/SteadySteps.WebHost --launch-profile https
```

   It listens on `https://localhost:7271`, with Swagger at `/swagger`.

3. Start the front end:

```bash
npm --prefix SteadySteps/SteadyStepsFrontend run dev
```

   It serves `http://localhost:5173`, which is the only origin the API's development
   CORS policy allows.

The auth cookie is issued with `SameSite=None; Secure` because the front end (http) and
API (https) count as cross-site under schemeful same-site rules. If sign-in appears to
succeed but every subsequent request comes back 401, trust the ASP.NET Core development
certificate — `dotnet dev-certs https --trust`.

## Demo data

In Development the API can populate a demo account so the dashboards have something to
draw. It's configured under `DemoData` in `appsettings.Development.json`:

```json
"DemoData": {
  "Enabled": true,
  "Username": "strangerdanger",
  "Email": "strangerdanger@steadysteps.local",
  "Password": "StraNger-D4nger!",
  "HistoryDays": 120
}
```

On startup the seeder finds (or creates) that account and adds any of its six demo
habits — Steps, Hydration, Sleep, Mindfulness, Strength training and Reading — that
aren't there yet, along with a goal and a generated log history for each. It tops up
rather than replaces: habits you created yourself are never touched, and restarting the
API doesn't duplicate anything. The generator uses a fixed seed, so a rebuilt database
tells the same story. Set `Enabled` to `false` to turn it off; it never runs outside
Development.

## API

All endpoints sit behind the Identity cookie except registration and login.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/Auth/Register` | Create an account |
| `POST` | `/api/Auth/Login` | Sign in |
| `POST` | `/api/Auth/Logout` | Sign out |
| `GET`  | `/api/Auth/Self` | The signed-in account |
| `GET/POST/PUT/DELETE` | `/api/Habit[/{id}]` | Habits |
| `GET/POST/PUT/DELETE` | `/api/Goal[/{id}]` | Goals |
| `GET/POST/PUT/DELETE` | `/api/HabitLog[/{id}]` | Habit logs (optional `?habitId=`) |
| `PUT` | `/api/User/Profile` | Change username and email |
| `PUT` | `/api/User/Password` | Change password |
| `GET` | `/api/User/Export` | Full JSON export of the account |
| `DELETE` | `/api/User/Account` | Close the account and sign out |

## Preferences

The Settings page's display options — insight window, week start, default logged value,
notes in the Today table — are presentation-only and live in `localStorage` under
`steadysteps.preferences`, not on the server.
