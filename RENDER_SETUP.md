# Deploying Backend to Render - Step by Step Guide

## Prerequisites
- A [Render](https://render.com) account
- A [MongoDB Atlas](https://www.mongodb.com/atlas/database) account (free tier works)

---

## Step 1: Get Your MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and log in
2. Click on your cluster (or create a free cluster)
3. Click **"Connect"** button
4. Select **"Connect your application"**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ngl?retryWrites=true&w=majority
   ```
6. Replace `username` and `password` with your actual database credentials
7. Replace `cluster` with your actual cluster name

---

## Step 2: Generate a JWT Secret

Run this command in your terminal to generate a secure random key:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated string - you'll need it for the JWT_SECRET environment variable.

---

## Step 3: Connect Your Backend to Render

### Option A: Connect from GitHub (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** and select **"Web Service"**
3. Connect your GitHub account and select your repository
4. If you haven't pushed your code yet, make sure to push to GitHub first

### Option B: Manual Deploy (Upload ZIP)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** and select **"Web Service"**
3. Select **"Upload a file instead"**
4. Upload your backend folder as a ZIP file

---

## Step 4: Configure Your Web Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | ngl-backend |
| **Environment** | Node |
| **Build Command** | npm install |
| **Start Command** | npm start |
| **Instance Type** | Free (or your preferred tier) |

---

## Step 5: Add Environment Variables

In the same page where you configure your web service, scroll down to the **"Environment Variables"** section and add these:

### Required Variables:

1. **MONGO_URI**
   - Value: Your MongoDB connection string from Step 1
   - Example: `mongodb+srv://myuser:mypassword@cluster0.mongodb.net/ngl?retryWrites=true&w=majority`

2. **CLIENT_ORIGIN**
   - Value: `https://nglmessagemeweb.vercel.app`

3. **JWT_SECRET**
   - Value: The random string you generated in Step 2
   - Example: `a1b2c3d4e5f6...` (64 character string)

### Optional Variables:

4. **PORT**
   - Value: `5000` (Render will override this with their own port, but this is the fallback)

---

## Step 6: Deploy

1. Click **"Create Web Service"** button at the bottom
2. Wait for the build to complete (this may take a few minutes)
3. You should see "Live" status when deployed successfully

---

## Step 7: Verify Your Backend is Working

Visit this URL in your browser:
```
https://nglmessagemeweb.onrender.com/api/health
```

You should see a JSON response like:
```json
{"ok":true,"timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Step 8: Set Up Admin User

After your backend is deployed, you need to create an admin account:

1. In your backend folder locally, make sure you have a `.env` file with the same variables
2. Run this command in your terminal:
   ```bash
   cd backend
   npm install
   npm run seed:admin
   ```
3. This will create an admin user with:
   - Email: `admin@ngl.com`
   - Password: `admin123`

**Important:** Change the admin password after first login!

---

## Troubleshooting

### Build Fails
- Make sure you have the correct `package.json` with all dependencies
- Check the Build Logs in Render for errors

### "MONGO_URI is missing" Error
- Make sure MONGO_URI is set in Render Environment Variables
- Verify your MongoDB Atlas network settings allow connections from Render (add 0.0.0.0/0 in IP Access List)

### CORS Errors
- Make sure CLIENT_ORIGIN is set to exactly `https://nglmessagemeweb.vercel.app`
- No trailing slash!

### "Cannot GET /" Error
- This is normal - there's no frontend served by the backend
- The API is available at `/api/*` routes

---

## Quick Reference

| Variable | Example Value |
|----------|---------------|
| MONGO_URI | `mongodb+srv://user:pass@cluster.mongodb.net/ngl?retryWrites=true&w=majority` |
| CLIENT_ORIGIN | `https://nglmessagemeweb.vercel.app` |
| JWT_SECRET | (generated from node command) |
| PORT | `5000` |

