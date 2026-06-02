# EchoMentor Deployment Guide

## 🚀 Frontend Deployment (Netlify/Vercel)

### Prerequisites
- GitHub account
- Netlify/Vercel account

### Environment Variables Setup

#### Development (.env.local)
```env
VITE_API_BASE_URL=http://localhost:5000
```

#### Production (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Netlify Deployment

1. **Connect GitHub Repository**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose the repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add these environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxx
   VITE_GROQ_API_KEY=gsk_xxxxx
   VITE_YOUTUBE_API_KEY=AIzaSy_xxxxx
   ```

4. **Domain Configuration**
   - Add custom domain in Site Settings → Domain Management
   - Configure DNS settings with your domain provider

### Vercel Deployment

1. **Connect GitHub Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Select GitHub and authorize
   - Choose the repository

2. **Environment Variables**
   - In Project Settings → Environment Variables
   - Add:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxx
   VITE_GROQ_API_KEY=gsk_xxxxx
   VITE_YOUTUBE_API_KEY=AIzaSy_xxxxx
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Important Notes

- **Admin Panel**: Only visible in development mode (`import.meta.env.DEV`)
- **Admin Login**: Email: `admin@echomentor.com` | Password: `admin123`
- **Backend URL**: Must be updated in environment variables for each environment

---

## 🔌 Backend Deployment (Render)

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/echomentor

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AI Services
OPENROUTER_API_KEY=sk-or-v1-xxxxx
GROQ_API_KEY=gsk_xxxxx

# Firebase (optional)
FIREBASE_API_KEY=xxxxx
FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxxxx

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Admin Credentials
ADMIN_EMAIL=admin@echomentor.com
ADMIN_PASSWORD=admin123
```

### Deploy Steps

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub repository
   - Fill in service details:
     - Name: `echomentor-backend`
     - Runtime: `Node`
     - Build command: `npm install`
     - Start command: `npm start`

3. **Add Environment Variables**
   - Go to Environment
   - Add all variables from above

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

---

## 🔐 Admin Panel Access

### Development
1. Click "Admin" button in landing page navbar (top-right)
2. Login with credentials below

### Production
- Admin button is hidden
- Direct URL access: `/admin`
- Still requires credentials

### Admin Credentials
```
Email: admin@echomentor.com
Password: admin123
```

---

## 📱 Frontend to Backend Communication

### How It Works
1. Frontend sends requests to `VITE_API_BASE_URL`
2. All authenticated requests include JWT token in header
3. Admin requests include admin token

### Example Request
```javascript
fetch('https://backend-domain.com/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## 🐛 Troubleshooting

### Admin Panel Not Showing
- **Development**: Check if `import.meta.env.DEV` is true
- **Production**: Admin button intentionally hidden, use direct URL `/admin`

### CORS Errors
- Update `FRONTEND_URL` in backend environment variables
- Ensure backend has proper CORS middleware

### API Connection Issues
- Verify `VITE_API_BASE_URL` matches backend domain
- Check that backend URL doesn't have trailing slash
- Ensure network requests are not blocked by firewall

### Admin Login Fails
- Verify credentials are correct
- Check JWT_SECRET in backend matches
- Ensure admin token is stored in localStorage

---

## 📚 API Endpoints

### Admin Routes
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/ai-usage` - AI usage analytics

### User Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get profile

### AI Routes
- `POST /api/ai/chat` - Send AI chat message
- `GET /api/ai/history` - Get chat history

---

## 🔄 Continuous Integration

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## ✅ Checklist

- [ ] Environment variables configured
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] CORS properly configured
- [ ] Admin login credentials changed
- [ ] JWT_SECRET set securely
- [ ] Database backups scheduled
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured
- [ ] Email service configured

