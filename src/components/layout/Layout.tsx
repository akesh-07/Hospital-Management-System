import React, { useState, useEffect } from "react";
import {
  LineChart,
  UserPlus,
  Users,
  Pill,
  Home,
  Save,
  X,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Upload,
  RefreshCw,
  Circle,
} from "lucide-react";

// Importing child components
import Layout from "../../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import PatientRegistrationContent from "../components/PatientRegistrationContent";

// Mock dependencies
const mockDb = {};
const mockTimestamp = { now: () => ({ toDate: () => new Date() }) };
const mockAddDoc = (collection, data) =>
  new Promise((resolve) => {
    console.log("Saving patient:", data);
    setTimeout(resolve, 500);
  });

// Shared Component: Page Renderer (Router Logic)
const PageRenderer = ({ currentPage }) => {
  switch (currentPage) {
    case "registration":
      return <PatientRegistrationContent />;
    case "dashboard":
      return (
        <div className="p-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="mt-4">
            Welcome, view your key performance indicators here.
          </p>
        </div>
      );
    case "pre-opd":
      return (
        <div className="p-8">
          <h1 className="text-3xl font-bold">Pre-OPD/Patient Queue</h1>
          <p className="mt-4">
            Manage the queue of patients waiting for consultation.
          </p>
        </div>
      );
    case "pharmacy":
      return (
        <div className="p-8">
          <h1 className="text-3xl font-bold">Pharmacy Module</h1>
          <p className="mt-4">Manage drug inventory and dispensing.</p>
        </div>
      );
    default:
      return (
        <div className="p-8">
          <h1 className="text-3xl font-bold">Welcome to HMS</h1>
          <p className="mt-4">Select a module from the sidebar.</p>
        </div>
      );
  }
};

// Wrapper for the Authenticated Section
const PatientRegistrationPage = ({ currentPage, onNavigate, onLogout }) => {
  return (
    <Layout
      defaultSection={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <PageRenderer currentPage={currentPage} />
    </Layout>
  );
};

export default PatientRegistrationPage;
