# Frontend Deployment Checklist - Vercel

## ✅ Completed Configuration

### API Configuration ✅
- [x] Backend URL uses environment variable `REACT_APP_BACKEND_URL`
- [x] Defaults to `http://127.0.0.1:8000/api/` for local development
- [x] Environment variable can be overridden per deployment stage

### Environment Variables ✅
- [x] `.env.example` created with all required variables
- [x] `vercel.json` configured for React
- [x] `.vercelignore` set up (ignores unnecessary files)
- [x] Ready for Vercel environment variable dashboard

### Vercel Configuration ✅
- [x] `vercel.json` created with:
  - Build command: `npm run build`
  - Output directory: `build/`
  - Rewrites configured for React Router (SPA)
- [x] Framework preset: React
- [x] Auto-deploy on Git push enabled

---

## 📋 Pre-Deployment Checklist

- [x] `npm install` - dependencies installed
- [x] `npm start` - runs locally on http://localhost:3000
- [x] `npm run build` - builds successfully
- [ ] **TODO**: Test login with local backend running
- [ ] **TODO**: Commit changes to GitHub

---

## 🚀 Quick Start: Deploy to Vercel (3 Steps)

### Step 1: Install Vercel CLI (One-time)
```bash
npm install -g vercel
vercel login
# Opens browser → Sign in with GitHub
```

### Step 2: Deploy
```bash
cd travel-companion-frontend
vercel --prod
```

Responds with:
```
✅ Production: https://travel-companion-frontend.vercel.app
```

### Step 3: Update Backend CORS
After getting your Vercel domain, tell your backend:

```bash
# On Render/Railway dashboard:
# Environment > CORS_ALLOWED_ORIGINS
# Add: https://travel-companion-frontend.vercel.app
```

**Done!** 🎉

---

## 🌐 Domain Name Options

### Option 1: Free Vercel Domain (Default)
```
https://travel-companion-frontend.vercel.app
```
- ✅ **Auto-generated**, no cost
- ✅ **Standard pattern**: `{project-name}.vercel.app`
- ✅ **Auto SSL/HTTPS**
- ❌ Not your custom brand
- ❌ Harder to remember

**When to use**: For now, perfect for testing

---

### Option 2: Custom Domain (Professional)
```
https://yourdomain.com
```
- ✅ **Professional**: your brand
- ✅ **Easy to remember**
- ✅ **Full control** over domain
- ❌ **Cost**: ~$10-15/year
- ❌ **DNS setup**: 24-48 hours to propagate

**When to use**: Going live to public users

**How to set up**:
1. Buy domain from GoDaddy, Namecheap, etc.
2. Vercel Dashboard → Settings → Domains
3. Add domain name
4. Update DNS records at registrar
5. Done!

---

### Option 3: Subdomain (Flexible)
```
https://app.yourdomain.com
```
- ✅ **Professional** but separated from main site
- ✅ **Easy to scale** multiple apps
- ❌ Requires custom domain first

**How to set up**:
1. Own `yourdomain.com`
2. Vercel → Add domain: `app.yourdomain.com`
3. Add DNS CNAME at registrar

---

## 📊 Domain Name Decision Matrix

| Scenario | Recommendation |
|----------|-----------------|
| **Local testing** | Use `localhost:3000` |
| **Initial staging** | Use `vercel.app` free domain |
| **Team sharing** | Share `vercel.app` link |
| **Production launch** | Buy custom domain |
| **Multiple apps** | Use subdomains (`app.yourdomain.com`) |

---

## 🔧 Environment Variables to Set Up

In Vercel Dashboard (after deploying):

1. **Project Settings** → **Environment Variables**
2. Add:

| Key | Value | Environment |
|-----|-------|-------------|
| `REACT_APP_BACKEND_URL` | `https://your-render-backend.com/api/` | Production |
| `REACT_APP_BACKEND_URL` | `http://127.0.0.1:8000/api/` | Development |

3. Click **Save and Redeploy**

---

## 🧪 Testing After Deployment

### Test 1: Frontend Loads
```
https://your-vercel-domain.com
→ Should load login page
```

### Test 2: Check CORS Setup
Open DevTools Console (F12):
```javascript
// Test API call
fetch('https://your-backend-domain/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e.message))
```

**Success**: See JWT token  
**CORS Error**: Update backend `CORS_ALLOWED_ORIGINS`

### Test 3: Login Flow
1. Click Login
2. Enter credentials
3. Should redirect to dashboard (if backend is accessible)

---

## 🔄 Auto-Deployment Workflow

Once GitHub is connected:

```bash
# Make changes locally
git add src/pages/Login.jsx
git commit -m "Update login styling"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Installs dependencies
# 3. Runs build
# 4. Deploys to production
# 5. Notifies you with deployment URL

# Your new code is live in ~2-3 minutes!
```

---

## 📈 Deployment Status

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| Frontend | 🟡 Ready to Deploy | TBD | Use Vercel |
| Backend | ✅ Deployed | [Render/Railway] | Already deployed |
| Database | ✅ Deployed | [Neon] | Already deployed |

---

## Troubleshooting

### "Build Failed"
```bash
# Test locally first
npm run build
# If this works locally, should work on Vercel
```

### "Cannot GET /"
This is normal for React SPA. Vercel's `vercel.json` fixes it automatically.

### "CORS errors" from API
```
Access-Control-Allow-Origin header not present
```
Fix:
1. Get your Vercel domain
2. Update backend `CORS_ALLOWED_ORIGINS` to include it
3. Redeploy backend
4. Refresh frontend

### "White page, no errors"
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify `REACT_APP_BACKEND_URL` is set correctly

---

## Quick Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login (one-time)
vercel login

# Deploy to production
vercel --prod

# Deploy to preview (non-main branch)
vercel

# View deployment logs
vercel logs

# Remove production deployment
vercel remove --prod

# Check environment variables
vercel env ls
```

---

## Next Steps

1. ✅ Code is ready for Vercel
2. → Run `vercel --prod` command
3. → Get domain: `https://travel-companion-frontend.vercel.app`
4. → Add to backend `CORS_ALLOWED_ORIGINS`
5. → Test login flow
6. → (Optional) Buy custom domain and connect

---

## Resources

- Vercel Docs: https://vercel.com/docs
- React Deployment: https://vercel.com/docs/frameworks/react
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- Troubleshooting: https://vercel.com/support

---

**Ready to Deploy!** 🚀
