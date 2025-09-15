import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  FileText,
  TestTube,
  Pill,
  User,
  Clock,
  Upload,
  Bot,
  ChevronRight,
  Activity,
  ArrowLeft,
  Loader,
  Brain,
  AlertCircle,
  CheckCircle,
  Calendar,
  Save,
  Printer,
  Heart,
  FileDown,
  Search,
  UserCheck,
  ClipboardList,
  Eye,
  BookOpen,
} from "lucide-react";
import AIAssistTab from "./AIAssistTab";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { Vitals } from "../../types";
import PatientQueue from "../queue/PatientQueue";
import { Patient } from "../../types";
import PrescriptionModule from "../prescription/PrescriptionModule";

interface DoctorModuleProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
}

// Helper component for section headers to maintain consistency
const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center space-x-3 mb-6">
    <div className="bg-[#012e58]/10 p-2 rounded-lg">
      <Icon className="w-6 h-6 text-[#012e58]" />
    </div>
    <h2 className="text-2xl font-bold text-[#0B2D4D] tracking-tight">
      {title}
    </h2>
  </div>
);

// --- Main DoctorModule Component ---
// Show PatientQueue
export const DoctorModule: React.FC<DoctorModuleProps> = ({
  selectedPatient,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    "history" | "assessment" | "prescriptions" | "ai-assist"
  >("assessment");
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [consultation, setConsultation] = useState({
    symptoms: [] as string[],
    duration: "",
    aggravatingFactors: [] as string[],
    generalExamination: [] as string[],
    systemicExamination: [] as string[],
    investigations: [] as string[],
    diagnosis: "",
    notes: "",
  });

  // Fetch vitals from Firebase when a patient is selected
  useEffect(() => {
    if (!selectedPatient?.id) {
      setVitals(null);
      return;
    }

    const vitalsQuery = query(
      collection(db, "vitals"),
      where("patientId", "==", selectedPatient.id),
      orderBy("recordedAt", "desc")
    );

    const unsubscribe = onSnapshot(vitalsQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const latestVitals = snapshot.docs[0].data() as Vitals;
        setVitals(latestVitals);
      } else {
        setVitals(null);
      }
    });

    return () => unsubscribe();
  }, [selectedPatient]);

  // Mock history data - in real app, this would be fetched from the database
  const mockHistory = [
    { date: "2024-08-15", diagnosis: "Routine Checkup", doctor: "Dr. Smith" },
    {
      date: "2024-07-10",
      diagnosis: "Hypertension Follow-up",
      doctor: "Dr. Wilson",
    },
  ];

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (fn: (prev: any) => any) => void
  ) => {
    setter((prev: any) => ({
      ...prev,
      [array === consultation.symptoms
        ? "symptoms"
        : array === consultation.aggravatingFactors
        ? "aggravatingFactors"
        : array === consultation.generalExamination
        ? "generalExamination"
        : array === consultation.systemicExamination
        ? "systemicExamination"
        : "investigations"]: array.includes(item)
        ? array.filter((i) => i !== item)
        : [...array, item],
    }));
  };

  // Common input styling to match registration page
  const inputStyle =
    "p-3 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500";

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === id
          ? "bg-[#012e58] text-white shadow-lg"
          : "text-[#1a4b7a] hover:bg-[#012e58]/10 border border-gray-200 bg-white"
      }`}
    >
      <Icon className="w-5 h-5" /> <span>{label}</span>
    </button>
  );

  if (!selectedPatient) {
    return <PatientQueue />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-[#1a4b7a] hover:text-[#0B2D4D] hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Queue</span>
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="p-3 bg-[#012e58]/10 rounded-full">
              <Stethoscope className="w-8 h-8 text-[#012e58]" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#0B2D4D] tracking-tight">
                Doctor Consultation
              </h1>
              <p className="text-gray-500 text-lg mt-1">
                Complete medical examination and diagnosis
              </p>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-gradient-to-r from-[#012e58]/5 to-[#1a4b7a]/5 rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#012e58] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {selectedPatient.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg text-[#0B2D4D]">
                  {selectedPatient.fullName}
                </p>
                <p className="text-[#1a4b7a] font-medium">
                  {selectedPatient.uhid} • {selectedPatient.age}Y •{" "}
                  {selectedPatient.gender}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <TabButton id="history" label="Patient History" icon={FileText} />
          <TabButton
            id="assessment"
            label="Clinical Assessment"
            icon={Stethoscope}
          />
          <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
          <TabButton id="ai-assist" label="AI Assist" icon={Bot} />
        </div>

        {/* Tab Content */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* Patient Information Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={UserCheck} title="Patient Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#1a4b7a] mb-1 block">
                      Contact Number
                    </label>
                    <p className="font-semibold text-[#0B2D4D] bg-gray-50 p-3 rounded-lg">
                      {selectedPatient.contactNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a4b7a] mb-1 block">
                      Visit Type
                    </label>
                    <p className="font-semibold text-[#0B2D4D] bg-gray-50 p-3 rounded-lg">
                      {selectedPatient.visitType}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#1a4b7a] mb-1 block">
                      Address
                    </label>
                    <p className="font-semibold text-[#0B2D4D] bg-gray-50 p-3 rounded-lg">
                      {selectedPatient.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a4b7a] mb-1 block">
                      Payment Method
                    </label>
                    <p className="font-semibold text-[#0B2D4D] bg-gray-50 p-3 rounded-lg">
                      {selectedPatient.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="text-sm font-medium text-[#1a4b7a] mb-3 block">
                      Chronic Conditions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.chronicConditions.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg"
                          >
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Previous Consultations Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={Clock} title="Previous Consultations" />
              <div className="space-y-4">
                {mockHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-[#0B2D4D] text-lg">
                        {item.diagnosis}
                      </p>
                      <p className="text-[#1a4b7a] font-medium">
                        {item.doctor}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-[#012e58]/10 rounded-lg">
                        <Calendar className="w-4 h-4 text-[#012e58]" />
                        <span className="text-sm font-medium text-[#012e58]">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "assessment" && (
          <div className="space-y-6">
            {/* Vitals and Medical History Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Vitals Card */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Activity} title="Patient Vitals" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {[
                    { label: "BP", value: "120/80", unit: "mmHg" },
                    { label: "PR", value: "72", unit: "bpm" },
                    { label: "SpO₂", value: "98", unit: "%" },
                    { label: "BMI", value: "22.5", unit: "" },
                    { label: "BPR", value: "18", unit: "/min" },
                  ].map((vital) => (
                    <div
                      key={vital.label}
                      className="text-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100"
                    >
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        {vital.label}
                      </p>
                      <p className="font-bold text-2xl text-[#0B2D4D]">
                        {vital.value}
                      </p>
                      {vital.unit && (
                        <p className="text-xs text-gray-400 mt-1">
                          {vital.unit}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={FileDown} title="Medical History" />
                <div className="space-y-3">
                  {[
                    { name: "Discharge Summary", icon: FileDown },
                    { name: "X-Ray (PDF)", icon: FileDown },
                    { name: "USG (PDF)", icon: FileDown },
                    { name: "Investigation ROP", icon: FileDown },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 hover:from-[#012e58]/10 hover:to-[#012e58]/15 rounded-lg border border-gray-200 transition-all duration-200 group"
                    >
                      <item.icon className="w-4 h-4 text-[#012e58] group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-[#0B2D4D]">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-[#012e58]">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      AI Assisted Summary
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chief Complaints Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={ClipboardList} title="Chief Complaints" />

              {/* Quick Symptom Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[#1a4b7a] mb-3 block">
                  Quick Symptom Selection
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {["Fever", "Cold", "Cough", "Diarrhea", "Vomiting"].map(
                    (symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#012e58]/5 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                        />
                        <span className="text-sm font-medium text-[#0B2D4D]">
                          {symptom}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Detailed Complaints Table */}
              <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white">
                      <th className="p-4 text-left font-semibold">Symptom</th>
                      <th className="p-4 text-left font-semibold">Duration</th>
                      <th className="p-4 text-left font-semibold">
                        Aggravating/Relieving Factors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="p-4">
                        <input
                          type="text"
                          className={inputStyle}
                          placeholder="Enter symptom"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          className={inputStyle}
                          placeholder="Duration (e.g., 2 days)"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          className={inputStyle}
                          placeholder="Factors that worsen/improve"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Examination Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Examination Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Eye} title="General Examination" />

                {/* Examination Findings */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-[#1a4b7a] mb-3 block">
                    Clinical Findings
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Pallor", "Icterus", "Cyanosis", "Clubbing", "LAP"].map(
                      (item) => (
                        <label
                          key={item}
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#012e58]/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                          />
                          <span className="text-sm font-medium text-[#0B2D4D]">
                            {item}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#1a4b7a] mb-2 block">
                      Consciousness
                    </label>
                    <input
                      type="text"
                      className={inputStyle}
                      placeholder="Level of consciousness"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a4b7a] mb-2 block">
                      Built
                    </label>
                    <select className={inputStyle}>
                      <option value="">Select built</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Templates Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={BookOpen} title="Templates & Quick Fill" />

                {/* Template Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-[#1a4b7a] mb-3 block">
                    Common Templates
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {["Knee Pain", "Back Pain", "Muscle Spasm"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 rounded-lg border border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                        />
                        <span className="font-medium text-[#0B2D4D] group-hover:text-[#012e58] transition-colors">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Search Field */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms/findings"
                    className="pl-11 pr-4 py-3 w-full border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Systemic and Local Examination Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Systemic Examination Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Heart} title="Systemic Examination" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "CNS",
                      placeholder: "Central Nervous System findings",
                    },
                    { label: "RS", placeholder: "Respiratory System findings" },
                    {
                      label: "CVS",
                      placeholder: "Cardiovascular System findings",
                    },
                    { label: "P/A", placeholder: "Per Abdomen findings" },
                  ].map((system) => (
                    <div key={system.label} className="space-y-2">
                      <label className="text-sm font-semibold text-[#1a4b7a] block">
                        {system.label}
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 resize-none"
                        rows={3}
                        placeholder={system.placeholder}
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Examination Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Stethoscope} title="Local Examination" />
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center space-y-2">
                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500 font-medium">
                      Case-Specific Examination
                    </p>
                    <p className="text-sm text-gray-400">
                      Orthopedic module integration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "prescriptions" && selectedPatient && (
          <PrescriptionModule
            selectedPatient={selectedPatient}
            consultation={consultation}
          />
        )}

        {activeTab === "ai-assist" && selectedPatient && (
          <AIAssistTab
            consultation={consultation}
            selectedPatient={selectedPatient}
          />
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button className="group flex items-center px-6 py-3 border border-[#012e58] rounded-lg text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-lg font-medium">
              <Save className="w-5 h-5 mr-2.5 transition-transform duration-300 group-hover:scale-110" />
              Save Draft
            </button>
            <button className="flex items-center space-x-2 px-8 py-3 bg-[#012e58] text-white font-semibold rounded-lg shadow-md hover:bg-[#1a4b7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-lg">
              <span>Complete Consultation</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
