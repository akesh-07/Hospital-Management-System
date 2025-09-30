import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  UserPlus,
  Users,
  Stethoscope,
  Pill,
  LineChart,
  FlaskConical, // Import new icon for Lab Requests
} from "lucide-react";
import { UserRole } from "../../contexts/AuthContext";
import { useAuth } from "../../contexts/AuthContext";
import HMS_LOGO from "./HMS-bgr.png";

interface SidebarProps {
  activeSection: string;
}

const allNavigationItems = [
  {
    id: "registration",
    label: "Registration",
    icon: UserPlus,
    path: "/registration",
  },
  { id: "queue", label: "Pre-OPD", icon: Users, path: "/pre-opd" }, // 🟢 ITEM FOR LAB TECHNICIAN
  {
    id: "lab-requests",
    label: "Lab Requests",
    icon: FlaskConical,
    path: "/lab-requests",
  },
  { id: "pharmacy", label: "Pharmacy", icon: Pill, path: "/pharmacy" },
  { id: "dashboard", label: "Analytics", icon: LineChart, path: "/dashboard" },
];

const rolePermissions: Record<UserRole, string[]> = {
  doctor: ["dashboard", "queue"],
  pharmacist: ["dashboard", "pharmacy"],
  "staff-nurse": ["dashboard", "queue"],
  receptionist: ["dashboard", "registration", "queue"], // 🟢 Technician is correctly allowed access to lab-requests
  technician: ["dashboard", "lab-requests"],
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getVisibleItems = () => {
    // Return an empty array if user or role is not yet determined
    if (isLoading || !user?.role) {
      return [];
    }

    const allowedItemIds = rolePermissions[user.role];
    return allNavigationItems.filter((item) =>
      allowedItemIds.includes(item.id)
    );
  };

  const visibleItems = getVisibleItems();

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className="">
              <img src={HMS_LOGO} alt="logo" />
            </div>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path || activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 shadow-inner"
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* System Status - matching original bottom section */}
    </aside>
  );
};
