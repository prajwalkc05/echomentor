# Production Setup Guide - Admin Panel & Environment

## ✅ Fixed Issues

### 1. **Admin Panel Not Working in Production**
**Problem**: Admin panel was using localhost or hardcoded URLs  
**Solution**: 
- Updated all admin API calls to use `API_BASE_URL` constant from environment variables
- Set `VITE_API_BASE_URL` in `.env.production` to backend domain
- Admin panel now correctly points to production backend

### 2. **Environment Variables Not Loading**
**Files Updated**:
- `AdminLogin.tsx` - Uses `API_BASE_URL` from env
- `AdminDashboard.tsx` - Uses `API_BASE_URL` from env
- `AdminUsers.tsx` - Uses `API_BASE_URL` from env
- `utils/api.ts` - Added warning if env var not set

---

## 🚀 Production Deployment Steps

### Frontend (Netlify/Vercel)

1. **Update Environment Variables**
   - Go to your deployment platform (Netlify/Vercel)
   - Add to Build Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   VITE_OPENROUTER_API_KEY=your-key-here
   VITE_GROQ_API_KEY=your-key-here
   VITE_YOUTUBE_API_KEY=your-key-here
   ```

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Trigger new deploy after adding environment variables

3. **Verify Admin Panel**
   - Admin button is hidden in production (not showing)
   - Direct URL: `/admin` should redirect to login
   - After login: admin panel should load data from production backend

### Backend (Render)

1. **Ensure Environment Variables Set**
   ```
   VITE_API_BASE_URL=https://echobackend-dexy.onrender.com
   MONGODB_URI=your-mongodb-url
   JWT_SECRET=your-secret
   ADMIN_EMAIL=admin@echomentor.com
   ADMIN_PASSWORD=admin123
   ```

2. **Verify Admin Routes**
   - Test admin login: `POST https://backend.com/api/admin/auth/login`
   - Test dashboard: `GET https://backend.com/api/admin/dashboard`

---

## 🔐 Admin Access in Production

### Login Page
- URL: `https://your-domain.com/admin`
- Email: `admin@echomentor.com`
- Password: `admin123`

### Why Admin Button is Hidden
- Production: Admin button intentionally removed from sidebar
- Development: Admin button visible in landing navbar
- Security: Harder to discover admin panel in production

### Direct Access
Even without button, you can access:
- URL: `https://your-domain.com/admin`
- Login required with admin credentials

---

## 📋 Configuration Checklist

- [ ] `.env.production` created with correct `VITE_API_BASE_URL`
- [ ] Netlify/Vercel environment variables updated
- [ ] Backend domain is publicly accessible
- [ ] Admin login credentials changed from defaults
- [ ] Backend `/api/admin/auth/login` endpoint working
- [ ] JWT_SECRET set in backend
- [ ] CORS configured for frontend domain
- [ ] Database connected and user data persisting
- [ ] Admin panel routes verified working
- [ ] Test admin login in production

---

## 🧪 Testing Production Admin Panel

1. **Test Admin Login**
   ```bash
   curl -X POST https://backend.com/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@echomentor.com","password":"admin123"}'
   ```

2. **Test Dashboard API**
   ```bash
   curl https://backend.com/api/admin/dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Test in Browser**
   - Open `https://your-frontend.com/admin`
   - Login with credentials
   - Verify data loads from backend

---

## 🔄 Environment Variables Summary

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:5000` | `https://backend-domain.com` |
| `VITE_OPENROUTER_API_KEY` | Local .env | Netlify/Vercel secrets |
| `VITE_GROQ_API_KEY` | Local .env | Netlify/Vercel secrets |
| `VITE_YOUTUBE_API_KEY` | Local .env | Netlify/Vercel secrets |

---

## 🚨 Troubleshooting

### Admin Panel Shows "API Connection Error"
1. Check `VITE_API_BASE_URL` in environment
2. Verify backend is running and accessible
3. Check browser console for CORS errors
4. Ensure JWT_SECRET matches in backend

### Admin Login Fails
1. Verify credentials: `admin@echomentor.com` / `admin123`
2. Check backend admin routes are deployed
3. Verify JWT signing is working
4. Check MongoDB connection

### Data Not Loading in Admin Dashboard
1. Verify admin token is stored in localStorage
2. Check backend admin routes return data
3. Verify database has records
4. Check browser network tab for API responses

---

## 📚 Additional Resources

- Full deployment guide: See `DEPLOYMENT_GUIDE.md`
- Backend setup: See backend `.env.example`
- Frontend setup: See `.env.example`

