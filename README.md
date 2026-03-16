# NGL-Style Anonymous Messaging App

Full-stack web app with:

- Public anonymous message form
- Backend API with JSON file storage
- JWT-protected admin login and message dashboard

## Project Structure

- `frontend/` - React (Vite) client UI
- `backend/` - Express API
  - `data/submissions.json` - JSON data store
  - `routes/` - API routes
  - `middleware/` - auth middleware
  - `server.js` - app entry point

## Features Implemented

- Public form fields:
  - Full Name (required, must include at least 2 words)
  - Anonymous Display Name (required)
  - Message (required)
- Frontend validation with clear error messages
- Backend validation + sanitization for all incoming data
- `POST /api/messages` stores:
  - `fullName`
  - `anonymousName`
  - `message`
  - `createdAt`
- Full Name is hidden from public responses
- Admin auth:
  - `POST /api/admin/login` returns JWT on successful login
  - bcrypt-hashed password in DB
  - `GET /api/admin/messages` protected by JWT
  - returns full details only to authenticated admin
- CORS enabled
- Environment variables for JWT secret and admin seed credentials
- Responsive dark-themed UI

## Local Setup

1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Configure environment variables

Backend:

- Copy `backend/.env.example` to `backend/.env`
- Update values as needed

Frontend:

- Copy `frontend/.env.example` to `frontend/.env`

3. Seed admin credentials

Option A (without storing admin password in `.env`):

```bash
cd backend
npm run seed:admin -- admin@example.com MyStrongPass123!
```

Option B (using `.env` values `ADMIN_EMAIL` and `ADMIN_PASSWORD`):

```bash
cd backend
npm run seed:admin
```

4. Run backend

```bash
cd backend
npm run dev
```

5. Run frontend

```bash
cd frontend
npm run dev
```

6. Use the app

- Public form: `http://localhost:5173/` or `http://localhost:5173/u/yourname`
- Admin login: `http://localhost:5173/admin/login`
- Admin dashboard: `http://localhost:5173/admin/dashboard`

## Deploy to Render (Backend)

1. Push this repo to GitHub.
2. In Render, create a new `Web Service` from your GitHub repo.
3. Configure service:
   - `Root Directory`: `backend`
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
4. Add environment variables in Render:
   - `JWT_SECRET` = strong random string
   - `CLIENT_ORIGIN` = `https://nglmessagemeweb.vercel.app`
   - `ADMIN_EMAIL` = your admin email (optional if using CLI args to seed)
   - `ADMIN_PASSWORD` = your admin password (optional if using CLI args to seed)
   - `STORE_FILE_PATH` = `/var/data/submissions.json` (recommended when using a Render disk)
5. (Recommended) Attach a persistent disk in Render and mount it to `/var/data`.
6. Deploy the service.
7. Open Render Shell and run admin seed once:

```bash
npm run seed:admin
```

Backend URL: `https://nglmessagemeweb.onrender.com`

## Deploy to Vercel (Frontend)

1. In Vercel, import the same GitHub repo.
2. Configure project:
   - `Framework Preset`: `Vite`
   - `Root Directory`: `frontend`
   - `Build Command`: `npm run build`
   - `Output Directory`: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL` = `https://nglmessagemeweb.onrender.com`
4. Deploy.

Frontend URL: `https://nglmessagemeweb.vercel.app`

## Production Checklist

1. Visit `https://nglmessagemeweb.onrender.com/api/health` and confirm `{ ok: true }`.
2. Create a profile/message from frontend and confirm it appears in admin dashboard.
3. Delete a message in admin dashboard and confirm it is removed.

## API Summary

### Public

- `POST /api/profiles`
  - Body:

```json
{
  "fullName": "Juan Dela Cruz",
  "email": "juan@example.com",
  "age": 25,
  "profileImage": "data:image/png;base64,..."
}
```

- `POST /api/messages`
  - Body:

```json
{
  "profileId": "generated-profile-id",
  "anonymousName": "TruthTeller99",
  "message": "You are doing great!"
}
```

### Admin

- `POST /api/admin/login`
  - Body:

```json
{
  "email": "admin@example.com",
  "password": "ChangeThisPassword123!"
}
```

- `GET /api/admin/messages`
  - Header: `Authorization: Bearer <token>`
