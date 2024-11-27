import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (we'll create these next)
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerTeam from './pages/manager/Team';
import ManagerAnalytics from './pages/manager/Analytics';
import ReporteeDashboard from './pages/reportee/Dashboard';
import ReporteeEvaluations from './pages/reportee/Evaluations';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="admin">
                  <Layout>
                    <AdminUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute role="admin">
                  <Layout>
                    <AdminAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute role="manager">
                  <Layout>
                    <ManagerDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/team"
              element={
                <ProtectedRoute role="manager">
                  <Layout>
                    <ManagerTeam />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/analytics"
              element={
                <ProtectedRoute role="manager">
                  <Layout>
                    <ManagerAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Reportee Routes */}
            <Route
              path="/reportee"
              element={
                <ProtectedRoute role="reportee">
                  <Layout>
                    <ReporteeDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportee/evaluations"
              element={
                <ProtectedRoute role="reportee">
                  <Layout>
                    <ReporteeEvaluations />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
