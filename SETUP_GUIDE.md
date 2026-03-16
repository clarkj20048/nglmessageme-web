# NGL Message Me - Complete Setup Guide

This guide will help you set up your fully working NGL anonymous messaging website with:
- **Backend**: Render (https://nglmessagemeweb.onrender.com)
- **Frontend**: Vercel (https://nglmessagemeweb.vercel.app)
- **Database**: MongoDB Atlas (for persistent data storage)

---

## Prerequisites

1. A [Render](https://render.com) account
2. A [Vercel](https://vercel.com) account
3. A [MongoDB Atlas](https://www.mongodb.com/atlas/database) account (free tier works)

---

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create a MongoDB Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign up for a free account
2. Click "Build a Database" and select the **Free** tier (M0)
3. Create a cluster name (e.g., `ngl-cluster`)
4. Create a username and password (remember these!)
5. Click "Create User"

### 1.2 Configure Network Access
1. In the left sidebar, click **Network Access**
2. Click "Add IP Address"
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click "Confirm"

### 1.3 Get Your Connection String
1. Click **Database** in the left sidebar
2. Click "Connect" on your cluster
3. Select **Connect your application**
4. Copy the connection string - it looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ngl?retryWrites=true&w=majority
   ```
5. Replace `username` and `password` with your actual credentials
6. Replace `ngl` with your preferred database name (or leave as is)

---

## Step 2: Generate JWT Secret

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated 64-character string - you'll need it for `JWT_SECRET`.

---

## Step 3: Deploy Backend to Render

### 3.1 Push Code to GitHub
If you haven't already, push your backend code to a GitHub repository:
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with MongoDB support"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

### 3.2 Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** and select **"Web Service"**
3. Connect your GitHub account and select your repository
4. Configure the following settings:

| Setting | Value |
|---------|-------|
| **Name** | ngl-backend |
| **Environment** | Node |
| **Build Command** | npm install |
| **Start Command** | npm start |
| **Instance Type** | Free |

### 3.3 Add Environment Variables
Scroll down to the **Environment Variables** section and add these:

| Variable | Value |
|----------|-------|
| **MONGO_URI** | Your MongoDB connection string (from Step 1.3) |
| **CLIENT_ORIGIN** | `https://nglmessagemeweb.vercel.app` |
| **JWT_SECRET** | Your generated JWT secret (from Step 2) |
| **PORT** | `5000` |

### 3.4 Deploy
1. Click **"Create Web Service"** button
2. Wait for the build to complete (2-5 minutes)
3. You should see "Live" status when deployed

### 3.5 Verify Backend
Visit: `https://nglmessagemeweb.onrender.com/api/health`
You should see: `{"ok":true,"timestamp":"..."}`

---

## Step 4: Set Up Admin User

### 4.1 Create Local .env File
In your backend folder, create a `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGIN=https://nglmessagemeweb.vercel.app
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@ngl.com
ADMIN_PASSWORD=admin123
```

### 4.2 Install Dependencies & Seed Admin
```bash
cd backend
npm install
npm run seed:admin
```

This creates an admin user:
- **Email**: admin@ngl.com
- **Password**: admin123

⚠️ **Important**: Change the password after first login!

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Push Frontend Code to GitHub
Make sure your frontend code is also pushed to GitHub (can be same or separate repo).

### 5.2 Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the following:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite (or React) |
| **Build Command** | npm run build |
| **Output Directory** | dist |

5. Click **"Deploy"**

### 5.3 Wait for Deployment
1-2 minutes. You'll see "Ready" when done.

---

## Step 6: Verify Your Website

### 6.1 Test the Website
1. Go to: `https://nglmessagemeweb.vercel.app`
2. Create a profile
3. Send an anonymous message
4. Check if it works!

### 6.2 Test Admin Dashboard
1. Go to: `https://nglmessagemeweb.vercel.app/admin`
2. Login with:
   - **Email**: admin@ngl.com
   - **Password**: admin123
3. View and manage messages

---

## Troubleshooting

### CORS Errors
- Make sure `CLIENT_ORIGIN` in Render is exactly `https://nglmessagemeweb.vercel.app` (no trailing slash)

### MongoDB Connection Failed
- Verify your MongoDB Atlas network settings (allow 0.0.0.0/0)
- Check that MONGO_URI is correct in Render

### Build Failed on Render
- Make sure all dependencies are in package.json
- Check Build Logs in Render dashboard

### Data Not Persisting
- Ensure you're using MongoDB (not the old JSON file storage)
- Check MongoDB Atlas cluster is active

---

## Quick Reference

| Service | URL |
|---------|-----|
| **Frontend** | https://nglmessagemeweb.vercel.app |
| **Backend API** | https://nglmessagemeweb.onrender.com |
| **Admin Panel** | https://nglmessagemeweb.vercel.app/admin |
| **Health Check** | https://nglmessagemeweb.onrender.com/api/health |

---

## Environment Variables Summary

### Render (Backend)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
CLIENT_ORIGIN=https://nglmessagemeweb.vercel.app
JWT_SECRET=your_64_character_jwt_secret
PORT=5000
```

### Local Development (.env)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_64_character_jwt_secret
PORT=5000
```

