import React from "react";
import { User, Bell, Settings } from "lucide-react";
import HMS_LOGO from "./hms-logo.png";
interface HeaderProps {
  currentSection: string;
}

export const Header: React.FC<HeaderProps> = ({ currentSection }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-[200px]">
              <img src={HMS_LOGO} alt="logo" />
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-gray-400">|</span>
            <span className="ml-4 text-lg font-medium text-[#0B2D4D] capitalize">
              {currentSection}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-[#012e58] hover:bg-[#e0f7fa] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#012e58] hover:bg-[#e0f7fa] rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#0B2D4D]">
                Dr. Sarah Wilson
              </p>
              <p className="text-xs text-[#1a4b7a]">General Physician</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
