import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { PatientRegistration } from './components/registration/PatientRegistration';
import  PatientQueue  from './components/queue/PatientQueue';
import { VitalsAssessment } from './components/vitals/VitalsAssessment';
import { DoctorModule } from './components/doctor/DoctorModule';
import { PrescriptionModule } from './components/prescription/PrescriptionModule';
import { PharmacyModule } from './components/pharmacy/PharmacyModule';
import { BillingModule } from './components/billing/BillingModule';
import { NavigationItem } from './types';

function App() {
  const [activeSection, setActiveSection] = useState<NavigationItem>('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'registration':
        return <PatientRegistration />;
      case 'queue':
        return <PatientQueue />;
      case 'vitals':
        return <VitalsAssessment />;
      case 'doctor':
        return <DoctorModule />;
      case 'prescription':
        return <PrescriptionModule />;
      case 'pharmacy':
        return <PharmacyModule />;
      case 'billing':
        return <BillingModule />;
      case 'analytics':
        return <Dashboard />; // Reuse dashboard for analytics view
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentSection={activeSection} />
        
        <main className="flex-1 overflow-y-auto">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}

export default App;