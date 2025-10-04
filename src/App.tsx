// App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout"; // Use named import
import LoginPage from "./components/auth/LoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { PatientRegistration } from "./components/registration/PatientRegistration";
import PatientQueue from "./components/queue/PatientQueue";
import { DoctorModule } from "./components/doctor/DoctorModule";
import StaffDashboard from "./components/Staff/StaffDashboard";
import { PharmacyModule } from "./components/pharmacy/PharmacyModule";
import SignupPage from "./components/auth/SignupPage";
import DoctorForm from "./components/auth/DoctorForm";
import Ai from "./components/doctor/Ai";
import IPDQueue from "./components/queue/IPDQueue";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/doctor" element={<DoctorForm />} />
          <Route path="/sign" element={<SignupPage />} />
          <Route path="/ai" element={<Ai />} />

          {/* Protected routes wrapped with the Layout component */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout currentSection="dashboard">
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/registration"
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <Layout currentSection="registration">
                  <PatientRegistration />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pre-opd"
            element={
              <ProtectedRoute
                allowedRoles={["receptionist", "doctor", "staff-nurse"]}
              >
                <Layout currentSection="queue">
                  <PatientQueue />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* NEW: IPD Queue Route */}
          <Route
            path="/ipd-queue"
            element={
              <ProtectedRoute
                allowedRoles={["doctor", "staff-nurse", "receptionist"]}
              >
                <Layout currentSection="ipd-queue">
                  {" "}
                  {/* <-- Section ID matches sidebar item ID */}
                  <IPDQueue />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-module"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <Layout currentSection="doctor">
                  <DoctorModule />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute allowedRoles={["pharmacist"]}>
                <Layout currentSection="pharmacy">
                  <PharmacyModule />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff-nurse"]}>
                <Layout currentSection="staff">
                  <StaffDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for unhandled paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
