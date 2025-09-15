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

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id
          ? "bg-[#012e58] text-white shadow-sm"
          : "text-[#1a4b7a] hover:bg-[#e0f7fa]"
      }`}
    >
      <Icon className="w-4 h-4" /> <span className="font-medium">{label}</span>{" "}
    </button>
  );

  if (!selectedPatient) {
    return <PatientQueue />;
  }

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      {" "}
      <div className="max-w-7xl mx-auto">
        {" "}
        <div className="flex items-center justify-between mb-6">
          {" "}
          <div className="flex items-center space-x-3">
            {" "}
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-[#1a4b7a] hover:text-[#0B2D4D] hover:bg-[#e0f7fa] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> <span>Back to Queue</span>{" "}
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <Stethoscope className="w-8 h-8 text-[#012e58]" />{" "}
            <div>
              {" "}
              <h1 className="text-3xl font-bold text-[#0B2D4D]">
                {" "}
                Doctor Consultation{" "}
              </h1>{" "}
              <p className="text-[#1a4b7a]">
                {" "}
                Complete medical examination and diagnosis{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {" "}
            <div className="flex items-center space-x-3">
              {" "}
              <div className="w-10 h-10 bg-[#e0f7fa] rounded-full flex items-center justify-center">
                {" "}
                <span className="text-[#012e58] font-medium text-sm">
                  {" "}
                  {selectedPatient.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}{" "}
                </span>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="font-semibold text-[#0B2D4D]">
                  {" "}
                  {selectedPatient.fullName}{" "}
                </p>{" "}
                <p className="text-sm text-[#1a4b7a]">
                  {" "}
                  {selectedPatient.uhid} • {selectedPatient.age}Y •{" "}
                  {selectedPatient.gender}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <TabButton id="history" label="Patient History" icon={FileText} />{" "}
          <TabButton
            id="assessment"
            label="Clinical Assessment"
            icon={Stethoscope}
          />
          <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
          <TabButton id="ai-assist" label="AI Assist" icon={Bot} />{" "}
        </div>{" "}
        {activeTab === "history" && (
          // ... existing history tab content
          <div className="space-y-6">
            {" "}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {" "}
              <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                {" "}
                Patient Information{" "}
              </h3>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {" "}
                <div>
                  <p className="text-sm text-[#1a4b7a]">Contact Number</p>{" "}
                  <p className="font-medium text-[#0B2D4D]">
                    {" "}
                    {selectedPatient.contactNumber}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  <p className="text-sm text-[#1a4b7a]">Address</p>{" "}
                  <p className="font-medium text-[#0B2D4D]">
                    {" "}
                    {selectedPatient.address}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  <p className="text-sm text-[#1a4b7a]">Visit Type</p>{" "}
                  <p className="font-medium text-[#0B2D4D]">
                    {" "}
                    {selectedPatient.visitType}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  <p className="text-sm text-[#1a4b7a]">Payment Method</p>{" "}
                  <p className="font-medium text-[#0B2D4D]">
                    {" "}
                    {selectedPatient.paymentMethod}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mb-6">
                    {" "}
                    <p className="text-sm text-[#1a4b7a] mb-2">
                      {" "}
                      Chronic Conditions{" "}
                    </p>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {selectedPatient.chronicConditions.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                          >
                            {" "}
                            {condition}{" "}
                          </span>
                        )
                      )}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
            </div>{" "}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {" "}
              <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                {" "}
                Previous Consultations{" "}
              </h3>{" "}
              <div className="space-y-3">
                {" "}
                {mockHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    {" "}
                    <div>
                      {" "}
                      <p className="font-medium text-[#0B2D4D]">
                        {" "}
                        {item.diagnosis}{" "}
                      </p>
                      <p className="text-sm text-[#1a4b7a]">{item.doctor}</p>{" "}
                    </div>{" "}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />{" "}
                      <span className="text-sm text-[#1a4b7a]">
                        {item.date}
                      </span>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}
        {activeTab === "assessment" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                  Patient Vitals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">BP</p>
                    <p className="font-bold text-lg text-[#0B2D4D]">120/80</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PR</p>
                    <p className="font-bold text-lg text-[#0B2D4D]">72 bpm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SpO₂</p>
                    <p className="font-bold text-lg text-[#0B2D4D]">98%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BMI</p>
                    <p className="font-bold text-lg text-[#0B2D4D]">22.5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BPR</p>
                    <p className="font-bold text-lg text-[#0B2D4D]">18/min</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                  Medical & Personal History
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#e0f7fa] hover:bg-[#b3e5fc] rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>Discharge Summary</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#e0f7fa] hover:bg-[#b3e5fc] rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>X-Ray (PDF)</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#e0f7fa] hover:bg-[#b3e5fc] rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>USG (PDF)</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#e0f7fa] hover:bg-[#b3e5fc] rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>Investigation ROP</span>
                  </button>
                </div>
                <div className="mt-2 text-center text-xs text-[#012e58] font-semibold">
                  AI Assisted Summary
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                Chief Complaints
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["Fever", "Cold", "Cough", "Diarrhea", "Vomiting"].map(
                  (symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#012e58] focus:ring-[#1a4b7a]"
                      />
                      <span>{symptom}</span>
                    </label>
                  )
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA]">
                    <tr>
                      <th className="p-2 text-left font-medium">Symptom</th>
                      <th className="p-2 text-left font-medium">Duration</th>
                      <th className="p-2 text-left font-medium">
                        Aggravating/Relieving Factors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md p-1"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                  General Examination
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {["Pallor", "Icterus", "Cyanosis", "Clubbing", "LAP"].map(
                    (item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#1a4b7a]"
                        />
                        <span>{item}</span>
                      </label>
                    )
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Consciousness</label>
                    <input
                      type="text"
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Built</label>
                    <select className="w-full mt-1 border-gray-300 rounded-md p-1">
                      <option>Mild</option>
                      <option>Moderate</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                  Templates for Easy Fill
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["Knee Pain", "Back Pain", "Muscle Spasm"].map((item) => (
                    <label
                      key={item}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#012e58] focus:ring-[#1a4b7a]"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms/findings"
                    className="w-full pl-10 p-2 border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                  Systemic Examination
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">CNS</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="font-medium">RS</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="font-medium">CVS</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="font-medium">P/A</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#0B2D4D] mb-4">
                  Local Examination
                </h3>
                <div className="text-center text-gray-500 italic p-4 border-2 border-dashed rounded-md">
                  Use based on case type - Ortho module specific.
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
        )}{" "}
        {activeTab === "ai-assist" && selectedPatient && (
          <AIAssistTab
            consultation={consultation}
            selectedPatient={selectedPatient}
          />
        )}{" "}
        <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-lg border border-gray-200">
          {" "}
          <div className="flex items-center space-x-4">
            {" "}
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              {" "}
              Save Draft{" "}
            </button>{" "}
            <button className="flex items-center space-x-2 px-6 py-3 bg-[#012e58] text-white rounded-lg hover:bg-[#1a4b7a] transition-colors">
              <span>Complete Consultation</span>
              <ChevronRight className="w-4 h-4" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
