# SafeCircle — Community Watch

SafeCircle is a responsive React frontend for the Community Watch production-shaped API.

## API

`https://1-community-watch-api.vercel.app/api/v1`

Public docs: `/docs`  
OpenAPI: `/openapi.json`

## Authentication

This project uses **JWT Bearer authentication consistently**. The JWT returned by login is stored in `localStorage` under `community_watch_token` and attached as `Authorization: Bearer <token>` to authenticated requests. Cookies are intentionally not sent by the API wrapper so the app does not mix cookie and bearer sessions.

## Implemented roles

- **Resident:** register/login, profile, incident feed and filters, report incidents, incident details, upvotes, comments, delete own reports, zone alerts.
- **Patrol officer:** all resident functionality plus patrol shifts, checkpoints, ending shifts, and incident status updates.
- **Admin:** all patrol functionality plus broadcasting safety alerts.

## Core API flows implemented

- `GET /public/stats`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/me`
- `GET /incidents`
- `POST /incidents`
- `GET /incidents/{id}`
- `DELETE /incidents/{id}`
- `PATCH /incidents/{id}/status`
- `POST /incidents/{id}/upvote`
- `POST /incidents/{id}/comments`
- `GET /patrols`
- `POST /patrols/start`
- `POST /patrols/{id}/checkpoint`
- `POST /patrols/{id}/end`
- `GET /alerts`
- `POST /alerts`

## Routing

- `/` — public landing page with live API statistics
- `/login` — authentication
- `/register` — registration
- `/incidents` — protected incident feed
- `/incidents/:id` — protected incident detail
- `/report-incident` — protected report form
- `/profile` — protected profile
- `/alerts` — protected alerts
- `/patrols` — patrol officer/admin only
- `/home` redirects to `/`
- unknown routes render the Not Found page

## Responsive design

The app is designed for desktop, tablet and narrow mobile screens, including the 375px viewport called out in the project brief. Navigation becomes a mobile drawer, filters wrap, and patrol/report forms collapse to single-column layouts.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```
