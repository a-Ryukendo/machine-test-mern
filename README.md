# MERN Machine Test Solution

This project implements the requested MERN machine test features:

- Admin login using JWT authentication
- Agent creation and listing
- Uploading CSV/XLS/XLSX files with `FirstName`, `Phone`, and `Notes`
- Automatic equal distribution of uploaded items across 5 agents
- Viewing distributed lists by agent

## Project Structure

- `server` - Node.js + Express + MongoDB API
- `client` - React (Vite) frontend

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud connection string)

## Backend Setup

1. Go to backend folder:
   - `cd server`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Install dependencies (already done if you just cloned and run fresh):
   - `npm install`
4. Start backend:
   - `npm run dev`

Backend runs on `http://localhost:5000`.

### Create Admin User

After backend starts, call:

- `POST http://localhost:5000/api/auth/seed-admin`

This seeds admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Frontend Setup

1. Go to frontend folder:
   - `cd client`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Install dependencies:
   - `npm install`
4. Start frontend:
   - `npm run dev`

Frontend runs on Vite default URL (usually `http://localhost:5173`).

## API Endpoints

- `POST /api/auth/login` - Admin login
- `POST /api/auth/seed-admin` - Seed admin from env
- `POST /api/agents` - Add agent (JWT required)
- `GET /api/agents` - Get agents (JWT required)
- `POST /api/tasks/upload` - Upload list file and distribute (JWT required)
- `GET /api/tasks/distributed` - Get distributed lists (JWT required)

## CSV/XLSX Format

Required columns (case-sensitive as configured):

- `FirstName`
- `Phone`
- `Notes`

Example:

```csv
FirstName,Phone,Notes
Aman,+919999999991,Follow up tomorrow
Riya,+919999999992,Priority lead
```

## Distribution Logic

- First 5 created agents are used for allocation.
- Items are assigned in round-robin order.
- This guarantees near-equal split and sequential handling of remainders.

## Validation Implemented

- Login credentials required
- Agent email format validation
- Agent mobile format with country code (`+` followed by digits)
- File type validation (`csv`, `xlsx`, `xls`)
- Minimum 5 agents required before distribution
- Basic row validation on required fields (`FirstName`, `Phone`)

