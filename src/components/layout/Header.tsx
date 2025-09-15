import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import the Cookies library
import { User, Bell, Settings } from "lucide-react";
import HMS_LOGO from "./hms-logo.png";

interface HeaderProps {
  currentSection: string;
}

export const Header: React.FC<HeaderProps> = ({ currentSection }) => {
  const [userName, setUserName] = useState<string | null>(null); // State to hold the user's name
  const [userRole, setUserRole] = useState<string | null>(null); // State to hold the user's role

  // Use useEffect to read the cookie when the component mounts
  useEffect(() => {
    const nameFromCookie = Cookies.get("userName");
    const roleFromCookie = Cookies.get("userRole"); // Read the userRole cookie

    if (nameFromCookie) {
      setUserName(nameFromCookie);
    }
    if (roleFromCookie) {
      setUserRole(roleFromCookie);
    }
  }, []); // The empty dependency array ensures this runs only once

  return (
    // Change 1: Reduced vertical padding to a minimum
    <header className="bg-gradient-to-r from-[#012e58] to-[#1a4b7a] border-b border-white/10 px-6 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Change 2: Further reduced the logo size */}
            <div className="w-[120px]">
              <img src={HMS_LOGO} alt="logo" />
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-white/30">|</span>
            <span className="ml-4 text-base font-medium text-white capitalize">
              {currentSection}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {/* Change 3: Reduced button padding */}
            <button className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
            {/* Change 4: Reduced avatar size */}
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:block">
              {/* Dynamically display the user's name from the state */}
              <p className="text-sm font-medium text-white">{userName || "User"}</p>
              {/* Dynamically display the user's role from the state */}
              <p className="text-xs text-white/70">{userRole || "Role"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
