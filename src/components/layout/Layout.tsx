// src/components/layout/Layout.tsx
import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentSection }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    // FIX: Set main container to h-screen and hidden overflow
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      <Sidebar
        activeSection={currentSection}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {" "}
        {/* <-- Allow only this column to scroll */}
        <Header currentSection={currentSection} onMenuClick={toggleSidebar} />
        <main className="p-8 flex-1">
          {" "}
          {/* Removed overflow-auto as it's now on the parent div */}
          {children}
        </main>
      </div>
    </div>
  );
};
