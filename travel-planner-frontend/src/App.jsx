import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import PrivateRoute from "./components/common/PrivateRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TripsPage from "./pages/TripsPage";
import TripDetailPage from "./pages/TripDetailPage";
import CreateTripPage from "./pages/CreateTripPage";
import ItineraryPage from "./pages/ItineraryPage";
import BookingsPage from "./pages/BookingsPage";
import BudgetPage from "./pages/BudgetPage";
import ProfilePage from "./pages/ProfilePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersList from "./pages/Admin/UsersList";
import AuditLogs from "./pages/Admin/AuditLogs";
import OfflineIndicator from "./components/common/OfflineIndicator";
import NotFoundPage from "./pages/NotFoundPage";
import TemplatesPage from "./pages/TemplatesPage";
import AddDestinationPage from "./pages/AddDestinationPage";
import EditDestinationPage from "./pages/EditDestinationPage";
import ChecklistPage from "./pages/ChecklistPage";
import APITest from "./components/Test/APITest";
import InvitationsPage from "./pages/InvitationsPage";
import TripMapPage from "./pages/TripMapPage";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/trips"
              element={
                <PrivateRoute>
                  <TripsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/trip/:id"
              element={
                <PrivateRoute>
                  <TripDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-trip"
              element={
                <PrivateRoute>
                  <CreateTripPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-trip/:id"
              element={
                <PrivateRoute>
                  <CreateTripPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/trip/:id/itinerary"
              element={
                <PrivateRoute>
                  <ItineraryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <PrivateRoute>
                  <BookingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/trip/:id/bookings"
              element={
                <PrivateRoute>
                  <BookingsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/budget"
              element={
                <PrivateRoute>
                  <BudgetPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/trip/:id/budget"
              element={
                <PrivateRoute>
                  <BudgetPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <PrivateRoute>
                  <RecommendationsPage />
                </PrivateRoute>
              }
            />

            {/* Invitations Route */}
            <Route
              path="/invitations"
              element={
                <PrivateRoute>
                  <InvitationsPage />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute adminOnly>
                  <UsersList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <PrivateRoute adminOnly>
                  <AuditLogs />
                </PrivateRoute>
              }
            />

            {/* Destination Routes */}
            <Route
              path="/trip/:id/add-destination"
              element={
                <PrivateRoute>
                  <AddDestinationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/trip/:id/edit-destination/:destinationId"
              element={
                <PrivateRoute>
                  <EditDestinationPage />
                </PrivateRoute>
              }
            />

            {/* Templates Route */}
            <Route
              path="/templates"
              element={
                <PrivateRoute>
                  <TemplatesPage />
                </PrivateRoute>
              }
            />

            {/* Checklist Route */}
            <Route
              path="/trip/:id/checklist"
              element={
                <PrivateRoute>
                  <ChecklistPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/trip/:id/map"
              element={
                <PrivateRoute>
                  <TripMapPage />
                </PrivateRoute>
              }
            />

            {/* API Test Route (remove in production) */}
            <Route path="/api-test" element={<APITest />} />

            {/* 404 Route - Always last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <OfflineIndicator />
    </div>
  );
}

export default App;
