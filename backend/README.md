# Banking Ledger System

A sophisticated double-entry banking ledger system built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **Double-Entry Bookkeeping**: All transactions are stored as DEBIT/CREDIT pairs via MongoDB aggregation
- **Idempotent Transfers**: Unique-indexed keys prevent double-spending under concurrent access
- **ACID Transactions**: MongoDB sessions with programmatic rollback for atomic operations
- **Append-Only Architecture**: Update/delete operations blocked via Mongoose pre-hooks for auditability
- **Stateless JWT Auth**: Token blacklist with TTL for secure logout
- **Email Notifications**: Transactional alerts for login, transfers, and failures via Nodemailer

## Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

```bash
cd backend
npm install
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:

```
MONGODB_URI=mongodb://localhost:27017/banking-ledger
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout and blacklist token

### Accounts

- `POST /api/accounts` - Create new account
- `GET /api/accounts` - List user's accounts
- `GET /api/accounts/:accountId` - Get account details

### Transactions

- `POST /api/transactions/transfer` - Execute transfer (idempotent)
- `GET /api/transactions/:accountId/balance` - Get account balance (aggregated)
- `GET /api/transactions/:accountId/history` - Get transaction history

## Architecture

### Models
- **User**: Authentication and account ownership
- **Account**: Bank accounts with account numbers
- **Transaction**: DEBIT/CREDIT ledger entries with idempotency keys
- **TokenBlacklist**: JWT token revocation with TTL expiry

### Key Design Patterns

1. **Idempotency**: All transfers use unique keys to safely retry
2. **ACID Transactions**: MongoDB sessions ensure atomicity
3. **Append-Only**: Pre-hooks prevent updates/deletes for audit trail
4. **Computed Balances**: Aggregation pipelines calculate balances (no stored state)
5. **Token Blacklist**: TTL-indexed documents auto-expire revoked tokens

## Development

Running tests:
```bash
npm test
```

The system enforces data integrity at multiple levels:
- Database constraints on unique keys
- Transaction sessions with rollback
- Pre-hooks blocking destructive operations
- Idempotency for safe retries
