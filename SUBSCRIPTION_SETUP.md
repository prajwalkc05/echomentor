# Dynamic Subscription System - Implementation Guide

## 🎯 Overview

EchoMentor now has a fully dynamic subscription system where:
- **Admin** controls pricing and features via MongoDB
- **Frontend** automatically updates without redeploy
- **Payments** processed via Razorpay
- **Analytics** tracks revenue and subscriptions

---

## 📋 Backend Setup

### 1. Install Dependencies

```bash
npm install razorpay
```

### 2. Environment Variables

Add to `.env`:

```env
RAZORPAY_KEY=<your_test_key>
RAZORPAY_SECRET=<your_test_secret>
```

Get keys from: https://dashboard.razorpay.com

### 3. Seed Default Plans

```bash
node src/seeds/subscription.seed.js
```

This creates 3 plans:
- **Free**: ₹0 (monthly)
- **Pro**: ₹199 (monthly)
- **Premium**: ₹1500 (yearly)

### 4. Database Models

**Subscription Schema:**
```javascript
{
  name: String (enum: ["Free", "Pro", "Premium"]),
  price: Number,
  billingCycle: String (enum: ["monthly", "yearly"]),
  features: [String],
  active: Boolean,
  timestamps: true
}
```

**Payment Schema:**
```javascript
{
  userId: ObjectId (ref: User),
  planId: ObjectId (ref: Subscription),
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  status: String (enum: ["pending", "success", "failed"]),
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  timestamps: true
}
```

**User Schema Updates:**
```javascript
subscriptionPlan: String (default: "Free"),
subscriptionData: {
  startDate: Date,
  endDate: Date,
  paymentId: String
}
```

---

## 🔌 Backend API Endpoints

### Public Endpoints

**GET** `/api/subscription/plans`
- Returns all active subscription plans
- No authentication required
- Response:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "name": "Free",
      "price": 0,
      "billingCycle": "monthly",
      "features": ["20 Chats/Day", ...],
      "active": true
    }
  ]
}
```

### Protected Endpoints (Auth Required)

**POST** `/api/subscription/create-order`
- Initiates Razorpay order
- Body: `{ planId: "..." }`
- Response: `{ order: {...}, payment: {...} }`

**POST** `/api/subscription/verify-payment`
- Verifies Razorpay signature
- Body: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }`
- Updates user subscription on success

**GET** `/api/subscription/payment-history`
- Returns user's payment history
- Response: `[ { planId, amount, status, createdAt, ... } ]`

### Admin Endpoints (Admin Auth Required)

**GET** `/api/admin/subscriptions`
- Get all plans (active + inactive)

**POST** `/api/admin/subscriptions`
- Create new plan
- Body: `{ name, price, billingCycle, features }`

**PUT** `/api/admin/subscriptions/:id`
- Update plan details
- Body: `{ price, features, active, ... }`

**DELETE** `/api/admin/subscriptions/:id`
- Deactivate a plan (soft delete)

**GET** `/api/admin/subscription/analytics`
- Revenue stats, plan distribution, monthly trends

---

## 💻 Frontend Setup

### 1. Environment Variables

Add to `.env`:

```env
VITE_RAZORPAY_KEY=<your_test_key>
```

### 2. Add Razorpay Script

In `index.html`, add before `</head>`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 3. SubscriptionPage Component

Located at: `src/pages/SubscriptionPage.tsx`

Features:
- Fetches plans from `/api/subscription/plans`
- Displays 3 pricing cards (Free, Pro, Premium)
- Handles Razorpay payment flow
- Shows feature comparison table
- FAQ section

Usage:
```tsx
import SubscriptionPage from './pages/SubscriptionPage';

// In app routing
{currentPage === 'subscription' && <SubscriptionPage />}
```

### 4. Admin Subscription Management

Located at: `src/admin/pages/SubscriptionsPage.tsx`

Features:
- View all plans in table
- Add new plans
- Edit existing plans (price, features, billing cycle)
- Delete/deactivate plans
- Real-time updates

---

## 🔄 Complete User Flow

```
1. User visits /subscription
   ↓
2. Frontend fetches plans from /api/subscription/plans
   ↓
3. User selects Pro plan → clicks Subscribe
   ↓
4. Frontend calls POST /api/subscription/create-order
   ↓
5. Backend creates Razorpay order, returns orderId
   ↓
6. Frontend opens Razorpay checkout modal
   ↓
7. User completes payment in Razorpay
   ↓
8. Razorpay returns payment details
   ↓
9. Frontend calls POST /api/subscription/verify-payment
   ↓
10. Backend verifies signature, updates user.subscriptionPlan
    ↓
11. Sets subscription end date:
    - Monthly: +1 month
    - Yearly: +1 year
    ↓
12. User can access Pro features immediately
```

---

## 🎨 Admin Flow

```
Admin Panel → Subscriptions Tab
    ↓
View current plans in table
    ↓
[Edit] Plan → Change price 199→299
    ↓
[Save] → Updates MongoDB
    ↓
[Frontend refresh] → Fetches new price
    ↓
New users see ₹299
```

---

## 💳 Razorpay Integration

### Test Mode Credentials

For testing, use Razorpay's test mode:
- Dashboard: https://dashboard.razorpay.com
- Get Test Keys from: Settings → API Keys
- Test Card: `4111111111111111` (Visa)
- Any future expiry date
- Any 3-digit CVV

### Production Mode

1. Go to Settings → API Keys
2. Switch to Live mode
3. Copy Live keys
4. Update `.env` with live keys
5. Add live URL to Razorpay dashboard

---

## 📊 Admin Analytics

**GET** `/api/admin/subscription/analytics`

Returns:
```json
{
  "totalRevenue": 5999,
  "planDistribution": [
    { "_id": "Free", "count": 150 },
    { "_id": "Pro", "count": 45 },
    { "_id": "Premium", "count": 12 }
  ],
  "monthlyRevenue": [
    { "_id": "2024-01", "total": 2500 },
    { "_id": "2024-02", "total": 3499 }
  ]
}
```

---

## 🚀 Deployment Checklist

### Backend (Render)

1. Add Razorpay keys to environment variables
2. Seed plans:
   ```bash
   npm install
   node src/seeds/subscription.seed.js
   ```
3. Deploy

### Frontend (Netlify/Vercel)

1. Add `VITE_RAZORPAY_KEY` to build environment
2. Deploy

---

## 🧪 Testing

### Create Test Order

```bash
curl -X POST http://localhost:8000/api/subscription/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId": "PLAN_ID_HERE"}'
```

### Get Plans

```bash
curl http://localhost:8000/api/subscription/plans
```

### Admin: Create Plan

```bash
curl -X POST http://localhost:8000/api/admin/subscriptions \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro",
    "price": 199,
    "billingCycle": "monthly",
    "features": ["Unlimited Chat", "Unlimited Resume"]
  }'
```

---

## 🐛 Troubleshooting

### Payment fails with "Invalid signature"
- Verify Razorpay secret key matches in `.env`
- Check payment ID format

### Plans not updating in frontend
- Hard refresh (Cmd+Shift+R)
- Check `/api/subscription/plans` endpoint
- Verify MongoDB connection

### Admin can't modify plans
- Check admin auth token is valid
- Verify admin middleware is working
- Check user role in database

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `src/modules/subscription/subscription.model.js` | DB schemas |
| `src/modules/subscription/subscription.service.js` | Business logic |
| `src/modules/subscription/subscription.controller.js` | API handlers |
| `src/modules/subscription/subscription.routes.js` | Route definitions |
| `src/admin/pages/SubscriptionsPage.tsx` | Admin management UI |
| `src/pages/SubscriptionPage.tsx` | User pricing page |
| `src/seeds/subscription.seed.js` | Initialize plans |

---

## ✅ Features Summary

✓ Dynamic subscription plans (stored in MongoDB)
✓ Admin can change prices anytime
✓ Frontend auto-updates without redeploy
✓ Razorpay payment integration
✓ User subscription tracking
✓ Revenue analytics
✓ Feature comparison table
✓ Subscription history
✓ Plan deactivation support
✓ Monthly & yearly billing cycles
