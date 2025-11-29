import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRole } from './store/RoleContext';
import { Outlet } from "react-router-dom";

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';

import  UserLayout from './components/layout/UserLayout';


// Auth
import Login from './pages/Login';

// Admin Pages (your existing pages)
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrowing from './pages/Borrowing';
import Reservations from './pages/Reservations';
import NotFound from './pages/NotFound';
import FinesList from '@/pages/FinesList';

// User Pages
import UserCatalog from './pages/UserCatalog';
import UserBorrowed from './pages/UserBorrowed';
import UserReservation from './pages/UserReservation';
import UserFines from './pages/UserFines';
import UserProfile from './pages/UserProfile';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useRole();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes - Keep your exact URLs */}
        <Route
          path="/"
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

        {/* User Routes */}
                    <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Outlet />
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


        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  
  );
}

export default App;