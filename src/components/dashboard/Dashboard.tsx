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

// Mock data similar to your original
const mockAnalytics = {
  dailyAppointments: 145,
  totalPatients: 2847,
  completedConsultations: 89,
  pendingPayments: 12,
  newPatients: 62,
  topSymptoms: [
    { name: "Fever", count: 45 },
    { name: "Headache", count: 38 },
    { name: "Cough", count: 32 },
    { name: "Back Pain", count: 28 },
    { name: "Fatigue", count: 25 },
  ],
  topDiagnoses: [
    { name: "Common Cold", count: 25 },
    { name: "Hypertension", count: 22 },
    { name: "Diabetes", count: 18 },
    { name: "Anxiety", count: 15 },
    { name: "Arthritis", count: 12 },
  ],
  topMedications: [
    { name: "Paracetamol", count: 34 },
    { name: "Amoxicillin", count: 28 },
    { name: "Ibuprofen", count: 22 },
    { name: "Metformin", count: 19 },
    { name: "Lisinopril", count: 16 },
  ],
  labTests: [
    { name: "Blood Test", count: 45 },
    { name: "Urine Test", count: 32 },
    { name: "X-Ray", count: 28 },
    { name: "ECG", count: 22 },
    { name: "MRI", count: 15 },
  ],
  revenue: {
    today: 45000,
    thisMonth: 1250000,
    trend: 15.2,
  },
};

export default function Dashboard() {
  const analytics = mockAnalytics;
  const [userName, setUserName] = useState("Dr. Smith");

  // Chart data for the trending graph
  const chartData = [
    { day: "Jul 1", appointments: 4 },
    { day: "Jul 4", appointments: 6 },
    { day: "Jul 7", appointments: 5 },
    { day: "Jul 10", appointments: 7 },
    { day: "Jul 13", appointments: 6 },
    { day: "Jul 16", appointments: 8 },
    { day: "Jul 19", appointments: 7 },
    { day: "Jul 22", appointments: 9 },
    { day: "Jul 25", apartments: 8 },
    { day: "Jul 28", appointments: 10 },
    { day: "Jul 31", appointments: 9 },
  ];

  type StatCardProps = {
    title: string;
    value: string;
    color: string;
    isLarge?: boolean;
  };

  const StatCard = ({
    title,
    value,
    color,
    isLarge = false,
  }: StatCardProps) => (
    <div
      className={`${color} rounded-2xl p-6 text-white shadow-lg ${
        isLarge ? "col-span-1" : ""
      }`}
    >
      <h3 className="text-sm font-medium opacity-90 mb-2">{title}</h3>
      <p className={`font-bold ${isLarge ? "text-4xl" : "text-3xl"}`}>
        {value}
      </p>
    </div>
  );

  type TopItemsListProps = {
    title: string;
    items: { name: string; count: number }[];
    bgColor?: string;
  };

  const TopItemsList = ({
    title,
    items,
    bgColor = "bg-white/80",
  }: TopItemsListProps) => (
    <div className={`${bgColor} backdrop-blur-sm rounded-2xl p-6 shadow-lg`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">{item.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (item.count / Math.max(...items.map((i) => i.count))) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800 w-6">
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SimpleChart = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        DAILY APPOINTMENTS VS TREATMENT TRENDS
      </h3>
      <div className="h-24 flex items-end justify-between space-x-2">
        {chartData.map((point, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            <div
              className="w-3 bg-gradient-to-t from-orange-400 to-orange-300 rounded-full transition-all duration-300 hover:from-orange-500 hover:to-orange-400"
              style={{ height: `${((point.appointments ?? 0) / 10) * 60}px` }}
            ></div>
            {index % 3 === 0 && (
              <span className="text-xs text-gray-600 transform -rotate-45 mt-2">
                {point.day}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-600">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );

  const ButtonTab = ({
    children,
    active = false,
  }: {
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/90 text-gray-800 shadow-md"
          : "bg-white/60 text-gray-700 hover:bg-white/80"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with organic shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-green-50 to-blue-100">
        {/* Organic background shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-blue-400/20 to-teal-400/20 rounded-full blur-3xl transform translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl transform translate-y-1/2"></div>

        {/* Decorative leaf shapes */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-teal-400/30 rounded-full transform rotate-45"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-green-400/30 rounded-full"></div>
        <div className="absolute bottom-32 left-20 w-10 h-10 bg-blue-400/30 rounded-full transform rotate-12"></div>
        <div className="absolute bottom-20 right-1/3 w-7 h-7 bg-teal-400/30 rounded-full transform -rotate-45"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 p-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                BASIC ANALYTICS
              </h1>
              <div className="flex space-x-4 mb-6">
                <StatCard
                  title="NEW PT"
                  value={analytics.newPatients.toString()}
                  color="bg-gradient-to-br from-teal-500 to-teal-600"
                />
                <StatCard
                  title="APPOINTMENTS"
                  value={analytics.dailyAppointments.toString()}
                  color="bg-gradient-to-br from-gray-600 to-gray-700"
                />
              </div>

              {/* Chart */}
              <SimpleChart />
            </div>

            {/* Modern building illustration placeholder */}
            <div className="ml-8 flex flex-col items-end">
              <div className="w-48 h-32 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-2xl mb-4 flex items-center justify-center border border-teal-200/50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Hospital Overview
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-800">{userName}</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-3 mt-6">
            <ButtonTab active>Top Symptoms</ButtonTab>
            <ButtonTab>Top Diagnoses</ButtonTab>
            <ButtonTab>Top 5 Drugs</ButtonTab>
            <ButtonTab>Top Lab Tests</ButtonTab>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopItemsList
            title="Top Symptoms Today"
            items={analytics.topSymptoms}
          />
          <TopItemsList
            title="Common Diagnoses"
            items={analytics.topDiagnoses}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TopItemsList
            title="Prescribed Medications"
            items={analytics.topMedications}
          />
          <TopItemsList title="Lab Tests Ordered" items={analytics.labTests} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Patients</p>
                <p className="text-2xl font-bold">
                  {analytics.totalPatients.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+5% from last month</span>
                </div>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">
                  {analytics.completedConsultations}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-2xl font-bold">
                  {analytics.pendingPayments}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Revenue Growth</p>
                <p className="text-2xl font-bold">{analytics.revenue.trend}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">This month</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{analytics.revenue.today.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-teal-600">
                ₹{analytics.revenue.thisMonth.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Growth Rate</p>
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
    </div>
  );
}
