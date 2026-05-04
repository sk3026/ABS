# JWT Quick Reference

## 1️⃣ Generate Secret Key (Run Once)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output → Paste in `backend/.env` as `JWT_SECRET`

## 2️⃣ Update backend/.env

```env
JWT_SECRET=your_generated_secret_here
JWT_EXPIRY=24h
TOKEN_BLACKLIST_CLEANUP_INTERVAL=3600000
```

## 3️⃣ Start Backend

```bash
cd backend
npm run dev
```

## 4️⃣ Test Flow

### Option A: cURL Commands

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"John","lastName":"Doe"}'

# Response: { "token": "eyJhb...", "user": {...} }

# Copy token and test protected route
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer eyJhb..."
```

### Option B: Frontend Test

```bash
cd frontend
npm run dev
# Open http://localhost:5173
# Register → Auto logs in → Check DevTools LocalStorage for "token"
```

### Option C: Postman

1. POST to `http://localhost:5000/api/auth/register`
2. Copy `token` from response
3. In Headers tab: `Authorization: Bearer <token>`
4. GET to `http://localhost:5000/api/accounts`

## JWT Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │ { email, password }
       ▼
┌─────────────────────────┐
│   Backend               │
│ - Verify credentials    │
│ - Create JWT token      │
│ - Return token          │
└──────┬──────────────────┘
       │
       │ 2. Response: { token: "abc..." }
       ▼
┌──────────────────────────┐
│   Frontend               │
│ - Store in localStorage  │
│ - Redirect to dashboard  │
└──────┬───────────────────┘
       │
       │ 3. GET /api/accounts
       │ Header: Authorization: Bearer abc...
       ▼
┌──────────────────────────┐
│   Backend Middleware     │
│ - Verify token           │
│ - Extract userId         │
│ - Process request        │
└──────┬───────────────────┘
       │
       │ 4. Response: [accounts...]
       ▼
┌─────────────┐
│   Frontend  │ ✅ Logged in & authenticated
└─────────────┘
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Invalid token" | Regenerate JWT_SECRET, restart backend |
| "No token provided" | Make sure to login first |
| Token not in headers | Check Axios interceptor in `src/api/client.js` |
| "Unauthorized" on protected routes | Verify token not expired (24h) |
| Logout not working | Token should be added to blacklist |

## Files to Check

| File | Purpose |
|------|---------|
| `backend/.env` | JWT configuration |
| `backend/src/services/AuthService.js` | Token generation |
| `backend/src/middleware/auth.js` | Token verification |
| `frontend/src/api/client.js` | Token auto-attach to requests |
| `frontend/src/context/AuthContext.jsx` | Token storage & state |

## Verify Setup

✅ Check backend/.env has JWT_SECRET
✅ Backend running: `npm run dev`
✅ Frontend can login successfully
✅ Token appears in browser localStorage
✅ Protected API routes work with token
✅ Logout removes token from localStorage

**All JWT logic is already implemented!** Just need to:
1. Generate secret key
2. Update .env file
3. Test the flow
