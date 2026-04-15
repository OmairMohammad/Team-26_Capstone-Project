# Deployment Guide

This project is prepared for:
- **Render** for the FastAPI backend
- **Netlify** for the React/Vite frontend

## Folder structure
- `server/` → FastAPI backend
- `client/` → React frontend

## Environment variables

### Backend (`server/.env.example`)
- `OBRIEN_IDI_SECRET`
- `OBRIEN_IDI_TOKEN_TTL_SECONDS`
- `CORS_ORIGINS`
- `HOST`
- `PORT`

### Frontend (`client/.env`)
- `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`

## Local production-style test
1. Start backend from `server/`
2. Set `VITE_API_BASE_URL` in `client/.env`
3. Build frontend from `client/` with `npm run build`

## Platform files included
- `render.yaml` for Render
- `client/netlify.toml` for Netlify
