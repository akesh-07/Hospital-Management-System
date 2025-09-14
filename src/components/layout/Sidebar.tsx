import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, UserPlus, Users, Stethoscope, Pill } from "lucide-react";
import { UserRole } from "../../contexts/AuthContext";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  activeSection: string;
}

const allNavigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  {
    id: "registration",
    label: "Registration",
    icon: UserPlus,
    path: "/registration",
  },
  { id: "queue", label: "Pre-OPD", icon: Users, path: "/pre-opd" },
  {
    id: "doctor",
    label: "Doctor Module",
    icon: Stethoscope,
    path: "/doctor-module",
  },
  { id: "pharmacy", label: "Pharmacy", icon: Pill, path: "/pharmacy" },
];

const rolePermissions: Record<UserRole, string[]> = {
  doctor: ["dashboard", "queue", "doctor"],
  pharmacist: ["dashboard", "pharmacy"],
  "staff-nurse": ["dashboard", "queue"],
  receptionist: ["dashboard", "registration", "queue"],
  technician: ["dashboard"],
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSection }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getVisibleItems = () => {
    if (!user?.role || !rolePermissions[user.role]) {
      return allNavigationItems.filter((item) => item.id === "dashboard");
    }

    const allowedItemIds = rolePermissions[user.role];
    return allNavigationItems.filter((item) =>
      allowedItemIds.includes(item.id)
    );
  };

  const visibleItems = getVisibleItems();

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100"></div>

      <nav className="p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path || activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-8 border-t border-gray-100">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              System Status
            </span>
          </div>
          <p className="text-xs text-gray-600">All systems operational</p>
        </div>
      </div>
    </aside>
  );
};
