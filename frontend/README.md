# Banking Ledger Frontend

A modern React + Vite application for the Banking Ledger system with authentication, account management, and transactions.

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
cp .env.example .env
```

### Configuration

Edit `.env` with your API endpoint:

```
VITE_API_URL=http://localhost:5000/api
```

### Running

Development:
```bash
npm run dev
```

Production build:
```bash
npm run build
```

## Features

- **User Authentication**: Register, login, logout with JWT
- **Account Management**: Create and manage multiple accounts
- **Transactions**: View balance and transaction history
- **Transfers**: Idempotent transfers between accounts
- **Real-time Balance**: Aggregated balance from MongoDB
- **Email Notifications**: Transaction alerts

## Project Structure

```
src/
├── api/                    (API client and endpoints)
├── pages/                  (Login, Register, Dashboard, Account Detail)
├── context/                (Auth context for state)
├── components/             (ProtectedRoute, etc)
├── styles/                 (CSS for all pages)
└── App.jsx                 (Router setup)
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`.

All authenticated requests automatically include the JWT token from localStorage.

## Building

```bash
npm run build
```

Output is in the `dist/` directory.
