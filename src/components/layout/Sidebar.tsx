import React from 'react';
import { 
  Home, 
  UserPlus, 
  Users, 
  Activity, 
  Stethoscope, 
  FileText, 
  Pill,
  CreditCard, 
  BarChart3,
  Heart
} from 'lucide-react';
import { NavigationItem } from '../../types';

interface SidebarProps {
  activeSection: NavigationItem;
  onSectionChange: (section: NavigationItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const navigationItems = [
    { id: 'dashboard' as NavigationItem, label: 'Dashboard', icon: Home },
    { id: 'registration' as NavigationItem, label: 'Registration', icon: UserPlus },
    { id: 'queue' as NavigationItem, label: 'Pre-OPD', icon: Users },
    { id: 'doctor' as NavigationItem, label: 'Doctor Module', icon: Stethoscope },
    { id: 'prescription' as NavigationItem, label: 'Prescription', icon: FileText },
    { id: 'pharmacy' as NavigationItem, label: 'Pharmacy', icon: Pill },
    { id: 'billing' as NavigationItem, label: 'Payments', icon: CreditCard },
    { id: 'analytics' as NavigationItem, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-gray-900">HMS Navigation</span>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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
            <span className="text-sm font-medium text-gray-700">System Status</span>
          </div>
          <p className="text-xs text-gray-600">All systems operational</p>
        </div>
      </div>
    </aside>
  );
};