import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useRole } from './store/RoleContext';
import { Toaster } from './components/ui/toaster';

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
   AuthRedirect Component
   Redirects user if they have a specific role
------------------------------------------ */
function AuthRedirect({ 
  role: targetRole, 
  to, 
  children 
}: { 
  role: 'admin' | 'member'; 
  to: string; 
  children: React.ReactNode 
}) {
  const { role, isAuthenticated } = useRole();
  
  if (isAuthenticated && role === targetRole) {
    return <Navigate to={to} replace />;
  }
  
  return <>{children}</>;
}

/* -----------------------------------------
   App Component
   Defines all routes of the app
------------------------------------------ */
function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Primary Landing: User Discovery (Public) */}
        <Route element={<UserLayout />}>
          <Route 
            path="/" 
            element={
              <AuthRedirect role="admin" to="/admin">
                <UserCatalog />
              </AuthRedirect>
            } 
          />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <UserLayout />
          }
        >
          <Route path="catalog" element={<Navigate to="/" replace />} />
          <Route path="borrowed" element={<UserBorrowed />} />
          <Route path="reservations" element={<UserReservation />} />
          <Route path="fines" element={<UserFines />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin Routes (Relocated to /admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="members" element={<Members />} />
          <Route path="borrowing" element={<Borrowing />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="fines" element={<FinesList />} />
        </Route>

        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
