import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import LoginPage from "./components/auth/LoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { PatientRegistration } from "./components/registration/PatientRegistration";
import PatientQueue from "./components/queue/PatientQueue";
import { DoctorModule } from "./components/doctor/DoctorModule";
import { PharmacyDashboard } from "./components/pharmacy/PharmacyDashboard";
import StaffDashboard from "./components/Staff/StaffDashboard";
import { PharmacyModule } from "./components/pharmacy/PharmacyModule";
import SignupPage from "./components/auth/SignupPage";
import DoctorForm from "./components/auth/DoctorForm";
import Ai from "./components/doctor/ai";
import LabForm from "./components/LabModule/Lab";
import InPatientsForm from "./components/IP/In-Patients";

// A layout component for all authenticated pages
const AuthenticatedLayout: React.FC<{
  children: React.ReactNode;
  currentSection: string;
}> = ({ children, currentSection }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar activeSection={currentSection} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header currentSection={currentSection} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route for the Login page */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/doctor" element={<DoctorForm />} />
           <Route path="/sign" element={<SignupPage />} />
          <Route path="/ai" element={<Ai />} />
          <Route path="/lab" element={<LabForm />} />
           <Route path="/IP" element={<InPatientsForm />} />
          {/* Common Dashboard for all roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout currentSection="dashboard">
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Receptionist Routes */}
          <Route
            path="/registration"
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <AuthenticatedLayout currentSection="registration">
                  <PatientRegistration />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pre-opd"
            element={
              <ProtectedRoute
                allowedRoles={["receptionist", "doctor", "staff-nurse"]}
              >
                <AuthenticatedLayout currentSection="queue">
                  <PatientQueue />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor-module"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <AuthenticatedLayout currentSection="doctor">
                  <DoctorModule />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Pharmacist Routes */}
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute allowedRoles={["pharmacist"]}>
                <AuthenticatedLayout currentSection="pharmacy">
                  <PharmacyModule />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Nurse Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff-nurse"]}>
                <AuthenticatedLayout currentSection="staff">
                  <StaffDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route to redirect to login if no other route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
