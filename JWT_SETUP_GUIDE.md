# JWT Authentication Setup Guide

## What is JWT?

JWT (JSON Web Token) is a stateless authentication method. After login, the server gives the client a token that proves they're logged in. The client sends this token with every request.

## JWT Configuration

### 1. Backend Setup (.env)

Edit `backend/.env`:

```env
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRY=24h
TOKEN_BLACKLIST_CLEANUP_INTERVAL=3600000
```

**Important:** Generate a strong secret key. You can use:

```bash
# In backend directory, run this once:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

### 2. How JWT Works in Backend

**Login Flow:**
```
User sends email + password
  ↓
Backend validates credentials
  ↓
Backend creates JWT token (expires in 24h)
  ↓
Token sent to frontend
  ↓
Frontend stores token in localStorage
```

**Every API Request:**
```
Frontend sends: Authorization: Bearer <token>
  ↓
Backend middleware verifies token signature
  ↓
If valid → Process request
If invalid/expired → Return 401 Unauthorized
```

### 3. Backend Files to Know

**AuthService** (`src/services/AuthService.js`):
- Generates JWT tokens after successful login
- Handles logout by blacklisting tokens

**Middleware** (`src/middleware/auth.js`):
- `authMiddleware` - Verifies JWT on protected routes
- Checks if token is blacklisted
- Extracts user info from token

**Routes** - Protected routes use `authMiddleware`:
```javascript
router.get('/accounts', authMiddleware, AccountController.getAccounts);
//                      ↑ This checks JWT token
```

### 4. Frontend Setup

**API Client** (`src/api/client.js`):
```javascript
// Automatically adds token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**AuthContext** (`src/context/AuthContext.jsx`):
```javascript
// Stores token and user info
const [token, setToken] = useState(localStorage.getItem('token'));
```

### 5. Complete Login Flow Example

**User registers/logs in:**
```
1. User enters email: test@gmail.com, password: mypassword
2. Frontend sends to: POST /api/auth/login
3. Backend:
   - Checks email exists
   - Verifies password (hashed)
   - Creates JWT: eyJhbGc...xyz (contains userId, email)
   - Returns token to frontend
4. Frontend:
   - Stores token in localStorage
   - Sets user state
   - Redirects to /dashboard
```

**User makes transfer:**
```
1. Frontend: POST /api/transactions/transfer
   Header: Authorization: Bearer eyJhbGc...xyz
   Body: { fromAccountId, toAccountId, amount }

2. Backend middleware:
   - Extracts token from header
   - Verifies signature with JWT_SECRET
   - Checks if blacklisted
   - Extracts userId from token
   - Sets req.user = { userId, email }

3. Controller uses req.user.userId for the transfer
```

**User logs out:**
```
1. Frontend: POST /api/auth/logout
   Header: Authorization: Bearer eyJhbGc...xyz

2. Backend:
   - Adds token to blacklist (TokenBlacklist collection)
   - Expires automatically after 24h
   - Frontend removes token from localStorage

3. Next request without token → Returns 401 → Frontend redirects to /login
```

## Step-by-Step Setup

### Step 1: Generate Secret Key

```bash
cd backend
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 2: Update .env File

```bash
# backend/.env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRY=24h
TOKEN_BLACKLIST_CLEANUP_INTERVAL=3600000
```

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

### Step 4: Test JWT

**Option A: Using cURL**

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "test@example.com" }
}

# 2. Copy the token and use it
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Make authenticated request
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $TOKEN"
```

**Option B: Using Postman**

1. Get token from login request
2. Go to "Headers" tab
3. Add: `Authorization: Bearer <your_token_here>`
4. Send request

**Option C: Using Frontend**

1. Start frontend: `npm run dev`
2. Register at http://localhost:5173/register
3. Should redirect to dashboard (token stored automatically)
4. Check browser DevTools:
   - Application → LocalStorage → Look for `token`

## JWT Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWEwMDAwMDAwMDAwMDAwMDAwMDAwMDEiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjM4MzYwMDAwLCJleHAiOjE2MzgyNDAwMDB9.signature

Split into 3 parts:
1. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 = Header (algorithm, type)
2. eyJ1c2VySWQiOi... = Payload (userId, email, expiry)
3. signature = Signature (verified with JWT_SECRET)
```

## Decode Token (Optional)

Visit https://jwt.io and paste your token to see decoded content.

## Security Best Practices

✅ **Do:**
- Use strong `JWT_SECRET` (minimum 32 characters)
- Set short expiry times (24h recommended)
- Store token in localStorage or httpOnly cookie
- Send token in Authorization header
- Use HTTPS in production
- Refresh token before expiry (optional)

❌ **Don't:**
- Share JWT_SECRET in code/GitHub
- Use weak secrets like "secret123"
- Store token in URL/query params
- Trust token on frontend (verify on backend)
- Use old/expired tokens

## Troubleshooting

**Problem: "Invalid or expired token"**
- Check if token was copied correctly
- Check if 24h expiry passed
- Verify JWT_SECRET in .env matches backend

**Problem: Token not sent with requests**
- Check if localStorage has `token` key
- Check browser Network tab → see Authorization header
- Verify Axios interceptor is running

**Problem: Logout not working**
- Backend needs to add token to blacklist
- Check TokenBlacklist collection in MongoDB
- Wait for token to expire (24h)

**Problem: "No token provided"**
- Frontend needs to call login first
- Token must be stored in localStorage
- Check if browser localStorage is enabled

## Token Refresh (Advanced)

Currently using 24h expiry. For production, implement refresh tokens:

```javascript
// Optional: Add refresh token logic
// When main token expires, use refresh token to get new one
// Keeps user logged in longer without re-entering password
```

## Next Steps

1. ✅ Generate strong JWT_SECRET
2. ✅ Update backend/.env
3. ✅ Restart backend
4. ✅ Test login flow in frontend
5. ✅ Verify token in browser DevTools
6. ✅ Make authenticated API calls

All JWT logic is already implemented. Just configure the secret key and test!
