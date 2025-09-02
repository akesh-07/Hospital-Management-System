import React from 'react';
import { User, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
}

export const Header: React.FC<HeaderProps> = ({ currentSection }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-1 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MedCare HMS</h1>
              <p className="text-sm text-gray-500">Hospital Management System</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-gray-400">|</span>
            <span className="ml-4 text-lg font-medium text-gray-700 capitalize">
              {currentSection}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Dr. Sarah Wilson</p>
              <p className="text-xs text-gray-500">General Physician</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};