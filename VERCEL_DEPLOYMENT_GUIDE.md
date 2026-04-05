# React Frontend Deployment to Vercel

## Overview

Vercel is the easiest way to deploy React apps. It:
- Auto-deploys from Git commits
- Provides free SSL/TLS certificates
- Supports custom domains
- Has excellent performance (CDN globally)
- Integrates perfectly with Next.js (optional upgrade)

---

## Step 1: Prepare Your React App

### 1.1 Update Backend API URL

The API configuration now uses an environment variable:

```javascript
// src/API/api.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
```

### 1.2 Create Environment Variables File

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
REACT_APP_BACKEND_URL=http://127.0.0.1:8000/api/
```

### 1.3 Test Locally

```bash
npm start
# Should start on http://localhost:3000
# Make sure Django backend is running on http://127.0.0.1:8000
```

### 1.4 Build for Production

```bash
npm run build
# Creates optimized production build in ./build/
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

#### 2A.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2A.2 Login to Vercel

```bash
vercel login
# Opens browser → Sign in with GitHub
```

#### 2A.3 Deploy

```bash
cd travel-companion-frontend
vercel --prod
```

You'll be prompted:
- **Project name**: `travel-companion-frontend` (or custom)
- **Link to GitHub**: Yes (for auto-deploys)
- **Overwrite settings**: No (keep defaults)

After deployment:
```
✅ Production: https://travel-companion-frontend.vercel.app/
```

---

### Option B: Deploy via Vercel Dashboard (Easiest for Beginners)

#### 2B.1 Go to Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**

#### 2B.2 Select Repository

1. Search for: `Aayushdai/project_front`
2. Click **Import**

#### 2B.3 Configure Project

- **Project Name**: `travel-companion` (auto-filled)
- **Framework Preset**: React
- **Root Directory**: `./` (or where `package.json` is)

#### 2B.4 Add Environment Variables

**Very Important!** Before deploying, add environment variables:

1. Click **Environment Variables**
2. Add:
   - **Name**: `REACT_APP_BACKEND_URL`
   - **Value**: `https://your-backend-domain.com/api/` (Render/Railway URL)
   - **Environments**: Production, Preview, Development

3. Click **Save**

#### 2B.5 Deploy

Click **Deploy** → Wait 2-3 minutes

**Result**: 
```
✅ https://travel-companion.vercel.app
```

---

## Step 3: Update Backend CORS

Now that frontend is deployed, update backend CORS origins:

### On Render Dashboard:

1. Go to your backend service
2. Environment → Edit variable `CORS_ALLOWED_ORIGINS`
3. Update to:
   ```
   https://travel-companion.vercel.app,https://www.yourdomain.com
   ```
4. Auto-redeploys backend

### In Production `.env`:

```
CORS_ALLOWED_ORIGINS=https://travel-companion.vercel.app,https://www.yourdomain.com
```

---

## Step 4: Test the Deployment

### 4.1 Access Frontend

Visit: https://travel-companion.vercel.app

You should see:
- ✅ Homepage/Login page loads
- ✅ No CORS errors in console
- ✅ Can log in (if backend is accessible)

### 4.2 Check for CORS Errors

Open browser DevTools (F12):
1. **Console** tab
2. Try logging in
3. Look for errors like:
   ```
   Access to XMLHttpRequest has been blocked by CORS policy
   ```

**Fix**: Update `CORS_ALLOWED_ORIGINS` on backend

### 4.3 Test API Calls

In browser console:
```javascript
fetch('https://your-backend-domain.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

Should see JWT token response (not error).

---

## Step 5: Custom Domain (Optional)

### 5.1 Buy a Domain

- GoDaddy, Namecheap, or any registrar
- Example: `yourdomain.com`

### 5.2 Connect to Vercel

1. Vercel Dashboard → Your Project → Settings
2. **Domains** section
3. Add domain: `yourdomain.com`
4. Vercel shows DNS records to add

### 5.3 Update DNS Records

Go to your domain registrar (GoDaddy, etc.):

1. Find **DNS settings**
2. Add Vercel's DNS records:
   ```
   CNAME yourdomain.com alias.vercel.app
   ```

3. Wait 24-48 hours for DNS to propagate
4. Visit `https://yourdomain.com` → ✅ Works!

---

## Vercel Domain Names Explained

### Free Vercel Domain (Easiest)
```
https://travel-companion.vercel.app
```
- ✅ **Pros**: Free, auto SSL, simple setup
- ❌ **Cons**: Not your brand, harder to remember

### Custom Domain (Professional)
```
https://yourdomain.com
```
- ✅ **Pros**: Professional, brandable, full control
- ❌ **Cons**: ~$10-15/year domain cost

### Subdomain (Flexible)
```
https://app.yourdomain.com
```
- ✅ **Pros**: Professional, separates app from website
- ❌ **Cons**: Requires custom domain

### Recommendation
**For now**: Use free `travel-companion.vercel.app`  
**Later**: Buy `yourdomain.com` and use it across all services

---

## Auto-Deployment from Git

Once connected to GitHub, Vercel auto-deploys on:
- ✅ Push to `main` branch → Production
- ✅ Push to other branches → Preview URLs
- ✅ Pull requests → Auto-preview links

Example workflow:
```bash
# Make changes
git add src/
git commit -m "Update login page"
git push origin main

# Vercel auto-deploys!
# ✅ In 2-3 minutes: https://travel-companion.vercel.app is updated
```

---

## Environment Variables for Different Stages

### Development (Local)
```
REACT_APP_BACKEND_URL=http://127.0.0.1:8000/api/
```

### Preview (Staging on Vercel)
```
REACT_APP_BACKEND_URL=https://travel-companion-staging.render.com/api/
```

### Production
```
REACT_APP_BACKEND_URL=https://travel-companion-api.render.com/api/
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Cannot find module" error | Run `npm install` locally, test with `npm start` |
| Build fails | Check `npm run build` locally first |
| CORS errors | Update backend `CORS_ALLOWED_ORIGINS` |
| Blank white page | Check DevTools → Console for errors |
| API returns 404 | Verify `REACT_APP_BACKEND_URL` is correct |

---

## Performance Tips

1. **Vercel Edge Caching**: Built-in, no config needed
2. **Image Optimization**: Use Vercel's Image component (optional)
3. **Analytics**: Vercel Web Analytics (free tier)
4. **Monitoring**: Vercel Observability

---

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Get Vercel domain: `https://travel-companion.vercel.app`
3. ✅ Update backend CORS
4. ✅ Test login/API
5. (Optional) Buy custom domain
6. (Optional) Set up CI/CD monitoring

---

## Quick Reference

| Task | Command |
|------|---------|
| Install Vercel CLI | `npm install -g vercel` |
| Login | `vercel login` |
| Deploy | `vercel --prod` |
| View logs | `vercel logs -u` |
| Remove project | `vercel remove` |

---

## Resources

- Vercel Docs: https://vercel.com/docs
- React Deployment: https://vercel.com/docs/frameworks/react
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- Custom Domains: https://vercel.com/docs/concepts/projects/domains

