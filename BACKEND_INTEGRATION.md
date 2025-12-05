# Backend Integration Guide

## Overview

Your library management system now has full backend integration. The React frontend connects to your Express.js/MongoDB backend.

## Architecture

```
┌─────────────────────────┐
│  React Frontend (Vite)  │
│   Port: 5173 (dev)      │
└────────────┬────────────┘
             │
        HTTPS / JSON
             │
┌────────────▼────────────┐
│  Express.js Backend     │
│   Port: 8080            │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   MongoDB Database      │
│   (Atlas)               │
└─────────────────────────┘
```

## Environment Setup

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend (Backend/config.env)

```env
NODE_ENV=development
PORT=8080
USER=karim
PASSWORD=123456
DATABASE=mongodb+srv://karimshawky20005_db_user:<PASSWORD>@cluster0.z5pmtrh.mongodb.net/?appName=Cluster0
DB_PASSWORD=0KkvA5HbnSEiVxYr
JWT_SECRET=your_secret_key_here
```

## API Endpoints

### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (returns JWT token)
- `GET /auth/profile` - Get current user profile (requires auth)

### Books (`/api/v1/books`)

- `GET /api/v1/books` - Get all books / search / filter
- `GET /api/v1/books/:id` - Get single book
- `POST /api/v1/books` - Create book (admin only)
- `PATCH /api/v1/books/:id` - Update book (admin only)
- `DELETE /api/v1/books/:id` - Delete book (admin only)

### Borrowing (`/api/v1/borrow`)

- `POST /api/v1/borrow/:bookId` - Borrow a book
- `POST /api/v1/return/:bookId` - Return a book
- `GET /api/v1/borrow/history/:userId` - Get borrow history
- `GET /api/v1/borrow/active` - Get active borrows

### Fines (`/fines`)

- `GET /fines/unpaid/:userId` - Get unpaid fines
- `POST /fines/pay/:fineId` - Pay a fine (admin only)
- `GET /fines/all` - Get all fines (admin only)

### Reservations (`/reservations`)

- `POST /reservations` - Create reservation
- `GET /reservations` - Get all reservations
- `GET /reservations/user/:userId` - Get user reservations
- `DELETE /reservations/:id` - Cancel reservation

## Frontend API Services

All API calls are through TypeScript services in `src/api/`:

### Available Services

1. **authApi** (`src/api/authApi.ts`)

   - `register()` - Register user
   - `login()` - Login user
   - `getProfile()` - Get current user
   - `logout()` - Clear stored tokens
   - `isAuthenticated()` - Check if logged in
   - `isAdmin()` - Check if user is admin

2. **bookApi** (`src/api/bookApi.ts`)

   - `getAll()` - Get all books
   - `getById()` - Get single book
   - `search()` - Search books
   - `getByCategory()` - Filter by category
   - `create()` - Add new book (admin)
   - `update()` - Update book (admin)
   - `delete()` - Delete book (admin)

3. **borrowApi** (`src/api/borrowApi.ts`)

   - `borrowBook()` - Borrow a book
   - `returnBook()` - Return a book
   - `getBorrowHistory()` - Get borrow records
   - `getActiveBorrows()` - Get active borrows
   - `getOverdueBooks()` - Get overdue books

4. **fineApi** (`src/api/fineApi.ts`)

   - `getUnpaidFines()` - Get user's unpaid fines
   - `getUserFines()` - Get all user fines
   - `payFine()` - Pay a fine
   - `getAllFines()` - Get all fines (admin)

5. **memberApi** (`src/api/memberApi.ts`)

   - `getAll()` - Get all members (admin)
   - `getById()` - Get member details
   - `update()` - Update member
   - `delete()` - Delete member (admin)

6. **reservationApi** (`src/api/reservationApi.ts`)
   - `create()` - Create reservation
   - `getUserReservations()` - Get user reservations
   - `getAll()` - Get all reservations (admin)
   - `cancel()` - Cancel reservation

## Running the Application

### Terminal 1 - Start Backend

```powershell
cd Backend
npm install
node server.js
```

Backend runs on: `http://localhost:8080`

### Terminal 2 - Start Frontend

```powershell
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Authentication Flow

1. User registers/logs in via `/login` page
2. Backend returns JWT token
3. Token stored in `localStorage` as `authToken`
4. All subsequent API requests include token in header: `Authorization: Bearer <token>`
5. Backend validates token with `protect` middleware
6. Token expires in 7 days (configurable in backend)

## Role-Based Access

### Admin Features

- Add/Edit/Delete books
- View all fines
- View all members
- View all reservations and borrow records
- Access to reports & analytics

### Member Features

- View books
- Borrow/return books
- View own fines
- Make reservations
- View own profile

## API Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    "books": [...],
    "message": "..."
  }
}
```

### Error Response

```json
{
  "message": "Error description",
  "error": "Detailed error"
}
```

## Database Models

- **User** - User accounts (admin/member roles)
- **Book** - Book catalog
- **Borrow** - Borrowing records
- **Fine** - Fine records
- **Reservation** - Book reservations

## Troubleshooting

### Backend won't start

- Check MongoDB credentials in `Backend/config.env`
- Ensure MongoDB Atlas has your IP whitelisted
- Check port 8080 is not in use

### Frontend API errors

- Verify `VITE_API_BASE_URL` in `.env` points to backend
- Check backend is running and accessible
- Check browser console for error details
- Verify JWT token is valid (may have expired)

### CORS errors

- Backend already has CORS enabled
- Ensure frontend URL matches backend's allowed origins

## Next Steps

1. Test login/register flow
2. Add books via admin dashboard
3. Test borrow/return functionality
4. Verify fines calculation
5. Test role-based access
6. Deploy to production

## Security Notes

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt
- Admin routes protected with `adminOnly` middleware
- All sensitive operations require authentication
- Environment variables never exposed to frontend

---

**Integration Status**: ✅ Complete
**Last Updated**: December 5, 2025
