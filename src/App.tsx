import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useRole } from './store/RoleContext';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';

// Auth
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrowing from './pages/Borrowing';
import Reservations from './pages/Reservations';
import FinesList from '@/pages/FinesList';
import NotFound from './pages/NotFound';

// User Pages
import UserCatalog from './pages/UserCatalog';
import UserBorrowed from './pages/UserBorrowed';
import UserReservation from './pages/UserReservation';
import UserFines from './pages/UserFines';
import UserProfile from './pages/UserProfile';

/* -----------------------------------------
   ProtectedRoute Component
   Wraps routes to prevent access if not logged in
------------------------------------------ */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useRole();
  // If user is logged in, render children; otherwise redirect to /login
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/* -----------------------------------------
   App Component
   Defines all routes of the app
------------------------------------------ */
function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Default page for / */}
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="members" element={<Members />} />
        <Route path="borrowing" element={<Borrowing />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="fines" element={<FinesList />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            {/* UserLayout wraps all user pages */}
            <UserLayout>
              <Outlet /> {/* Outlet is required to render nested routes */}
            </UserLayout>
          </ProtectedRoute>
        }
      >
        <Route path="catalog" element={<UserCatalog />} />
        <Route path="borrowed" element={<UserBorrowed />} />
        <Route path="reservations" element={<UserReservation />} />
        <Route path="fines" element={<UserFines />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* 404 - Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
