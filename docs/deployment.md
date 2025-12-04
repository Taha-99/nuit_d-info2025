# Deployment Guide

## Frontend (Vite PWA)
1. `cd frontend`
2. `npm install`
3. `npm run build`
4. Deploy `dist/` to Netlify/Vercel or serve via Express (`app.use(express.static(...))`).

## Backend (Express + SQLite)
1. `cd backend`
2. `npm install`
3. Configure `.env`
4. `npm run start`
5. For Heroku/Render, set `PORT` env and mount persistent volume for `data/app.db`.

## Combined
- Use reverse proxy to expose `/api` to backend and `/` to static frontend.
- Enable HTTPS and configure CORS in production.
