import React, { useState, useEffect, useRef } from "react";
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
  X,
  Plus,
  Trash2,
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
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { PrescriptionProvider } from "../../contexts/PrescriptionContext";
import Ai from "./Ai";

// --- ADD THIS LINE ---
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`;
// --------------------

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const AutocompleteInput: React.FC<{
  symptomId: number;
  value: string;
  onChange: (symptomId: number, value: string) => void;
  symptomOptions: string[];
  addSymptomOption: (symptom: string) => void;
}> = ({ symptomId, value, onChange, symptomOptions, addSymptomOption }) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredSymptoms = symptomOptions.filter((s) =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(symptomId, e.target.value);
    setShowDropdown(true);
  };

  const handleSelectSymptom = (symptom: string) => {
    setInputValue(symptom);
    onChange(symptomId, symptom);
    setShowDropdown(false);
  };

  const handleAddSymptom = () => {
    if (inputValue && !symptomOptions.includes(inputValue)) {
      addSymptomOption(inputValue);
      handleSelectSymptom(inputValue);
    }
  };

  const showAddButton =
    inputValue &&
    !symptomOptions.some((s) => s.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="p-2 border border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-sm"
          placeholder="Enter symptom"
        />
        {showAddButton && (
          <button
            type="button"
            onClick={handleAddSymptom}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      {showDropdown && filteredSymptoms.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {filteredSymptoms.map((symptom, index) => (
            <div
              key={index}
              onClick={() => handleSelectSymptom(symptom)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              {symptom}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface DoctorModuleProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
  onCompleteConsultation: (patientId: string) => void;
}

// Helper component for section headers to maintain consistency
const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center space-x-2 mb-3">
    <div className="bg-[#012e58]/10 p-1.5 rounded-md">
      <Icon className="w-4 h-4 text-[#012e58]" />
    </div>
    <h2 className="text-lg font-bold text-[#0B2D4D] tracking-tight">{title}</h2>
  </div>
);

// New Component for rendering formatted AI summary
const FormattedAiSummary: React.FC<{ summary: string }> = ({ summary }) => {
  const lines = summary.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-4 text-[#1a4b7a]">
      {lines.map((line, index) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3 key={index} className="text-lg font-bold text-[#0B2D4D] pt-2">
              {line.slice(2, -2)}
            </h3>
          );
        }
        if (line.startsWith("* ") || line.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc list-inside pl-4">
              <li>{line.slice(2)}</li>
            </ul>
          );
        }
        if (line.includes(":")) {
          const parts = line.split(":");
          const key = parts[0];
          const value = parts.slice(1).join(":");
          return (
            <div key={index} className="flex">
              <span className="font-semibold w-1/3">{key}:</span>
              <span className="w-2/3">{value}</span>
            </div>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

// New AI Summary Modal Component
const AiSummaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, summary, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#F8F9FA] rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#e0f7fa] rounded-full">
              <Bot className="w-6 h-6 text-[#012e58]" />
            </div>
            <h2 className="text-xl font-bold text-[#0B2D4D]">
              AI-Generated Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
              <Loader className="w-12 h-12 text-[#012e58] animate-spin mb-4" />
              <p className="text-lg font-semibold text-[#0B2D4D]">
                Analyzing History...
              </p>
              <p className="text-sm text-[#1a4b7a]">
                Please wait while our AI processes the information.
              </p>
            </div>
          ) : (
            <FormattedAiSummary summary={summary} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-200 bg-[#F8F9FA] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a4b7a] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main DoctorModule Component ---
// Show PatientQueue
const DoctorModuleContent: React.FC<DoctorModuleProps> = ({
  selectedPatient,
  onBack,
  onCompleteConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<
    "history" | "assessment" | "prescriptions" | "ai-assist"
  >("assessment");
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [consultation, setConsultation] = useState({
    symptoms: [{ id: 1, symptom: "", duration: "", factors: "" }],
    duration: "",
    aggravatingFactors: [] as string[],
    generalExamination: [] as string[],
    systemicExamination: [] as string[],
    investigations: [] as string[],
    diagnosis: "",
    notes: "",
  });

  const [symptomOptions, setSymptomOptions] = useState<string[]>([
    "Fever",
    "Cold",
    "Cough",
    "Diarrhea",
    "Vomiting",
    "Headache",
    "Back Pain",
  ]);

  const addSymptomOption = (symptom: string) => {
    if (!symptomOptions.includes(symptom)) {
      setSymptomOptions((prev) => [...prev, symptom]);
    }
  };

  const [uploadedFilesData, setUploadedFilesData] = useState<
    Record<string, string>
  >({});
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const fileInputRefs = {
    "Discharge Summary": useRef<HTMLInputElement>(null),
    "X-Ray (PDF)": useRef<HTMLInputElement>(null),
    "USG (PDF)": useRef<HTMLInputElement>(null),
    "Investigation ROP": useRef<HTMLInputElement>(null),
  };

  // --- File Handling and Text Extraction ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (file.type === "application/pdf") {
            const loadingTask = pdfjsLib.getDocument(
              event.target?.result as ArrayBuffer
            );
            const pdf = await loadingTask.promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((item: any) => item.str).join(" ");
            }
            resolve(text);
          } else if (
            file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } else if (file.type === "text/plain") {
            resolve(event.target?.result as string);
          } else {
            reject(new Error("Unsupported file type"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };

      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await extractTextFromFile(file);
        setUploadedFilesData((prev) => ({ ...prev, [fileType]: text }));
      } catch (error) {
        console.error("Error extracting text from file:", error);
      }
    }
  };

  const handleAiSummary = async () => {
    setIsSummaryModalOpen(true);
    setIsAiSummaryLoading(true);
    setAiSummary("");

    const combinedData = `
      Uploaded Medical History:
      ${Object.entries(uploadedFilesData)
        .map(([fileType, text]) => `${fileType}:\n${text}`)
        .join("\n\n")}

      Chief Complaints:
      ${consultation.symptoms
        .map(
          (s) =>
            `- Symptom: ${s.symptom}, Duration: ${s.duration}, Factors: ${s.factors}`
        )
        .join("\n")}

      General Examination:
      - Clinical Findings: ${consultation.generalExamination.join(", ")}
      
      Systemic Examination:
      ${consultation.systemicExamination.join("\n")}
    `;

    try {
      console.log("Using API Key: [API_KEY_HIDDEN]");
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            Authorization: "Bearer ",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "You are a medical assistant. Summarize the patient's condition based on the provided data.",
              },
              {
                role: "user",
                content: combinedData,
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const summary =
        data?.choices?.[0]?.message?.content?.trim() ||
        "Could not generate summary.";
      setAiSummary(summary);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setAiSummary("An error occurred while generating the summary.");
    } finally {
      setIsAiSummaryLoading(false);
    }
  };

  // Fetch vitals from Firebase when a patient is selected
  useEffect(() => {
    if (!selectedPatient?.id) {
      setVitals(null);
      return;
    }
    console.log("id=" + selectedPatient.id);
    const vitalsQuery = query(
      collection(db, "vitals"),
      where("patientId", "==", selectedPatient.id)
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
    { date: "2024-08-15", diagnosis: "Routine Checkup", doctor: "Dr. Dhinesh" },
    {
      date: "2024-07-10",
      diagnosis: "Hypertension Follow-up",
      doctor: "Dr. Dhinesh",
    },
  ];

  const handleSymptomChange = (
    id: number,
    field: "symptom" | "duration" | "factors",
    value: string
  ) => {
    setConsultation((prev) => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom) =>
        symptom.id === id ? { ...symptom, [field]: value } : symptom
      ),
    }));
  };

  const addSymptomRow = () => {
    setConsultation((prev) => ({
      ...prev,
      symptoms: [
        ...prev.symptoms,
        {
          id: Date.now(),
          symptom: "",
          duration: "",
          factors: "",
        },
      ],
    }));
  };

  const removeSymptomRow = (id: number) => {
    setConsultation((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter((symptom) => symptom.id !== id),
    }));
  };

  // Helper function to format blood pressure
  const formatBloodPressure = (bp: string): string => {
    return bp;
  };

  // Get vitals data for display
  const getVitalsDisplay = () => {
    if (!vitals) {
      // Return default/placeholder values when no vitals are available
      return [
        { label: "BP", value: "120/80", unit: "mmHg" },
        { label: "PR", value: "70", unit: "bpm" },
        { label: "SpO₂", value: "99", unit: "%" },
        { label: "BMI", value: "25.6", unit: "" },
        { label: "RR", value: "20", unit: "/min" },
      ];
    }

    return [
      {
        label: "BP",
        value: formatBloodPressure(vitals.bloodPressure),
        unit: "mmHg",
      },
      {
        label: "PR",
        value: vitals.pulse?.toString() || "70",
        unit: "bpm",
      },
      {
        label: "SpO₂",
        value: vitals.spo2?.toString() || "99",
        unit: "%",
      },
      {
        label: "BMI",
        value: vitals.bmi?.toString() || "25.6",
        unit: "",
      },
      {
        label: "RR",
        value: vitals.respiratoryRate?.toString() || "20",
        unit: "/min",
      },
    ];
  };

  // Common input styling to match registration page
  const inputStyle =
    "p-2 border border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-sm";

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
        activeTab === id
          ? "bg-[#012e58] text-white shadow-md"
          : "text-[#1a4b7a] hover:bg-[#012e58]/10 border border-gray-200 bg-white"
      }`}
    >
      <Icon className="w-4 h-4" /> <span>{label}</span>
    </button>
  );

  if (!selectedPatient) {
    return <PatientQueue />;
  }

  return (
    <div className="p-2 bg-gray-100 min-h-screen font-sans">
      <div className="w-full bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-[#1a4b7a] hover:text-[#0B2D4D] hover:bg-gray-100 rounded-md transition-colors border border-gray-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Tab Navigation in Header */}
            <div className="flex space-x-2">
              <TabButton id="history" label="History" icon={FileText} />
              <TabButton
                id="assessment"
                label="Assessment"
                icon={Stethoscope}
              />
              <TabButton id="ai-assist" label="AI Assist" icon={Bot} />
              <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-gradient-to-r from-[#012e58]/5 to-[#1a4b7a]/5 rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#012e58] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedPatient.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#0B2D4D]">
                  {selectedPatient.fullName}
                </p>
                <p className="text-[#1a4b7a] font-medium text-xs">
                  {selectedPatient.uhid} • {selectedPatient.age}Y •{" "}
                  {selectedPatient.gender}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {/* Patient Information Card */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={UserCheck} title="Patient Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Contact Number
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.contactNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Visit Type
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.visitType}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Address
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Payment Method
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                      Chronic Conditions
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatient.chronicConditions.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-md"
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
            <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={Clock} title="Previous Consultations" />
              <div className="space-y-2">
                {mockHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-[#0B2D4D] text-sm">
                        {item.diagnosis}
                      </p>
                      <p className="text-[#1a4b7a] font-medium text-xs">
                        {item.doctor}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#012e58]/10 rounded-md">
                        <Calendar className="w-3 h-3 text-[#012e58]" />
                        <span className="text-xs font-medium text-[#012e58]">
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
          <div className="space-y-4">
            {/* Vitals and Medical History Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Patient Vitals Card */}
              <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Activity} title="Patient Vitals" />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {getVitalsDisplay().map((vital) => (
                    <div
                      key={vital.label}
                      className="text-center p-3 bg-gradient-to-b from-gray-50 to-white rounded-md border border-gray-100"
                    >
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {vital.label}
                      </p>
                      <p className="font-bold text-lg text-[#0B2D4D]">
                        {vital.value}
                      </p>
                      {vital.unit && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {vital.unit}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {vitals && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Last recorded:{" "}
                      {vitals.recordedAt && (vitals.recordedAt as any).toDate
                        ? (vitals.recordedAt as any).toDate().toLocaleString()
                        : new Date(vitals.recordedAt).toLocaleString()}
                    </p>
                    {vitals.recordedBy && (
                      <p className="text-xs text-gray-600">
                        Recorded by: {vitals.recordedBy}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Medical History Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={FileDown} title="Medical History" />
                <div className="space-y-2">
                  {Object.keys(fileInputRefs).map((name) => (
                    <div key={name}>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        ref={fileInputRefs[name as keyof typeof fileInputRefs]}
                        onChange={(e) => handleFileUpload(e, name)}
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() =>
                          fileInputRefs[
                            name as keyof typeof fileInputRefs
                          ].current?.click()
                        }
                        className="flex items-center space-x-2 w-full px-3 py-2 text-xs bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 hover:from-[#012e58]/10 hover:to-[#012e58]/15 rounded-md border border-gray-200 transition-all duration-200 group"
                      >
                        <Upload className="w-3 h-3 text-[#012e58] group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-[#0B2D4D]">
                          {name}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleAiSummary}
                    disabled={isAiSummaryLoading}
                    className="w-full flex items-center justify-center space-x-1.5 text-[#012e58] hover:bg-gray-100 p-2 rounded-md transition-colors"
                  >
                    {isAiSummaryLoading ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3" />
                    )}
                    <span className="text-xs font-semibold">
                      {isAiSummaryLoading
                        ? "Generating..."
                        : "AI Assisted Summary"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Chief Complaints Card */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={ClipboardList} title="Chief Complaints" />

              {/* Quick Symptom Selection */}
              <div className="mb-4">
                <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                  Quick Symptom Selection
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {["Fever", "Cold", "Cough", "Diarrhea", "Vomiting"].map(
                    (symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center space-x-1.5 p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#012e58]/5 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                        />
                        <span className="text-xs font-medium text-[#0B2D4D]">
                          {symptom}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Detailed Complaints Table */}
              <div className="overflow-x-auto bg-gray-50 rounded-md border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white">
                      <th className="p-2 text-left font-semibold text-xs">
                        Symptom
                      </th>
                      <th className="p-2 text-left font-semibold text-xs">
                        Duration
                      </th>
                      <th className="p-2 text-left font-semibold text-xs">
                        Aggravating/Relieving Factors
                      </th>
                      <th className="p-2 text-center font-semibold text-xs">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.symptoms.map((symptom) => (
                      <tr key={symptom.id} className="border-t border-gray-200">
                        <td className="p-2">
                          <AutocompleteInput
                            symptomId={symptom.id}
                            value={symptom.symptom}
                            onChange={(id, value) =>
                              handleSymptomChange(id, "symptom", value)
                            }
                            symptomOptions={symptomOptions}
                            addSymptomOption={addSymptomOption}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={symptom.duration}
                            onChange={(e) =>
                              handleSymptomChange(
                                symptom.id,
                                "duration",
                                e.target.value
                              )
                            }
                            className={inputStyle}
                            placeholder="Duration (e.g., 2 days)"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={symptom.factors}
                            onChange={(e) =>
                              handleSymptomChange(
                                symptom.id,
                                "factors",
                                e.target.value
                              )
                            }
                            className={inputStyle}
                            placeholder="Factors that worsen/improve"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeSymptomRow(symptom.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={addSymptomRow}
                  className="w-full mt-2 flex items-center justify-center space-x-1.5 p-2 text-xs font-medium text-[#012e58] bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Symptom</span>
                </button>
              </div>
            </div>

            {/* Examination Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* General Examination Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Eye} title="General Examination" />

                {/* Examination Findings */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                    Clinical Findings
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pallor", "Icterus", "Cyanosis", "Clubbing", "LAP"].map(
                      (item) => (
                        <label
                          key={item}
                          className="flex items-center space-x-1.5 p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#012e58]/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                          />
                          <span className="text-xs font-medium text-[#0B2D4D]">
                            {item}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Consciousness
                    </label>
                    <input
                      type="text"
                      className={inputStyle}
                      placeholder="Level of consciousness"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
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
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={BookOpen} title="Templates & Quick Fill" />

                {/* Template Selection */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                    Common Templates
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {["Knee Pain", "Back Pain", "Muscle Spasm"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 p-2 bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 rounded-md border border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                        />
                        <span className="font-medium text-xs text-[#0B2D4D] group-hover:text-[#012e58] transition-colors">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Search Field */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms/findings"
                    className="pl-8 pr-3 py-2 w-full border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Systemic and Local Examination Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Systemic Examination Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Heart} title="Systemic Examination" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div key={system.label} className="space-y-1">
                      <label className="text-xs font-semibold text-[#1a4b7a] block">
                        {system.label}
                      </label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 resize-none text-sm"
                        rows={2}
                        placeholder={system.placeholder}
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Examination Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Stethoscope} title="Local Examination" />
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center space-y-1">
                    <Stethoscope className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-gray-500 font-medium text-sm">
                      Case-Specific Examination
                    </p>
                    <p className="text-xs text-gray-400">
                      Orthopedic module integration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "prescriptions" && selectedPatient && (
          <div className="space-y-4">
            <PrescriptionModule
              selectedPatient={selectedPatient}
              consultation={consultation}
            />
          </div>
        )}

        {activeTab === "ai-assist" && selectedPatient && (
          <div className="space-y-4">
            <Ai consultation={consultation} selectedPatient={selectedPatient} />
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button className="group flex items-center px-4 py-2 border border-[#012e58] rounded-md text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-sm font-medium">
              <Save className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
              Save Draft
            </button>
            {activeTab === "assessment" && (
              <button
                onClick={() => setActiveTab("ai-assist")}
                className="group flex items-center px-4 py-2 border border-[#012e58] rounded-md  bg-[#012e58] hover:bg-[#012e58e3] text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-sm font-medium"
              >
                <Bot className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                AI Assist
              </button>
            )}
            {activeTab === "ai-assist" && (
              <button
                onClick={() => setActiveTab("prescriptions")}
                className="group flex items-center px-4 py-2 bg-[#012e58] text-white font-semibold rounded-md shadow-md hover:bg-[#1a4b7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-sm"
              >
                <span>Prescription</span>
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            )}
          </div>

          {/* COMPLETE CONSULTATION BUTTON - NOW ALWAYS VISIBLE IN DOCTOR MODULE */}
          <button
            onClick={() => onCompleteConsultation(selectedPatient.id)}
            className="group flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all duration-300 text-sm"
          >
            <span>Complete Consultation</span>
            <CheckCircle className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
      <AiSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={aiSummary}
        isLoading={isAiSummaryLoading}
      />
    </div>
  );
};
export const DoctorModule: React.FC<DoctorModuleProps> = (props) => {
  return (
    <PrescriptionProvider>
      <DoctorModuleContent {...props} />
    </PrescriptionProvider>
  );
};

export default DoctorModule;
