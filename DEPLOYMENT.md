# PharmaGuard Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Render/Railway Deployment](#renderrailway-deployment)
4. [Vercel Deployment](#vercel-deployment)

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)
- OpenAI API Key (optional, for LLM features)

---

## Docker Deployment

The easiest way to deploy PharmaGuard is using Docker and Docker Compose.

1. Clone the repository
2. Copy `.env.example` to `.env` and add your OpenAI API key (optional)
3. Run `docker-compose up -d`
4. The application will be available at `http://localhost:3000`

---

## Render/Railway Deployment

For a fully managed backend deployment:

1. Push your code to a GitHub repository.
2. Go to Render or Railway and create a new Web Service.
3. Connect your GitHub repository.
4. Configure the service:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add `OPENAI_API_KEY` (optional)
5. Deploy!

---

## Vercel Deployment

If you want to deploy the frontend separately to Vercel:

1. Push your code to a GitHub repository.
2. Go to Vercel and import your repository.
3. Configure the project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy!

*Note: If you deploy the frontend separately, you will need to update the API endpoints in the frontend code to point to your deployed backend URL.*
