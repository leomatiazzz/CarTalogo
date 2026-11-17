import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AdminsPage } from './pages/AdminsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes with Navbar */}
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-[#20242B] flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <VehiclesPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Admin-only Route */}
          <Route
            path="/admins"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div className="min-h-screen bg-[#20242B] flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <AdminsPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/vehicles" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
