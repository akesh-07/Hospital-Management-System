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
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Cookies from "js-cookie";
import { mockAnalytics } from "../../data/mockData";

type CategoryType =
  | "symptoms"
  | "diagnoses"
  | "medications"
  | "labTests"
  | null;

export const Dashboard: React.FC = () => {
  const analytics = mockAnalytics;
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

  // Mock data for daily appointments vs treatment
  const dailyAppointmentsVsTreatment = [
    { date: "Jan 01", appointments: 120, treatments: 98 },
    { date: "Jan 02", appointments: 132, treatments: 105 },
    { date: "Jan 03", appointments: 101, treatments: 87 },
    { date: "Jan 04", appointments: 134, treatments: 112 },
    { date: "Jan 05", appointments: 145, treatments: 128 },
    { date: "Jan 06", appointments: 165, treatments: 142 },
    { date: "Jan 07", appointments: 178, treatments: 156 },
  ];

  useEffect(() => {
    const nameFromCookie = Cookies.get("userName");
    if (nameFromCookie) {
      setUserName(nameFromCookie);
    }
  }, []);

  const getCategoryData = (category: CategoryType) => {
    switch (category) {
      case "symptoms":
        return analytics.topSymptoms;
      case "diagnoses":
        return analytics.topDiagnoses;
      case "medications":
        return analytics.topMedications;
      case "labTests":
        return analytics.labTests;
      default:
        return [];
    }
  };

  const getCategoryTitle = (category: CategoryType) => {
    switch (category) {
      case "symptoms":
        return "Top Symptoms";
      case "diagnoses":
        return "Top Diagnoses";
      case "medications":
        return "Top 5 Drugs";
      case "labTests":
        return "Top Lab Tests";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case "symptoms":
        return Activity;
      case "diagnoses":
        return CheckCircle;
      case "medications":
        return Pill;
      case "labTests":
        return TestTube;
      default:
        return Activity;
    }
  };

  const formatChartData = (data: { name: string; count: number }[]) => {
    return data.slice(0, 5).map((item) => ({
      name: item.name,
      value: item.count,
    }));
  };

  const FilterButton: React.FC<{
    category: CategoryType;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ category, label, icon: Icon }) => (
    <button
      onClick={() => setSelectedCategory(category)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
        selectedCategory === category
          ? "bg-[#012e58] text-white shadow-md"
          : "bg-gray-100 text-[#1a4b7a] hover:bg-gray-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0B2D4D] mb-2">
            Basic Analytics
          </h1>
          <p className="text-[#1a4b7a]">
            Welcome back, {userName || "User"}. Here's your overview.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="mb-8">
          {selectedCategory === null ? (
            /* Default Line Chart */
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-[#012e58]" />
                <h3 className="text-xl font-semibold text-[#0B2D4D]">
                  Daily Appointments vs Treatment
                </h3>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyAppointmentsVsTreatment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#012e58"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#012e58" }}
                      name="Appointments"
                    />
                    <Line
                      type="monotone"
                      dataKey="treatments"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#3b82f6" }}
                      name="Treatments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Bar Chart Area */
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {React.createElement(getCategoryIcon(selectedCategory), {
                    className: "w-6 h-6 text-[#012e58]",
                  })}
                  <h3 className="text-xl font-semibold text-[#0B2D4D]">
                    {getCategoryTitle(selectedCategory)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-200 text-[#1a4b7a] hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatChartData(getCategoryData(selectedCategory))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="value" fill="#012e58" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <FilterButton
            category="symptoms"
            label="Top Symptoms"
            icon={Activity}
          />
          <FilterButton
            category="diagnoses"
            label="Top Diagnoses"
            icon={CheckCircle}
          />
          <FilterButton
            category="medications"
            label="Top 5 Drugs"
            icon={Pill}
          />
          <FilterButton
            category="labTests"
            label="Top Lab Tests"
            icon={TestTube}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-[#1a4b7a]">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
