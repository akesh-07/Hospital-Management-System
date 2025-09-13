import React, { useState } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { PatientRegistration } from "./components/registration/PatientRegistration";
import PatientQueue from "./components/queue/PatientQueue";
import { VitalsAssessment } from "./components/vitals/VitalsAssessment";
import { DoctorModule } from "./components/doctor/DoctorModule";
import { PrescriptionModule } from "./components/prescription/PrescriptionModule";
import { PharmacyModule } from "./components/pharmacy/PharmacyModule";
import { BillingModule } from "./components/billing/BillingModule";
import { NavigationItem } from "./types";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import ReceptionistDashboard from "./components/Receptionist/ReceptionistDashboard";
import { PharmacyDashboard } from "./components/pharmacy/PharmacyDashboard";
import StaffDashboard from "./components/Staff/StaffDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  const [activeSection, setActiveSection] =
    useState<NavigationItem>("dashboard");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "registration":
        return <PatientRegistration />;
      case "queue":
        return <PatientQueue />;
      case "vitals":
        return <VitalsAssessment />;
      case "doctor":
        return <DoctorModule />;
      case "prescription":
        return <PrescriptionModule />;
      case "pharmacy":
        return <PharmacyModule />;
      case "billing":
        return <BillingModule />;
      case "analytics":
        return <Dashboard />; // Reuse dashboard for analytics view
      default:
        return <Dashboard />;
    }
  };

  const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentSection={activeSection} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/doctor" element={<DoctorModule />} />
    <Route path="/reception" element={<ReceptionistDashboard />} />
    <Route path="/pharmacy" element={<PharmacyDashboard />} />
    <Route path="/staff" element={<StaffDashboard />} />
  </Routes>;

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route - Login page */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected routes with role-based access */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <AuthenticatedLayout>
                  <DoctorModule />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reception"
            element={
              <ProtectedRoute allowedRoles={["receptionist"]}>
                <AuthenticatedLayout>
                  <ReceptionistDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute allowedRoles={["pharmacist"]}>
                <AuthenticatedLayout>
                  <PharmacyDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff-nurse"]}>
                <AuthenticatedLayout>
                  <StaffDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={["technician"]}>
                <AuthenticatedLayout>
                  {renderActiveSection()}
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
