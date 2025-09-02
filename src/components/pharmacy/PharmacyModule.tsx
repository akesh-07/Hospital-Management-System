import React, { useState } from 'react';
import { PharmacyDashboard } from './PharmacyDashboard';
import { DrugInventory } from './DrugInventory';
import { PrescriptionFulfillment } from './PrescriptionFulfillment';
import { PharmacyBilling } from './PharmacyBilling';
import { 
  Pill, 
  Package, 
  FileText, 
  CreditCard,
  BarChart3
} from 'lucide-react';

type PharmacyTab = 'dashboard' | 'inventory' | 'prescriptions' | 'billing' | 'analytics';

export const PharmacyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PharmacyTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as PharmacyTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory' as PharmacyTab, label: 'Inventory', icon: Package },
    { id: 'prescriptions' as PharmacyTab, label: 'Prescriptions', icon: FileText },
    { id: 'billing' as PharmacyTab, label: 'Billing', icon: CreditCard },
  ];

  const TabButton: React.FC<{ 
    id: PharmacyTab; 
    label: string; 
    icon: React.ComponentType<any> 
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-green-600 text-white shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PharmacyDashboard />;
      case 'inventory':
        return <DrugInventory />;
      case 'prescriptions':
        return <PrescriptionFulfillment />;
      case 'billing':
        return <PharmacyBilling />;
      default:
        return <PharmacyDashboard />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Pill className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
              <p className="text-gray-600">Complete pharmacy operations and inventory control</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <TabButton key={tab.id} {...tab} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-0">
        {renderActiveTab()}
      </div>
    </div>
  );
};