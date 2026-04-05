# Travel Companion Frontend - Vercel Deployment Guide

## 📋 Quick Summary

Your React frontend is now **ready to deploy to Vercel** with these changes:

✅ **API URL** is now environment-based (not hardcoded)  
✅ **Vercel configuration** files added  
✅ **Environment variables** template created  
✅ **Documentation** complete  

---

## 🚀 Deploy in 3 Steps

### Step 1: Install Vercel (One-time Only)
```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy to Production
```bash
cd travel-companion-frontend
vercel --prod
```

### Step 3: Get Your Domain
Vercel responds with:
```
✅ Production: https://travel-companion-frontend.vercel.app
```

That's it! Your frontend is now live. 🎉

---

## 🌐 Your Domain Names

### Free Domain (Automatic)
```
https://travel-companion-frontend.vercel.app
```
- Generated from GitHub repo name
- ✅ Free, instant, SSL included
- ❌ Not your brand

**Better option**: Customize project name in Vercel Dashboard → `travel-companion.vercel.app`

### Custom Domain (Professional)
```
https://yourdomain.com
```
- ✅ Professional, branded
- ❌ Cost: $10-15/year

**Setup**:
1. Buy domain (namecheap.com, godaddy.com, etc.)
2. Vercel Dashboard → Settings → Domains
3. Add your domain
4. Update DNS records at registrar
5. Wait 24-48 hours for DNS propagation

---

## Environment Variables Setup

### Local Development
Create `.env.local`:
```
REACT_APP_BACKEND_URL=http://127.0.0.1:8000/api/
```

### Vercel Production
1. Deploy to Vercel first: `vercel --prod`
2. Go to Vercel Dashboard
3. Your Project → Settings → Environment Variables
4. Add:
   ```
   Name: REACT_APP_BACKEND_URL
   Value: https://your-backend-domain.com/api/
   Environments: Production
   ```
5. Redeploy by pushing to GitHub or clicking Redeploy

---

## Backend CORS Configuration

After getting your Vercel domain, **update your backend CORS**:

### On Render Dashboard:
1. Go to your backend service
2. Environment → CORS_ALLOWED_ORIGINS
3. Change to:
   ```
   https://travel-companion.vercel.app,https://yourdomain.com
   ```
4. Auto-redeploys

### Testing CORS
Open browser console (F12) after logging in:
```javascript
fetch('https://your-backend/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'test@example.com', password: 'pass' })
})
.then(r => r.json())
.then(d => console.log('JWT Token:', d.access_token))
.catch(e => console.error('Error:', e.message))
```

If you see CORS error → Update backend CORS origins

---

## Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `src/API/api.js` | Added env var support | API URL now configurable |
| `.env.example` | Created | Template for env variables |
| `vercel.json` | Created | Vercel deployment config |
| `.vercelignore` | Created | Files to exclude from deployment |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Created | Detailed deployment guide |
| `VERCEL_DEPLOYMENT_CHECKLIST.md` | Created | Pre-deployment checklist |
| `DOMAIN_NAMES_EXPLAINED.md` | Created | Domain naming guide |

---

## What Happens When You Deploy

1. **GitHub Integration**: Vercel watches your repo
2. **Auto-Deploy on Push**: 
   ```bash
   git push origin main
   # Vercel auto-detects → builds → deploys in 2-3 min
   ```
3. **Build Process**:
   - `npm install` - installs dependencies
   - `npm run build` - builds optimized production
   - Uploads to Vercel CDN
4. **Live**: Your app is now on the internet!

---

## Testing After Deployment

### Test 1: Page Loads
Visit: `https://travel-companion.vercel.app` → See login page ✅

### Test 2: Try Login
1. Click Login button
2. Enter email & password
3. Should see JWT token response or error message

### Test 3: Check Logs
Vercel Dashboard → Deployments → View logs for errors

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank white page | Build error | Check Vercel build logs |
| CORS error on login | Backend CORS not updated | Add frontend domain to `CORS_ALLOWED_ORIGINS` |
| API returns 404 | Wrong API URL | Check `REACT_APP_BACKEND_URL` env var |
| Site won't build | Missing dependencies | Run `npm install && npm run build` locally |

---

## How to Push Updates

Once deployed, updating is easy:

```bash
# Make changes locally
nano src/pages/Login.jsx

# Test locally
npm start

# Commit and push
git add src/pages/Login.jsx
git commit -m "Update login button styling"
git push origin main

# ✅ Vercel auto-deploys in 2-3 minutes!
```

---

## Auto-Deployment Branches

```
main branch   → Production (https://travel-companion.vercel.app)
other-branch  → Preview URL (https://travel-companion-abc123.vercel.app)
Pull requests → Auto preview URL (for reviewing before merging)
```

---

## Performance & Monitoring

Vercel automatically provides:
- ✅ **Global CDN**: Fast worldwide
- ✅ **Auto-scaling**: Handles traffic spikes
- ✅ **Uptime monitoring**: Alerts on failures
- ✅ **Analytics**: View usage stats
- ✅ **Deployment previews**: Test before production

---

## Next Steps

1. ✅ **Prepare frontend** (already done)
2. → **Deploy to Vercel**: `vercel --prod`
3. → **Get domain**: `https://travel-companion.vercel.app`
4. → **Update backend CORS** with Vercel domain
5. → **Test login flow** end-to-end
6. → *(Optional)* Buy custom domain

---

## Documentation Files

1. **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide (70+ lines)
2. **[VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md)** - Quick checklist & troubleshooting
3. **[DOMAIN_NAMES_EXPLAINED.md](DOMAIN_NAMES_EXPLAINED.md)** - Domain naming guide (200+ lines)
4. **[.env.example](.env.example)** - Environment variables template

---

## Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to staging/preview
vercel

# View deployment history
vercel ls

# View logs for current deployment
vercel logs

# Remove a deployment
vercel remove

# Check if build succeeds locally
npm run build

# Run locally
npm start

# Test in production mode locally
npm install -g serve
serve -s build
# Visit http://localhost:3000
```

---

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **React Guide**: https://vercel.com/docs/frameworks/react
- **Env Variables**: https://vercel.com/docs/projects/environment-variables
- **Custom Domains**: https://vercel.com/docs/concepts/projects/domains
- **Troubleshooting**: https://vercel.com/support

---

## Your Addresses After Deployment

| Component | Development | Production |
|-----------|-------------|------------|
| Frontend | http://localhost:3000 | https://travel-companion.vercel.app |
| Backend | http://127.0.0.1:8000 | https://travel-companion-api.render.com |
| Database | Local SQLite | Neon PostgreSQL |

---

**Status**: Ready to deploy! 🚀
