import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Pill,
  TestTube,
} from "lucide-react";
import Cookies from "js-cookie"; // Import the Cookies library
import { mockAnalytics } from "../../data/mockData";

export const Dashboard: React.FC = () => {
  const analytics = mockAnalytics;
  const [userName, setUserName] = useState<string | null>(null); // State for user name

  // useEffect to read the cookie when the component mounts
  useEffect(() => {
    const nameFromCookie = Cookies.get("userName");
    if (nameFromCookie) {
      setUserName(nameFromCookie);
    }
  }, []); // The empty dependency array ensures this runs only once

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<any>;
    trend?: string;
    color: string;
  }> = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#1a4b7a] text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0B2D4D] mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const TopItemsList: React.FC<{
    title: string;
    items: { name: string; count: number }[];
    icon: React.ComponentType<any>;
  }> = ({ title, items, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-[#012e58]" />
        <h3 className="text-lg font-semibold text-[#0B2D4D]">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-[#1a4b7a]">{item.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#012e58] h-2 rounded-full"
                  style={{
                    width: `${
                      (item.count / Math.max(...items.map((i) => i.count))) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-[#0B2D4D] w-6">
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8F9FA] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2D4D]">Dashboard</h1>
          <p className="text-[#1a4b7a] mt-1">
            
            Welcome back, {userName || "User"}. Here's your hospital overview.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#1a4b7a]">Today's Date</p>
          <p className="text-lg font-semibold text-[#0B2D4D]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Daily Appointments"
          value={analytics.dailyAppointments.toString()}
          icon={Calendar}
          trend="+12% from yesterday"
          color="bg-[#012e58]"
        />
        <StatCard
          title="Total Patients"
          value={analytics.totalPatients.toLocaleString()}
          icon={Users}
          trend="+5% from last month"
          color="bg-[#1a4b7a]"
        />
        <StatCard
          title="Completed Consultations"
          value={analytics.completedConsultations.toString()}
          icon={CheckCircle}
          color="bg-[#3b82f6]"
        />
        <StatCard
          title="Pending Payments"
          value={analytics.pendingPayments.toString()}
          icon={AlertCircle}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItemsList
          title="Top Symptoms Today"
          items={analytics.topSymptoms}
          icon={Activity}
        />
        <TopItemsList
          title="Common Diagnoses"
          items={analytics.topDiagnoses}
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItemsList
          title="Prescribed Medications"
          items={analytics.topMedications}
          icon={Pill}
        />
        <TopItemsList
          title="Lab Tests Ordered"
          items={analytics.labTests}
          icon={TestTube}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
          Revenue Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-[#1a4b7a] text-sm">Today's Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{analytics.revenue.today.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#1a4b7a] text-sm">This Month</p>
            <p className="text-2xl font-bold text-[#012e58]">
              ₹{analytics.revenue.thisMonth.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#1a4b7a] text-sm">Growth Rate</p>
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <p className="text-2xl font-bold text-green-600">
                {analytics.revenue.trend}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};