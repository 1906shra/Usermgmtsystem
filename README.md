# User Management System

A full-stack MERN web application for managing user accounts with role-based access control (RBAC).

## Features

- **JWT Authentication** — Access + Refresh token flow
- **Role-Based Access Control** — Admin, Manager, User roles
- **User Lifecycle Management** — Create, Read, Update, Soft-Delete
- **Audit Tracking** — createdAt, updatedAt, createdBy, updatedBy
- **Paginated & Searchable User List** — Filter by role and status
- **Responsive UI** — Clean dark-themed interface

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Context API, Vite |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Deployment | Render (backend), Vercel (frontend) |

## Role Permissions

| Action | Admin | Manager | User |
|--------|-------|---------|------|
| View all users | ✅ | ✅ | ❌ |
| View user details | ✅ | ✅ (non-admin) | ❌ |
| Create users | ✅ | ❌ | ❌ |
| Edit any user | ✅ | ✅ (non-admin, no role change) | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Deactivate users | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # JWT helpers, seed script
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + API calls
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Page components
│   │   ├── styles/          # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Seed the database with demo users
npm run seed

# Start development server
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Set VITE_API_URL to your backend URL

# Start development server
npm run dev
```

### Environment Variables

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| Manager | manager@example.com | Manager@123 |
| User | user@example.com | User@123 |

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login | Public |
| POST | /api/auth/refresh | Refresh token | Public |
| POST | /api/auth/logout | Logout | Required |
| GET | /api/auth/me | Get current user | Required |

### Users
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | /api/users | List users (paginated) | Admin, Manager |
| POST | /api/users | Create user | Admin |
| GET | /api/users/profile | Own profile | All |
| PUT | /api/users/profile | Update own profile | All |
| GET | /api/users/:id | Get user by ID | Admin, Manager |
| PUT | /api/users/:id | Update user | Admin, Manager |
| DELETE | /api/users/:id | Deactivate user | Admin |

## Deployment

### Backend (Render)
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `.env.example`

### Frontend (Vercel)
1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens (15min) + refresh tokens (7 days)
- Inactive users blocked at authentication
- Input validation on all endpoints
- Password never returned in API responses
- Rate limiting (100 req/15min)
- Helmet.js security headers
- CORS configured for specific origins
- Environment variables for all secrets
